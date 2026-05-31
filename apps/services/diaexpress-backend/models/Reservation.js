const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  type: { type: String, enum: ['invoice', 'packing_list', 'certificate', 'customs', 'permit', 'other'], required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, default: null },
}, { _id: false });

const RESERVATION_STATUSES = [
  'draft',
  'pending_validation',
  'confirmed',
  'rejected',
  'cancelled',
  'converted_to_shipment_assignment',
  // legacy compatibility
  'pending',
  'in_transit',
  'delivered',
];

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', default: null },
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', default: null },
  transportLineId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportLine', default: null },
  embarkmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Embarkment', default: null },

  type: { type: String, enum: ['FCL', 'LCL'], required: true },
  packageTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PackageType', default: null },
  requestedUnits: { type: Number, default: 1 },
  containerSize: { type: String, enum: ['20FT', '40FT', '40HC'], required: false },

  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departureDate: { type: Date, required: true },
  arrivalDate: { type: Date },

  provider: { type: String, enum: ['CMA_CGM', 'INTERNAL'], required: true },
  status: { type: String, enum: RESERVATION_STATUSES, default: 'draft' },
  rejectionReason: { type: String, default: null },
  cancellationReason: { type: String, default: null },

  requestedAt: { type: Date, default: Date.now },
  reservationConfirmedAt: { type: Date, default: null },
  convertedToAssignmentAt: { type: Date, default: null },

  trackingNumber: { type: String },
  documents: { type: [DocumentSchema], default: [] },

  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
module.exports.RESERVATION_STATUSES = RESERVATION_STATUSES;
