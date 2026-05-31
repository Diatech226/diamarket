const { test } = require('node:test');
const assert = require('node:assert');

const pricingServicePath = require.resolve('../services/pricingService');
require.cache[pricingServicePath] = {
  exports: {
    getInternalQuote: async () => ({
      provider: 'internal',
      estimatedPrice: 950,
      currency: 'USD',
      appliedRule: { pricingId: 'rule_1', scopeType: 'lane' },
      breakdown: { baseAmount: 900, surchargeAmount: 50, total: 950 },
      warnings: [],
      explanation: { strategy: 'highest_specificity_then_lowest_price' },
    }),
  },
};

const Quote = require('../models/Quote');
const quoteController = require('../controllers/quoteController');
const { buildCreateQuotePayload } = require('../services/quoteDomainService');

function createMockRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

test('buildCreateQuotePayload supports canonical route/package/pricing DTO', () => {
  const payload = buildCreateQuotePayload({
    route: { origin: 'Paris', destination: 'Lomé', transportType: 'air' },
    package: {
      packageTypeId: 'pkg_1',
      weight: 22,
      dimensions: { length: 100, width: 40, height: 20 },
    },
    pricing: {
      totalPrice: 870,
      currency: 'USD',
      breakdown: { total: 870 },
      appliedRule: { pricingId: 'rule_2' },
      provider: 'internal',
    },
  });

  assert.strictEqual(payload.origin, 'Paris');
  assert.strictEqual(payload.destination, 'Lomé');
  assert.strictEqual(payload.transportType, 'air');
  assert.strictEqual(payload.estimatedPrice, 870);
  assert.strictEqual(payload.currency, 'USD');
  assert.deepStrictEqual(payload.pricingBreakdown, { total: 870 });
  assert.strictEqual(payload.pricingAppliedId, 'rule_2');
});

test('estimateQuote returns temporary estimate payload and never persists quote', async () => {
  Quote.create = async () => {
    throw new Error('estimate flow must not persist quotes');
  };

  const req = {
    body: {
      origin: 'Paris',
      destination: 'Douala',
      transportType: 'sea',
      weight: 12,
      length: 100,
      width: 80,
      height: 60,
    },
  };
  const res = createMockRes();

  await quoteController.estimateQuote(req, res, (error) => {
    throw error;
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.payload.data.temporary, true);
  assert.strictEqual(res.payload.data.estimateType, 'temporary_pricing');
  assert.ok(res.payload.data.quoteDraftPayload);
  assert.strictEqual(res.payload.data.quoteDraftPayload.route.origin, 'Paris');
  assert.strictEqual(res.payload.data.quoteDraftPayload.pricing.estimatedPrice, 950);
});
