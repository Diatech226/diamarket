const mongoose = require('mongoose');

const transportLineSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true },
    originMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
    destination: { type: String, required: true },
    destinationMarketPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketPoint', default: null },
    transportType: { type: String, enum: ['air', 'sea', 'road'], default: null },
    transportTypes: {
      type: [String],
      enum: ['air', 'sea', 'road'],
      default: [],
      validate: (value) => Array.isArray(value) && value.length > 0,
    },
    lineCode: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
    estimatedTransitDays: { type: Number },
  },
  {
    timestamps: true,
  }
);

transportLineSchema.index({ origin: 1, destination: 1, lineCode: 1 }, { unique: false });
transportLineSchema.index({ originMarketPointId: 1, destinationMarketPointId: 1, transportType: 1, isActive: 1 }, { unique: false });

module.exports = mongoose.models.TransportLine || mongoose.model('TransportLine', transportLineSchema);
