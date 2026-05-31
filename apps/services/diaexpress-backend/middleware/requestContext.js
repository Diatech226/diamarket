const crypto = require('crypto');
const { runWithContext, getRequestContext } = require('../src/shared/observability/requestContext');
const { logger } = require('../src/shared/observability/logger');

function generateId() {
  return crypto.randomUUID();
}

function requestContextMiddleware(req, res, next) {
  const incomingRequestId = req.get('x-correlation-id') || req.get('x-request-id');
  const requestId = incomingRequestId || generateId();
  const startedAt = Date.now();

  runWithContext(
    {
      requestId,
      method: req.method,
      route: req.originalUrl,
      actorId: null,
    },
    () => {
      req.correlationId = requestId;
      req.requestId = requestId;
      res.setHeader('x-correlation-id', requestId);
      res.setHeader('x-request-id', requestId);

      logger.info('request', 'request.started', {
        path: req.originalUrl,
        userAgent: req.get('user-agent') || null,
      });

      res.on('finish', () => {
        const context = getRequestContext();
        logger.info('request', 'request.completed', {
          statusCode: res.statusCode,
          latencyMs: Date.now() - startedAt,
          actorId: req.user?._id?.toString?.() || context?.actorId || null,
          path: req.originalUrl,
        });
      });

      next();
    },
  );
}

module.exports = requestContextMiddleware;
