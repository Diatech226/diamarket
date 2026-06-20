const Shipment = require('../models/Shipment');

const PREFIX = 'DX';

function formatDate(date = new Date()) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

function formatSequence(value) {
  return String(value).padStart(6, '0');
}

async function generateTrackingNumber({ date = new Date(), maxAttempts = 25 } = {}) {
  const day = formatDate(date);
  const prefix = `${PREFIX}-${day}-`;
  const latest = await Shipment.findOne({ trackingCode: { $regex: `^${prefix}` } }).sort({ trackingCode: -1 }).select('trackingCode').lean();
  const latestSequence = Number.parseInt(String(latest?.trackingCode || '').slice(-6), 10) || 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const trackingCode = `${prefix}${formatSequence(latestSequence + attempt)}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Shipment.exists({ trackingCode });
    if (!exists) return trackingCode;
  }

  throw new Error('Unable to generate a unique tracking number');
}

module.exports = { generateTrackingNumber, formatDate, formatSequence };
