const mongoose = require('mongoose');

const IntegrationAuditLogSchema = new mongoose.Schema({
  source: { type: String, required: true, index: true },
  direction: { type: String, enum: ['inbound', 'outbound'], default: 'inbound', index: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  idempotencyKey: { type: String, default: null, index: true },
  statusCode: { type: Number, default: null },
  request: { type: mongoose.Schema.Types.Mixed, default: null },
  response: { type: mongoose.Schema.Types.Mixed, default: null },
  error: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

IntegrationAuditLogSchema.index({ source: 1, endpoint: 1, idempotencyKey: 1 });

module.exports = mongoose.models.IntegrationAuditLog || mongoose.model('IntegrationAuditLog', IntegrationAuditLogSchema);
