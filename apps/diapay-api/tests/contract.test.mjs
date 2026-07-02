import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { app } from '../dist/app.js';

const validStatuses = new Set(['pending', 'processing', 'requires_action', 'succeeded', 'failed', 'cancelled', 'expired', 'refunded']);

async function withServer(fn) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert(address && typeof address === 'object');
  try {
    await fn(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
}

async function request(baseUrl, method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, json: await response.json() };
}

function assertEnvelope(json, success) {
  assert.equal(json.success, success);
  assert.equal(typeof json.message, 'string');
  if (success) assert.ok('data' in json);
  else assert.ok(json.error?.code);
}

test('Diapay public API contract endpoints keep stable response envelopes', async () => {
  await withServer(async (baseUrl) => {
    let response = await request(baseUrl, 'GET', '/health');
    assert.equal(response.status, 200);
    assertEnvelope(response.json, true);

    response = await request(baseUrl, 'GET', '/api/v1/config');
    assert.equal(response.status, 200);
    assertEnvelope(response.json, true);
    assert.ok(response.json.data.apiBaseUrl);

    response = await request(baseUrl, 'POST', '/api/v1/checkout/sessions', { amount: 1200, currency: 'XOF', successUrl: 'https://example.test/success', cancelUrl: 'https://example.test/cancel' });
    assert.equal(response.status, 201);
    assertEnvelope(response.json, true);
    const sessionId = response.json.data.id;
    assert.ok(sessionId);

    response = await request(baseUrl, 'GET', `/api/v1/checkout/sessions/${sessionId}`);
    assert.equal(response.status, 200);
    assertEnvelope(response.json, true);

    response = await request(baseUrl, 'POST', '/api/v1/payments', { amount: 1200, currency: 'XOF', method: 'mock' });
    assert.equal(response.status, 201);
    assertEnvelope(response.json, true);
    const paymentId = response.json.data.id;
    assert.ok(paymentId);
    assert.ok(validStatuses.has(response.json.data.status));

    response = await request(baseUrl, 'GET', `/api/v1/payments/${paymentId}`);
    assert.equal(response.status, 200);
    assertEnvelope(response.json, true);
    assert.ok(validStatuses.has(response.json.data.status));

    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId, reason: 'contract_test' });
    assert.equal(response.status, 201);
    assertEnvelope(response.json, true);
    const refundId = response.json.data.id;
    assert.ok(refundId);

    response = await request(baseUrl, 'GET', `/api/v1/refunds/${refundId}`);
    assert.equal(response.status, 200);
    assertEnvelope(response.json, true);

    response = await request(baseUrl, 'GET', '/api/v1/payments/missing_payment');
    assert.equal(response.status, 404);
    assertEnvelope(response.json, false);
  });
});
