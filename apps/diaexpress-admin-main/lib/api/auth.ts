import { resolveClerkJwtTemplate } from './clerk-template';

type ClerkWindow = Window & {
  Clerk?: {
    session?: {
      getToken: (options?: { template?: string; skipCache?: boolean }) => Promise<string | null>;
    };
  };
};

type ResolveAuthTokenOptions = {
  token?: string | null;
  forceFresh?: boolean;
};

type AuthFailureCategory = 'no_session' | 'invalid_session' | 'insufficient_role' | 'backend_unavailable';

export type AuthTokenFailureReason =
  | 'missing_auth_context'
  | 'token_template_not_found'
  | 'token_resolution_failed'
  | 'no_token';

export type ResolvedAuthToken = {
  token: string | null;
  failureReason: AuthTokenFailureReason | null;
  detail: string | null;
  template: string | null;
};

type ServerAuthBridgeResponse = {
  token?: string | null;
  reason?: string;
  detail?: string | null;
};

const AUTH_FAILURE_CACHE_TTL_MS = 15_000;
const DEV_BEARER_TOKEN_ENV_KEY = 'NEXT_PUBLIC_ADMIN_BEARER_TOKEN';

function isDev() {
  return process.env.NODE_ENV !== 'production';
}

function debugAuth(message: string, extra?: Record<string, unknown>) {
  if (!isDev()) return;
  console.info('[adminv2/auth]', message, extra || {});
}

function resolveTemplate() {
  return resolveClerkJwtTemplate();
}

function resolveDevBearerToken() {
  const fallbackToken = process.env[DEV_BEARER_TOKEN_ENV_KEY];
  if (process.env.NODE_ENV === 'production' || typeof fallbackToken !== 'string') {
    return null;
  }

  const token = fallbackToken.trim();
  return token.length ? token : null;
}

type ClerkTokenOptions = { template?: string; skipCache?: boolean };

function buildClerkTokenOptions(forceFresh = false): ClerkTokenOptions {
  const template = resolveTemplate();
  const tokenOptions: ClerkTokenOptions = { template };

  if (forceFresh) {
    tokenOptions.skipCache = true;
  }

  return tokenOptions;
}

function isTemplateNotFound(detail: string | null) {
  return typeof detail === 'string' && (detail.toLowerCase().includes('not found') || detail.toLowerCase().includes('no jwt template exists'));
}

async function resolveBrowserClerkToken(forceFresh = false): Promise<ResolvedAuthToken> {
  if (typeof window === 'undefined') {
    return { token: null, failureReason: 'no_token', detail: null, template: null };
  }

  const clerk = (window as ClerkWindow).Clerk;
  if (!clerk?.session?.getToken) {
    return { token: null, failureReason: 'missing_auth_context', detail: null, template: null };
  }

  try {
    const tokenOptions = buildClerkTokenOptions(forceFresh);
    const token = await clerk.session.getToken(tokenOptions);
    if (token) {
      debugAuth('resolved browser Clerk token', {
        template: tokenOptions.template,
        skipCache: tokenOptions.skipCache === true,
      });
      return { token, failureReason: null, detail: null, template: tokenOptions.template || null };
    }

    return { token: null, failureReason: 'no_token', detail: null, template: tokenOptions.template || null };
  } catch (error) {
    const detail = (error as Error).message || String(error);
    const failureReason = isTemplateNotFound(detail) ? 'token_template_not_found' : 'token_resolution_failed';
    logOnce(
      `clerk-token-${failureReason}`,
      '[adminv2/auth] unable to resolve browser Clerk token',
      { detail, template: resolveTemplate(), failureReason },
    );
    return {
      token: null,
      failureReason,
      detail,
      template: resolveTemplate(),
    };
  }
}

