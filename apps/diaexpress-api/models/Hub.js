const mongoose = require('mongoose');

const HubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  city: { type: String, required: true, index: true },
  country: { type: String, required: true, index: true },
  code: { type: String, unique: true, sparse: true },
  capacity: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  notes: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.models.Hub || mongoose.model('Hub', HubSchema);
