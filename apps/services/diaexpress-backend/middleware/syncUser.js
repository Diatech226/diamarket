// 📁 middleware/syncUser.js
const { ensureRequestIdentityAsync } = require('../services/diaexpressAuthService');
const { syncUserFromIdentity } = require('../services/userIdentityService');
const { error: sendError } = require('../utils/http');

function authErrorCode(reason) {
  const normalized = String(reason || '').toLowerCase();
  return normalized === 'invalid_token' || normalized === 'expired_token' ? 'INVALID_TOKEN' : 'AUTH_REQUIRED';
}

module.exports = async (req, res, next) => {
  try {
    const result = await ensureRequestIdentityAsync(req);
    const identity = result?.identity || null;
    const reason = result?.reason || req.authFailureReason || 'missing_token';

    if (!identity) {
      return sendError(res, {
        status: 401,
        code: authErrorCode(reason),
        message: 'Authentication required',
        details: {
          reason,
        },
      });
    }

    const user = await syncUserFromIdentity(identity);
    if (!user) {
      return sendError(res, {
        status: 503,
        code: 'AUTH_USER_SYNC_FAILED',
        message: 'Unable to synchronize authenticated user',
        details: {
          reason: 'user_sync_failed',
        },
      });
    }

    req.dbUser = user;
    req.userId = user._id;
    next();
  } catch (err) {
    console.warn('[auth] sync user middleware failed', {
      message: err?.message || String(err),
      requestId: req?.requestId || null,
    });
    next(err);
  }
};
