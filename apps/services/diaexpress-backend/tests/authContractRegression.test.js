const test = require('node:test');
const assert = require('node:assert/strict');

const { __private: authPrivate } = require('../middleware/auth');
const {
  isForcedAdminEmail,
  resolveForcedAdminEmail,
} = require('../services/userIdentityService');

function makeReq(headerValue, authFailureReason = null) {
  return {
    authFailureReason,
    get(name) {
      if (name.toLowerCase() === 'authorization') {
        return headerValue;
      }
      return null;
    },
  };
}

function makeJwt(expSecondsOffset) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsOffset })).toString('base64url');
  return `${header}.${payload}.signature`;
}

test('classifyAuthFailure returns missing_token when Authorization header is absent', () => {
  const req = makeReq(null);
  assert.equal(authPrivate.classifyAuthFailure(req), 'missing_token');
});

test('classifyAuthFailure returns invalid_token for non-expired malformed/invalid bearer tokens', () => {
  const token = makeJwt(120);
  const req = makeReq(`Bearer ${token}`);
  assert.equal(authPrivate.classifyAuthFailure(req), 'invalid_token');
});

test('classifyAuthFailure returns expired_token for expired JWT payloads', () => {
  const token = makeJwt(-120);
  const req = makeReq(`Bearer ${token}`);
  assert.equal(authPrivate.classifyAuthFailure(req), 'expired_token');
});

test('userHasRole enforces backend DB role as authority', () => {
  assert.equal(authPrivate.userHasRole({ role: 'client' }, { roles: ['admin'] }, 'admin'), false);
  assert.equal(authPrivate.userHasRole({ role: 'admin' }, { roles: ['client'] }, 'admin'), true);
});

test('forced admin resolver is disabled by default without explicit env', () => {
  delete process.env.CMS_ADMIN_EMAIL;
  delete process.env.ADMIN_DEFAULT_EMAIL;
  assert.equal(resolveForcedAdminEmail(), null);
  assert.equal(isForcedAdminEmail('zcedric121@gmail.com'), false);
});

test('forced admin resolver honors CMS_ADMIN_EMAIL override', () => {
  process.env.CMS_ADMIN_EMAIL = 'new-admin@example.com';
  assert.equal(resolveForcedAdminEmail(), 'new-admin@example.com');
  assert.equal(isForcedAdminEmail('new-admin@example.com'), true);
  assert.equal(isForcedAdminEmail('someone@example.com'), false);
  delete process.env.CMS_ADMIN_EMAIL;
});
