const mongoose = require('mongoose');

const quoteAuditLogSchema = new mongoose.Schema({
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true, index: true },
  userId: { type: String, default: null, index: true },
  userLabel: { type: String, default: null },
  role: { type: String, default: null },
  action: { type: String, required: true, index: true },
  oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
  newValue: { type: mongoose.Schema.Types.Mixed, default: null },
  comment: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.models.QuoteAuditLog || mongoose.model('QuoteAuditLog', quoteAuditLogSchema);
