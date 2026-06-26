import express from "express";
import { v4 as uuid } from "uuid";
import type { ProjectRepository } from "../../domain/ProjectRepository";
import type { RabbitPublisher } from "../messaging/RabbitPublisher";

function toMysqlDatetime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function buildProjectRoutes(repo: ProjectRepository, bus: RabbitPublisher) {
  const r = express.Router();
  const getUserId = (req: express.Request) => req.header("X-User-Id") || "";
  const API_VERSION = "/v2";

  r.get(`${API_VERSION}/projects`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const projects = await repo.getProjects(userId);
    res.json(projects);
  });

  r.post(`${API_VERSION}/projects`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { name, description } = req.body ?? {};
    if (!name) return res.status(400).json({ error: "Missing fields" });

    const project = {
      id: uuid(),
      userId,
      name: String(name),
      description: description ? String(description) : null,
      status: "OPEN" as const,
      closedAt: null,
      openTasksCount: 0,
      closedTasksCount: 0,
    };

    await repo.storeProject(project);
  await bus.publish("project.created", {
    projectId: project.id,
    projectName: project.name,
    userId,
  });

    res.json(project);
  });

  r.patch(`${API_VERSION}/projects/:id`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const existing = await repo.getProject(req.params.id, userId);
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.status === "CLOSED") return res.status(400).json({ error: "Project is closed" });

    const { name, description } = req.body ?? {};

    const updated = {
      ...existing,
      name: name ? String(name) : existing.name,
      description: description !== undefined ? String(description) : existing.description,
    };

    await repo.updateProject(existing.id, updated, userId);
    await bus.publish("project.updated", {
      projectId: existing.id,
      projectName: updated.name,
      userId,
    });

    res.json(updated);
  });

  r.post(`${API_VERSION}/projects/:id/close`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const project = await repo.getProject(req.params.id, userId);
    if (!project) return res.status(404).json({ error: "Not found" });
    if (project.status === "CLOSED") return res.status(400).json({ error: "Already closed" });
    if (project.openTasksCount > 0) {
      return res.status(400).json({ error: "Cannot close project while tasks remain open" });
    }

    const updated = {
      ...project,
      status: "CLOSED" as const,
      closedAt: toMysqlDatetime(new Date()),
    };

    await repo.updateProject(project.id, updated, userId);
    await bus.publish("project.closed", {
      projectId: project.id,
      projectName: project.name,
      userId,
    });
    res.json(updated);
  });

  r.delete(`${API_VERSION}/projects/:id`, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const project = await repo.getProject(req.params.id, userId);
    if (!project) return res.status(404).json({ error: "Not found" });

    await repo.removeProject(project.id, userId);
    await bus.publish("project.deleted", { projectId: project.id, userId });

    res.json({ ok: true });
  });

  return r;
}