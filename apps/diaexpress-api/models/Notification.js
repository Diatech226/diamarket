const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userId: { type: String, index: true },
  recipientEmail: { type: String, default: null },
  recipientPhone: { type: String, default: null },
  channel: { type: String, enum: ['email','sms','whatsapp','in_app'], default: 'in_app', index: true },
  eventType: { type: String, required: true, index: true },
  type: { type: String, enum: ['quote', 'shipment', 'payment', 'system', 'message', 'incident'], default: 'system' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending','sent','failed','read'], default: 'sent', index: true },
  readAt: { type: Date, default: null },
  sentAt: { type: Date, default: Date.now },
  relatedType: { type: String, default: null },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedEntity: { entityType: { type: String }, entityId: { type: mongoose.Schema.Types.ObjectId } },
  read: { type: Boolean, default: false },
  deliveryChannels: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: false }, sms: { type: Boolean, default: false }, whatsapp: { type: Boolean, default: false }, push: { type: Boolean, default: false } },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
