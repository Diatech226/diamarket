const mongoose = require('mongoose');
const { SHIPMENT_STATUSES, normalizeShipmentStatus } = require('../src/domain/statuses');

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
  source: { type: String, enum: ['manual', 'diamarket'], default: 'manual', index: true },
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
    default: 'created',
  },
  currentLocation: { type: String },
  currentMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
  estimatedDelivery: { type: Date },
  originMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
  destinationMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
  transportLineId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportLine', default: null },

  clientSnapshot: { type: mongoose.Schema.Types.Mixed },
  originSnapshot: { type: mongoose.Schema.Types.Mixed },
  destinationSnapshot: { type: mongoose.Schema.Types.Mixed },
  transportSnapshot: { type: mongoose.Schema.Types.Mixed },
  packageSnapshot: { type: mongoose.Schema.Types.Mixed },
  serviceSnapshot: { type: mongoose.Schema.Types.Mixed },
  documentSnapshot: { type: mongoose.Schema.Types.Mixed },
  shipmentReference: { type: String, index: true },
  weight: Number,
  volume: Number,
  priceAccepted: Number,
  currency: String,
  weightActual: Number,
  weightVolumetric: Number,
  billableWeight: Number,
  routeSnapshot: { type: mongoose.Schema.Types.Mixed },
  pricingSnapshot: { type: mongoose.Schema.Types.Mixed },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },

  trackingUpdates: { type: [ShipmentHistorySchema], default: [] },

  assignedAgent: { type: String, default: null, index: true },
  assignedTeam: { type: String, default: null, index: true },
  assignedHub: { type: String, default: null, index: true },
  sla: {
    deadline: { type: Date, default: null },
    status: { type: String, enum: ['on_time', 'at_risk', 'late'], default: 'on_time' },
    rule: { type: String, default: null },
  },
  operationsAlerts: { type: [String], default: [] },
  returnReason: { type: String, default: null },
  returnComment: { type: String, default: null },
  returnCustomerVisible: { type: Boolean, default: false },

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

ShipmentSchema.index({ status: 1, createdAt: -1 });

ShipmentSchema.pre('validate', function normalizeShipmentStatusBeforeValidate(next) {
  if (this.status) this.status = normalizeShipmentStatus(this.status);
  if (Array.isArray(this.trackingUpdates)) {
    this.trackingUpdates.forEach((entry) => {
      if (entry.status) entry.status = normalizeShipmentStatus(entry.status);
    });
  }
  next();
});

module.exports = mongoose.models.Shipment || mongoose.model('Shipment', ShipmentSchema);
module.exports.SHIPMENT_STATUSES = SHIPMENT_STATUSES;
