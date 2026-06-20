require('dotenv').config();
const mongoose = require('mongoose');
const Quote = require('../models/Quote');
const Shipment = require('../models/Shipment');
const { LEGACY_QUOTE_STATUS_MAP, LEGACY_SHIPMENT_STATUS_MAP } = require('../src/domain/statuses');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diaexpress';

async function migrateCollection(Model, map, label) {
  let modified = 0;
  for (const [legacy, canonical] of Object.entries(map)) {
    const result = await Model.updateMany({ status: legacy }, { $set: { status: canonical } });
    modified += result.modifiedCount || 0;
    console.log(`${label}: ${legacy} -> ${canonical}: ${result.modifiedCount || 0}`);
  }
  return modified;
}

async function main() {
  await mongoose.connect(uri);
  const quoteModified = await migrateCollection(Quote, LEGACY_QUOTE_STATUS_MAP, 'Quote');
  const shipmentModified = await migrateCollection(Shipment, LEGACY_SHIPMENT_STATUS_MAP, 'Shipment');
  console.log(`Migration terminée. Quotes modifiés: ${quoteModified}. Shipments modifiés: ${shipmentModified}.`);
  await mongoose.disconnect();
}

main().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
