const mongoose = require('mongoose');

const CurrencyRateSchema = new mongoose.Schema({
  code: { type: String, required: true, uppercase: true, trim: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  symbol: { type: String, trim: true },
  rateToDefault: { type: Number, required: true, min: 0 },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastUpdatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

CurrencyRateSchema.pre('validate', function normalize(next) {
  if (this.code) this.code = String(this.code).trim().toUpperCase();
  if (this.isDefault) this.rateToDefault = 1;
  next();
});

module.exports = mongoose.models.CurrencyRate || mongoose.model('CurrencyRate', CurrencyRateSchema);
