export interface Session {
  id: string;
  timestamp: number;
  lessonText: string;
  summary: string;
  exercises?: string[];
  language: string;
}

const STORAGE_KEY = "sway3_sessions";

export function saveSession(session: Session) {
  const sessions = loadSessions();
  sessions.unshift(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function loadSessions(): Session[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getSession(id: string): Session | undefined {
  return loadSessions().find((s) => s.id === id);
}

export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY);
}
