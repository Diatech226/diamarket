export type CmsUser = { id: string; email: string; name?: string; role: 'admin' | 'vendor' | 'user' };
export type CmsSession = { success: boolean; authenticated?: boolean; token?: string; user?: CmsUser; message?: string };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_DIAMARKET_API_URL || 'http://localhost:5000/api';
const AUTH_API_URL = `${API_BASE_URL.replace(/\/$/, '')}/auth`;
const TOKEN_STORAGE_KEY = 'diamarket_cms_token';

function readStoredToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function storeToken(token?: string) {
  if (typeof window === 'undefined' || !token) return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearStoredToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function isCmsSession(payload: unknown): payload is CmsSession {
  return typeof payload === 'object' && payload !== null && typeof (payload as CmsSession).success === 'boolean';
}

async function request(path: string, init?: RequestInit): Promise<CmsSession> {
  const token = readStoredToken();
  let response: Response;
  try {
    response = await fetch(`${AUTH_API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
  } catch {
    throw new Error(`Impossible de joindre l’API d’authentification (${AUTH_API_URL}). Vérifiez NEXT_PUBLIC_API_URL et CORS.`);
  }
  const payload = await response.json().catch(() => null);
  const message = isCmsSession(payload) ? payload.message : undefined;

  if (!response.ok || !isCmsSession(payload) || payload.success === false) {
    throw Object.assign(new Error(message || `Réponse API d’authentification invalide (${response.status})`), { status: response.status });
  }

  if (payload.token) storeToken(payload.token);
  return payload;
}

export const cmsAuth = {
  me: () => request('/me'),
  login: (email: string, password: string) => request('/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) }),
  logout: async () => {
    try {
      return await request('/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
  },
  clearStoredToken,
};
