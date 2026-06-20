import { apiFetch } from "./client";
const API_VERSION = "/v1";
export async function getProjects() {
  return apiFetch(`${API_VERSION}/projects`, { method: "GET" });
}

export async function createProject(name: string, description?: string) {
  return apiFetch(`${API_VERSION}/projects`, {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function closeProject(projectId: string) {
  return apiFetch(`${API_VERSION}/projects/${projectId}/close`, {
    method: "POST",
  });
}

export async function deleteProject(projectId: string) {
  return apiFetch(`${API_VERSION}/projects/${projectId}`, {
    method: "DELETE",
  });
}