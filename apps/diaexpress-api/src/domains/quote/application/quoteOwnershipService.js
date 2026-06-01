const Quote = require('../../../../models/Quote');

async function applyShipmentLifecycleToQuote({ quoteId, shipmentStatus, trackingCode, deliveredAt }) {
  if (!quoteId) return null;

  const patch = {
    trackingNumber: trackingCode || null,
  };

  if (['created', 'pending_dispatch', 'scheduled'].includes(shipmentStatus)) {
    patch.deliveryStatus = 'assigned';
  } else if (['in_transit', 'at_hub', 'out_for_delivery'].includes(shipmentStatus)) {
    patch.deliveryStatus = 'in_transit';
  } else if (shipmentStatus === 'delivered') {
    patch.deliveryStatus = 'delivered';
    patch.status = 'converted';
    patch.deliveredAt = deliveredAt || new Date();
  } else if (['cancelled', 'returned', 'failed_delivery'].includes(shipmentStatus)) {
    patch.deliveryStatus = 'not_assigned';
    patch.status = 'cancelled';
    patch.deliveredAt = null;
  }

  return Quote.findByIdAndUpdate(quoteId, { $set: patch }, { new: true });
}

module.exports = {
  applyShipmentLifecycleToQuote,
};
