const mongoose = require('mongoose');
const dns = require('node:dns').promises;
const { metrics } = require('../src/lib/observability/metrics');
const { logger } = require('../src/lib/observability/logger');

const DEFAULT_LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/diaexpress';
const DEFAULT_MONGO_SERVER_SELECTION_TIMEOUT_MS = 5000;
const DEFAULT_MONGO_CONNECT_TIMEOUT_MS = 8000;
const DEFAULT_MONGO_SOCKET_TIMEOUT_MS = 20000;
const DEFAULT_MONGO_DNS_TIMEOUT_MS = 3000;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const withTimeout = (promise, timeoutMs, timeoutMessage) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(timeoutMessage);
      error.code = 'ETIMEOUT';
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const URI_PATTERN = /^mongodb(\+srv)?:\/\//i;
const LOCAL_URI_PATTERN = /^mongodb:\/\//i;
const DB_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const isDnsError = (error) => {
  const message = error?.message || '';
  return error?.code === 'ENOTFOUND' || /enotfound/i.test(message);
};

const isAuthError = (error) => {
  const message = error?.message || '';
  return error?.code === 18 || /auth(entication)? failed|bad auth/i.test(message);
};

const isIpAccessListError = (error) => {
  const message = error?.message || '';
  return /whitelist|not in your atlas|ip access list|not authorized from this ip/i.test(message);
};

