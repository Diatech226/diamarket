const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const appConfig = require('./config/appConfig');
const { seedAdminUser } = require('./services/adminSeeder');
const errorHandler = require('./middleware/errorHandler');
const { error } = require('./utils/http');
const { getAuthRuntimeStatus } = require('./services/diaexpressAuthService');
const { DOMAIN_REGISTRY } = require('./src/domains');
const requestContextMiddleware = require('./middleware/requestContext');
const { logger } = require('./src/shared/observability/logger');
const { metrics } = require('./src/shared/observability/metrics');
const metricsMiddleware = require('./middleware/metrics');
const { validateStartupConfig } = require('./config/startupValidation');
const { buildRateLimiter } = require('./middleware/rateLimit');

const app = express();
let httpServer = null;

const shutdownAfterFatal = (eventName, fatalError) => {
  logger.error('errors', eventName, {
    errorMessage: fatalError?.message || String(fatalError),
    stack: fatalError?.stack,
  });

  if (httpServer) {
    httpServer.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 5000).unref();
    return;
  }

  process.exit(1);
};

process.on('unhandledRejection', (reason) => {
  shutdownAfterFatal('process.unhandled_rejection', reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', (fatalError) => {
  shutdownAfterFatal('process.uncaught_exception', fatalError);
});

// Middleware global
const corsOrigins = appConfig.server.corsOrigins;
const corsOptions = corsOrigins.length
  ? { origin: corsOrigins, credentials: true }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestContextMiddleware);
app.use(metricsMiddleware);

const authRateLimiter = buildRateLimiter({ windowMs: 60_000, maxRequests: 40, keyPrefix: 'auth' });
const adminRateLimiter = buildRateLimiter({ windowMs: 60_000, maxRequests: 120, keyPrefix: 'admin' });
app.use('/api/auth', authRateLimiter);
app.use('/api/admin', adminRateLimiter);
app.use('/api/v1/admin', adminRateLimiter);

app.locals.db = {
  connected: false,
  source: 'none',
  mode: 'required',
  degradedReason: 'Startup pending: database not initialized yet.',
  attemptedModes: [],
  dnsResolution: null,
  connectionAttempt: null,
  fallback: null,
  error: null,
};

const deriveSystemState = () => {
  if (app.locals.db.connected) {
    return 'healthy';
  }

  if (app.locals.db.connectionAttempt?.status === 'failed') {
    return 'unavailable';
  }

  return 'degraded';
};

const paymentStatusSummary = () => {
  if (!appConfig.services.diaPay.baseUrl) {
    return {
      status: 'degraded',
      reason: 'DIAPAY_BASE_URL not configured',
    };
  }

  return {
    status: 'configured',
    reason: null,
  };
};

const buildHealthPayload = () => {
  const state = deriveSystemState();
  const statusCode = state === 'healthy' ? 200 : state === 'degraded' ? 200 : 503;

  return {
    statusCode,
    payload: {
      data: {
        ok: state === 'healthy',
        status: state,
        service: 'diaexpress-backend',
        env: appConfig.runtime.environment,
        db: {
          status: app.locals.db.connected ? 'connected' : 'failed',
          mode: app.locals.db.mode || (app.locals.db.connected ? 'atlas' : 'degraded'),
          source: app.locals.db.source,
          attemptedModes: app.locals.db.attemptedModes || [],
          connectionAttempt: app.locals.db.connectionAttempt || null,
          reason: app.locals.db.degradedReason || app.locals.db.error?.message || null,
        },
        auth: {
          status: getAuthRuntimeStatus()?.enabled ? 'healthy' : 'degraded',
          mode: getAuthRuntimeStatus()?.provider || 'unknown',
        },
        payments: paymentStatusSummary(),
        degradedMode: state !== 'healthy',
        timestamp: new Date().toISOString(),
        domains: Object.keys(DOMAIN_REGISTRY),
      },
      meta: {},
    },
  };
};

app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  const result = buildHealthPayload();
  return res.status(result.statusCode).json(result.payload);
});

