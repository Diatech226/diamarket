// 📁 middleware/auth.js
const appConfig = require('../config/appConfig');
const { ensureRequestIdentityAsync, parseAuthorizationHeader } = require('../services/diaexpressAuthService');
const { syncUserFromIdentity } = require('../services/userIdentityService');
const { error: sendError } = require('../utils/http');
const { logger } = require('../src/lib/observability/logger');
const { getRequestContext } = require('../src/lib/observability/requestContext');

const integrationKeyRegistry = (() => {
  const entries = new Map();

  appConfig.services.integrations.apiKeys.forEach((entry) => {
    const [key, label] = entry.split(':').map((value) => value.trim()).filter(Boolean);
    if (key) {
      entries.set(key, label || 'partner');
    }
  });

  return entries;
})();

function extractIntegrationKey(req) {
  const headerValue = req.get('x-api-key') || req.get('x-partner-key');
  if (!headerValue) {
    return null;
  }

  const normalised = headerValue.trim();
  if (!normalised) {
    return null;
  }

  const label = integrationKeyRegistry.get(normalised);
  if (!label) {
    return null;
  }

  return { key: normalised, label };
}

function attachIntegrationIdentity(req) {
  if (req.identity?.type === 'integration') {
    return req.identity;
  }

  const integration = extractIntegrationKey(req);
  if (!integration) {
    return null;
  }

  const identity = {
    type: 'integration',
    apiKey: integration.key,
    principalId: integration.key,
    label: integration.label,
  };

  req.identity = identity;
  return identity;
}

function maskPrincipal(identity) {
  const principal = identity?.principalId ? String(identity.principalId) : null;
  if (!principal) {
    return null;
  }

  if (principal.length <= 6) {
    return `${principal.slice(0, 2)}***`;
  }

  return `${principal.slice(0, 3)}***${principal.slice(-3)}`;
}

function decodeJwtExpiry(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
    if (!decoded?.exp) {
      return null;
    }

    return Number(decoded.exp) * 1000;
  } catch (_error) {
    return null;
  }
}

function classifyAuthFailure(req) {
  if (req.authFailureReason) {
    return req.authFailureReason;
  }

  const header = req.get('authorization') || req.get('Authorization');
  const parsed = parseAuthorizationHeader(header);
  if (!parsed.ok) {
    return parsed.reason || 'missing_token';
  }

  const expiry = decodeJwtExpiry(parsed.token);
  if (expiry && expiry <= Date.now()) {
    return 'expired_token';
  }

  return 'invalid_token';
}

function authErrorCode(reason) {
  const normalized = String(reason || '').toLowerCase();
  if (normalized === 'invalid_token' || normalized === 'expired_token') {
    return 'INVALID_TOKEN';
  }
  if (normalized === 'role_forbidden') {
    return 'FORBIDDEN';
  }
  return 'AUTH_REQUIRED';
}

function logAuthEvent(level, message, details = {}) {
  if (level === 'warn') {
    logger.warn('auth', message, details);
    return;
  }

  logger.info('auth', message, details);
}

async function resolveAndAttachIdentity(req) {
  const result = await ensureRequestIdentityAsync(req);
  const identity = result?.identity || null;
  const reason = result?.reason || null;

  if (identity) {
    req.auth = identity;
    req.identity = identity;
  } else if (reason) {
    req.authFailureReason = reason;
  }

  return { identity, reason };
}

async function resolveAndAttachUser(req) {
  if (req.user) {
    return { identity: req.identity || req.auth || null, user: req.user };
  }

  const { identity, reason } = await resolveAndAttachIdentity(req);
  if (!identity) {
    if (reason) req.authFailureReason = reason;
    logAuthEvent('warn', 'authentication failed', {
      reason: classifyAuthFailure(req),
      method: req.method,
      path: req.originalUrl,
    });
    return { identity: null, user: null };
  }

  const user = await syncUserFromIdentity(identity);
  if (!user) {
    req.authFailureReason = 'user_sync_failed';
    logAuthEvent('warn', 'authentication failed', {
      reason: 'user_sync_failed',
      principal: maskPrincipal(identity),
      method: req.method,
      path: req.originalUrl,
    });
    return { identity, user: null };
  }

  req.user = user;
  req.dbUser = user;
  req.userId = user._id;

  const ctx = getRequestContext();
  if (ctx) {
    ctx.actorId = user?._id?.toString?.() || null;
  }

  return { identity, user };
}

function userHasRole(user, _identity, role) {
  if (!role) return true;

  const required = String(role).toLowerCase();
  const current = user?.role ? String(user.role).toLowerCase() : null;

  return current === 'admin' || current === required;
}

exports.requireAuth = async (req, res, next) => {
  try {
    const { identity, user } = await resolveAndAttachUser(req);
    if (!identity || !user) {
      return sendError(res, {
        status: 401,
        code: authErrorCode(classifyAuthFailure(req)),
        message: 'Authentication required',
        details: {
          reason: classifyAuthFailure(req),
        },
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

exports.requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const { identity, user } = await resolveAndAttachUser(req);
      if (!identity || !user) {
        return sendError(res, {
          status: 401,
          code: authErrorCode(classifyAuthFailure(req)),
          message: 'Authentication required',
          details: {
            reason: classifyAuthFailure(req),
          },
        });
      }

      if (!userHasRole(user, identity, role)) {
        logAuthEvent('warn', 'authorization failed', {
          reason: 'role_forbidden',
          requiredRole: role,
          principal: maskPrincipal(identity),
          currentRole: user?.role || null,
          method: req.method,
          path: req.originalUrl,
        });
        return sendError(res, {
          status: 403,
          code: 'FORBIDDEN',
          message: 'Not authorized for this resource',
          details: {
            reason: 'role_forbidden',
            requiredRole: role,
          },
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

exports.requireUserOrIntegrationKey = async (req, res, next) => {
  try {
    const { identity } = await resolveAndAttachIdentity(req);
    if (identity) {
      return next();
    }

    const integrationIdentity = attachIntegrationIdentity(req);
    if (integrationIdentity) {
      return next();
    }

    logAuthEvent('warn', 'authentication failed', {
      reason: 'missing_token_or_integration_key',
      method: req.method,
      path: req.originalUrl,
    });

    return sendError(res, {
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'Authentication required (Bearer token or integration API key)',
      details: {
        reason: 'missing_token_or_integration_key',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.isIntegrationRequest = (req) => req.identity?.type === 'integration';

exports.optionalAuth = async (req, _res, next) => {
  try {
    await resolveAndAttachIdentity(req);
    next();
  } catch (error) {
    next(error);
  }
};

exports.optionalUserOrIntegrationKey = async (req, _res, next) => {
  try {
    const { identity } = await resolveAndAttachIdentity(req);
    if (identity) {
      return next();
    }

    const integrationIdentity = attachIntegrationIdentity(req);
    if (integrationIdentity) {
      return next();
    }

    next();
  } catch (error) {
    next(error);
  }
};

exports.optionalAuthOrIntegration = exports.optionalUserOrIntegrationKey;

exports.__private = {
  classifyAuthFailure,
  userHasRole,
  authErrorCode,
};
