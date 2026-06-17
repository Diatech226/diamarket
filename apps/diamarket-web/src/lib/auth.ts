export type AuthUser = { id: string; email: string; name?: string; role: 'admin' | 'vendor' | 'user' };
export type AuthSession = { success: boolean; authenticated?: boolean; token?: string; user?: AuthUser; message?: string };

export const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth`;
const TOKEN_STORAGE_KEY = 'diamarket_web_token';

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

function isAuthSession(payload: unknown): payload is AuthSession {
  return typeof payload === 'object' && payload !== null && typeof (payload as AuthSession).success === 'boolean';
}

async function authRequest(path: string, init?: RequestInit): Promise<AuthSession> {
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
  const message = isAuthSession(payload) ? payload.message : undefined;

  if (!response.ok || !isAuthSession(payload) || payload.success === false) {
    throw new Error(message || `Réponse API d’authentification invalide (${response.status})`);
  }

  if (payload.token) storeToken(payload.token);
  return payload;
}

export const publicAuth = {
  me: () => authRequest('/me'),
  register: (body: { name: string; email: string; password: string }) => authRequest('/register', { method: 'POST', body: JSON.stringify({ name: body.name.trim(), email: body.email.trim().toLowerCase(), password: body.password }) }),
  login: (body: { email: string; password: string }) => authRequest('/login', { method: 'POST', body: JSON.stringify({ email: body.email.trim().toLowerCase(), password: body.password }) }),
  logout: async () => {
    try {
      return await authRequest('/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
  },
};
