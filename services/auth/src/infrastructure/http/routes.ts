import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import type { AuthRepository } from "../../domain/AuthRepository";

export function buildAuthRoutes(repo: AuthRepository) {
  const r = express.Router();
  
  // Définition des versions d'API
  const VersionAPI = "/v2";

  // ==========================================
  // ROUTES V1 (Rétrocompatibilité préservée)
  // ==========================================

  r.post(`${VersionAPI}/register`, async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await repo.getUserByUsername(String(username));
    if (existing) return res.status(409).json({ error: "Username already used" });

    const userId = uuid();
    const passwordHash = await bcrypt.hash(String(password), 10);
    
    // En V1, on ignore la date de naissance
    await repo.createUser({ id: userId, username: String(username), passwordHash });

    res.json({ userId });
  });

  r.get(`${VersionAPI}/me`, async (req, res) => {
    const userId = req.header("X-User-Id");
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await repo.getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // En V1, on nettoie l'objet pour ne pas renvoyer le nouveau champ aux anciens clients
    res.json({
      id: user.id,
      username: user.username
    });
  });


  // ==========================================
  // ROUTES V2 (Nouvelles fonctionnalités)
  // ==========================================

  r.post(`${VersionAPI}/register`, async (req, res) => {
    const { username, password, birthDate } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    // Optionnel : Validation basique du format de la date YYYY-MM-DD
    if (birthDate && isNaN(Date.parse(String(birthDate)))) {
      return res.status(400).json({ error: "Invalid birthDate format. Expected YYYY-MM-DD" });
    }

    const existing = await repo.getUserByUsername(String(username));
    if (existing) return res.status(409).json({ error: "Username already used" });

    const userId = uuid();
    const passwordHash = await bcrypt.hash(String(password), 10);
    
    // En V2, on passe le birthDate au repository
    await repo.createUser({ 
      id: userId, 
      username: String(username), 
      passwordHash,
      birthDate: birthDate ? String(birthDate) : null 
    });

    res.json({ userId });
  });

  r.get(`${VersionAPI}/me`, async (req, res) => {
    const userId = req.header("X-User-Id");
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await repo.getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // En V2, on renvoie le profil complet avec la birthDate
    res.json(user); 
  });


  // ==========================================
  // ROUTES COMMUNES (Identiques en V1 et V2)
  // ==========================================
  
  const loginHandler = async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const user = await repo.getUserByUsername(String(username));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ userId: user.id });
  };

  r.post(`${VersionAPI}/login`, loginHandler);

  return r;
}