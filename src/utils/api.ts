// src/utils/api.ts
export const API_BASE = (() => {
  // In Capacitor (mobile) the WebView runs from file://, so use the deployed backend URL
  if (typeof window === "undefined") return "https://sway3.vercel.app";
  if (window.location.protocol === "file:") {
    return "https://sway3.vercel.app";
  }
  // In web/dev (vite) use relative paths (you can use vite proxy during dev)
  return "";
})();

/**
 * apiFetch wraps fetch so the app uses absolute URL on mobile and relative on web/dev
 * Usage: apiFetch("/api/gemini", {...})
 */
export async function apiFetch(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  return fetch(url, init);
}
