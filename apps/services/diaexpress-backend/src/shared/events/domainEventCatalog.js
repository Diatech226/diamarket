const DOMAIN_EVENT_NAMES = Object.freeze({
  QUOTE_REQUESTED: 'quote.requested',
  QUOTE_APPROVED: 'quote.approved',
  QUOTE_CONVERTED: 'quote.converted',
  SHIPMENT_CREATED: 'shipment.created',
  SHIPMENT_STATUS_CHANGED: 'shipment.status_changed',
  TRACKING_UPDATED: 'tracking.updated',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  NETWORK_MARKET_POINT_CREATED: 'network.market_point.created',
  NETWORK_TRANSPORT_LINE_CREATED: 'network.transport_line.created',
  NETWORK_EMBARKMENT_CREATED: 'network.embarkment.created',
  RESERVATION_CREATED: 'reservation.created',
  RESERVATION_CONFIRMED: 'reservation.confirmed',
  RESERVATION_REJECTED: 'reservation.rejected',
  SCHEDULE_CREATED: 'schedule.created',
  SHIPMENT_ASSIGNED: 'shipment.assigned',
  EMBARKMENT_CAPACITY_REACHED: 'embarkment.capacity_reached',
  SHIPMENT_PLANNING_EXCEPTION: 'shipment.planning_exception',
});

module.exports = {
  DOMAIN_EVENT_NAMES,
};
