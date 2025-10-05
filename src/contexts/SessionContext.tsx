import React, { createContext, useContext, useEffect, useState } from "react";

type Lang = "en" | "fr" | "ar";

export interface CurrentSession {
  lessonText: string;
  summary: string;
  language: Lang;
}

interface SessionContextType {
  current: CurrentSession | null;
  setSession: (s: CurrentSession) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  current: null,
  setSession: () => {},
  clearSession: () => {},
});

const STORAGE_KEY = "sway3_current_session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<CurrentSession | null>(null);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.lessonText && parsed?.summary && parsed?.language) {
          setCurrent(parsed);
        }
      }
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      if (current) localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [current]);

  const setSession = (s: CurrentSession) => setCurrent(s);
  const clearSession = () => setCurrent(null);

  return (
    <SessionContext.Provider value={{ current, setSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
