import { buildApiUrl } from '@/lib/api/client';
import { resolveAppRouterAuthToken } from '@/lib/api/auth.server';
import { normalizeAdminRole } from '@/lib/auth/roles';

type BackendUser = {
  role?: string;
  email?: string;
};

export type BackendAuthStatus =
  | { ok: true; user: BackendUser }
  | { ok: false; status: 401 | 403 | 500 | 503; reason: string; requestId?: string | null; detail?: string | null };

function extractBackendReason(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const directReason = (payload as { reason?: unknown }).reason;
  if (typeof directReason === 'string' && directReason.trim()) {
    return directReason.trim();
  }

  const nestedReason = (payload as { error?: { details?: { reason?: unknown } } }).error?.details?.reason;
  if (typeof nestedReason === 'string' && nestedReason.trim()) {
    return nestedReason.trim();
  }

  const code = (payload as { error?: { code?: unknown }; code?: unknown }).error?.code ?? (payload as { code?: unknown }).code;
  if (typeof code === 'string' && code.trim()) {
    return code.trim();
  }

  const message = (payload as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return fallback;
}

function extractBackendDetail(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const message = (payload as { error?: { message?: unknown }; message?: unknown }).error?.message ?? (payload as { message?: unknown }).message;
  return typeof message === 'string' && message.trim() ? message.trim() : null;
}

function normalizeBackendReason(reason: string) {
  const normalized = reason.trim().toLowerCase();
  if (normalized.includes('mongo') || normalized.includes('database') || normalized.includes('db')) {
    return 'database_unavailable';
  }

  if (normalized.includes('auth') || normalized.includes('token') || normalized.includes('identity')) {
    return 'auth_backend_error';
  }

  return normalized || 'server_error';
}

export async function resolveBackendAdminStatus(): Promise<BackendAuthStatus> {
  const authToken = await resolveAppRouterAuthToken(true);

  if (process.env.NODE_ENV !== 'production') {
    console.info('[adminv2/auth] Backend admin auth token resolution', {
      tokenPresent: Boolean(authToken.token),
      usedTemplate: authToken.usedTemplate,
      errorReason: authToken.errorReason,
      errorDetail: authToken.errorDetail,
    });
  }

  if (!authToken.token) {
    const reason = authToken.errorReason === 'token_template_not_found' ? 'token_template_not_found' : 'missing_token';
    return { ok: false, status: 401, reason, requestId: null, detail: authToken.errorDetail };
  }

  try {
    const response = await fetch(buildApiUrl('api/users/me'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken.token}`,
      },
      cache: 'no-store',
    });

    const requestId = response.headers.get('x-request-id') || response.headers.get('x-correlation-id');
    const payload = (await response.json().catch(() => null)) as { user?: BackendUser; data?: BackendUser } | null;

    if (response.status === 401) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[adminv2/auth] Backend rejected Clerk token for /api/users/me', {
          status: response.status,
          reason: extractBackendReason(payload, 'unauthenticated'),
          requestId,
          detail: extractBackendDetail(payload),
        });
      }

      return {
        ok: false,
        status: 401,
        reason: extractBackendReason(payload, 'unauthenticated'),
        requestId,
        detail: extractBackendDetail(payload),
      };
    }

    if (response.status === 403) {
      return {
        ok: false,
        status: 403,
        reason: extractBackendReason(payload, 'role_forbidden'),
        requestId,
        detail: extractBackendDetail(payload),
      };
    }

    if (!response.ok) {
      if (response.status === 503) {
        return {
          ok: false,
          status: 503,
          reason: normalizeBackendReason(extractBackendReason(payload, 'backend_unavailable')),
          requestId,
          detail: extractBackendDetail(payload),
        };
      }

      return {
        ok: false,
        status: 500,
        reason: normalizeBackendReason(extractBackendReason(payload, 'server_error')),
        requestId,
        detail: extractBackendDetail(payload),
      };
    }

    const user = payload?.user || payload?.data || {};

    if (normalizeAdminRole(user.role) !== 'admin') {
      return { ok: false, status: 403, reason: 'role_forbidden', requestId };
    }

    return { ok: true, user };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[adminv2/auth] Backend admin status network failure', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return { ok: false, status: 503, reason: 'backend_unavailable', requestId: null };
  }
}
