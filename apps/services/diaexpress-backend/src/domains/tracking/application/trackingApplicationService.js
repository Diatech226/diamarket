const Shipment = require('../../../../models/Shipment');
const { getCarrierTracking, normaliseProvider } = require('../../../../services/carrierIntegrationService');
const { normalizeShipmentStatus, normalizeTrackingEvents } = require('../../../../services/shipmentService');
const { applyShipmentLifecycleToQuote } = require('../../quote/application/quoteOwnershipService');
const { publishDomainEvent } = require('../../../shared/events/domainEventPublisher');
const { DOMAIN_EVENT_NAMES } = require('../../../shared/events/domainEventCatalog');

function convertEvents(events = []) {
  return events
    .filter(Boolean)
    .map((event) => ({
      eventType: event.eventType || event.type || 'carrier_update',
      status: normalizeShipmentStatus(event.code || event.status || 'in_transit'),
      location: event.location || event.source || null,
      note: event.description || event.note || null,
      source: 'carrier',
      actorId: null,
      actorLabel: null,
      carrierReference: event.reference || null,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }));
}

async function syncTracking({ trackingCode, provider: requestedProvider, identity }) {
  const shipment = await Shipment.findOne({ trackingCode });
  const provider = normaliseProvider(requestedProvider || shipment?.provider);

  if (!shipment && provider === 'internal') {
    return { code: 404, payload: { message: 'Expédition introuvable' } };
  }

  const trackingPayload = await getCarrierTracking({ provider, trackingNumber: trackingCode, shipment, identity });
  if (!trackingPayload) {
    if (shipment) {
      const events = normalizeTrackingEvents(shipment.trackingUpdates || []);
      return {
        code: 200,
        payload: { provider, trackingCode, status: shipment.status, currentStatus: shipment.status, events, timeline: events, shipment },
      };
    }
    return { code: 502, payload: { message: 'Impossible de récupérer le suivi transporteur' } };
  }

  const status = normalizeShipmentStatus(trackingPayload.status || shipment?.status);
  const events = convertEvents(trackingPayload.events);

  if (shipment) {
    shipment.status = status;
    const existingUpdates = Array.isArray(shipment.trackingUpdates) ? shipment.trackingUpdates : [];
    shipment.trackingUpdates = normalizeTrackingEvents(existingUpdates.concat(events));
    shipment.currentLocation = shipment.trackingUpdates[shipment.trackingUpdates.length - 1]?.location || shipment.currentLocation || null;
    shipment.estimatedDelivery = trackingPayload.estimatedDelivery ? new Date(trackingPayload.estimatedDelivery) : shipment.estimatedDelivery;
    shipment.meta = {
      ...shipment.meta,
      lastTrackingSync: new Date(),
      providerTrackingPayload: trackingPayload.meta?.raw || shipment.meta?.providerTrackingPayload || null,
    };
    await shipment.save();

    await applyShipmentLifecycleToQuote({
      quoteId: shipment.quoteId,
      shipmentStatus: shipment.status,
      trackingCode: shipment.trackingCode,
      deliveredAt: shipment.deliveredAt,
    });
    publishDomainEvent(DOMAIN_EVENT_NAMES.TRACKING_UPDATED, {
      shipmentId: String(shipment._id),
      trackingCode: shipment.trackingCode,
      status: shipment.status,
      provider,
    });
  }

  const normalizedEvents = normalizeTrackingEvents(shipment?.trackingUpdates || events);
  return {
    code: 200,
    payload: {
      provider,
      trackingCode,
      status,
      currentStatus: status,
      estimatedDelivery: trackingPayload.estimatedDelivery || shipment?.estimatedDelivery || null,
      events: normalizedEvents,
      timeline: normalizedEvents,
      shipment,
    },
  };
}

module.exports = {
  syncTracking,
};
