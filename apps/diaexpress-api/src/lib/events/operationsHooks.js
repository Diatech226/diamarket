const { publishDomainEvent } = require('./domainEventPublisher');

const OPERATIONS_EVENTS = {
  INCIDENT_CREATED: 'IncidentCreated',
  INCIDENT_RESOLVED: 'IncidentResolved',
  SHIPMENT_AT_RISK: 'ShipmentAtRisk',
  SHIPMENT_LATE: 'ShipmentLate',
  RETURN_INITIATED: 'ReturnInitiated',
};

function publishOperationsEvent(name, payload) {
  publishDomainEvent(name, { ...payload, emittedAt: new Date().toISOString() });
}

module.exports = { OPERATIONS_EVENTS, publishOperationsEvent };
