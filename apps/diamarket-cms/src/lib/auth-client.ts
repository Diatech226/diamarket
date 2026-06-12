export type CmsUser = { id: string; email: string; name?: string; role: string };
export type CmsSession = { success: boolean; authenticated: boolean; user?: CmsUser; message?: string };
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000/api/auth';

async function request(path: string, init?: RequestInit): Promise<CmsSession> {
  const response = await fetch(`${AUTH_API_URL}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({ message: 'Réponse API invalide' }));
  if (!response.ok) throw Object.assign(new Error(payload.message || `Erreur ${response.status}`), { status: response.status });
  return payload;
}
export const cmsAuth = {
  me: () => request('/me'),
  login: (email: string, password: string) => request('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/logout', { method: 'POST' }),
};
