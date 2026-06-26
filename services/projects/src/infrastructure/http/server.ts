import express from "express";
import type { ProjectRepository } from "../../domain/ProjectRepository";
import type { RabbitPublisher } from "../messaging/RabbitPublisher";
import { buildProjectRoutes } from "./routes";

export function startProjectServer(repo: ProjectRepository, bus: RabbitPublisher, port: number) {
  const app = express();

  app.use(express.json());
  app.use(buildProjectRoutes(repo, bus));

  app.listen(port, "0.0.0.0", () => {
    console.log(`[projects] listening on ${port}`);
  });
}