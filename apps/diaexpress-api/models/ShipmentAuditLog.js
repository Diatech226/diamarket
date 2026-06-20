const mongoose = require('mongoose');

const shipmentAuditLogSchema = new mongoose.Schema({
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', default: null, index: true },
  userId: { type: String, default: null, index: true },
  userLabel: { type: String, default: null },
  role: { type: String, default: null },
  action: { type: String, required: true, index: true },
  oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
  newValue: { type: mongoose.Schema.Types.Mixed, default: null },
  comment: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.models.ShipmentAuditLog || mongoose.model('ShipmentAuditLog', shipmentAuditLogSchema);
