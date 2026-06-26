import express from "express";
import type { AuthRepository } from "../../domain/AuthRepository";
import { buildAuthRoutes } from "./routes";

export function startAuthServer(repo: AuthRepository, port: number) {
  const app = express();
  app.use(express.json());
  app.use(buildAuthRoutes(repo));

  // 🟢 AJOUT : Fallback JSON pour toutes les routes non trouvées (Évite le crash HTML)
  app.use((req, res) => {
    res.status(404).json({ 
      error: `Route ${req.method} ${req.url} non trouvée sur le service Auth.` 
    });
  });

  // 🟢 CORRECTION : Ajout de "0.0.0.0" pour écouter tout le réseau Docker
  app.listen(port, "0.0.0.0", () => console.log(`[auth] listening on ${port}`));

}