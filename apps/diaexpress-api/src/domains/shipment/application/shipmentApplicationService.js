const Shipment = require('../../../../models/Shipment');
const {
  createShipmentFromQuote,
  normalizeShipmentStatus,
  resolveIdentityRole,
  assertShipmentTransition,
  buildTrackingEvent,
  applyLifecycleDates,
} = require('../../../../services/shipmentService');
const { applyShipmentLifecycleToQuote } = require('../../quote/application/quoteOwnershipService');
const { publishDomainEvent } = require('../../../shared/events/domainEventPublisher');
const { DOMAIN_EVENT_NAMES } = require('../../../shared/events/domainEventCatalog');

async function convertQuoteToShipment({ quoteId, identity, notes }) {
  const result = await createShipmentFromQuote({ quoteId, identity, notes });
  if (result.created) {
    publishDomainEvent(DOMAIN_EVENT_NAMES.SHIPMENT_CREATED, {
      shipmentId: String(result.shipment._id),
      quoteId: String(result.quote._id),
      trackingCode: result.shipment.trackingCode,
      originMarketPointId: result.shipment.originMarketPointId ? String(result.shipment.originMarketPointId) : null,
      destinationMarketPointId: result.shipment.destinationMarketPointId ? String(result.shipment.destinationMarketPointId) : null,
      transportLineId: result.shipment.transportLineId ? String(result.shipment.transportLineId) : null,
    });
    publishDomainEvent(DOMAIN_EVENT_NAMES.QUOTE_CONVERTED, {
      quoteId: String(result.quote._id),
      shipmentId: String(result.shipment._id),
    });
  }
  return result;
}

async function updateShipmentStatus({ shipment, identity, input }) {
  const { status, location, note, paymentStatus, eventType, eventTimestamp, carrierReference } = input;
  const nextStatus = normalizeShipmentStatus(status);
  assertShipmentTransition({ currentStatus: shipment.status, nextStatus, identityRole: resolveIdentityRole(identity) });

  shipment.meta = shipment.meta || {};
  shipment.trackingUpdates = Array.isArray(shipment.trackingUpdates) ? shipment.trackingUpdates : [];
  if (paymentStatus) shipment.meta.lastPaymentStatus = paymentStatus;
  if (nextStatus) shipment.status = nextStatus;
  if (location) shipment.currentLocation = location;
  if (input?.currentMarketPointId) shipment.currentMarketPointId = input.currentMarketPointId;

  if (nextStatus || location || note) {
    shipment.trackingUpdates.push(buildTrackingEvent({
      shipment,
      status: nextStatus || shipment.status,
      location,
      note: note || (nextStatus ? `Status updated to ${nextStatus}` : null),
      identity,
      eventType,
      eventTimestamp,
      carrierReference,
    }));
  }

  applyLifecycleDates(shipment, nextStatus, identity);
  await shipment.save();
  await applyShipmentLifecycleToQuote({
    quoteId: shipment.quoteId,
    shipmentStatus: shipment.status,
    trackingCode: shipment.trackingCode,
    deliveredAt: shipment.deliveredAt,
  });
  publishDomainEvent(DOMAIN_EVENT_NAMES.SHIPMENT_STATUS_CHANGED, {
    shipmentId: String(shipment._id),
    quoteId: shipment.quoteId ? String(shipment.quoteId) : null,
    status: shipment.status,
  });

  return shipment;
}

async function addShipmentHistory({ shipment, identity, input }) {
  const { location, status, note, eventType, eventTimestamp, carrierReference } = input;
  const nextStatus = normalizeShipmentStatus(status || shipment.status);
  assertShipmentTransition({ currentStatus: shipment.status, nextStatus, identityRole: resolveIdentityRole(identity) });

  shipment.trackingUpdates = Array.isArray(shipment.trackingUpdates) ? shipment.trackingUpdates : [];
  shipment.trackingUpdates.push(buildTrackingEvent({
    shipment,
    status: nextStatus,
    location,
    note,
    identity,
    eventType,
    eventTimestamp,
    carrierReference,
  }));

  if (nextStatus) shipment.status = nextStatus;
  if (location) shipment.currentLocation = location;
  if (input?.currentMarketPointId) shipment.currentMarketPointId = input.currentMarketPointId;
  applyLifecycleDates(shipment, nextStatus, identity);
  await shipment.save();
  await applyShipmentLifecycleToQuote({
    quoteId: shipment.quoteId,
    shipmentStatus: shipment.status,
    trackingCode: shipment.trackingCode,
    deliveredAt: shipment.deliveredAt,
  });
  publishDomainEvent(DOMAIN_EVENT_NAMES.TRACKING_UPDATED, {
    shipmentId: String(shipment._id),
    quoteId: shipment.quoteId ? String(shipment.quoteId) : null,
    status: shipment.status,
    events: shipment.trackingUpdates.length,
  });

  return shipment;
}

async function findShipmentOrThrow(shipmentId) {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    const error = new Error('Shipment introuvable');
    error.status = 404;
    error.code = 'SHIPMENT_NOT_FOUND';
    throw error;
  }
  return shipment;
}

module.exports = {
  convertQuoteToShipment,
  updateShipmentStatus,
  addShipmentHistory,
  findShipmentOrThrow,
};
