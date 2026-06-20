import { apiFetch } from "./client";
const API_VERSION = "/v1";
export async function getMe() {
  return apiFetch(`${API_VERSION}/auth/me`, { method: "GET" });
}

export async function login(username: string, password: string) {
  return apiFetch(`${API_VERSION}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username: string, password: string) {
  return apiFetch(`${API_VERSION}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return apiFetch(`${API_VERSION}/auth/logout`, { method: "POST" });
}