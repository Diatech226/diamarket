const { test, beforeEach } = require('node:test');
const assert = require('node:assert');

const Pricing = require('../models/Pricing');
const { getInternalQuote, validatePricingPayload, overlapsDimensionRanges } = require('../services/pricingService');

beforeEach(() => {
  Pricing.find = async () => [];
});

test('validatePricingPayload detects overlapping weight ranges', () => {
  const errors = validatePricingPayload({
    origin: 'A',
    destination: 'B',
    transportPrices: [{
      transportType: 'air',
      unitType: 'kg',
      dimensionRanges: [
        { minWeight: 0, maxWeight: 10, price: 100 },
        { minWeight: 5, maxWeight: 20, price: 120 },
      ],
      packagePricing: [],
    }],
  });
  assert.ok(errors.some((e) => e.includes('chevauchement')));
});

test('overlapsDimensionRanges detects overlapping volume ranges', () => {
  assert.strictEqual(
    overlapsDimensionRanges({ minVolume: 0, maxVolume: 2 }, { minVolume: 1.5, maxVolume: 3 }),
    true
  );
});

test('validatePricingPayload rejects invalid validity window', () => {
  const errors = validatePricingPayload({
    origin: 'A', destination: 'B',
    validFrom: '2026-01-10', validUntil: '2026-01-01',
    transportPrices: [{ transportType: 'air', unitType: 'kg', dimensionRanges: [], packagePricing: [] }],
  });
  assert.ok(errors.some((e) => e.includes('validFrom')));
});

test('getInternalQuote returns pricing not found when lane missing', async () => {
  Pricing.find = () => ({ lean: async () => [] });
  const result = await getInternalQuote({ origin: 'X', destination: 'Y', transportType: 'air', weight: 1 });
  assert.strictEqual(result.errorCode, 'PRICING_NOT_FOUND');
});

test('getInternalQuote returns ambiguous when two identical best rules exist', async () => {
  Pricing.find = () => ({
    lean: async () => ([
      { _id: '1', origin: 'A', destination: 'B', currency: 'USD', validFrom: '2025-01-01', transportPrices: [{ _id: 'tp1', transportType: 'air', unitType: 'kg', pricePerUnit: 10, dimensionRanges: [], packagePricing: [] }] },
      { _id: '2', origin: 'A', destination: 'B', currency: 'USD', validFrom: '2025-01-01', transportPrices: [{ _id: 'tp2', transportType: 'air', unitType: 'kg', pricePerUnit: 10, dimensionRanges: [], packagePricing: [] }] },
    ]),
  });
  const result = await getInternalQuote({ origin: 'A', destination: 'B', transportType: 'air', weight: 2 });
  assert.strictEqual(result.errorCode, 'PRICING_AMBIGUOUS');
});

test('getInternalQuote supports exact boundary values', async () => {
  Pricing.find = () => ({
    lean: async () => ([
      { _id: '1', origin: 'A', destination: 'B', currency: 'USD', validFrom: '2025-01-01', transportPrices: [{ _id: 'tp1', transportType: 'air', unitType: 'kg', pricePerUnit: null, dimensionRanges: [{ _id: 'r1', minWeight: 0, maxWeight: 10, price: 55, priority: 3 }], packagePricing: [] }] },
    ]),
  });
  const result = await getInternalQuote({ origin: 'A', destination: 'B', transportType: 'air', weight: 10 });
  assert.strictEqual(result.estimatedPrice, 55);
  assert.strictEqual(String(result.appliedRule.matchedDimensionRangeId), 'r1');
});

test('getInternalQuote calculates air billable volumetric weight and minimum XOF', async () => {
  Pricing.find = () => ({
    lean: async () => ([
      {
        _id: 'air-xof', origin: 'Paris', destination: 'Dakar', currency: 'XOF', scopeType: 'legacy_route',
        transportPrices: [{ _id: 'tp-air', transportType: 'air', unitType: 'kg', pricePerUnit: 1000, minimumPrice: 5000, dimensionRanges: [], packagePricing: [] }],
      },
    ]),
  });
  const result = await getInternalQuote({ origin: 'Paris', destination: 'Dakar', transportType: 'air', weight: 1, dimensions: { length: 50, width: 40, height: 30 } });
  assert.strictEqual(result.estimatedPrice, 12000);
  assert.strictEqual(result.currency, 'XOF');
  assert.strictEqual(result.breakdown.weightActual, 1);
  assert.strictEqual(result.breakdown.weightVolumetric, 12);
  assert.strictEqual(result.breakdown.billableWeight, 12);
});

test('getInternalQuote supports sea volume, delays and home delivery service', async () => {
  Pricing.find = () => ({
    lean: async () => ([
      {
        _id: 'sea-xof', origin: 'Montreal', destination: 'Abidjan', currency: 'XOF', scopeType: 'legacy_route',
        transportPrices: [{ _id: 'tp-sea', transportType: 'sea', unitType: 'm3', pricePerUnit: 100000, minDelayDays: 20, maxDelayDays: 35, additionalServices: { homeDelivery: 2500 }, dimensionRanges: [], packagePricing: [] }],
      },
    ]),
  });
  const result = await getInternalQuote({ origin: 'Montreal', destination: 'Abidjan', transportType: 'sea', weight: 5, volume: 0.2, additionalServices: ['home_delivery'] });
  assert.strictEqual(result.estimatedPrice, 22500);
  assert.strictEqual(result.estimatedDays, 35);
  assert.deepStrictEqual(result.breakdown.servicesApplied, [{ service: 'homeDelivery', amount: 2500 }]);
});
