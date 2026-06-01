import { API_BASE } from './api';

const RETRIABLE_STATUS = new Set([404, 405, 408, 425, 429, 500, 502, 503, 504]);
const RETRIABLE_ERROR_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN', 'ABORT_ERR']);

const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || '8000', 10);
const MAX_RETRIES = Number.parseInt(process.env.NEXT_PUBLIC_API_RETRY_COUNT || '2', 10);

const coerceArray = (payload, keys = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    const value = payload?.[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const requestWithFallback = async (paths, options) => {
  let lastError = null;

  for (let index = 0; index < paths.length; index += 1) {
    const path = paths[index];

    try {
      return await apiRequest(path, options);
    } catch (error) {
      const isLastPath = index === paths.length - 1;

      if (!isLastPath && RETRIABLE_STATUS.has(error?.status)) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
};

const buildUrl = (path) => {
  if (!path) {
    throw new Error('Path is required for API requests');
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalisedPath}`;
};


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error, attempt) => {
  if (attempt >= MAX_RETRIES) {
    return false;
  }

  if (error?.isBackendUnavailable) {
    return true;
  }

  if (RETRIABLE_STATUS.has(error?.status)) {
    return true;
  }

  if (error?.code && RETRIABLE_ERROR_CODES.has(error.code)) {
    return true;
  }

  return false;
};

const decorateUnavailableError = (error, path) => {
  if (error?.isBackendUnavailable) {
    return error;
  }

  const fallback = new Error('Backend offline: DiaExpress API is unavailable.');
  fallback.status = error?.status || 503;
  fallback.code = error?.code || 'BACKEND_UNAVAILABLE';
  fallback.path = path;
  fallback.isBackendUnavailable = true;
  fallback.cause = error;
  return fallback;
};

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Unable to parse API response as JSON', error);
    return null;
  }
};

const unwrapSuccessPayload = (payload) => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  return payload;
};

const getErrorMessage = (payload, fallback) => {
  if (payload?.error?.message) {
    return payload.error.message;
  }
  if (payload?.message) {
    return payload.message;
  }
  if (typeof payload?.error === 'string') {
    return payload.error;
  }
  return fallback;
};

export const apiRequest = async (path, { method = 'GET', token, body, headers, timeoutMs = REQUEST_TIMEOUT_MS } = {}) => {
  const requestHeaders = new Headers(headers || {});

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (body !== undefined && body !== null && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(buildUrl(path), {
        method,
        headers: requestHeaders,
        body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const payload = await parseJsonSafely(response);

      if (!response.ok) {
        const message = getErrorMessage(payload, `API request failed with status ${response.status}`);
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw decorateUnavailableError(error, path);
        }

        throw error;
      }

      return unwrapSuccessPayload(payload);
    } catch (error) {
      clearTimeout(timeout);

      const normalizedError =
        error?.name === 'AbortError'
          ? Object.assign(new Error(`API timeout after ${timeoutMs}ms`), {
              status: 408,
              code: 'ABORT_ERR',
              isBackendUnavailable: true,
            })
          : error;

      const maybeUnavailable =
        normalizedError?.isBackendUnavailable || RETRIABLE_ERROR_CODES.has(normalizedError?.code)
          ? decorateUnavailableError(normalizedError, path)
          : normalizedError;

      if (shouldRetry(maybeUnavailable, attempt)) {
        const delay = 250 * (attempt + 1);
        console.warn(`[api] request retry ${attempt + 1}/${MAX_RETRIES} for ${method} ${path} in ${delay}ms`, {
          message: maybeUnavailable?.message,
          code: maybeUnavailable?.code,
          status: maybeUnavailable?.status,
        });
        await sleep(delay);
        attempt += 1;
        continue;
      }

      throw maybeUnavailable;
    }
  }

  throw new Error(`API request failed after ${MAX_RETRIES + 1} attempts`);
};

export const fetchAdminQuotes = async (token) => {
  const data = await requestWithFallback(
    ['/api/admin/quotes', '/api/quotes', '/api/quotes/all'],
    { token },
  );

  return coerceArray(data, ['quotes']);
};

export const updateQuoteStatus = (quoteId, status, token, extra = {}) =>
  apiRequest(`/api/quotes/${quoteId}/status`, {
    method: 'PATCH',
    token,
    body: { status, ...extra },
  });

export const adminQuoteAction = (quoteId, action, payload = {}, token) =>
  apiRequest(`/api/quotes/${quoteId}/${action}`, {
    method: 'POST',
    token,
    body: payload,
  });

export const estimateQuote = (payload) => apiRequest('/api/quotes/estimate', { method: 'POST', body: payload });

export const createQuote = (payload, token) =>
  apiRequest('/api/quotes', {
    method: 'POST',
    token,
    body: payload,
  });

export const createShipmentFromQuote = (quoteId, token) =>
  apiRequest('/api/shipments/create-from-quote', {
    method: 'POST',
    token,
    body: { quoteId },
  });

export const fetchAdminPricing = async (token) => {
  const data = await requestWithFallback(['/api/admin/pricing', '/api/pricing'], { token });
  return coerceArray(data, ['pricings', 'data']);
};

export const savePricing = (payload, token) =>
  requestWithFallback(['/api/admin/pricing', '/api/pricing'], {
    method: 'POST',
    token,
    body: payload,
  });

export const updatePricing = (pricingId, payload, token) =>
  requestWithFallback(
    [`/api/admin/pricing/${pricingId}`, `/api/pricing/${pricingId}`],
    {
      method: 'PUT',
      token,
      body: payload,
    },
  );

export const deletePricing = (pricingId, token) =>
  requestWithFallback(
    [`/api/admin/pricing/${pricingId}`, `/api/pricing/${pricingId}`],
    {
      method: 'DELETE',
      token,
    },
  );

export const fetchAdminShipments = async (token) => {
  const data = await requestWithFallback(['/api/admin/shipments', '/api/shipments'], { token });
  return coerceArray(data, ['shipments', 'data']);
};

export const updateShipmentStatus = (shipmentId, status, token, extra = {}) =>
  requestWithFallback(
    [`/api/admin/shipments/${shipmentId}/status`, `/api/shipments/${shipmentId}/status`],
    {
      method: 'PATCH',
      token,
      body: { status, ...extra },
    },
  );

export const deleteShipment = (shipmentId, token) =>
  requestWithFallback(
    [`/api/admin/shipments/${shipmentId}`, `/api/shipments/${shipmentId}`],
    {
      method: 'DELETE',
      token,
    },
  );

export const fetchCurrentUser = async (token) => {
  const data = await requestWithFallback(['/api/admin/users/me', '/api/users/me'], { token });
  if (data?.user) {
    return data.user;
  }
  return data;
};

export const fetchQuoteMeta = () => apiRequest('/api/quotes/meta');

export const fetchQuoteById = async (quoteId, token) => {
  if (!quoteId) {
    throw new Error('quoteId is required');
  }

  const data = await apiRequest(`/api/quotes/${quoteId}`, { token });
  return data?.quote || data || null;
};

export const deleteQuote = (quoteId, token) => {
  if (!quoteId) {
    throw new Error('quoteId is required');
  }

  return apiRequest(`/api/quotes/${quoteId}`, {
    method: 'DELETE',
    token,
  });
};

export const fetchClientQuotes = async (token) => {
  const data = await apiRequest('/api/quotes/me', { token });
  if (Array.isArray(data?.quotes)) {
    return data.quotes;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const fetchClientShipments = async (token) => {
  const data = await apiRequest('/api/shipments/me', { token });
  if (Array.isArray(data?.shipments)) {
    return data.shipments;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const fetchShipmentById = async (shipmentId, token) => {
  if (!shipmentId) {
    throw new Error('shipmentId is required');
  }

  const data = await apiRequest(`/api/shipments/${shipmentId}`, { token });
  return data?.shipment || data || null;
};

export const fetchPublicPricingRoutes = () => apiRequest('/api/pricing/routes');

export default {
  apiRequest,
  fetchAdminQuotes,
  updateQuoteStatus,
  adminQuoteAction,
  estimateQuote,
  createQuote,
  createShipmentFromQuote,
  fetchAdminPricing,
  savePricing,
  updatePricing,
  deletePricing,
  fetchAdminShipments,
  updateShipmentStatus,
  deleteShipment,
  fetchCurrentUser,
  fetchClientQuotes,
  fetchClientShipments,
  fetchQuoteMeta,
  fetchQuoteById,
  deleteQuote,
  fetchShipmentById,
  fetchPublicPricingRoutes,
};
