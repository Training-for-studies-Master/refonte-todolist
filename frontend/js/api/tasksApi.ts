import { apiFetch } from "./client";
const API_VERSION = "/v1";
export async function getTasks() {
  return apiFetch(`${API_VERSION}/tasks`, { method: "GET" });
}

export async function createTask(name: string, projectId: string) {
  return apiFetch(`${API_VERSION}/tasks`, {
    method: "POST",
    body: JSON.stringify({ name, projectId }),
  });
}

export async function closeTask(taskId: string) {
  return apiFetch(`${API_VERSION}/tasks/${taskId}/close`, {
    method: "POST",
  });
}

export async function reopenTask(taskId: string) {
  return apiFetch(`${API_VERSION}/tasks/${taskId}/reopen`, {
    method: "POST",
  });
}

export async function deleteTask(taskId: string) {
  return apiFetch(`${API_VERSION}/tasks/${taskId}`, {
    method: "DELETE",
  });
}