const mongoose = require('mongoose');

const PricingAuditLogSchema = new mongoose.Schema({
  pricingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pricing', index: true },
  action: { type: String, enum: ['create', 'update', 'delete'], required: true, index: true },
  actorId: { type: String, default: null, index: true },
  actorLabel: { type: String, default: null },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null },
  changedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

module.exports = mongoose.models.PricingAuditLog || mongoose.model('PricingAuditLog', PricingAuditLogSchema);
