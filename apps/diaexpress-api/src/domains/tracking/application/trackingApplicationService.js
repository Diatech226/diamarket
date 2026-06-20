const Shipment = require('../../../../models/Shipment');
const { getCarrierTracking, normaliseProvider } = require('../../../../services/carrierIntegrationService');
const { normalizeShipmentStatus, normalizeTrackingEvents } = require('../../../../services/shipmentService');
const { applyShipmentLifecycleToQuote } = require('../../quote/application/quoteOwnershipService');
const { publishDomainEvent } = require('../../../lib/events/domainEventPublisher');
const { DOMAIN_EVENT_NAMES } = require('../../../lib/events/domainEventCatalog');
const ShipmentIncident = require('../../../../models/ShipmentIncident');

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

function publicShipmentView(shipment, incidents = []) {
  if (!shipment) return null;
  const obj = typeof shipment.toObject === 'function' ? shipment.toObject() : { ...shipment };
  delete obj.assignedAgent; delete obj.assignedTeam; delete obj.assignedHub; delete obj.assignmentNote; delete obj.assignmentReason; delete obj.assignedBy; delete obj.meta;
  delete obj.returnReason; delete obj.returnComment;
  if (incidents.some((incident) => ['open', 'in_progress'].includes(incident.status))) {
    obj.publicNotice = {
      type: 'delay',
      message: 'Votre colis rencontre un retard. Notre équipe traite la situation.',
      lastUpdate: obj.updatedAt || new Date(),
    };
  }
  return obj;
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
      const publicIncidents = await ShipmentIncident.find({ shipmentId: shipment._id, customerVisible: true, status: { $in: ['open', 'in_progress'] } }).lean();
      return {
        code: 200,
        payload: { provider, trackingCode, status: shipment.status, currentStatus: shipment.status, events, timeline: events, shipment: publicShipmentView(shipment, publicIncidents) },
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
  const publicIncidents = shipment ? await ShipmentIncident.find({ shipmentId: shipment._id, customerVisible: true, status: { $in: ['open', 'in_progress'] } }).lean() : [];
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
      shipment: publicShipmentView(shipment, publicIncidents),
    },
  };
}

module.exports = {
  syncTracking,
};
