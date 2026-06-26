export const API_BASE = `${window.location.protocol}//${window.location.hostname}:3000`;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}:3000${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  return text ? JSON.parse(text) : null;
}