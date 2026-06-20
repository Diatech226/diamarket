const mongoose = require('mongoose');

const INCIDENT_TYPES = ['delay','damage','missing_package','customs_issue','address_issue','delivery_failed','payment_issue','customer_unreachable','other'];
const INCIDENT_SEVERITIES = ['low','medium','high','critical'];
const INCIDENT_STATUSES = ['open','in_progress','resolved','closed'];

const IncidentCommentSchema = new mongoose.Schema({
  author: { type: String, default: 'system' },
  visibility: { type: String, enum: ['internal', 'public'], default: 'internal' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const ShipmentIncidentSchema = new mongoose.Schema({
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
  trackingNumber: { type: String, required: true, index: true },
  type: { type: String, enum: INCIDENT_TYPES, required: true, index: true },
  severity: { type: String, enum: INCIDENT_SEVERITIES, default: 'medium', index: true },
  status: { type: String, enum: INCIDENT_STATUSES, default: 'open', index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  reportedBy: { type: String, default: 'system' },
  assignedTo: { type: String, default: null, index: true },
  assignedTeam: { type: String, default: null, index: true },
  location: { type: String, default: null },
  nextAction: { type: String, default: null },
  linkedTrackingEventAt: { type: Date, default: null },
  customerVisible: { type: Boolean, default: false },
  resolution: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
  comments: { type: [IncidentCommentSchema], default: [] },
}, { timestamps: true });

ShipmentIncidentSchema.index({ trackingNumber: 1, status: 1 });
ShipmentIncidentSchema.index({ createdAt: -1 });

module.exports = mongoose.models.ShipmentIncident || mongoose.model('ShipmentIncident', ShipmentIncidentSchema);
module.exports.INCIDENT_TYPES = INCIDENT_TYPES;
module.exports.INCIDENT_SEVERITIES = INCIDENT_SEVERITIES;
module.exports.INCIDENT_STATUSES = INCIDENT_STATUSES;
