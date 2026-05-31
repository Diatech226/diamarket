const appConfig = require('./appConfig');
const { parseMongoUri } = require('./db');

function isTruthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function formatMongoUriIssues(label, issues) {
  const details = issues.map((issue) => issue.message).join(' ');
  return `${label} is invalid: ${details}`;
}

function assertMongoUri(rawUri) {
  const uri = String(rawUri || '').trim();
  if (!uri) {
    throw new Error('Missing required config: MONGODB_URI');
  }

  const validation = parseMongoUri(uri, { allowSrv: true, requireDatabaseName: true, label: 'MONGODB_URI' });
  if (!validation.valid) {
    throw new Error(formatMongoUriIssues('MONGODB_URI', validation.issues));
  }
}

function assertLocalMongoUri(rawUri) {
  const uri = String(rawUri || '').trim();
  if (!uri) return;

  const validation = parseMongoUri(uri, { allowSrv: false, requireDatabaseName: true, label: 'MONGODB_LOCAL_URI' });
  if (!validation.valid) {
    const srvIssue = validation.issues.find((issue) => issue.code === 'LOCAL_URI_MUST_NOT_BE_SRV');
    if (srvIssue) {
      throw new Error(srvIssue.message);
    }

    throw new Error(formatMongoUriIssues('MONGODB_LOCAL_URI', validation.issues));
  }
}

function validateStartupConfig(env = process.env, config = appConfig) {
  const required = ['MONGODB_URI'];
  const optional = [];
  const devOnlyFallback = [];

  assertLocalMongoUri(env.MONGODB_LOCAL_URI);
  assertMongoUri(env.MONGODB_URI);

  if (config.runtime.environment === 'production') {
    required.push('CORS_ORIGINS');

    if (!env.CORS_ORIGINS?.trim()) {
      throw new Error('Missing required production config: CORS_ORIGINS');
    }
  }

  optional.push('DIAPAY_BASE_URL', 'DIAPAY_WEBHOOK_SECRET', 'INTEGRATION_API_KEYS');
  devOnlyFallback.push('MONGODB_LOCAL_URI');

  const degradedAllowed = isTruthy(env.ALLOW_DEGRADED_MODE);
  const localFallbackAllowed = isTruthy(env.MONGODB_ALLOW_LOCAL_FALLBACK);

  return {
    required,
    optional,
    devOnlyFallback,
    degradedAllowed,
    localFallbackAllowed,
  };
}

module.exports = {
  assertLocalMongoUri,
  assertMongoUri,
  isTruthy,
  validateStartupConfig,
};
