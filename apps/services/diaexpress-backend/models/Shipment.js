const mongoose = require('mongoose');

const SHIPMENT_STATUSES = [
  'draft',
  'created',
  'pending_dispatch',
  'scheduled',
  'in_transit',
  'delayed',
  'at_hub',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'returned',
  'cancelled',
];

const ShipmentHistorySchema = new mongoose.Schema({
  eventType: { type: String, default: 'status_update' },
  location: { type: String, default: null },
  status: {
    type: String,
    enum: SHIPMENT_STATUSES,
    required: true,
  },
  note: { type: String, default: null },
  source: { type: String, default: 'system' },
  actorId: { type: String, default: null },
  actorLabel: { type: String, default: null },
  carrierReference: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const ShipmentSchema = new mongoose.Schema({
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  principalId: { type: String, index: true },
  principalLabel: { type: String },

  provider: { type: String, default: 'internal' },
  carrier: { type: String },
  bookingReference: { type: String },
  serviceType: { type: String },

  trackingCode: { type: String, unique: true, required: true, index: true },
  status: {
    type: String,
    enum: SHIPMENT_STATUSES,
    default: 'draft',
  },
  currentLocation: { type: String },
  currentMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
  estimatedDelivery: { type: Date },
  originMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
  destinationMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
  transportLineId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportLine', default: null },

  weight: Number,
  volume: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },

  trackingUpdates: { type: [ShipmentHistorySchema], default: [] },

  createdAtOperational: { type: Date },
  scheduledAt: { type: Date },
  dispatchedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  returnedAt: { type: Date },
  convertedAt: { type: Date },
  convertedBy: { type: String },

  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  embarkmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Embarkment', default: null },
  planningStatus: { type: String, enum: ['unplanned', 'planned', 'assigned', 'scheduled'], default: 'unplanned' },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', default: null },
  assignmentStatus: { type: String, enum: ['none', 'assigned', 'unassigned'], default: 'none' },
  assignmentReason: { type: String, default: null },
  assignmentNote: { type: String, default: null },
  assignedAt: { type: Date, default: null },
  assignedBy: { type: String, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.models.Shipment || mongoose.model('Shipment', ShipmentSchema);
module.exports.SHIPMENT_STATUSES = SHIPMENT_STATUSES;
