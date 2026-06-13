export type AuthUser = { id: string; email: string; name?: string; role: 'admin' | 'vendor' | 'user' };
export type AuthSession = { success: boolean; authenticated: boolean; user?: AuthUser; message?: string };

export const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth`;

async function authRequest(path: string, init?: RequestInit): Promise<AuthSession> {
  const response = await fetch(`${AUTH_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({ message: 'Réponse API invalide' }));
  if (!response.ok) throw new Error(payload.message || `Erreur ${response.status}`);
  return payload;
}

export const publicAuth = {
  me: () => authRequest('/me'),
  register: (body: { name: string; email: string; password: string }) => authRequest('/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) => authRequest('/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => authRequest('/logout', { method: 'POST' }),
};
