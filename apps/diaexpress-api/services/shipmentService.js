const Shipment = require('../models/Shipment');
const Quote = require('../models/Quote');
const { ApiError } = require('../utils/http');

const {
  SHIPMENT_STATUSES,
  SHIPMENT_TRANSITIONS: ROLE_TRANSITIONS,
  normalizeShipmentStatus,
  canTransitionShipment,
} = require('../src/domain/statuses');

const TERMINAL_STATUSES = new Set(['delivered', 'returned', 'cancelled']);

const ELIGIBLE_QUOTE_STATUSES = new Set(['approved']);

function generateTrackingCode() {
  const date = new Date();
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate(),
  ).padStart(2, '0')}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SH-${yyyymmdd}-${random}`;
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
  if (!ELIGIBLE_QUOTE_STATUSES.has(normalizedQuoteStatus) && quote.deliveryStatus !== 'assigned') {
    throw new ApiError(409, 'QUOTE_NOT_ELIGIBLE_FOR_SHIPMENT', `Quote status ${quote.status} cannot be converted to shipment`);
  }

  const existing = await Shipment.findOne({ quoteId: quote._id });
  if (existing) return { shipment: existing, quote, created: false };

  const trackingCode = quote.trackingNumber || generateTrackingCode();
  const previousQuoteStatus = quote.status;
  const now = new Date();

  const shipment = await Shipment.create({
    quoteId: quote._id,
    userId: quote.userId || null,
    principalId: quote.requestedBy || identity.principalId,
    principalLabel: quote.requestedByLabel || identity.label || null,
    provider: quote.provider || 'internal',
    carrier: quote.carrier || 'DiaExpress',
    trackingCode,
    status: 'created',
    currentLocation: quote.origin || null,
    currentMarketPointId: quote.originMarketPointId || null,
    estimatedDelivery: quote.estimatedDelivery || null,
    originMarketPointId: quote.originMarketPointId || null,
    destinationMarketPointId: quote.destinationMarketPointId || null,
    transportLineId: quote.transportLineId || null,
    weight: quote.weight || null,
    volume: quote.volume || null,
    dimensions: {
      length: quote.length || null,
      width: quote.width || null,
      height: quote.height || null,
    },
    createdAtOperational: now,
    trackingUpdates: [{
      eventType: 'quote_converted',
      location: quote.origin || null,
      status: 'created',
      note: 'Shipment créé depuis le devis',
      source: 'system',
      actorId: identity?.principalId || null,
      actorLabel: identity?.label || null,
      carrierReference: null,
      timestamp: now,
    }],
    meta: {
      ...(quote.meta || {}),
      quote: {
        origin: quote.origin,
        destination: quote.destination,
        originMarketPointId: quote.originMarketPointId || null,
        destinationMarketPointId: quote.destinationMarketPointId || null,
        transportLineId: quote.transportLineId || null,
        estimatedPrice: quote.estimatedPrice,
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

  quote.shipmentId = shipment._id;
  quote.trackingNumber = trackingCode;
  quote.deliveryStatus = 'assigned';
  quote.status = 'converted_to_shipment';
  quote.convertedAt = now;
  quote.reviewHistory = Array.isArray(quote.reviewHistory) ? quote.reviewHistory : [];
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
