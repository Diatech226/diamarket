process.env.NODE_ENV ||= 'development';

// Do not enable degraded mode or local MongoDB fallback implicitly.
// Startup must fail fast unless the operator explicitly opts in via env.
require('../server');
