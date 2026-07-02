import assert from 'node:assert/strict';
import test from 'node:test';
import providerPkg from '../dist/modules/providers/index.js';
const { mockProvider, selectProvider, mapProviderStatus, sanitizeProviderResponse } = providerPkg;

test('provider registry selects compatible mock outside production', () => {
  const provider = selectProvider({ amount: 1000, currency: 'XOF', method: 'bank-card', mode: 'test' });
  assert.equal(provider.id, 'mock');
});

test('provider registry refuses silent mock fallback in production', () => {
  assert.throws(() => selectProvider({ amount: 1000, currency: 'XOF', method: 'bank-card', mode: 'production' }), /No compatible payment provider found/);
});

test('mock provider scenarios normalize payment statuses', async () => {
  for (const [scenario, expected] of [['payment_success','paid'], ['payment_failed','failed'], ['payment_pending','pending'], ['payment_requires_action','requires_action']]) {
    const result = await mockProvider.createPayment({ amount: 1000, currency: 'XOF', method: 'mock', merchant: 'test', details: { scenario } });
    assert.equal(result.status, expected);
    assert.equal(result.provider, 'mock');
  }
});

test('mock refunds support success and failed scenarios', async () => {
  const ok = await mockProvider.refundPayment({ providerReference: 'pp_mock_1', amount: 500, currency: 'XOF', scenario: 'refund_success' });
  assert.equal(ok.status, 'refunded');
  const failed = await mockProvider.refundPayment({ providerReference: 'pp_mock_1', amount: 500, currency: 'XOF', scenario: 'refund_failed' });
  assert.equal(failed.status, 'failed');
  assert.equal(failed.errorCode, 'REFUND_FAILED');
});

test('provider status mapping and sanitization are safe', () => {
  assert.equal(mapProviderStatus('action_needed'), 'requires_action');
  assert.equal(mapProviderStatus('provider_unknown_status'), 'processing');
  const sanitized = sanitizeProviderResponse({ token: 'abc', nested: { otp: '123456', public: 'ok' } });
  assert.equal(sanitized.token, '[REDACTED]');
  assert.deepEqual(sanitized.nested, { otp: '[REDACTED]', public: 'ok' });
});
