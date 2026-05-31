const test = require('node:test');
const assert = require('node:assert/strict');

const { ensureRequestIdentityAsync } = require('../services/diaexpressAuthService');
const { __private: authPrivate } = require('../middleware/auth');

function makeReq(headerValue) {
  return {
    authFailureReason: null,
    get(name) {
      if (name.toLowerCase() === 'authorization') {
        return headerValue;
      }
      return null;
    },
  };
}

test('ensureRequestIdentityAsync returns explicit missing identity result without Authorization', async () => {
  const req = makeReq(null);

  const result = await ensureRequestIdentityAsync(req);

  assert.deepEqual(result, { identity: null, user: null, reason: 'missing_token' });
  assert.equal(req.authFailureReason, 'missing_token');
});

test('ensureRequestIdentityAsync returns explicit malformed authorization result', async () => {
  const req = makeReq('Bearer');

  const result = await ensureRequestIdentityAsync(req);

  assert.deepEqual(result, { identity: null, user: null, reason: 'malformed_authorization_header' });
  assert.equal(req.authFailureReason, 'malformed_authorization_header');
});

test('auth error codes distinguish missing identity from invalid tokens', () => {
  assert.equal(authPrivate.authErrorCode('missing_token'), 'AUTH_REQUIRED');
  assert.equal(authPrivate.authErrorCode('invalid_token'), 'INVALID_TOKEN');
  assert.equal(authPrivate.authErrorCode('expired_token'), 'INVALID_TOKEN');
});
