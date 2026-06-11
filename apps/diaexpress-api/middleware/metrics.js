const { metrics } = require('../src/lib/observability/metrics');

function deriveBusinessMetric(req, res) {
  const path = req.path || req.originalUrl || '';

  if (req.method === 'POST' && path === '/api/quotes' && res.statusCode < 400) {
    metrics.increment('quote_creation_rate');
  }

  if (req.method === 'POST' && /\/api\/quotes\/[^/]+\/confirm$/.test(path) && res.statusCode < 400) {
    metrics.increment('quote_approval_rate');
  }

  if (req.method === 'POST' && /\/api\/shipments\/(from-quote|create-from-quote)$/.test(path) && res.statusCode < 400) {
    metrics.increment('shipment_creation_rate');
  }

  if (req.method === 'PATCH' && /\/api\/shipments\/[^/]+\/status$/.test(path) && res.statusCode >= 400) {
    metrics.increment('shipment_exception_count');
  }

  if (req.method === 'POST' && /\/api\/payments/.test(path)) {
    metrics.increment(res.statusCode < 400 ? 'payment_success_rate' : 'payment_failure_rate');
  }

  if (/\/api\/(reservations|schedules)/.test(path) && res.statusCode >= 400) {
    metrics.increment('planning_capacity_exceptions');
  }
}

module.exports = function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const latencyMs = Date.now() - start;
    metrics.observe('request_latency_ms', latencyMs, { method: req.method, route: req.route?.path || req.path || 'unknown' });
    metrics.increment('request_total', 1, { method: req.method, status: String(res.statusCode) });

    if (res.statusCode >= 400) {
      metrics.increment('request_error_rate', 1, { method: req.method, status: String(res.statusCode) });
      if (res.statusCode === 401 || res.statusCode === 403) {
        metrics.increment('auth_failures');
      }
    }

    deriveBusinessMetric(req, res);
  });

  next();
};
