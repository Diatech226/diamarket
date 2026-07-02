import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { app } from '../dist/app.js';

const validStatuses = new Set(['created', 'pending', 'processing', 'requires_action', 'succeeded', 'paid', 'failed', 'cancelled', 'expired', 'refunded', 'partially_refunded', 'disputed', 'chargeback']);

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
    assert.equal(response.json.data.attempts.length, 1);

    response = await request(baseUrl, 'POST', `/api/v1/payments/${paymentId}/cancel`);
    assert.equal(response.status, 400);
    assertEnvelope(response.json, false);

    response = await request(baseUrl, 'GET', `/api/v1/payments/${paymentId}`);
    assert.equal(response.status, 200);
    assertEnvelope(response.json, true);
    assert.ok(validStatuses.has(response.json.data.status));

    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId, amount: 600, reason: 'partial_contract_test' });
    assert.equal(response.status, 201);
    assertEnvelope(response.json, true);
    const partialRefundId = response.json.data.id;
    assert.equal(response.json.data.amount, 600);

    response = await request(baseUrl, 'GET', `/api/v1/payments/${paymentId}`);
    assert.equal(response.json.data.status, 'partially_refunded');

    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId, amount: 600, reason: 'total_contract_test' });
    assert.equal(response.status, 201);
    const refundId = response.json.data.id;
    assert.ok(refundId);

    response = await request(baseUrl, 'GET', `/api/v1/refunds/${partialRefundId}`);
    assert.equal(response.status, 200);
    assertEnvelope(response.json, true);

    response = await request(baseUrl, 'GET', `/api/v1/payments/${paymentId}`);
    assert.equal(response.json.data.status, 'refunded');

    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId, amount: 1, reason: 'too_much' });
    assert.equal(response.status, 400);
    assertEnvelope(response.json, false);

    response = await request(baseUrl, 'POST', '/api/v1/payments', { amount: 1000, currency: 'XOF', method: 'mock', forceStatus: 'failed' });
    assert.equal(response.status, 201);
    const failedPaymentId = response.json.data.id;
    assert.equal(response.json.data.status, 'failed');

    response = await request(baseUrl, 'POST', `/api/v1/payments/${failedPaymentId}/cancel`);
    assert.equal(response.status, 400);
    assertEnvelope(response.json, false);

    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId: failedPaymentId, amount: 100 });
    assert.equal(response.status, 400);
    assertEnvelope(response.json, false);

    response = await request(baseUrl, 'POST', '/api/v1/checkout/sessions', { amount: 500, currency: 'XOF', successUrl: 'not-a-url', cancelUrl: 'https://example.test/cancel' });
    assert.equal(response.status, 400);
    assertEnvelope(response.json, false);

    response = await request(baseUrl, 'POST', '/api/v1/checkout/sessions', { amount: 500, currency: 'XOF', successUrl: 'https://example.test/success', cancelUrl: 'https://example.test/cancel', expiresAt: new Date(Date.now() - 1000).toISOString() });
    assert.equal(response.status, 201);
    const expiredSessionId = response.json.data.id;
    response = await request(baseUrl, 'GET', `/api/v1/checkout/sessions/${expiredSessionId}`);
    assert.equal(response.json.data.status, 'expired');

    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId: 'missing_payment', amount: 100 });
    assert.equal(response.status, 404);
    assertEnvelope(response.json, false);

    response = await request(baseUrl, 'GET', '/api/v1/payments/missing_payment');
    assert.equal(response.status, 404);
    assertEnvelope(response.json, false);
  });
});
