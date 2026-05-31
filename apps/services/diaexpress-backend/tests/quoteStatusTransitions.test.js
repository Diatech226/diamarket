const { beforeEach, test } = require('node:test');
const assert = require('node:assert');

const notificationServicePath = require.resolve('../services/notificationService');
require.cache[notificationServicePath] = { exports: { push: async () => ({}) } };

const Quote = require('../models/Quote');
const adminQuoteController = require('../controllers/adminQuoteController');

const quotes = new Map();

function createQuote(data) {
  const quote = new Quote({ status: 'requested', ...data });
  const validationError = quote.validateSync();
  if (validationError) throw validationError;
  quotes.set(quote._id.toString(), quote);
  return quote;
}

Quote.findById = async (id) => quotes.get(id?.toString()) || null;
Quote.find = async () => Array.from(quotes.values());
Quote.prototype.save = async function saveStub() {
  quotes.set(this._id.toString(), this);
  return this;
};

beforeEach(() => quotes.clear());

function createMockRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.payload = body; return this; },
  };
}

test('admin review then approve follows canonical lifecycle', { concurrency: false }, async () => {
  const quote = createQuote({ origin: 'Paris', destination: 'Lomé', transportType: 'air' });

  const resReview = createMockRes();
  await adminQuoteController.markUnderReview({ params: { id: quote._id.toString() }, body: {}, identity: { principalId: 'admin-1' } }, resReview);
  assert.strictEqual(resReview.statusCode, 200);
  assert.strictEqual(resReview.payload.quote.status, 'under_review');

  const resApprove = createMockRes();
  await adminQuoteController.approve({ params: { id: quote._id.toString() }, body: { finalPrice: 1200, currency: 'USD' }, identity: { principalId: 'admin-1' } }, resApprove);
  assert.strictEqual(resApprove.statusCode, 200);
  assert.strictEqual(resApprove.payload.quote.status, 'approved');
});

test('invalid transition requested -> ready_for_shipment is rejected', { concurrency: false }, async () => {
  const quote = createQuote({ origin: 'Paris', destination: 'Accra', transportType: 'sea' });

  const res = createMockRes();
  await adminQuoteController.markReadyForShipment({ params: { id: quote._id.toString() }, body: {}, identity: { principalId: 'admin-2' } }, res);

  assert.strictEqual(res.statusCode, 409);
  assert.ok(String(res.payload.message).includes('Cannot transition'));
});
