const Shipment = require('../models/Shipment');
const Quote = require('../models/Quote');
const { ApiError } = require('../utils/http');
const ShipmentAuditLog = require('../models/ShipmentAuditLog');
const { generateTrackingNumber } = require('./trackingNumberService');

const {
  SHIPMENT_STATUSES,
  SHIPMENT_TRANSITIONS: ROLE_TRANSITIONS,
  normalizeShipmentStatus,
  canTransitionShipment,
} = require('../src/domain/statuses');

const TERMINAL_STATUSES = new Set(['delivered', 'returned', 'cancelled']);

const ELIGIBLE_QUOTE_STATUSES = new Set(['approved']);

async function generateTrackingCode() {
  return generateTrackingNumber();
}

function resolveIdentityRole(identity = {}) {
  const roles = [identity.role, ...(Array.isArray(identity.roles) ? identity.roles : [])]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  if (roles.includes('admin')) return 'admin';
  if (roles.some((role) => ['ops', 'operations', 'operator', 'dispatcher'].includes(role))) return 'operations';
  return 'operations';
}

function assertShipmentTransition({ currentStatus, nextStatus, identityRole }) {
  const current = normalizeShipmentStatus(currentStatus || 'created');
  const next = normalizeShipmentStatus(nextStatus);
  if (!next || current === next) return;

  if (!SHIPMENT_STATUSES.includes(next)) {
    throw new ApiError(400, 'SHIPMENT_INVALID_STATUS', `Unsupported shipment status: ${next}`);
  }

  if (!canTransitionShipment(current, next)) {
    throw new ApiError(409, 'INVALID_STATUS_TRANSITION', 'Transition de statut non autorisée');
  }
}

function buildTrackingEvent({ shipment, status, location, note, identity, eventType, eventTimestamp, source, carrierReference }) {
  const nextStatus = normalizeShipmentStatus(status || shipment.status || 'created');
  return {
    eventType: eventType || (status ? 'status_changed' : 'note_added'),
    status: nextStatus,
    location: location || shipment.currentLocation || null,
    note: note || null,
    source: source || (identity?.type === 'integration' ? 'integration' : 'admin'),
    actorId: identity?.principalId || null,
    actorLabel: identity?.label || null,
    carrierReference: carrierReference || null,
    timestamp: eventTimestamp ? new Date(eventTimestamp) : new Date(),
  };
}

function applyLifecycleDates(shipment, status, identity) {
  if (!status) return;
  const now = new Date();
  shipment.meta = shipment.meta || {};
  shipment.meta.lastStatusChangedBy = identity?.principalId || shipment.meta.lastStatusChangedBy || null;
  shipment.meta.lastStatusChangedAt = now;

  if (status === 'awaiting_pickup') shipment.scheduledAt = shipment.scheduledAt || now;
  if (status === 'in_transit') shipment.dispatchedAt = shipment.dispatchedAt || now;
  if (status === 'delivered') shipment.deliveredAt = shipment.deliveredAt || now;
  if (status === 'cancelled') shipment.cancelledAt = shipment.cancelledAt || now;
  if (status === 'returned') shipment.returnedAt = shipment.returnedAt || now;
}