app.get('/api/health/live', (_req, res) => {
  return res.status(200).json({ data: { status: 'healthy', service: 'diaexpress-backend', timestamp: new Date().toISOString() }, meta: {} });
});

app.get('/api/health/ready', (_req, res) => {
  const result = buildHealthPayload();
  const statusCode = result.payload.data.status === 'unavailable' ? 503 : 200;
  return res.status(statusCode).json(result.payload);
});


app.get('/api/metrics', (_req, res) => {
  return res.status(200).json({
    success: true,
    data: metrics.summary(),
    meta: {
      generatedAt: new Date().toISOString(),
    },
  });
});

const requireMongoConnection = (req, res, next) => {
  if (app.locals.db.connected) {
    return next();
  }

  return error(res, {
    status: 503,
    code: 'DB_UNAVAILABLE',
    category: 'DATABASE',
    message: 'MongoDB unavailable. Backend is running only because ALLOW_DEGRADED_MODE=true.',
    details: {
      mode: app.locals.db.mode || 'unavailable',
      source: app.locals.db.source || 'none',
      reason: app.locals.db.degradedReason || app.locals.db.error?.message || 'MongoDB connection is not established.',
      attemptedModes: app.locals.db.attemptedModes || [],
    },
  });
};

app.use(requireMongoConnection);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/package-types', require('./routes/packageType'));
app.use('/api/expeditions', require('./routes/expeditions'));
app.use('/api/admin/quotes', require('./routes/adminQuotes'));
app.use('/api/admin/market-points', require('./routes/marketPoints'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/schedules', require('./routes/Schedules'));
app.use('/api/admin', require('./routes/logisticsAdmin'));
const adminRouter = require('./routes/v1/admin');

app.use('/api/v1/admin', adminRouter);
app.use('/api/admin', adminRouter); // Legacy path for admin frontend
app.use('/api/v1/public', require('./routes/v1/public'));

app.use('/api/uploads', require('./routes/uploads'));
app.use('/uploads', express.static('uploads')); // pour servir les images

async function bootstrapServices(startupProfile) {
  logger.info('startup', 'bootstrap.started', { startupProfile });
  const dbState = await connectDB();
  app.locals.db = dbState;

  if (dbState.connected) {
    logger.info('startup', 'db.connected', { source: dbState.source, mode: dbState.mode, uriSummary: dbState.uriSummary });
    await seedAdminUser();
    logger.info('startup', 'admin.seed_checked');
    logger.info('startup', 'server.ready', { dbSource: dbState.source });
    return;
  }

  logger.error('startup', 'server.db_unavailable', { reason: dbState.degradedReason || dbState.error?.message || 'unknown_db_error' });
  logger.warn('startup', 'admin.seed_skipped_db_offline');
  if (!startupProfile.degradedAllowed) {
    throw new Error('MongoDB unavailable. Set a valid MONGODB_URI (Atlas) or explicitly enable local fallback with MONGODB_ALLOW_LOCAL_FALLBACK=true and MONGODB_LOCAL_URI.');
  }

  logger.error('startup', 'server.ready_db_unavailable', { reason: dbState.degradedReason || dbState.error?.message || 'unknown_db_error' });
}

async function startServer() {
  const PORT = appConfig.server.port;
  const startupProfile = validateStartupConfig();

  logger.info('startup', 'server.starting', { port: PORT, startupProfile });

  httpServer = app.listen(PORT, () => {
    logger.info('startup', 'server.listening', { url: `http://localhost:${PORT}`, port: PORT });
    logger.info('startup', 'express.ready', { health: '/health', readiness: '/api/health/ready' });
  });

  httpServer.on('error', (listenError) => {
    shutdownAfterFatal('startup.server.listen_failed', listenError);
  });

  await bootstrapServices(startupProfile);
}

app.use(errorHandler);

startServer().catch((startupError) => {
  shutdownAfterFatal('startup.server.start_failed', startupError);
});
