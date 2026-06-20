const express = require('express');
const Quote = require('../models/Quote');
const Shipment = require('../models/Shipment');
const IntegrationAuditLog = require('../models/IntegrationAuditLog');
const { getInternalQuote } = require('../services/pricingService');
const { createShipmentFromQuote, normalizeTrackingEvents } = require('../services/shipmentService');
const { success, ApiError } = require('../utils/http');

const router = express.Router();
const WEBHOOK_EVENTS = new Set(['shipment.created', 'shipment.picked_up', 'shipment.in_transit', 'shipment.out_for_delivery', 'shipment.delivered', 'shipment.failed', 'shipment.returned', 'shipment.cancelled']);
const STATUS_TO_EVENT = { created: 'shipment.created', pending_dispatch: 'shipment.picked_up', scheduled: 'shipment.picked_up', in_transit: 'shipment.in_transit', out_for_delivery: 'shipment.out_for_delivery', delivered: 'shipment.delivered', failed_delivery: 'shipment.failed', returned: 'shipment.returned', cancelled: 'shipment.cancelled' };

function configuredKeys() {
  return String(process.env.DIAMARKET_INTEGRATION_API_KEYS || process.env.INTEGRATION_API_KEYS || '').split(',').map((v) => v.trim()).filter(Boolean);
}

function requireIntegrationToken(req, _res, next) {
  const keys = configuredKeys();
  const token = req.get('x-integration-api-key') || (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!keys.length || !token || !keys.includes(token)) return next(new ApiError(401, 'INTEGRATION_UNAUTHORIZED', 'Integration API key is required or invalid'));
  req.identity = { type: 'integration', role: 'admin', roles: ['admin', 'integration'], principalId: 'diamarket-integration', label: 'Diamarket Integration' };
  return next();
}

function timeline(shipment) {
  return normalizeTrackingEvents(shipment.trackingUpdates || []);
}

function formatTracking(shipment) {
  const events = timeline(shipment);
  return { trackingNumber: shipment.trackingCode, status: shipment.status, events, timeline: events, lastUpdatedAt: events.length ? events[events.length - 1].timestamp : shipment.updatedAt, shipmentId: shipment._id, source: shipment.source };
}

async function audit(req, payload) {
  return IntegrationAuditLog.create({ source: 'diamarket', endpoint: req.originalUrl, method: req.method, idempotencyKey: req.get('Idempotency-Key') || null, request: req.body || null, ...payload }).catch(() => null);
}

router.use(requireIntegrationToken);

router.post('/shipping/estimate', async (req, res, next) => {
  try {
    const estimate = await getInternalQuote({ ...req.body, dimensions: req.body.dimensions || { length: req.body.length, width: req.body.width, height: req.body.height }, currency: req.body.currency || 'XOF' });
    if (estimate.errorCode) throw new ApiError(estimate.errorCode === 'PRICING_AMBIGUOUS' ? 409 : 404, estimate.errorCode, 'Pricing rule not found', estimate.explanation || estimate.warnings);
    const data = { estimatedPrice: estimate.estimatedPrice, currency: estimate.currency, estimatedDays: estimate.estimatedDays || 3 };
    await audit(req, { statusCode: 200, response: data });
    return success(res, data, { meta: { pricingEngine: 'internal', appliedRule: estimate.appliedRule } });
  } catch (error) { await audit(req, { statusCode: error.status || 500, error: { code: error.code, message: error.message } }); return next(error); }
});

router.post('/shipments', async (req, res, next) => {
  try {
    const idempotencyKey = req.get('Idempotency-Key');
    const orderId = req.body?.order?.id || req.body?.orderId;
    if (!idempotencyKey || !orderId) throw new ApiError(400, 'IDEMPOTENCY_REQUIRED', 'Idempotency-Key and order.id are required');
    const existing = await Shipment.findOne({ source: 'diamarket', $or: [{ 'meta.diamarket.orderId': String(orderId) }, { 'meta.diamarket.idempotencyKey': idempotencyKey }] });
    if (existing) throw new ApiError(409, 'DIAMARKET_SHIPMENT_ALREADY_EXISTS', 'Shipment already exists for this Diamarket order', formatTracking(existing));
    const body = req.body || {};
    const dims = body.dimensions || {};
    const estimate = await getInternalQuote({ origin: body.origin, destination: body.destination, transportType: body.transportType || 'road', weight: body.weight, dimensions: dims, currency: body.currency || 'XOF' });
    if (estimate.errorCode) throw new ApiError(estimate.errorCode === 'PRICING_AMBIGUOUS' ? 409 : 404, estimate.errorCode, 'Pricing rule not found', estimate.explanation || estimate.warnings);
    const quote = await Quote.create({ origin: body.origin, destination: body.destination, transportType: body.transportType || 'road', source: 'diamarket', status: 'approved', weight: body.weight, length: dims.length, width: dims.width, height: dims.height, userEmail: body.client?.email, requestedBy: `diamarket:${orderId}`, requestedByType: 'integration', requestedByLabel: body.client?.name || `Diamarket order ${orderId}`, recipientContactName: body.client?.name, recipientContactPhone: body.client?.phone, recipientContactEmail: body.client?.email, recipientAddressId: body.address?.id, estimatedPrice: estimate.estimatedPrice, finalPrice: estimate.estimatedPrice, currency: estimate.currency, pricingSnapshot: estimate, pricingBreakdown: estimate.breakdown, meta: { diamarket: { orderId: String(orderId), idempotencyKey, order: body.order, address: body.address, items: body.items || [] } } });
    const result = await createShipmentFromQuote({ quoteId: quote._id, identity: req.identity, notes: `Diamarket order ${orderId}` });
    result.shipment.meta = { ...(result.shipment.meta || {}), diamarket: { orderId: String(orderId), idempotencyKey, order: body.order, address: body.address, items: body.items || [] } };
    await result.shipment.save();
    const data = { shipment: result.shipment, tracking: formatTracking(result.shipment), timeline: timeline(result.shipment) };
    await audit(req, { statusCode: 201, response: { shipmentId: result.shipment._id, trackingNumber: result.shipment.trackingCode } });
    return success(res, data, { status: 201 });
  } catch (error) { await audit(req, { statusCode: error.status || 500, error: { code: error.code, message: error.message, details: error.details } }); return next(error); }
});

router.get('/shipments/:trackingNumber', async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ trackingCode: req.params.trackingNumber, source: 'diamarket' });
    if (!shipment) throw new ApiError(404, 'SHIPMENT_NOT_FOUND', 'Shipment introuvable');
    return success(res, formatTracking(shipment));
  } catch (error) { return next(error); }
});

router.post('/webhooks/:event', async (req, res, next) => {
  try {
    const event = req.params.event;
    if (!WEBHOOK_EVENTS.has(event)) throw new ApiError(400, 'WEBHOOK_EVENT_UNSUPPORTED', 'Unsupported webhook event');
    const idempotencyKey = req.get('Idempotency-Key');
    if (!idempotencyKey) throw new ApiError(400, 'IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required');
    const previous = await IntegrationAuditLog.findOne({ source: 'diamarket', endpoint: req.originalUrl, idempotencyKey, statusCode: 200 });
    if (previous) throw new ApiError(409, 'WEBHOOK_ALREADY_PROCESSED', 'Webhook already processed');
    await audit(req, { statusCode: 200, response: { accepted: true, event } });
    return success(res, { accepted: true, event });
  } catch (error) { await audit(req, { statusCode: error.status || 500, error: { code: error.code, message: error.message } }); return next(error); }
});

module.exports = router;
module.exports.STATUS_TO_EVENT = STATUS_TO_EVENT;
