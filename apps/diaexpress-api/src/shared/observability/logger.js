const appConfig = require('../../../config/appConfig');
const { getRequestContext } = require('./requestContext');

const SENSITIVE_FIELD_PATTERN = /(authorization|token|secret|password|api[-_]?key|cookie)/i;

function redactValue(value) {
  if (typeof value !== 'string') {
    return '[REDACTED]';
  }

  if (value.length <= 8) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, 4)}***${value.slice(-3)}`;
}

function sanitize(value, keyHint = '') {
  if (value == null) return value;

  if (SENSITIVE_FIELD_PATTERN.test(keyHint)) {
    return redactValue(String(value));
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, keyHint));
  }

  if (typeof value === 'object') {
    const output = {};
    Object.entries(value).forEach(([key, nestedValue]) => {
      output[key] = sanitize(nestedValue, key);
    });
    return output;
  }

  return value;
}

function write(level, category, message, details = {}) {
  const context = getRequestContext();
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'diaexpress-backend',
    environment: appConfig.runtime.environment,
    category,
    message,
    requestId: context?.requestId || null,
    correlationId: context?.requestId || context?.correlationId || null,
    route: context?.route || null,
    method: context?.method || null,
    userId: context?.actorId || null,
    actorId: context?.actorId || null,
    entityId: context?.entityId || null,
    ...sanitize(details),
  };

  const asJson = JSON.stringify(entry);
  if (level === 'error') {
    console.error(asJson);
  } else if (level === 'warn') {
    console.warn(asJson);
  } else {
    console.log(asJson);
  }
}

function child(baseCategory, baseDetails = {}) {
  return {
    info: (message, details = {}) => write('info', baseCategory, message, { ...baseDetails, ...details }),
    warn: (message, details = {}) => write('warn', baseCategory, message, { ...baseDetails, ...details }),
    error: (message, details = {}) => write('error', baseCategory, message, { ...baseDetails, ...details }),
  };
}

module.exports = {
  logger: {
    info: (category, message, details = {}) => write('info', category, message, details),
    warn: (category, message, details = {}) => write('warn', category, message, details),
    error: (category, message, details = {}) => write('error', category, message, details),
    child,
  },
};
