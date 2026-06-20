const Quote = require('../../../../models/Quote');

async function applyShipmentLifecycleToQuote({ quoteId, shipmentStatus, trackingCode, deliveredAt }) {
  if (!quoteId) return null;

  const patch = {
    trackingNumber: trackingCode || null,
  };

  if (['created', 'awaiting_pickup'].includes(shipmentStatus)) {
    patch.deliveryStatus = 'assigned';
  } else if (['picked_up', 'at_origin_hub', 'in_transit', 'at_destination_hub', 'out_for_delivery'].includes(shipmentStatus)) {
    patch.deliveryStatus = 'in_transit';
  } else if (shipmentStatus === 'delivered') {
    patch.deliveryStatus = 'delivered';
    patch.status = 'converted_to_shipment';
    patch.deliveredAt = deliveredAt || new Date();
  } else if (['cancelled', 'returned', 'delivery_failed'].includes(shipmentStatus)) {
    patch.deliveryStatus = 'not_assigned';
    patch.status = 'cancelled';
    patch.deliveredAt = null;
  }

  return Quote.findByIdAndUpdate(quoteId, { $set: patch }, { new: true });
}

module.exports = {
  applyShipmentLifecycleToQuote,
};
