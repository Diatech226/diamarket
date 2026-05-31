const mongoose = require('mongoose');

const DimensionRangeSchema = new mongoose.Schema(
  {
    minLength: Number,
    maxLength: Number,
    minWidth: Number,
    maxWidth: Number,
    minHeight: Number,
    maxHeight: Number,
    minWeight: Number,
    maxWeight: Number,
    minVolume: Number,
    maxVolume: Number,
    price: { type: Number, required: true },
    priority: { type: Number, default: 1 },
    description: String,
  },
  { _id: true }
);

const PackagePricingSchema = new mongoose.Schema(
  {
    packageTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PackageType', required: true },
    name: { type: String, required: true },
    basePrice: { type: Number, required: true },
    multipliers: {
      fragile: { type: Number, default: 1 },
      express: { type: Number, default: 1 },
      refrigerated: { type: Number, default: 1 },
    },
  },
  { _id: true }
);

const ContainerPricingSchema = new mongoose.Schema(
  {
    containerType: { type: String, required: true },
    basePrice: { type: Number, required: true },
    cbmPrice: { type: Number, default: null },
    multipliers: {
      fragile: { type: Number, default: 1 },
      express: { type: Number, default: 1 },
      refrigerated: { type: Number, default: 1 },
    },
  },
  { _id: true }
);

const ConditionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['fuel_surcharge', 'peak_season', 'customs_tax', 'insurance', 'other'],
      required: true,
    },
    value: Number,
    unit: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  },
  { _id: true }
);

const AddressDetailsSchema = new mongoose.Schema(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
  },
  { _id: false }
);

const GeoSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    provider: { type: String, trim: true },
    updatedAt: Date,
    capturedAt: Date,
  },
  { _id: false }
);

const WarehouseSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    instructions: { type: String, trim: true },
    copyHint: { type: String, trim: true },
    contact: ContactSchema,
    address: AddressDetailsSchema,
    geo: GeoSchema,
    openingHours: { type: String, trim: true },
    services: {
      type: [String],
      default: undefined,
      set: (values) =>
        Array.from(
          new Set(
            (values || [])
              .map((value) => (typeof value === 'string' ? value.trim() : ''))
              .filter(Boolean)
          )
        ),
    },
  },
  { _id: false }
);

const FeeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['per_km', 'flat'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'XAF', trim: true },
    minAmount: Number,
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const CustomerAddressGuidelineSchema = new mongoose.Schema(
  {
    allowedCountries: {
      type: [String],
      default: undefined,
      set: (values) =>
        Array.from(
          new Set(
            (values || [])
              .map((value) => (typeof value === 'string' ? value.trim().toUpperCase() : ''))
              .filter(Boolean)
          )
        ),
    },
    requiredFields: {
      type: [String],
      default: undefined,
      set: (values) =>
        Array.from(
          new Set(
            (values || [])
              .map((value) => (typeof value === 'string' ? value.trim() : ''))
              .filter(Boolean)
          )
        ),
    },
    instructions: { type: String, trim: true },
  },
  { _id: false }
);

const LastMileOptionSchema = new mongoose.Schema(
  {
    allowWarehouseDropoff: { type: Boolean, default: true },
    allowWarehousePickup: { type: Boolean, default: true },
    allowHomePickup: { type: Boolean, default: false },
    allowHomeDelivery: { type: Boolean, default: false },
    gpsRequiredForHome: { type: Boolean, default: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const TransportPricingSchema = new mongoose.Schema(
  {
    transportType: {
      type: String,
      required: true,
      enum: ['air', 'sea', 'road', 'rail', 'drone', 'camion', 'train'],
    },
    allowedUnits: { type: [String], enum: ['kg', 'm3'], default: ['kg'] },
    unitType: { type: String, enum: ['kg', 'm3'], required: true },
    pricePerUnit: { type: Number, default: null },
    dimensionRanges: [DimensionRangeSchema],
    packagePricing: [PackagePricingSchema],
    containerPricing: [ContainerPricingSchema],
    conditions: [ConditionSchema],
  },
  { _id: true }
);

const PricingSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true, trim: true },
    originMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
    originAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null },
    originLocation: GeoSchema,
    destination: { type: String, required: true, trim: true },
    destinationMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
    destinationAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null },
    destinationLocation: GeoSchema,
    transportLineId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportLine', default: null },
    expeditionLineId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpeditionLine', default: null },
    transportPrices: [TransportPricingSchema],
    originWarehouse: WarehouseSchema,
    destinationWarehouse: WarehouseSchema,
    pickupFee: FeeSchema,
    deliveryFee: FeeSchema,
    lastMileOptions: LastMileOptionSchema,
    customerAddressGuidelines: CustomerAddressGuidelineSchema,
    source: { type: String, enum: ['internal', 'cma-cgm', 'maersk', 'dhl'], default: 'internal' },
    scopeType: { type: String, enum: ['default', 'lane', 'legacy_route'], default: 'legacy_route' },
    isActive: { type: Boolean, default: true },
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
  },
  { timestamps: true }
);

PricingSchema.index({ transportLineId: 1, isActive: 1 });
PricingSchema.index({ origin: 1, destination: 1, isActive: 1 });

module.exports = mongoose.model('Pricing', PricingSchema);
