const test = require('node:test');
const assert = require('node:assert/strict');

const { success, error } = require('../utils/http');

function createRes() {
  return {
    statusCode: 200,
    payload: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

test('success response always includes data + meta', () => {
  const res = createRes();
  success(res, { id: 'q1' });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, {
    data: { id: 'q1' },
    meta: {},
  });
});

test('error response uses canonical error envelope', () => {
  const res = createRes();
  error(res, {
    status: 401,
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
    details: { reason: 'missing_token' },
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.payload, {
    error: {
      code: 'UNAUTHORIZED',
      category: null,
      message: 'Authentication required',
      reference: null,
      details: { reason: 'missing_token' },
    },
  });
});

test('error response includes support reference when correlation header exists', () => {
  const res = createRes();
  res.setHeader('x-correlation-id', 'corr-123');

  error(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' });

  assert.equal(res.payload.error.reference, 'corr-123');
});
