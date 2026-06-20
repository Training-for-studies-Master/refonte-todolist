import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import type { AuthRepository } from "../../domain/AuthRepository";

export function buildAuthRoutes(repo: AuthRepository) {
  const r = express.Router();
  const API_VERSION = "/v1";

  r.post(`${API_VERSION}/register`, async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await repo.getUserByUsername(String(username));
    if (existing) return res.status(409).json({ error: "Username already used" });

    const userId = uuid();
    const passwordHash = await bcrypt.hash(String(password), 10);
    await repo.createUser({ id: userId, username: String(username), passwordHash });

    // stateless: on renvoie juste userId
    res.json({ userId });
  });

  r.post(`${API_VERSION}/login`, async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const user = await repo.getUserByUsername(String(username));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ userId: user.id });
  });

  r.get(`${API_VERSION}/me`, async (req, res) => {
    const userId = req.header("X-User-Id");
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await repo.getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  });

  return r;
}