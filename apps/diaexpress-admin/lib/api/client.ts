import { applyAuthHeader, handleAuthFailure, type AuthTokenFailureReason } from './auth';

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 400;

const LOGISTICS_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
  process.env.ADMIN_API_BASE_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_LOGISTICS_API_BASE_URL ||
  'http://localhost:5000';
const DIAPAY_BASE_URL =
  process.env.NEXT_PUBLIC_DIAPAY_ADMIN_API_BASE_URL ||
  process.env.ADMIN_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api/v1/admin';

export type ApiTarget = 'logistics' | 'diapay';

export type ApiRequestOptions = RequestInit & {
  authToken?: string | null;

  target?: ApiTarget;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  /**
   * Pass a plain object to stringify as JSON. If you need to send FormData or a string body,
   * provide it directly via `body`.
   */
  json?: object;
};

export class ApiError<T = unknown> extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: T,
    public reason?: string | null,
    public requestId?: string | null
  ) {
    super(message);
  }
}

const BASE_URLS: Record<ApiTarget, string> = {
  logistics: LOGISTICS_BASE_URL,
  diapay: DIAPAY_BASE_URL
};

export function getApiBaseUrl(target: ApiTarget = 'logistics') {
  return BASE_URLS[target];
}

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}

export function buildQueryString(params?: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null || rawValue === '') return;
    search.set(key, String(rawValue));
  });

  return search.toString();
}

export function buildApiUrl(
  path: string,
  searchParams?: Record<string, string | number | boolean | undefined | null>,
  target: ApiTarget = 'logistics'
) {
  const base = ensureTrailingSlash(BASE_URLS[target]);
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, base);

  const queryString = buildQueryString(searchParams);
  if (queryString) {
    url.search = queryString;
  }

  return url.toString();
}

function isJsonContentType(contentType: string | null) {
  return contentType?.includes('application/json') ?? false;
}

async function parsePayload(response: Response) {
  const contentType = response.headers.get('content-type');
  const text = await response.text();

  if (!text) {
    return null;
  }

  if (isJsonContentType(contentType)) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  const trimmed = text.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string' && payload.trim().length) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const maybePayload = payload as {
      message?: string;
      error?: string | { message?: string };
      errors?: unknown;
    };
    if (typeof maybePayload.message === 'string' && maybePayload.message.trim().length) {
      return maybePayload.message;
    }
    if (
      maybePayload.error &&
      typeof maybePayload.error === 'object' &&
      typeof maybePayload.error.message === 'string' &&
      maybePayload.error.message.trim().length
    ) {
      return maybePayload.error.message;
    }
    if (typeof maybePayload.error === 'string' && maybePayload.error.trim().length) {
      return maybePayload.error;
    }
    if (Array.isArray(maybePayload.errors) && maybePayload.errors.length) {
      return String(maybePayload.errors[0]);
    }
  }

  return fallback;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function extractAuthReason(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const directReason = (payload as { reason?: unknown }).reason;
  if (typeof directReason === 'string' && directReason.trim().length) {
    return directReason.trim();
  }

  const nestedReason = (payload as { error?: { details?: { reason?: unknown } } }).error?.details?.reason;
  if (typeof nestedReason === 'string' && nestedReason.trim().length) {
    return nestedReason.trim();
  }

  return null;
}

function extractRequestId(response: Response, payload: unknown): string | null {
  const headerRequestId = response.headers.get('x-request-id') || response.headers.get('x-correlation-id');
  if (headerRequestId) {
    return headerRequestId;
  }

  if (payload && typeof payload === 'object') {
    const payloadRequestId = (payload as { requestId?: unknown }).requestId;
    if (typeof payloadRequestId === 'string' && payloadRequestId.trim()) {
      return payloadRequestId.trim();
    }
  }

  return null;
}

function resolveFriendlyAuthMessage(reason: string | null, fallback: string) {
  switch (reason) {
    case 'missing_token':
      return "Le backend n'a reçu aucun jeton. Réessayez dans quelques secondes.";
    case 'invalid_token':
      return "Le backend a refusé le jeton d'authentification.";
    case 'expired_token':
      return "Votre session a expiré. Actualisez la page pour relancer l'authentification.";
    case 'role_forbidden':
      return "Votre compte n'a pas les permissions nécessaires.";
    default:
      return fallback;
  }
}

function logApiError(details: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.error('[adminv2/api]', details);
}



function mapAuthFailureToBackendReason(reason: AuthTokenFailureReason | null): string {
  if (reason === 'token_template_not_found') {
    return 'token_template_not_found';
  }

  return 'missing_token';
}

function shouldBlockProtectedRequest(authFailure: AuthTokenFailureReason | null) {
  return authFailure === 'token_template_not_found' || authFailure === 'no_token' || authFailure === 'missing_auth_context';
}

function sleep(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function shouldRetry(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return error.status === 408 || error.status === 429 || error.status >= 500;
}

export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    json,
    searchParams,
    target = 'logistics',
    authToken = null,
    ...rest
  } = options;
  const headers = new Headers(rest.headers);

  let body = rest.body;
  if (json) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(json);
  }

  if (!headers.has('Content-Type') && body && typeof body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const url = buildApiUrl(path, searchParams, target);
  let refreshedAfterExpiry = false;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const authResolution = await applyAuthHeader(headers, { token: authToken, forceFresh: refreshedAfterExpiry });

      if (!authResolution.token && shouldBlockProtectedRequest(authResolution.failureReason)) {
        const authReason = mapAuthFailureToBackendReason(authResolution.failureReason);
        const message =
          authReason === 'token_template_not_found'
            ? "Le template JWT Clerk configuré est introuvable. Vérifiez la configuration du template backend."
            : "Aucun jeton d'authentification backend n'a pu être obtenu pour cette requête.";

        handleAuthFailure(401, authReason);
        throw new ApiError(message, 401, {
          reason: authReason,
          detail: authResolution.detail,
          template: authResolution.template,
        } as T, authReason, null);
      }

      const response = await fetch(url, {
        ...rest,
        body,
        headers,
        credentials: rest.credentials ?? 'include',
        signal: controller.signal
      });

      const payload = await parsePayload(response);

      if (!response.ok) {
        const authReason = extractAuthReason(payload);
        const requestId = extractRequestId(response, payload);
        const message = extractErrorMessage(payload, response.statusText || 'Erreur API');
        const resolvedMessage =
          response.status === 401 || response.status === 403 ? resolveFriendlyAuthMessage(authReason, message) : message;
        logApiError({ url, status: response.status, message, reason: authReason, payload, attempt });

        if (response.status === 401 && authReason === 'expired_token' && !refreshedAfterExpiry) {
          refreshedAfterExpiry = true;
          logApiError({ url, status: response.status, reason: authReason, action: 'refresh_token_retry' });
          await sleep(50);
          continue;
        }

        if (response.status === 401 || response.status === 403) {
          handleAuthFailure(response.status, authReason);
        }

        throw new ApiError(resolvedMessage, response.status, payload as T, authReason, requestId);
      }

      return unwrapData<T>(payload);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        const timeoutError = new ApiError('Requête expirée', 408);
        if (attempt < retries && shouldRetry(timeoutError)) {
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }
        throw timeoutError;
      }

      if (error instanceof ApiError) {
        if (attempt < retries && shouldRetry(error)) {
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }
        throw error;
      }

      logApiError({ url, error, attempt });
      const networkError = new ApiError('Impossible de contacter le serveur', 503);
      if (attempt < retries && shouldRetry(networkError)) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }
      throw networkError;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new ApiError('Impossible de contacter le serveur', 503);
}
