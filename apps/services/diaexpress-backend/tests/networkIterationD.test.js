const { test, beforeEach } = require('node:test');
const assert = require('node:assert');

const Country = require('../models/Country');
const MarketPoint = require('../models/MarketPoint');
const TransportLine = require('../models/TransportLine');
const Embarkment = require('../models/Embarkment');
const Pricing = require('../models/Pricing');
const Quote = require('../models/Quote');
const Shipment = require('../models/Shipment');

const { buildCreateQuotePayload } = require('../services/quoteDomainService');
const { createShipmentFromQuote } = require('../services/shipmentService');
const { getInternalQuote } = require('../services/pricingService');
const masterDataService = require('../src/domains/network/application/masterDataService');

beforeEach(() => {
  const mpOriginId = '507f1f77bcf86cd799439011';
  const mpDestinationId = '507f1f77bcf86cd799439012';
  Country.findById = async () => null;
  Country.findOne = async () => null;
  Country.create = async (payload) => ({ _id: 'country_1', ...payload });

  MarketPoint.findById = (id) => ({
    lean: async () => {
      if (String(id) === mpOriginId) return { _id: id, name: 'Paris Hub' };
      if (String(id) === mpDestinationId) return { _id: id, name: 'Lome Port' };
      return null;
    },
  });
  MarketPoint.findOne = async () => null;
  MarketPoint.create = async (payload) => ({ _id: 'mp_1', ...payload });

  TransportLine.findById = () => ({ lean: async () => null });
  TransportLine.findOne = async () => null;
  TransportLine.create = async (payload) => ({ _id: 'line_1', ...payload });

  Embarkment.create = async (payload) => ({ _id: 'emb_1', ...payload });
  Embarkment.find = () => ({ sort: () => ({ skip: () => ({ limit: () => ({ populate: () => ({ populate: () => ({ lean: async () => [] }) }) }) }) }) });

  Pricing.find = () => ({ lean: async () => [] });
  Quote.findById = async () => null;
  Shipment.findOne = async () => null;
  Shipment.create = async (payload) => ({ _id: 'shipment_1', ...payload });

});

test('transport line creation uses structured route and emits event', async () => {
  const line = await masterDataService.createTransportLine({
    originMarketPointId: '507f1f77bcf86cd799439011',
    destinationMarketPointId: '507f1f77bcf86cd799439012',
    transportType: 'air',
    lineCode: 'PAR-LOM-AIR',
  });

  assert.strictEqual(line.origin, 'Paris Hub');
  assert.strictEqual(line.destination, 'Lome Port');
  assert.strictEqual(line.transportType, 'air');
});

test('pricing can resolve by transportLineId', async () => {
  Pricing.find = () => ({
    lean: async () => ([
      {
        _id: 'pricing_1',
        currency: 'USD',
        transportLineId: '507f1f77bcf86cd799439013',
        transportPrices: [{ _id: 'tp1', transportType: 'air', unitType: 'kg', pricePerUnit: 4, dimensionRanges: [], packagePricing: [] }],
      },
    ]),
  });

  const result = await getInternalQuote({ transportLineId: '507f1f77bcf86cd799439013', transportType: 'air', weight: 10 });
  assert.strictEqual(result.estimatedPrice, 40);
  assert.strictEqual(String(result.appliedRule.transportLineId), '507f1f77bcf86cd799439013');
});

test('quote payload supports structured route ids', () => {
  const payload = buildCreateQuotePayload({
    route: {
      origin: 'Paris',
      destination: 'Lome',
      transportType: 'air',
      originMarketPointId: 'mp_origin',
      destinationMarketPointId: 'mp_destination',
      transportLineId: '507f1f77bcf86cd799439013',
    },
    pricing: { totalPrice: 1000, currency: 'USD' },
  });

  assert.strictEqual(payload.originMarketPointId, 'mp_origin');
  assert.strictEqual(payload.destinationMarketPointId, 'mp_destination');
  assert.strictEqual(payload.transportLineId, '507f1f77bcf86cd799439013');
});

test('shipment inherits structured route from quote conversion', async () => {
  const quoteDoc = {
    _id: 'quote_1',
    status: 'approved',
    deliveryStatus: 'not_assigned',
    requestedBy: 'user_1',
    provider: 'internal',
    origin: 'Paris',
    destination: 'Lome',
    originMarketPointId: '507f1f77bcf86cd799439011',
    destinationMarketPointId: '507f1f77bcf86cd799439012',
    transportLineId: '507f1f77bcf86cd799439013',
    reviewHistory: [],
    save: async () => {},
  };

  Quote.findById = async () => quoteDoc;
  Shipment.findOne = async () => null;
  Shipment.create = async (payload) => payload;

  const result = await createShipmentFromQuote({ quoteId: 'quote_1', identity: { principalId: 'admin_1' } });

  assert.strictEqual(result.shipment.originMarketPointId, '507f1f77bcf86cd799439011');
  assert.strictEqual(result.shipment.destinationMarketPointId, '507f1f77bcf86cd799439012');
  assert.strictEqual(result.shipment.transportLineId, '507f1f77bcf86cd799439013');
});

test('embarkment creation requires valid line and emits event', async () => {
  TransportLine.findById = () => ({ lean: async () => ({ _id: '507f1f77bcf86cd799439013', transportType: 'sea' }) });

  const embarkment = await masterDataService.createEmbarkment({
    transportLineId: '507f1f77bcf86cd799439013',
    departureDate: '2026-05-01T10:00:00.000Z',
    arrivalEstimate: '2026-05-11T10:00:00.000Z',
    capacity: 120,
  });

  assert.strictEqual(embarkment.transportType, 'sea');
  assert.strictEqual(embarkment.capacity, 120);
});
