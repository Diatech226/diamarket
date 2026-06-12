export type CmsUser = { id: string; email: string; name?: string; role: string };
export type CmsSession = { authenticated: boolean; user?: CmsUser; message?: string };
export const CMS_ALLOWED_ROLES = ['admin', 'editor', 'author'];
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000/api/v1/auth';

async function request(path: string, init?: RequestInit): Promise<CmsSession> {
  const response = await fetch(`${AUTH_API_URL}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({ message: 'Réponse API invalide' }));
  if (!response.ok) throw Object.assign(new Error(payload.message || `Erreur ${response.status}`), { status: response.status });
  return payload;
}
export const cmsAuth = {
  session: () => request('/session'),
  login: (email: string, password: string) => request('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/logout', { method: 'POST' }),
};