async function createShipmentFromQuote({ quoteId, identity, notes }) {
  const quote = await Quote.findById(quoteId);
  if (!quote) throw new ApiError(404, 'QUOTE_NOT_FOUND', 'Quote introuvable');

  const { normalizeQuoteStatus } = require('../src/domain/statuses');
  const normalizedQuoteStatus = normalizeQuoteStatus(quote.status || '');
  if (!ELIGIBLE_QUOTE_STATUSES.has(normalizedQuoteStatus)) {
    throw new ApiError(409, 'QUOTE_NOT_ELIGIBLE_FOR_SHIPMENT', 'Quote not eligible for shipment conversion');
  }

  const existing = await Shipment.findOne({ quoteId: quote._id });
  if (existing || quote.shipmentId) throw new ApiError(409, 'QUOTE_ALREADY_CONVERTED', 'Quote already converted to shipment');

  const trackingCode = quote.trackingNumber || await generateTrackingCode();
  const previousQuoteStatus = quote.status;
  const now = new Date();

  let shipment;
  try {
    shipment = await Shipment.create({
    quoteId: quote._id,
    source: quote.source === 'diamarket' ? 'diamarket' : 'manual',
    userId: quote.userId || null,
    principalId: quote.requestedBy || identity.principalId,
    principalLabel: quote.requestedByLabel || identity.label || null,
    provider: quote.provider || 'internal',
    carrier: quote.carrier || 'DiaExpress',
    trackingCode,
    shipmentReference: trackingCode,
    status: 'created',
    currentLocation: quote.origin || null,
    currentMarketPointId: quote.originMarketPointId || null,
    estimatedDelivery: quote.estimatedDelivery || null,
    originMarketPointId: quote.originMarketPointId || null,
    destinationMarketPointId: quote.destinationMarketPointId || null,
    transportLineId: quote.transportLineId || null,
    clientSnapshot: { userId: quote.userId || null, email: quote.userEmail || null, requestedBy: quote.requestedBy || null, label: quote.requestedByLabel || null, recipientContactName: quote.recipientContactName || null, recipientContactEmail: quote.recipientContactEmail || null, recipientContactPhone: quote.recipientContactPhone || null, contactPhone: quote.contactPhone || null },
    originSnapshot: { label: quote.origin, marketPointId: quote.originMarketPointId || null, senderAddressId: quote.senderAddressId || null },
    destinationSnapshot: { label: quote.destination, marketPointId: quote.destinationMarketPointId || null, recipientAddressId: quote.recipientAddressId || null },
    transportSnapshot: { transportType: quote.transportType, transportLineId: quote.transportLineId || null, provider: quote.provider || 'internal', carrier: quote.carrier || 'DiaExpress', delay: quote.pricingSnapshot?.delay || quote.pricingSnapshot?.deliveryDelay || null, estimatedDelivery: quote.estimatedDelivery || null },
    packageSnapshot: { packageTypeId: quote.packageTypeId || null, quantity: quote.quantity || null, unitType: quote.unitType || null, weight: quote.weight || null, weightActual: quote.weightActual ?? quote.weight ?? null, weightVolumetric: quote.weightVolumetric ?? null, billableWeight: quote.billableWeight ?? quote.weight ?? null, dimensions: { length: quote.length || null, width: quote.width || null, height: quote.height || null }, volume: quote.volume || null, declaredValue: quote.declaredValue || null },
    serviceSnapshot: { services: quote.services || [], pickupOption: quote.pickupOption || 'pickup' },
    weight: quote.billableWeight || quote.weight || null,
    volume: quote.volume || null,
    priceAccepted: quote.finalPrice ?? quote.estimatedPrice ?? null,
    currency: quote.currency || null,
    weightActual: quote.weightActual ?? quote.weight ?? null,
    weightVolumetric: quote.weightVolumetric ?? null,
    billableWeight: quote.billableWeight ?? quote.weight ?? null,
    routeSnapshot: { origin: quote.origin, destination: quote.destination, transportType: quote.transportType, transportLineId: quote.transportLineId || null },
    pricingSnapshot: quote.pricingSnapshot || {
      estimatedPrice: quote.estimatedPrice,
      finalPrice: quote.finalPrice,
      currency: quote.currency,
      pricingAppliedId: quote.pricingAppliedId,
      breakdown: quote.pricingBreakdown,
    },
    dimensions: {
      length: quote.length || null,
      width: quote.width || null,
      height: quote.height || null,
    },
    createdAtOperational: now,
    trackingUpdates: [{
      eventType: 'shipment_created',
      location: quote.origin || null,
      status: 'created',
      note: 'Shipment Created',
      source: 'system',
      actorId: identity?.principalId || null,
      actorLabel: identity?.label || null,
      carrierReference: null,
      timestamp: now,
    }, {
      eventType: 'converted_from_quote',
      location: quote.origin || null,
      status: 'created',
      note: 'Converted From Quote',
      source: 'system',
      actorId: identity?.principalId || null,
      actorLabel: identity?.label || null,
      carrierReference: trackingCode,
      timestamp: now,
    }],
    meta: {
      ...(quote.meta || {}),
      source: quote.source === 'diamarket' ? 'diamarket' : 'manual',
      quote: {
        origin: quote.origin,
        destination: quote.destination,
        originMarketPointId: quote.originMarketPointId || null,
        destinationMarketPointId: quote.destinationMarketPointId || null,
        transportLineId: quote.transportLineId || null,
        estimatedPrice: quote.estimatedPrice,
        finalPrice: quote.finalPrice,
        currency: quote.currency,
        userEmail: quote.userEmail || null,
        recipientContactName: quote.recipientContactName || null,
        services: quote.services || [],
        declaredValue: quote.declaredValue || null,
        weightActual: quote.weightActual ?? quote.weight ?? null,
        weightVolumetric: quote.weightVolumetric ?? null,
        billableWeight: quote.billableWeight ?? quote.weight ?? null,
        pricingSnapshot: quote.pricingSnapshot || null,
      },
      pickupOption: quote.pickupOption || 'pickup',
      senderAddressId: quote.senderAddressId || null,
      recipientAddressId: quote.recipientAddressId || null,
      billingAddressId: quote.billingAddressId || null,
      conversion: {
        sourceQuoteId: String(quote._id),
        convertedAt: now,
        convertedBy: identity?.principalId || null,
        convertedByLabel: identity?.label || null,
        notes: notes || null,
      },
    },
    convertedAt: now,
    convertedBy: identity?.principalId || null,
  });
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, 'TRACKING_ALREADY_EXISTS', 'Tracking number already exists');
    throw error;
  }

  quote.shipmentId = shipment._id;
  quote.trackingNumber = trackingCode;
  quote.deliveryStatus = 'assigned';
  quote.status = 'converted_to_shipment';
  quote.convertedAt = now;
  quote.reviewHistory = Array.isArray(quote.reviewHistory) ? quote.reviewHistory : [];
  await ShipmentAuditLog.create({ shipmentId: shipment._id, quoteId: quote._id, userId: identity?.principalId || null, userLabel: identity?.label || null, role: resolveIdentityRole(identity), action: 'conversion', oldValue: { quoteStatus: previousQuoteStatus }, newValue: { shipmentId: shipment._id, trackingCode, status: 'created' }, comment: notes || 'Converted From Quote' }).catch(() => null);

  quote.reviewHistory.push({
    action: 'quote_converted_to_shipment',
    fromStatus: previousQuoteStatus,
    toStatus: 'converted_to_shipment',
    actorId: identity?.principalId || null,
    actorLabel: identity?.label || null,
    role: resolveIdentityRole(identity),
    note: notes || 'Quote converti en shipment',
    at: now,
    metadata: { shipmentId: shipment._id, trackingCode },
  });
  await quote.save();

  return { shipment, quote, created: true };
}

function normalizeTrackingEvents(events = []) {
  return [...events]
    .filter(Boolean)
    .map((event) => ({
      eventType: event.eventType || 'status_update',
      status: normalizeShipmentStatus(event.status),
      location: event.location || null,
      note: event.note || null,
      source: event.source || 'system',
      actorId: event.actorId || null,
      actorLabel: event.actorLabel || null,
      carrierReference: event.carrierReference || null,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

module.exports = {
  SHIPMENT_STATUSES,
  TERMINAL_STATUSES,
  ROLE_TRANSITIONS,
  ELIGIBLE_QUOTE_STATUSES,
  normalizeShipmentStatus,
  resolveIdentityRole,
  assertShipmentTransition,
  buildTrackingEvent,
  applyLifecycleDates,
  createShipmentFromQuote,
  normalizeTrackingEvents,
};
