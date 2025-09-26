// src/utils/api.ts
const API_BASE = "https://sway3.vercel.app";

export async function apiFetch(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  try {
    console.log("[API] fetch:", url);
  } catch {}
  return fetch(url, init);
}
