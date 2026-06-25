import express from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import cors from "cors";

// Test 24.06.26 15:57
// test 16h12
// 16h22
// 16h31
// 16h41
// 16h51
// 17h06
// 17h17
// Test 25.06.206 14h14
// 14h37
// 15h04
// 15h31
// 15h44
// 15h56
// 16h09
// 16h26
// 16h42
// 16h52
// 17h19
// 20h01
// 20h17
// 20h34

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const AUTH_URL = process.env.AUTH_URL || "http://auth:3001";
const TASKS_URL = process.env.TASKS_URL || "http://tasks:3002";
const PROJECTS_URL = process.env.PROJECTS_URL || "http://projects:3003";
const API_VERSION = "/v2";
const SERVICE_VERSION = "v1";

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  })
);

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

app.post(`${API_VERSION}/auth/register`, async (req, res) => {
  const r = await fetch(`${AUTH_URL}/v2/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await r.json();
  if (!r.ok) return res.status(r.status).json(data);
  req.session.userId = data.userId;
  res.json({ ok: true, userId: data.userId });
});

app.post(`${API_VERSION}/auth/login`, async (req, res) => {
  const r = await fetch(`${AUTH_URL}/${SERVICE_VERSION}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await r.json();
  if (!r.ok) return res.status(r.status).json(data);
  req.session.userId = data.userId;
  res.json({ ok: true, userId: data.userId });
});

app.post(`${API_VERSION}/auth/logout`, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get(`${API_VERSION}/auth/me`, requireAuth, async (req, res) => {
  const r = await fetch(`${AUTH_URL}/v2/me`, { headers: { "X-User-Id": req.session.userId! } });
  res.status(r.status).json(await r.json());
});

app.get(`${API_VERSION}/tasks`, requireAuth, async (req, res) => {
  const r = await fetch(`${TASKS_URL}/${SERVICE_VERSION}/tasks`, { headers: { "X-User-Id": req.session.userId! } });
  res.status(r.status).json(await r.json());
});

app.post(`${API_VERSION}/tasks`, requireAuth, async (req, res) => {
  const r = await fetch(`${TASKS_URL}/${SERVICE_VERSION}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": req.session.userId! },
    body: JSON.stringify(req.body),
  });
  res.status(r.status).json(await r.json());
});

app.post(`${API_VERSION}/tasks/:id/close`, requireAuth, async (req, res) => {
  const r = await fetch(`${TASKS_URL}/${SERVICE_VERSION}/tasks/${req.params.id}/close`, {
    method: "POST",
    headers: { "X-User-Id": req.session.userId! },
  });
  res.status(r.status).json(await r.json());
});

app.delete(`${API_VERSION}/tasks/:id`, requireAuth, async (req, res) => {
  const r = await fetch(`${TASKS_URL}/${SERVICE_VERSION}/tasks/${req.params.id}`, {
    method: "DELETE",
    headers: { "X-User-Id": req.session.userId! },
  });
  res.status(r.status).json(await r.json());
});

app.get(`${API_VERSION}/projects`, requireAuth, async (req, res) => {
  const r = await fetch(`${PROJECTS_URL}/${SERVICE_VERSION}/projects`, {
    headers: { "X-User-Id": req.session.userId! },
  });
  res.status(r.status).json(await r.json());
});

app.post(`${API_VERSION}/projects`, requireAuth, async (req, res) => {
  const r = await fetch(`${PROJECTS_URL}/${SERVICE_VERSION}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": req.session.userId!,
    },
    body: JSON.stringify(req.body),
  });
  res.status(r.status).json(await r.json());
});

app.patch(`${API_VERSION}/projects/:id`, requireAuth, async (req, res) => {
  const r = await fetch(`${PROJECTS_URL}/${SERVICE_VERSION}/projects/${req.params.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": req.session.userId!,
    },
    body: JSON.stringify(req.body),
  });
  res.status(r.status).json(await r.json());
});

app.post(`${API_VERSION}/projects/:id/close`, requireAuth, async (req, res) => {
  const r = await fetch(`${PROJECTS_URL}/${SERVICE_VERSION}/projects/${req.params.id}/close`, {
    method: "POST",
    headers: { "X-User-Id": req.session.userId! },
  });
  res.status(r.status).json(await r.json());
});

app.delete(`${API_VERSION}/projects/:id`, requireAuth, async (req, res) => {
  const r = await fetch(`${PROJECTS_URL}/${SERVICE_VERSION}/projects/${req.params.id}`, {
    method: "DELETE",
    headers: { "X-User-Id": req.session.userId! },
  });
  res.status(r.status).json(await r.json());
});

app.post(`${API_VERSION}/tasks/:id/reopen`, requireAuth, async (req, res) => {
  const r = await fetch(`${TASKS_URL}/${SERVICE_VERSION}/tasks/${req.params.id}/reopen`, {
    method: "POST",
    headers: { "X-User-Id": req.session.userId! },
  });

  res.status(r.status).json(await r.json());
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TodoList API Gateway",
      version: "1.0.0",
      description: "API versionnée v1 via Gateway",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [], // simple version (pas besoin d'annotations pour ton projet)
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;