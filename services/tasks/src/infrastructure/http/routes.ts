import express from "express";
import { v4 as uuid } from "uuid";
import type { TaskRepository } from "../../domain/TaskRepository";
import type { RabbitPublisher } from "../messaging/RabbitPublisher";

export function buildCreateTaskHandler(repo: TaskRepository, bus: RabbitPublisher) {
  return async (req: express.Request, res: express.Response): Promise<void> => {
    const userId = req.header("X-User-Id") || "";
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { name, projectId } = req.body ?? {};
    if (!name || !projectId) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const task = {
      id: uuid(),
      name: String(name),
      status: "OPEN" as const,
      projectId: String(projectId),
    };

    await repo.storeTask(task, userId);

    try {
      await bus.publish("task.created", {
        taskId: task.id,
        projectId: task.projectId,
        userId,
        status: task.status,
      });
    } catch (e) {
      console.error("[tasks] publish failed", e);
    }

    res.json(task);
  };
}

export function buildTaskRoutes(repo: TaskRepository, bus: RabbitPublisher) {
  const r = express.Router();
  const getUserId = (req: express.Request) => req.header("X-User-Id") || "";
  const API_VERSION = "/v1";

  r.get(`${API_VERSION}/tasks`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const tasks = await repo.getTasks(userId);
    res.json(tasks);
  });

  r.post(`${API_VERSION}/tasks`, buildCreateTaskHandler(repo, bus));

  r.post(`${API_VERSION}/tasks/:id/close`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const t = await repo.getTask(req.params.id, userId);
    if (!t) return res.status(404).json({ error: "Not found" });

    if (t.status === "CLOSED") {
      return res.status(400).json({ error: "Task already closed" });
    }

    t.status = "CLOSED";
    await repo.updateTask(t.id, t, userId);

    try {
      await bus.publish("task.closed", {
        taskId: t.id,
        projectId: t.projectId,
        userId,
        status: t.status,
      });
    } catch (e) {
      console.error("[tasks] publish failed", e);
    }

    res.json(t);
  });

  r.post(`${API_VERSION}/tasks/:id/reopen`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const t = await repo.getTask(req.params.id, userId);
    if (!t) return res.status(404).json({ error: "Not found" });

    if (t.status === "OPEN") {
      return res.status(400).json({ error: "Task already open" });
    }

    const projectView = await repo.getProjectView(t.projectId);

    if (!projectView) {
      return res.status(400).json({ error: "Unknown project status" });
    }

    if (projectView.status === "CLOSED") {
      return res.status(400).json({ error: "Cannot reopen task because project is closed" });
    }

    t.status = "OPEN";
    await repo.updateTask(t.id, t, userId);

    try {
      await bus.publish("task.reopened", {
        taskId: t.id,
        projectId: t.projectId,
        projectName: projectView.projectName,
        userId,
        status: t.status,
      });
    } catch (e) {
      console.error("[tasks] publish failed", e);
    }

    res.json(t);
  });

  r.delete(`${API_VERSION}/tasks/:id`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const t = await repo.getTask(req.params.id, userId);
    if (!t) return res.status(404).json({ error: "Not found" });

    await repo.removeTask(t.id, userId);

    try {
      await bus.publish("task.deleted", {
        taskId: t.id,
        projectId: t.projectId,
        userId,
        status: t.status,
      });
    } catch (e) {
      console.error("[tasks] publish failed", e);
    }

    res.json({ ok: true });
  });

  return r;
}