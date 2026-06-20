process.env.AUTH_URL = "http://localhost:3001";
process.env.TASKS_URL = "http://localhost:3002";
process.env.PROJECTS_URL = "http://localhost:3003";
import request from "supertest";
import app from "../src/app";

const agent = request.agent(app);
const API_VERSION = "/v1";
// Test de compatabilité 20.06.2026
// 11h42
// 11h55
// 12h22
// 12h32
// 12h41, last ?
// 12h50 last last 
// 13h14
// Création projet
test("POST /projects persists project in DB", async () => {
  const login = await agent
    .post(`${API_VERSION}/auth/login`)
    .send({ username: "test", password: "test" });

  expect(login.status).toBe(200);

  const res = await agent
    .post(`${API_VERSION}/projects`)
    .send({ name: "Projet Integration Test" });

  expect(res.status).toBe(200);

  const projectId = res.body.id;

  const list = await agent.get(`${API_VERSION}/projects`);

  expect(list.body.some((p: any) => p.id === projectId)).toBe(true);
});

// Création task
test("POST /tasks persists task", async () => {
  const project = await agent
    .post(`${API_VERSION}/projects`)
    .send({ name: "Projet Tasks" });

  const task = await agent
    .post(`${API_VERSION}/tasks`)
    .send({
      name: "Task Integration",
      projectId: project.body.id,
    });

  expect(task.status).toBe(200);

  const list = await agent.get(`${API_VERSION}/tasks`);

  expect(list.body.some((t: any) => t.name === "Task Integration")).toBe(true);
});

// Close task
test("POST /tasks/:id/close updates persistence", async () => {
  const created = await agent
    .post(`${API_VERSION}/tasks`)
    .send({
      name: "Close me",
      projectId: "project-1",
    });

  const closeRes = await agent
    .post(`${API_VERSION}/tasks/${created.body.id}/close`);

  expect(closeRes.status).toBe(200);

  const tasks = await agent.get(`${API_VERSION}/tasks`);

  const task = tasks.body.find((t: any) => t.id === created.body.id);

  expect(task.status).toBe("CLOSED");
});

// Delete task
test("DELETE /tasks removes from persistence", async () => {
  const created = await agent
    .post(`${API_VERSION}/tasks`)
    .send({
      name: "Delete me",
      projectId: "project-1",
    });

  const delRes = await agent
    .delete(`${API_VERSION}/tasks/${created.body.id}`);

  expect(delRes.status).toBe(200);

  const list = await agent.get(`${API_VERSION}/tasks`);

  expect(list.body.find((t: any) => t.id === created.body.id)).toBeUndefined();
});