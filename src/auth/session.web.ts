import type { Session } from './types';

const key = 'michipedia.session.v1';
export async function loadSession(): Promise<Session | null> {
  const raw = globalThis.localStorage?.getItem(key);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Partial<Session>;
    if (typeof session.token !== 'string' || typeof session.user?.id !== 'string'
      || typeof session.user.name !== 'string' || typeof session.user.email !== 'string') return null;
    return session as Session;
  } catch { return null; }
}
export async function saveSession(session: Session): Promise<void> {
  globalThis.localStorage?.setItem(key, JSON.stringify(session));
}
export async function clearSession(): Promise<void> {
  globalThis.localStorage?.removeItem(key);
}
