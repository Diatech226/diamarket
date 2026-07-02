import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { app } from '../dist/app.js';
import ledgerPkg from '../dist/modules/ledger/ledger.service.js';
import invariants from '../dist/modules/ledger/ledger-invariants.js';
const { createAndPostLedgerTransaction, reverseLedgerTransaction } = ledgerPkg;
const { assertBalancedLedgerTransaction } = invariants;
async function withServer(fn) { const server = http.createServer(app); await new Promise((resolve) => server.listen(0, resolve)); const address = server.address(); try { await fn(`http://127.0.0.1:${address.port}`); } finally { await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve())); } }
async function request(baseUrl, method, path, body, headers = {}) { const response = await fetch(`${baseUrl}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined }); return { status: response.status, json: await response.json() }; }
test('ledger rejects unbalanced transactions and reverses posted transactions', () => {
  assert.throws(() => assertBalancedLedgerTransaction([{ id:'1', transactionId:'t', accountId:'a', direction:'debit', amount:100, currency:'XOF', posted:true, createdAt:'' }, { id:'2', transactionId:'t', accountId:'b', direction:'credit', amount:90, currency:'XOF', posted:true, createdAt:'' }]), /not balanced/);
  const tx = createAndPostLedgerTransaction({ type:'adjustment', referenceType:'adjustment', referenceId:'manual_test', amount:100, currency:'XOF', entries:[{ ownerType:'system', ownerId:'test', accountType:'adjustments', direction:'debit', amount:100 }, { ownerType:'platform', ownerId:'diapay', accountType:'platform_cash', direction:'credit', amount:100 }] });
  assert.equal(tx.status, 'posted');
  const reversal = reverseLedgerTransaction(tx.id);
  assert.equal(reversal.status, 'posted');
});
test('payment/refund ledger posting, wallet and balance endpoints', async () => {
  await withServer(async (baseUrl) => {
    let response = await request(baseUrl, 'POST', '/api/v1/payments', { amount: 1000, currency: 'XOF', method: 'mock' }, { 'Idempotency-Key': 'ledger-payment-1' });
    assert.equal(response.status, 201); const paymentId = response.json.data.id;
    response = await request(baseUrl, 'POST', '/api/v1/payments', { amount: 1000, currency: 'XOF', method: 'mock' }, { 'Idempotency-Key': 'ledger-payment-1' });
    assert.equal(response.status, 201);
    response = await request(baseUrl, 'GET', '/api/v1/ledger/transactions');
    const captures = response.json.data.filter((tx) => tx.referenceId === paymentId && tx.type === 'payment_capture');
    assert.equal(captures.length, 1);
    assert.equal(captures[0].entries.filter((e) => e.direction === 'debit').reduce((s,e)=>s+e.amount,0), captures[0].entries.filter((e) => e.direction === 'credit').reduce((s,e)=>s+e.amount,0));
    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId, amount: 400, reason: 'partial' }); assert.equal(response.status, 201);
    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId, amount: 600, reason: 'full' }); assert.equal(response.status, 201);
    response = await request(baseUrl, 'POST', '/api/v1/refunds', { paymentId, amount: 1, reason: 'too_much' }); assert.equal(response.status, 400);
    response = await request(baseUrl, 'GET', '/api/v1/wallets'); assert.equal(response.status, 200); assert.ok(Array.isArray(response.json.data));
    response = await request(baseUrl, 'GET', '/api/v1/balances'); assert.equal(response.status, 200); assert.equal(response.json.data.productionReady, false);
    response = await request(baseUrl, 'GET', '/api/v1/ledger/transactions'); assert.ok(response.json.data.some((tx) => tx.type === 'refund'));
  });
});
