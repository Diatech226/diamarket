const textForType = {
  validation: 'Some fields are invalid. Please review your input and try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  network: 'Network issue while contacting DiaExpress. Please retry in a moment.',
  system: 'The service is temporarily unavailable. Please retry soon.',
  upstream: 'A temporary upstream service issue occurred. Please retry shortly.',
  unknown: 'An unexpected error occurred. Please try again.',
};

const extractReference = (error) => {
  const fromBody = error?.response?.data?.error?.reference;
  const fromHeaders =
    error?.response?.headers?.['x-correlation-id'] ||
    error?.response?.headers?.['x-request-id'] ||
    null;

  return fromBody || fromHeaders || null;
};

export const normalizeApiError = (error, fallbackMessage) => {
  const status = Number(error?.status || error?.response?.status || 0);
  const rawMessage = error?.message || error?.response?.data?.error?.message || error?.response?.data?.message || '';
  const reference = extractReference(error);

  if (status === 401 || status === 403) {
    return { type: 'unauthorized', message: fallbackMessage || textForType.unauthorized, status, reference };
  }

  if (status === 400 || status === 422) {
    return { type: 'validation', message: rawMessage || fallbackMessage || textForType.validation, status, reference };
  }

  if ([502, 503, 504].includes(status)) {
    return { type: 'upstream', message: fallbackMessage || textForType.upstream, status, reference };
  }

  if (status >= 500) {
    return { type: 'system', message: fallbackMessage || textForType.system, status, reference };
  }

  if (
    error?.isBackendUnavailable ||
    ['TypeError', 'AbortError'].includes(error?.name) ||
    ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN', 'ABORT_ERR'].includes(error?.code)
  ) {
    return { type: 'network', message: fallbackMessage || textForType.network, status: status || 0, reference };
  }

  return {
    type: 'unknown',
    message: rawMessage || fallbackMessage || textForType.unknown,
    status,
    reference,
  };
};
