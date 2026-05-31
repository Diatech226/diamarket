const mongoose = require('mongoose');

const SCHEDULE_STATUSES = ['planned', 'booking_open', 'closed', 'departed', 'completed', 'cancelled'];

const ScheduleSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  transportType: { type: String, required: true, enum: ['air', 'sea', 'road'] },
  periodLabel: { type: String, required: true },

  transportLineId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportLine', default: null },
  expeditionLineId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpeditionLine', default: null },
  embarkmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Embarkment', default: null },

  departureDate: { type: Date, required: true },
  closingDate: { type: Date, required: true },
  arrivalEstimate: { type: Date, default: null },
  planningDeadline: { type: Date, default: null },
  departureLockAt: { type: Date, default: null },

  totalCapacity: { type: Number, default: null },
  reservedCapacity: { type: Number, default: 0 },
  supportedPackageTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PackageType' }],
  active: { type: Boolean, default: true },
  status: { type: String, enum: SCHEDULE_STATUSES, default: 'planned' },

  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
});

ScheduleSchema.virtual('availableCapacity').get(function availableCapacity() {
  if (typeof this.totalCapacity !== 'number') return null;
  return Math.max(0, this.totalCapacity - (this.reservedCapacity || 0));
});

ScheduleSchema.set('toJSON', { virtuals: true });
ScheduleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
module.exports.SCHEDULE_STATUSES = SCHEDULE_STATUSES;
