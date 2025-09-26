// src/utils/api.ts
const PROD = "https://sway3.vercel.app";

function isCapacitorLike() {
  if (typeof window === "undefined") return true;
  const proto = window.location.protocol;
  const host = window.location.hostname;
  return proto === "capacitor:" || host === "localhost";
}

export async function apiFetch(path: string, init?: RequestInit) {
  const base = isCapacitorLike() ? PROD : "";
  const url = path.startsWith("http") ? path : `${base}${path}`;
  try {
    console.log("[API] fetch:", url);
  } catch {}
  return fetch(url, init);
}
