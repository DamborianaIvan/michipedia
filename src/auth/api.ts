import type { Session } from './types';

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export class AuthError extends Error {}

async function request<T>(path: string, body?: unknown, token?: string): Promise<T> {
  if (!apiUrl) throw new AuthError('Falta configurar la dirección de la API de Michipedia.');
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new AuthError('No pudimos conectar con Michipedia. Revisá tu conexión e intentá de nuevo.');
  }
  const data = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new AuthError(data.message || 'No se pudo completar la operación.');
  return data as T;
}

export async function register(name: string, email: string, password: string): Promise<Session> {
  return request('/api/auth/register', { name, email, password });
}

export async function login(email: string, password: string): Promise<Session> {
  return request('/api/auth/login', { email, password });
}

export async function verifySession(token: string): Promise<Session['user']> {
  const response = await request<{ user: Session['user'] }>('/api/auth/me', undefined, token);
  return response.user;
}