const isNetworkDeniedError = (error) => {
  const message = error?.message || '';
  const code = String(error?.code || '').toUpperCase();
  return (
    isIpAccessListError(error) ||
    ['ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'ENETUNREACH', 'ECONNRESET'].includes(code) ||
    /connection timed out|network.*unreachable|connection refused|server selection timed out/i.test(message)
  );
};

const isLocalRefusedError = (error) => {
  const message = error?.message || '';
  return /ECONNREFUSED\s+127\.0\.0\.1:27017|connect ECONNREFUSED/i.test(message);
};

const extractMongoSrvHost = (uri = '') => {
  if (!uri.startsWith('mongodb+srv://')) return null;

  const withoutScheme = uri.replace('mongodb+srv://', '');
  const atIndex = withoutScheme.indexOf('@');
  const hostStart = atIndex >= 0 ? atIndex + 1 : 0;
  const hostAndPath = withoutScheme.slice(hostStart);
  const slashIndex = hostAndPath.indexOf('/');

  return (slashIndex >= 0 ? hostAndPath.slice(0, slashIndex) : hostAndPath).trim() || null;
};

const summariseUri = (uri = '') => {
  if (!uri) return 'not set';

  const isSrv = uri.startsWith('mongodb+srv://');
  const scheme = isSrv ? 'mongodb+srv://' : 'mongodb://';
  const withoutScheme = uri.startsWith(scheme) ? uri.slice(scheme.length) : uri;
  const atIndex = withoutScheme.lastIndexOf('@');
  const hostAndPath = atIndex >= 0 ? withoutScheme.slice(atIndex + 1) : withoutScheme;
  const slashIndex = hostAndPath.indexOf('/');
  const host = (slashIndex >= 0 ? hostAndPath.slice(0, slashIndex) : hostAndPath).trim() || 'unknown-host';
  return `${scheme}${host}/***`;
};

const parseMongoUri = (uri, options = {}) => {
  const { allowSrv = true, requireDatabaseName = true, label = 'MONGODB_URI' } = options;
  const trimmed = String(uri || '').trim();

  if (!URI_PATTERN.test(trimmed)) {
    return { valid: false, issues: [{ code: 'INVALID_FORMAT', message: 'URI must start with mongodb:// or mongodb+srv://' }] };
  }

  if (!allowSrv && trimmed.toLowerCase().startsWith('mongodb+srv://')) {
    return {
      valid: false,
      issues: [
        {
          code: 'LOCAL_URI_MUST_NOT_BE_SRV',
          message: 'MONGODB_LOCAL_URI must be a local mongodb:// URI. Use MONGODB_URI for Atlas.',
        },
      ],
    };
  }

  if (!allowSrv && !LOCAL_URI_PATTERN.test(trimmed)) {
    return { valid: false, issues: [{ code: 'INVALID_FORMAT', message: `${label} must start with mongodb://.` }] };
  }

  try {
    const parsed = new URL(trimmed);
    const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, '').trim());
    const issues = [];

    if (!parsed.hostname) {
      issues.push({ code: 'INVALID_FORMAT', message: 'Hostname is missing' });
    } else {
      const invalidHostname =
        /\s/.test(parsed.hostname) ||
        parsed.hostname.startsWith('.') ||
        parsed.hostname.endsWith('.') ||
        parsed.hostname.includes('..');
      if (invalidHostname) {
        issues.push({ code: 'INVALID_FORMAT', message: `Hostname "${parsed.hostname}" is invalid` });
      }
    }

    const isAtlasSrvUri = trimmed.toLowerCase().startsWith('mongodb+srv://');

    if (isAtlasSrvUri) {
      if (!/\.mongodb\.net$/i.test(parsed.hostname || '')) {
        issues.push({
          code: 'INVALID_FORMAT',
          message: `Atlas hostname "${parsed.hostname || 'missing-host'}" is invalid. Expected a MongoDB Atlas SRV host ending with ".mongodb.net".`,
        });
      }
    }

    if (requireDatabaseName) {
      if (!databaseName) {
        issues.push({
          code: 'MISSING_DB_NAME',
          message: 'Database name is required in URI path (for example: /diaexpress or /test).',
        });
      } else if (!DB_NAME_PATTERN.test(databaseName)) {
        issues.push({
          code: 'INVALID_DB_NAME',
          message: `Database name "${databaseName}" is invalid. Use letters, numbers, dots, underscores, or hyphens.`,
        });
      }
    }

    const withoutScheme = trimmed.replace(/^mongodb(\+srv)?:\/\//i, '');
    const atIndex = withoutScheme.indexOf('@');
    if (atIndex > 0) {
      const authSegment = withoutScheme.slice(0, atIndex);
      if (authSegment.includes(':')) {
        const [, password = ''] = authSegment.split(':');
        const decoded = decodeURIComponent(password);
        if (encodeURIComponent(decoded) !== password) {
          issues.push({ code: 'INVALID_FORMAT', message: 'Password appears not URL-encoded' });
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      parsed: {
        hostname: parsed.hostname,
        databaseName,
      },
    };
  } catch (_error) {
    return { valid: false, issues: [{ code: 'INVALID_FORMAT', message: 'URI is malformed and could not be parsed' }] };
  }
};

const normalizeMongoUri = (rawUri, options = {}) => {
  const trimmed = String(rawUri || '').trim();
  const validation = parseMongoUri(trimmed, options);
  if (!validation.valid) {
    return { valid: false, issues: validation.issues, uri: trimmed, autoFixed: false, reason: validation.issues[0]?.code || 'INVALID_FORMAT' };
  }

  return {
    valid: true,
    issues: [],
    uri: trimmed,
    autoFixed: false,
    reason: null,
  };
};

const collectTroubleshootingHints = (error, uri, label) => {
  const hints = [];

  if (isDnsError(error)) {
    const srvHost = extractMongoSrvHost(uri);
    if (srvHost) {
      hints.push(`Atlas hostname invalide ou non résolu: "${srvHost}".`);
    } else {
      hints.push('Atlas hostname invalide ou non résolu.');
    }
    hints.push('Copiez l’URI Atlas exacte depuis Atlas > Connect > Drivers.');
    hints.push('Check DNS configuration: verify local DNS resolvers can resolve SRV records for Atlas.');
    hints.push('Check VPN/proxy settings: disable or adjust them if they block DNS lookups.');
    hints.push('If DNS succeeds, then verify Atlas Network Access IP whitelist for your outbound IP.');
  }

  if (isAuthError(error)) {
    hints.push('Authentication failed. Verify MongoDB username/password and ensure special characters in password are URL-encoded.');
  }

  if (isNetworkDeniedError(error)) {
    hints.push('Atlas rejected this client IP. Add your machine/IP range to Atlas Network Access (IP Access List).');
    hints.push('Check IP whitelist: confirm the current outbound IP is allowed in Atlas Network Access.');
  }

  if (isLocalRefusedError(error)) {
    hints.push('Mongo local non lancé. Démarrez MongoDB local ou mettez à jour MONGODB_LOCAL_URI.');
  }

  if (label === 'MONGODB_URI' && !hints.length) {
    hints.push('Verify Atlas URI format: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/diaexpress?...');
  }

  return hints;
};

const classifyMongoError = (error) => {
  if (isDnsError(error)) return 'DNS_FAILURE';
  if (isAuthError(error)) return 'AUTH_FAILURE';
  if (isNetworkDeniedError(error)) return 'NETWORK_ACCESS_DENIED';
  if (isLocalRefusedError(error)) return 'LOCAL_MONGO_REFUSED';
  return 'UNKNOWN';
};

const resolveSrvDiagnostics = async (uri) => {
  const srvHost = extractMongoSrvHost(uri);
  if (!srvHost) {
    return {
      status: 'not_applicable',
      srvHost: null,
      recordsFound: 0,
      message: 'URI is not SRV-based; DNS SRV resolution skipped.',
    };
  }

  try {
    const dnsTimeoutMs = toPositiveInteger(process.env.MONGODB_DNS_TIMEOUT_MS, DEFAULT_MONGO_DNS_TIMEOUT_MS);
    const records = await withTimeout(
      dns.resolveSrv(`_mongodb._tcp.${srvHost}`),
      dnsTimeoutMs,
      `DNS SRV resolution timed out after ${dnsTimeoutMs}ms for ${srvHost}.`,
    );
    return {
      status: 'ok',
      srvHost,
      recordsFound: records.length,
      message: `Resolved ${records.length} SRV record(s).`,
    };
  } catch (error) {
    return {
      status: 'failed',
      srvHost,
      recordsFound: 0,
      code: error?.code || 'UNKNOWN',
      message: error?.message || 'DNS SRV resolution failed.',
      guidance: [
        'Check Atlas hostname: ensure it is copied exactly from Atlas cluster connection details.',
        'Check DNS configuration: verify this environment can resolve SRV records.',
        'Check IP whitelist: if DNS succeeds but connection fails, allow this host IP in Atlas Network Access.',
      ],
    };
  }
};

const formatMongoError = (error, uri, label) => ({
  target: label,
  uriSummary: summariseUri(uri),
  code: error?.code || 'UNKNOWN',
  category: classifyMongoError(error),
  name: error?.name || 'Error',
  message: error?.message || 'Unknown MongoDB error',
  reason: error?.reason?.message || null,
  hints: collectTroubleshootingHints(error, uri, label),
});

const logEnvDiagnostics = ({ configuredUri, localUri, localFallbackEnabled }) => {
  logger.info('db', 'env.summary', {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5000',
    mongodbUri: configuredUri ? 'set' : 'missing',
    mongodbLocalUri: process.env.MONGODB_LOCAL_URI ? 'set' : `missing (default disabled: ${DEFAULT_LOCAL_MONGO_URI})`,
    localFallbackEnabled,
    degradedModeAllowed: isTruthy(process.env.ALLOW_DEGRADED_MODE),
  });
  logger.info('db', 'env.effective_uri', {
    target: 'MONGODB_URI',
    uriSummary: summariseUri(configuredUri),
  });
  logger.info('db', 'env.effective_uri', {
    target: 'MONGODB_LOCAL_URI',
    uriSummary: summariseUri(localUri),
  });
  if (!localFallbackEnabled) {
    logger.warn('db', 'env.local_fallback_disabled', {
      message:
        'Local fallback is disabled. Set BOTH MONGODB_LOCAL_URI and MONGODB_ALLOW_LOCAL_FALLBACK=true to enable local Mongo fallback.',
    });
  }
};

const tryConnect = async (uri) => {
  const startedAt = Date.now();
  const serverSelectionTimeoutMS = toPositiveInteger(
    process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    DEFAULT_MONGO_SERVER_SELECTION_TIMEOUT_MS,
  );
  const connectTimeoutMS = toPositiveInteger(process.env.MONGODB_CONNECT_TIMEOUT_MS, DEFAULT_MONGO_CONNECT_TIMEOUT_MS);
  const socketTimeoutMS = toPositiveInteger(process.env.MONGODB_SOCKET_TIMEOUT_MS, DEFAULT_MONGO_SOCKET_TIMEOUT_MS);
  const startupTimeoutMS = toPositiveInteger(
    process.env.MONGODB_STARTUP_TIMEOUT_MS,
    Math.max(serverSelectionTimeoutMS + 2000, connectTimeoutMS + 1000),
  );

  await withTimeout(
    mongoose.connect(uri, {
      serverSelectionTimeoutMS,
      connectTimeoutMS,
      socketTimeoutMS,
      retryWrites: true,
      maxPoolSize: toPositiveInteger(process.env.MONGODB_MAX_POOL_SIZE, 10),
      minPoolSize: toPositiveInteger(process.env.MONGODB_MIN_POOL_SIZE, 0),
    }),
    startupTimeoutMS,
    `MongoDB startup connection timed out after ${startupTimeoutMS}ms.`,
  );

  return {
    elapsedMs: Date.now() - startedAt,
    timeouts: {
      serverSelectionTimeoutMS,
      connectTimeoutMS,
      socketTimeoutMS,
      startupTimeoutMS,
    },
  };
};

const isTruthy = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());

const connectDB = async () => {
  const normalizedConfigured = normalizeMongoUri(process.env.MONGODB_URI);
  const configuredUri = normalizedConfigured.uri;
  const explicitLocalUri = process.env.MONGODB_LOCAL_URI?.trim() || '';
  const localUri = explicitLocalUri || DEFAULT_LOCAL_MONGO_URI;
  const localFallbackEnabled = Boolean(explicitLocalUri) && isTruthy(process.env.MONGODB_ALLOW_LOCAL_FALLBACK);
  const candidates = [];
  const attempts = [];
  let configError = null;
  let dnsResolution = {
    status: 'not_attempted',
    srvHost: null,
    recordsFound: 0,
    message: 'No SRV DNS check was performed.',
  };
  const fallback = {
    configured: Boolean(explicitLocalUri),
    enabled: localFallbackEnabled,
    attempted: false,
    used: false,
    status: localFallbackEnabled ? 'enabled' : 'disabled',
    reason: localFallbackEnabled
      ? 'Local fallback enabled via MONGODB_ALLOW_LOCAL_FALLBACK=true.'
      : explicitLocalUri
        ? 'MONGODB_LOCAL_URI is set but fallback is disabled (set MONGODB_ALLOW_LOCAL_FALLBACK=true).'
        : 'MONGODB_LOCAL_URI is not set.',
  };

  logEnvDiagnostics({ configuredUri, localUri, localFallbackEnabled });
  if (normalizedConfigured.autoFixed) {
    logger.warn('db', 'uri.autofixed', {
      action: 'normalize_uri',
      result: 'success',
      failureReason: normalizedConfigured.reason || null,
      uriHost: configuredUri ? new URL(configuredUri).hostname : null,
      uriSummary: summariseUri(configuredUri),
    });
  }

  if (configuredUri) {
    const validation = parseMongoUri(configuredUri);
    if (!validation.valid) {
      logger.error('db', 'connect_attempt', {
        action: 'connect_attempt',
        uriHost: validation?.parsed?.hostname || extractMongoSrvHost(configuredUri),
        result: 'failure',
        failureReason: validation.issues.map((issue) => issue.code).join(','),
      });
      logger.error('db', 'mongodb_uri.invalid', {
        issues: validation.issues,
      });
      attempts.push({
        mode: 'MONGODB_URI',
        ok: false,
        skipped: true,
        category: 'CONFIGURATION',
        issues: validation.issues.map((issue) => issue.code),
      });
      configError = {
        target: 'MONGODB_URI',
        uriSummary: summariseUri(configuredUri),
        code: 'INVALID_URI',
        category: 'CONFIGURATION',
        name: 'MongoConfigurationError',
        message: 'MONGODB_URI is invalid and was not attempted.',
        reason: null,
        hints: validation.issues.map((issue) => issue.message),
      };
      dnsResolution = {
        status: 'skipped_invalid_uri',
        srvHost: null,
        recordsFound: 0,
        message: 'Skipped DNS SRV resolution because MONGODB_URI is invalid.',
      };
    } else {
      dnsResolution = await resolveSrvDiagnostics(configuredUri);
      if (dnsResolution.status === 'failed') {
        logger.error('db', 'dns_resolution.failed', {
          uriHost: dnsResolution.srvHost,
          code: dnsResolution.code || 'UNKNOWN',
          message: dnsResolution.message,
          guidance: dnsResolution.guidance,
        });
      } else if (dnsResolution.status === 'ok') {
        logger.info('db', 'dns_resolution.ok', {
          uriHost: dnsResolution.srvHost,
          recordsFound: dnsResolution.recordsFound,
        });
      }
      candidates.push({ uri: configuredUri, label: 'MONGODB_URI', isFallback: false });
    }
  } else {
    logger.warn('db', 'mongodb_uri.missing');
  }

  if (localFallbackEnabled) {
    const localValidation = parseMongoUri(localUri, { allowSrv: false, label: 'MONGODB_LOCAL_URI' });
    if (!localValidation.valid) {
      logger.error('db', 'mongodb_local_uri.invalid', { issues: localValidation.issues });
      configError = configError || {
        target: 'MONGODB_LOCAL_URI',
        uriSummary: summariseUri(localUri),
        code: 'INVALID_URI',
        category: 'CONFIGURATION',
        name: 'MongoConfigurationError',
        message: 'MONGODB_LOCAL_URI is invalid and was not attempted.',
        reason: null,
        hints: localValidation.issues.map((issue) => issue.message),
      };
    } else if (!configuredUri || configuredUri !== localUri) {
      candidates.push({ uri: localUri, label: 'MONGODB_LOCAL_URI', isFallback: true });
    }
  } else if (explicitLocalUri) {
    logger.warn('db', 'mongodb_local_uri.ignored_fallback_disabled');
  } else {
    logger.info('db', 'mongodb_local_uri.not_used', {
      reason: 'Local fallback disabled and no explicit MONGODB_LOCAL_URI provided.',
    });
  }

  if (!candidates.length) {
    const invalidError = configError || {
      target: 'none',
      uriSummary: summariseUri(localUri),
      code: 'INVALID_URI',
      category: 'CONFIGURATION',
      name: 'MongoConfigurationError',
      message: 'No valid MongoDB URI found in MONGODB_URI or MONGODB_LOCAL_URI.',
      reason: null,
      hints: [
        'Set MONGODB_URI to a valid Atlas URI including a database name (mongodb+srv://.../<db>?...).',
        `Set MONGODB_LOCAL_URI to a valid local URI (example: ${DEFAULT_LOCAL_MONGO_URI}) if you want local fallback.`,
      ],
    };

    logger.error('db', 'connect.unavailable_no_candidates');
    metrics.increment('db_connection_failures', 1, { source: 'none', category: invalidError.category });
    invalidError.hints.forEach((hint) => logger.warn('db', 'connect.hint', { hint }));

    return {
      connected: false,
      source: 'none',
      attemptedModes: attempts,
      dnsResolution,
      fallback,
      error: invalidError,
      connectionAttempt: {
        status: 'failed',
        source: null,
        category: invalidError.category,
        code: invalidError.code,
        message: invalidError.message,
      },
    };
  }

  let lastError = null;

  for (const candidate of candidates) {
    if (candidate.isFallback) fallback.attempted = true;
    try {
      logger.info('db', 'connect_attempt', {
        action: 'connect_attempt',
        uriHost: extractMongoSrvHost(candidate.uri) || new URL(candidate.uri).hostname,
        source: candidate.label,
        result: 'started',
      });
      const connection = await tryConnect(candidate.uri);
      attempts.push({ mode: candidate.label, ok: true, uriSummary: summariseUri(candidate.uri), elapsedMs: connection.elapsedMs, timeouts: connection.timeouts });
      logger.info('db', 'connect_attempt', {
        action: 'connect_attempt',
        uriHost: extractMongoSrvHost(candidate.uri) || new URL(candidate.uri).hostname,
        source: candidate.label,
        result: 'success',
        elapsedMs: connection.elapsedMs,
        timeouts: connection.timeouts,
      });
      return {
        connected: true,
        uriSummary: summariseUri(candidate.uri),
        source: candidate.label,
        mode: candidate.label === 'MONGODB_LOCAL_URI' ? 'local' : 'atlas',
        degradedReason: null,
        attemptedModes: attempts,
        dnsResolution,
        fallback: {
          ...fallback,
          used: candidate.isFallback,
          status: candidate.isFallback ? 'active' : fallback.status,
        },
        connectionAttempt: {
          status: 'success',
          source: candidate.label,
          category: null,
          code: null,
          message: `Connected via ${candidate.label}.`,
        },
        error: null,
      };
    } catch (error) {
      lastError = formatMongoError(error, candidate.uri, candidate.label);
      metrics.increment('db_connection_failures', 1, { source: candidate.label, category: lastError.category });
      attempts.push({ mode: candidate.label, ok: false, uriSummary: summariseUri(candidate.uri), category: lastError.category, code: lastError.code });
      const detail = `${lastError.name}(${lastError.code}): ${lastError.message}`;

      if (candidate.isFallback) {
        logger.error('db', 'connect_attempt', {
          action: 'connect_attempt',
          uriHost: extractMongoSrvHost(candidate.uri) || new URL(candidate.uri).hostname,
          source: candidate.label,
          result: 'failure',
          failureReason: lastError.category,
          detail,
        });
      } else {
        logger.error('db', 'connect_attempt', {
          action: 'connect_attempt',
          uriHost: extractMongoSrvHost(candidate.uri) || new URL(candidate.uri).hostname,
          source: candidate.label,
          result: 'failure',
          failureReason: lastError.category,
          detail,
        });
      }

      if (lastError.hints.length) {
        lastError.hints.forEach((hint) => logger.warn('db', 'connect.hint', { hint }));
      }
    }
  }

  logger.error('db', 'connect.failed', {
    message: 'Unable to connect to MongoDB.',
    lastError,
  });

  const explicitReason = `MongoDB connection unavailable after ${attempts.length} attempt(s). ` +
    `Category=${lastError?.category || 'UNKNOWN'}, code=${lastError?.code || 'UNKNOWN'}, source=${attempts.at(-1)?.mode || 'none'}. ` +
    `Fallback=${fallback.attempted ? 'attempted' : (fallback.enabled ? 'enabled_not_used' : 'disabled')}.`;
  logger.error('db', 'connect.failure_reason', { explicitReason });

  return {
    connected: false,
    source: 'none',
    mode: 'unavailable',
    degradedReason: explicitReason,
    attemptedModes: attempts,
    dnsResolution,
    fallback: {
      ...fallback,
      status: fallback.attempted ? 'attempted' : fallback.status,
    },
    connectionAttempt: {
      status: 'failed',
      source: attempts.at(-1)?.mode || null,
      category: lastError?.category || 'UNKNOWN',
      code: lastError?.code || 'UNKNOWN',
      message: lastError?.message || 'MongoDB unavailable',
    },
    error: lastError,
  };
};

module.exports = connectDB;
module.exports.parseMongoUri = parseMongoUri;
module.exports.normalizeMongoUri = normalizeMongoUri;
