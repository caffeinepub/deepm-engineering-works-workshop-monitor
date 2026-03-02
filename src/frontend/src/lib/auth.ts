import type { WorkshopRole } from "./types";

const SESSION_KEY = "deepm_session";

export interface WorkshopSession {
  email: string;
  role: WorkshopRole;
}

export function getStoredSession(): WorkshopSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkshopSession;
  } catch {
    return null;
  }
}

export function storeSession(session: WorkshopSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
