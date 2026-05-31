const { ApiError, error } = require('../utils/http');
const { classifyErrorCode } = require('../src/shared/errors/errorCatalog');
const { logger } = require('../src/shared/observability/logger');

const errorHandler = (err, req, res, _next) => {
  const status = err?.status || err?.statusCode || 500;
  const code = err?.code || (err instanceof ApiError ? err.code : 'INTERNAL_ERROR');
  const category = classifyErrorCode(code);
  const message = status >= 500 ? 'Internal server error' : err.message || 'Request failed';
  const requestId = req?.requestId || res.getHeader('x-correlation-id') || res.getHeader('x-request-id') || null;

  logger[status >= 500 ? 'error' : 'warn']('errors', 'request.failed', {
    code,
    category,
    status,
    path: req?.originalUrl,
    method: req?.method,
    requestId,
    errorMessage: err?.message,
    stack: status >= 500 ? err?.stack : undefined,
  });

  const details = status >= 500 && !(err instanceof ApiError && err.exposeDetails) ? undefined : err?.details;

  return error(res, {
    status,
    code,
    category,
    message,
    details,
  });
};

module.exports = errorHandler;