async function resolveServerBridgeToken(forceFresh = false): Promise<ResolvedAuthToken> {
  if (typeof window === 'undefined') {
    return { token: null, failureReason: 'missing_auth_context', detail: null, template: null };
  }

  try {
    const response = await fetch(`/api/admin/auth/token${forceFresh ? '?fresh=1' : ''}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => null)) as ServerAuthBridgeResponse | null;
    if (response.ok && payload?.token) {
      debugAuth('resolved token via server bridge', { forceFresh });
      return {
        token: payload.token,
        failureReason: null,
        detail: null,
        template: null,
      };
    }

    const reason = payload?.reason;
    const normalizedFailureReason: AuthTokenFailureReason =
      reason === 'token_template_not_found'
        ? 'token_template_not_found'
        : reason === 'missing_auth_context'
          ? 'missing_auth_context'
          : reason === 'token_resolution_failed'
            ? 'token_resolution_failed'
            : 'no_token';

    if (normalizedFailureReason === 'token_template_not_found' || normalizedFailureReason === 'no_token') {
      logOnce('server-bridge-token-missing', '[adminv2/auth] backend token bridge returned no token', {
        reason: normalizedFailureReason,
        detail: payload?.detail ?? null,
        template: resolveTemplate(),
      });
    }

    return {
      token: null,
      failureReason: normalizedFailureReason,
      detail: payload?.detail ?? null,
      template: resolveTemplate(),
    };
  } catch (error) {
    return {
      token: null,
      failureReason: 'token_resolution_failed',
      detail: (error as Error).message || String(error),
      template: resolveTemplate(),
    };
  }
}

let cachedAuthFailure: (ResolvedAuthToken & { at: number }) | null = null;

function shouldUseCachedFailure(forceFresh = false) {
  if (!cachedAuthFailure || forceFresh) {
    return false;
  }

  return Date.now() - cachedAuthFailure.at <= AUTH_FAILURE_CACHE_TTL_MS;
}

function isCacheableFailure(result: ResolvedAuthToken) {
  return !result.token && (result.failureReason === 'token_template_not_found' || result.failureReason === 'no_token');
}

function setCachedFailure(result: ResolvedAuthToken) {
  if (!isCacheableFailure(result)) {
    cachedAuthFailure = null;
    return;
  }

  cachedAuthFailure = {
    ...result,
    at: Date.now(),
  };
}

export async function resolveAuthTokenDetailed(options: ResolveAuthTokenOptions = {}): Promise<ResolvedAuthToken> {
  if (typeof options.token === 'string' && options.token.trim().length) {
    return { token: options.token.trim(), failureReason: null, detail: null, template: null };
  }

  if (typeof window === 'undefined') {
    return { token: null, failureReason: 'missing_auth_context', detail: null, template: resolveTemplate() };
  }

  if (shouldUseCachedFailure(Boolean(options.forceFresh))) {
    return {
      token: null,
      failureReason: cachedAuthFailure?.failureReason || 'no_token',
      detail: cachedAuthFailure?.detail || null,
      template: cachedAuthFailure?.template || resolveTemplate(),
    };
  }

  const browserToken = await resolveBrowserClerkToken(Boolean(options.forceFresh));
  if (browserToken.token) {
    cachedAuthFailure = null;
    return browserToken;
  }

  if (
    browserToken.failureReason === 'missing_auth_context' ||
    browserToken.failureReason === 'no_token' ||
    browserToken.failureReason === 'token_template_not_found'
  ) {
    const bridgedToken = await resolveServerBridgeToken(Boolean(options.forceFresh));
    if (bridgedToken.token) {
      cachedAuthFailure = null;
      return bridgedToken;
    }

    const devFallbackToken = resolveDevBearerToken();
    if (devFallbackToken) {
      cachedAuthFailure = null;
      debugAuth('resolved auth token via local dev fallback');
      return { token: devFallbackToken, failureReason: null, detail: null, template: null };
    }

    setCachedFailure(bridgedToken);
    return bridgedToken;
  }

  const devFallbackToken = resolveDevBearerToken();
  if (devFallbackToken) {
    cachedAuthFailure = null;
    debugAuth('resolved auth token via local dev fallback');
    return { token: devFallbackToken, failureReason: null, detail: null, template: null };
  }

  setCachedFailure(browserToken);
  return browserToken;
}

export async function resolveAuthToken(options: ResolveAuthTokenOptions = {}): Promise<string | null> {
  const result = await resolveAuthTokenDetailed(options);
  return result.token;
}

export async function applyAuthHeader(headers: Headers, options: ResolveAuthTokenOptions = {}): Promise<ResolvedAuthToken> {
  if (headers.has('Authorization') && !options.forceFresh) {
    return { token: headers.get('Authorization') || null, failureReason: null, detail: null, template: null };
  }

  if (options.forceFresh) {
    headers.delete('Authorization');
  }

  const result = await resolveAuthTokenDetailed(options);
  if (result.token) {
    headers.set('Authorization', `Bearer ${result.token}`);
    debugAuth('attached Authorization bearer token', { source: typeof window === 'undefined' ? 'server' : 'browser' });
  }

  return result;
}

function browserHasFrontendSession() {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean((window as ClerkWindow).Clerk?.session);
}

let lastAuthRedirectAt = 0;

function shouldThrottleAuthRedirect() {
  if (typeof window === 'undefined') {
    return false;
  }

  const now = Date.now();
  if (now <= lastAuthRedirectAt) {
    lastAuthRedirectAt = now;
    return false;
  }

  if (now - lastAuthRedirectAt < 1500) {
    return true;
  }

  lastAuthRedirectAt = now;
  return false;
}

const loggedWarnings = new Set<string>();

function logOnce(key: string, message: string, extra?: Record<string, unknown>) {
  if (!isDev() || loggedWarnings.has(key)) {
    return;
  }

  loggedWarnings.add(key);
  console.warn(message, extra || {});
}

function normalizeReason(reason?: string | null) {
  return typeof reason === 'string' ? reason.trim().toLowerCase() : '';
}

function classifyAuthFailure(status: number, reason?: string | null): AuthFailureCategory {
  const normalizedReason = normalizeReason(reason);

  if (status === 403) {
    return 'insufficient_role';
  }

  if (status >= 500 || status === 408 || status === 429) {
    return 'backend_unavailable';
  }

  if (status === 401) {
    if (normalizedReason === 'missing_token' || normalizedReason === 'token_template_not_found') {
      return 'backend_unavailable';
    }

    const hasFrontendSession = browserHasFrontendSession();

    if (!hasFrontendSession) {
      return 'no_session';
    }

    return 'invalid_session';
  }

  return 'backend_unavailable';
}

function redirectIfNeeded(nextPath: string) {
  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (currentPath === nextPath) {
    return;
  }

  window.location.assign(nextPath);
}

export function handleAuthFailure(status: number, reason?: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (shouldThrottleAuthRedirect()) {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const category = classifyAuthFailure(status, reason);

  if (currentPath.startsWith('/admin/auth-error') || currentPath.startsWith('/access-denied')) {
    return;
  }

  switch (category) {
    case 'no_session': {
      logOnce('auth-no-session', '[adminv2/auth] backend returned 401 and no frontend session is active');
      redirectIfNeeded('/sign-in?reason=unauthenticated');
      return;
    }
    case 'invalid_session': {
      const normalizedReason = normalizeReason(reason);
      const reasonQuery = normalizedReason === 'expired_token' ? 'session-invalid' : 'backend-unauthorized';
      logOnce('auth-invalid-session', '[adminv2/auth] frontend session exists but backend rejected auth', {
        status,
        reason: normalizedReason || 'unknown',
      });
      redirectIfNeeded(`/admin/auth-error?reason=${reasonQuery}`);
      return;
    }
    case 'insufficient_role':
      logOnce('auth-insufficient-role', '[adminv2/auth] backend denied access for role mismatch');
      redirectIfNeeded('/access-denied');
      return;
    case 'backend_unavailable':
      logOnce('auth-backend-unavailable', '[adminv2/auth] backend unavailable; auth redirect suppressed', {
        status,
        reason: normalizeReason(reason) || 'unknown',
      });
      return;
    default:
      return;
  }
}
