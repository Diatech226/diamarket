const { error } = require('../utils/http');
const { logger } = require('../src/lib/observability/logger');

function buildRateLimiter({ windowMs, maxRequests, keyPrefix }) {
  const buckets = new Map();

  return (req, res, next) => {
    const identifier = `${keyPrefix}:${req.ip || 'unknown'}`;
    const now = Date.now();
    const current = buckets.get(identifier);

    if (!current || now > current.resetAt) {
      buckets.set(identifier, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      logger.warn('auth', 'rate_limit.exceeded', {
        keyPrefix,
        ip: req.ip || 'unknown',
        path: req.originalUrl,
      });
      return error(res, {
        status: 429,
        code: 'RATE_LIMITED',
        category: 'auth',
        message: 'Too many requests. Please retry later.',
      });
    }

    current.count += 1;
    return next();
  };
}

module.exports = {
  buildRateLimiter,
};
