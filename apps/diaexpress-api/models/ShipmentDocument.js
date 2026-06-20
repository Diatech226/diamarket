const mongoose = require('mongoose');

const DOCUMENT_TYPES = ['shipping_label','invoice','receipt','customs_document','pickup_proof','delivery_proof','incident_photo','other'];
const DOCUMENT_VISIBILITIES = ['admin_only','client_visible','public_tracking'];

const ProofSchema = new mongoose.Schema({
  photo: { type: String, default: null },
  signature: { type: String, default: null },
  recipientName: { type: String, default: null },
  deliveryCode: { type: String, select: false, default: null },
  agent: { type: String, default: null },
  date: { type: Date, default: Date.now },
  location: { type: String, default: null },
  note: { type: String, default: null },
}, { _id: false });

const ShipmentDocumentSchema = new mongoose.Schema({
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', index: true, default: null },
  type: { type: String, enum: DOCUMENT_TYPES, required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, default: 'application/octet-stream' },
  size: { type: Number, default: 0, max: 10 * 1024 * 1024 },
  visibility: { type: String, enum: DOCUMENT_VISIBILITIES, default: 'admin_only', index: true },
  uploadedBy: { type: String, default: null },
  proof: { type: ProofSchema, default: undefined },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.models.ShipmentDocument || mongoose.model('ShipmentDocument', ShipmentDocumentSchema);
module.exports.DOCUMENT_TYPES = DOCUMENT_TYPES;
module.exports.DOCUMENT_VISIBILITIES = DOCUMENT_VISIBILITIES;
