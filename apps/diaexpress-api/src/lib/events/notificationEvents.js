const NOTIFICATION_EVENTS = Object.freeze({
  QuoteSubmitted: 'QuoteSubmitted', QuoteInfoRequested: 'QuoteInfoRequested', QuotePriced: 'QuotePriced', QuoteApproved: 'QuoteApproved', QuoteRejected: 'QuoteRejected', QuoteConvertedToShipment: 'QuoteConvertedToShipment',
  ShipmentCreated: 'ShipmentCreated', PickupScheduled: 'PickupScheduled', ShipmentPickedUp: 'ShipmentPickedUp', ShipmentInTransit: 'ShipmentInTransit', ShipmentAtDestinationHub: 'ShipmentAtDestinationHub', ShipmentOutForDelivery: 'ShipmentOutForDelivery', ShipmentDelivered: 'ShipmentDelivered', ShipmentDelayed: 'ShipmentDelayed', ShipmentDeliveryFailed: 'ShipmentDeliveryFailed', ShipmentReturned: 'ShipmentReturned', ShipmentCancelled: 'ShipmentCancelled',
  IncidentCreated: 'IncidentCreated', IncidentResolved: 'IncidentResolved', PaymentReceived: 'PaymentReceived',
});
const STATUS_EVENT_MAP = Object.freeze({
  awaiting_pickup: NOTIFICATION_EVENTS.PickupScheduled,
  scheduled: NOTIFICATION_EVENTS.PickupScheduled,
  picked_up: NOTIFICATION_EVENTS.ShipmentPickedUp,
  in_transit: NOTIFICATION_EVENTS.ShipmentInTransit,
  at_destination_hub: NOTIFICATION_EVENTS.ShipmentAtDestinationHub,
  at_hub: NOTIFICATION_EVENTS.ShipmentAtDestinationHub,
  out_for_delivery: NOTIFICATION_EVENTS.ShipmentOutForDelivery,
  delivered: NOTIFICATION_EVENTS.ShipmentDelivered,
  delayed: NOTIFICATION_EVENTS.ShipmentDelayed,
  delivery_failed: NOTIFICATION_EVENTS.ShipmentDeliveryFailed,
  failed_delivery: NOTIFICATION_EVENTS.ShipmentDeliveryFailed,
  returned: NOTIFICATION_EVENTS.ShipmentReturned,
  cancelled: NOTIFICATION_EVENTS.ShipmentCancelled,
});
module.exports = { NOTIFICATION_EVENTS, STATUS_EVENT_MAP };
