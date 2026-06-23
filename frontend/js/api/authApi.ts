import { apiFetch } from "./client";
const API_VERSION = "/v2";
export async function getMe() {
  return apiFetch(`${API_VERSION}/auth/me`, { method: "GET" });
}

export async function login(username: string, password: string) {
  return apiFetch(`${API_VERSION}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username: string, password: string, birthDate?: string) {
  return apiFetch(`${API_VERSION}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ 
      username, 
      password,
      birthDate: birthDate || null
    }),
  });
}

export async function logout() {
  return apiFetch(`${API_VERSION}/auth/logout`, { method: "POST" });
}