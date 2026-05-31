const mongoose = require('mongoose');

const OPERATIONAL_EXCEPTION_CODES = [
  'capacity_exceeded',
  'cutoff_missed',
  'incompatible_package_type',
  'invalid_route_assignment',
  'embarkment_delayed',
  'schedule_unavailable',
];

const OperationalExceptionSchema = new mongoose.Schema({
  code: { type: String, enum: OPERATIONAL_EXCEPTION_CODES, required: true },
  message: { type: String, required: true },
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', default: null },
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', default: null },
  embarkmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Embarkment', default: null },
  raisedBy: { type: String, default: 'system' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models.OperationalException || mongoose.model('OperationalException', OperationalExceptionSchema);
module.exports.OPERATIONAL_EXCEPTION_CODES = OPERATIONAL_EXCEPTION_CODES;
