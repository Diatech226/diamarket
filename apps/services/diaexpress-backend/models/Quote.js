const mongoose = require('mongoose');

const QUOTE_STATUSES = [
  'draft',
  'requested',
  'under_review',
  'approved',
  'rejected',
  'awaiting_customer_approval',
  'customer_approved',
  'expired',
  'cancelled',
  'ready_for_shipment',
  'converted',
  // legacy compatibility
  'pending',
  'confirmed',
  'dispatched',
];

const quoteActionSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    fromStatus: { type: String },
    toStatus: { type: String },
    actorId: { type: String },
    actorLabel: { type: String },
    role: { type: String },
    note: { type: String },
    at: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema({
  // 📋 Produit
  productType: { type: String },
  productLocation: { type: String },
  contactPhone: { type: String },
  photoUrl: { type: String },
  pickupOption: { type: String, enum: ['pickup', 'dropoff'], default: 'pickup' },
  senderAddressId: { type: String },
  recipientAddressId: { type: String },
  billingAddressId: { type: String },
  recipientContactName: { type: String },
  recipientContactPhone: { type: String },
  recipientContactEmail: { type: String },

  // 🌍 Infos transport
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  transportType: {
    type: String,
    enum: ['air', 'sea', 'road'],
    required: true,
  },
  transportLineId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportLine' },
  originMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
  destinationMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },

  provider: { type: String, default: 'internal' },

  // 🔹 Statut du devis
  status: {
    type: String,
    enum: QUOTE_STATUSES,
    default: 'requested',
  },
  priority: {
    type: String,
    enum: ['urgent', 'normal', 'low'],
    default: 'normal',
  },
  source: {
    type: String,
    enum: ['client', 'admin', 'partner', 'import'],
    default: 'client',
  },
  rejectionReason: { type: String },
  notes: { type: String },
  adminNotes: { type: String },
  reviewNotes: { type: String },

  // audit timestamps
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  customerApprovedAt: { type: Date },
  convertedAt: { type: Date },

  // actor metadata
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  reviewHistory: { type: [quoteActionSchema], default: [] },

  // 💰 Prix
  estimatedPrice: { type: Number },
  finalPrice: { type: Number },
  pricingNote: { type: String },
  currency: { type: String, default: 'USD' },
  estimationMethod: { type: String },
  matchedPricingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pricing' },
  pricingAppliedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pricing' },
  pricingBreakdown: { type: mongoose.Schema.Types.Mixed },

  // 🔹 Paiement
  paymentMethod: { type: String, enum: ['crypto', 'fiat'], default: null },
  paymentStatus: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
  transactionHash: { type: String },
  paymentDate: { type: Date },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

  // 🔹 Livraison & tracking
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
  trackingNumber: { type: String },
  carrier: { type: String, enum: ['CMA CGM', 'DHL', 'UPS', 'Internal', 'FedEx', 'DiaExpress'], default: 'Internal' },
  deliveryStatus: {
    type: String,
    enum: ['not_assigned', 'assigned', 'dispatched', 'in_transit', 'delivered'],
    default: 'not_assigned',
  },
  deliveredAt: { type: Date },

  // 📦 Colis
  unitType: { type: String, enum: ['kg', 'm3'] },
  quantity: { type: Number },
  packageTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PackageType' },

  // Dimensions
  length: Number,
  width: Number,
  height: Number,
  weight: Number,
  volume: Number,

  // 👤 Utilisateur
  userEmail: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedBy: { type: String },
  requestedByType: { type: String, default: 'user' },
  requestedByLabel: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.models.Quote || mongoose.model('Quote', quoteSchema);
module.exports.QUOTE_STATUSES = QUOTE_STATUSES;
