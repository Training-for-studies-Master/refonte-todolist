import express from "express";
import type { TaskRepository } from "../../domain/TaskRepository";
import type { RabbitPublisher } from "../messaging/RabbitPublisher";
import { buildTaskRoutes } from "./routes";

export function startTaskServer(repo: TaskRepository, bus: RabbitPublisher, port: number) {
  const app = express();
  app.use(express.json());
  app.use(buildTaskRoutes(repo, bus));
  app.listen(port, "0.0.0.0", () => console.log(`[tasks] listening on ${port}`));
}