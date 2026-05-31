const mongoose = require('mongoose');
const Pricing = require('../models/Pricing');
const PackageType = require('../models/PackageType');
const { success, parseListQuery, ApiError } = require('../utils/http');
const { validatePricingPayload } = require('../services/pricingService');
const {
  findTransportLine,
  applyLineDefaults,
  resolveRouteContext,
  listTransportLines,
} = require('../src/domains/network/application/masterDataService');

const toTrimmed = (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
const parseObjectId = (value) => (mongoose.Types.ObjectId.isValid(String(value || '')) ? new mongoose.Types.ObjectId(String(value)) : null);

const windowsOverlap = (aFrom, aTo, bFrom, bTo) => {
  const startA = aFrom ? new Date(aFrom).getTime() : -Infinity;
  const endA = aTo ? new Date(aTo).getTime() : Infinity;
  const startB = bFrom ? new Date(bFrom).getTime() : -Infinity;
  const endB = bTo ? new Date(bTo).getTime() : Infinity;
  return startA <= endB && startB <= endA;
};

const buildPricingPayload = (body = {}) => {
  const payload = {};
  ['origin', 'destination', 'scopeType', 'currency'].forEach((key) => {
    const v = toTrimmed(body[key]);
    if (v) payload[key] = key === 'currency' ? v.toUpperCase() : v;
  });
  if (body.transportLineId !== undefined) payload.transportLineId = parseObjectId(body.transportLineId);
  if (body.originMarketPointId !== undefined) payload.originMarketPointId = parseObjectId(body.originMarketPointId);
  if (body.destinationMarketPointId !== undefined) payload.destinationMarketPointId = parseObjectId(body.destinationMarketPointId);
  if (body.expeditionLineId !== undefined) payload.expeditionLineId = parseObjectId(body.expeditionLineId);
  if (Array.isArray(body.transportPrices)) payload.transportPrices = body.transportPrices;
  ['originWarehouse', 'destinationWarehouse', 'pickupFee', 'deliveryFee', 'lastMileOptions', 'customerAddressGuidelines', 'validFrom', 'validUntil', 'isActive'].forEach((k) => {
    if (body[k] !== undefined) payload[k] = body[k];
  });
  if (payload.transportLineId) payload.scopeType = 'lane';
  else if (!payload.scopeType) payload.scopeType = 'legacy_route';
  return payload;
};

async function enrichPricingScope(payload = {}) {
  if (payload.transportLineId) {
    const line = await findTransportLine(payload.transportLineId);
    if (!line) throw new ApiError(400, 'INVALID_REFERENCE', 'Ligne de transport introuvable');
    return applyLineDefaults(payload, line);
  }

  if (payload.origin || payload.destination || payload.originMarketPointId || payload.destinationMarketPointId) {
    const route = await resolveRouteContext({
      origin: payload.origin,
      destination: payload.destination,
      originMarketPointId: payload.originMarketPointId,
      destinationMarketPointId: payload.destinationMarketPointId,
    });

    const enriched = {
      ...payload,
      origin: route.origin || payload.origin,
      destination: route.destination || payload.destination,
      originMarketPointId: route.originMarketPointId ? parseObjectId(route.originMarketPointId) : payload.originMarketPointId || null,
      destinationMarketPointId: route.destinationMarketPointId ? parseObjectId(route.destinationMarketPointId) : payload.destinationMarketPointId || null,
      transportLineId: route.transportLineId ? parseObjectId(route.transportLineId) : payload.transportLineId || null,
    };
    if (enriched.transportLineId) enriched.scopeType = 'lane';
    return enriched;
  }

  return payload;
}

async function detectConflicts(payload, currentId = null) {
  const query = { isActive: true };
  if (payload.transportLineId) query.transportLineId = payload.transportLineId;
  else {
    query.origin = payload.origin;
    query.destination = payload.destination;
  }
  if (currentId) query._id = { $ne: currentId };
  const existing = await Pricing.find(query).select('_id validFrom validUntil transportPrices transportLineId origin destination').lean();

  return existing.filter((record) => {
    if (!windowsOverlap(payload.validFrom, payload.validUntil, record.validFrom, record.validUntil)) return false;
    const incomingTypes = new Set((payload.transportPrices || []).map((tp) => tp.transportType));
    const existingTypes = new Set((record.transportPrices || []).map((tp) => tp.transportType));
    return [...incomingTypes].some((type) => existingTypes.has(type));
  });
}

exports.createPricing = async (req, res, next) => {
  try {
    const payload = await enrichPricingScope(buildPricingPayload(req.body));
    const validationErrors = validatePricingPayload(payload);
    if (validationErrors.length) throw new ApiError(400, 'PRICING_VALIDATION_ERROR', 'Tarification invalide', { pricing: validationErrors });

    const conflicts = await detectConflicts(payload);
    if (conflicts.length) {
      throw new ApiError(409, 'PRICING_CONFLICT', 'Conflit détecté: règle active déjà présente sur ce scope et cette période', {
        conflictingPricingIds: conflicts.map((c) => c._id),
      });
    }

    const pricing = await Pricing.create(payload);
    return success(res, pricing, { status: 201, legacy: pricing });
  } catch (error) { return next(error); }
};

exports.getAllPricing = async (req, res, next) => {
  try {
    const list = parseListQuery(req.query, { allowedSortBy: ['createdAt', 'updatedAt', 'origin', 'destination', 'validFrom'] });
    const query = {};
    if (req.query.transportLineId) {
      const parsed = parseObjectId(req.query.transportLineId);
      if (parsed) query.transportLineId = parsed;
    }
    if (req.query.transportType) query['transportPrices.transportType'] = req.query.transportType;
    if (req.query.isActive === 'true' || req.query.isActive === 'false') query.isActive = req.query.isActive === 'true';
    if (req.query.currency) query.currency = String(req.query.currency).toUpperCase();
    if (req.query.packageTypeId) query['transportPrices.packagePricing.packageTypeId'] = parseObjectId(req.query.packageTypeId);
    if (list.search) query.$or = [{ origin: new RegExp(list.search, 'i') }, { destination: new RegExp(list.search, 'i') }];

    const [data, total] = await Promise.all([
      Pricing.find(query).sort({ [list.sortBy]: list.sortOrder === 'asc' ? 1 : -1 }).skip(list.skip).limit(list.limit),
      Pricing.countDocuments(query),
    ]);

    return success(res, data, {
      pagination: { page: list.page, limit: list.limit, total, totalPages: Math.ceil(total / list.limit) || 1 },
      meta: { filters: { transportType: req.query.transportType || null, search: list.search || null, isActive: req.query.isActive || null, currency: req.query.currency || null, packageTypeId: req.query.packageTypeId || null } },
      legacy: data,
    });
  } catch (error) { return next(error); }
};

exports.getPricingById = async (req, res, next) => {
  try {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) throw new ApiError(404, 'PRICING_NOT_FOUND', 'Tarif introuvable');
    return success(res, pricing, { legacy: pricing });
  } catch (error) { return next(error); }
};

exports.updatePricing = async (req, res, next) => {
  try {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) throw new ApiError(404, 'PRICING_NOT_FOUND', 'Tarif introuvable');
    const payload = await enrichPricingScope(buildPricingPayload(req.body));
    const merged = { ...pricing.toObject(), ...payload };
    const validationErrors = validatePricingPayload(merged);
    if (validationErrors.length) throw new ApiError(400, 'PRICING_VALIDATION_ERROR', 'Tarification invalide', { pricing: validationErrors });

    const conflicts = await detectConflicts(merged, pricing._id);
    if (conflicts.length) throw new ApiError(409, 'PRICING_CONFLICT', 'Conflit de règle active détecté', { conflictingPricingIds: conflicts.map((c) => c._id) });

    Object.entries(payload).forEach(([k, v]) => { if (v !== undefined) pricing.set(k, v); });
    await pricing.save();
    return success(res, pricing, { legacy: pricing });
  } catch (error) { return next(error); }
};

exports.deletePricing = async (req, res, next) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);
    if (!pricing) throw new ApiError(404, 'PRICING_NOT_FOUND', 'Tarif introuvable');
    return success(res, { deleted: true }, { legacy: { message: 'Tarif supprimé' } });
  } catch (error) { return next(error); }
};

exports.getWarehouses = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.origin) query.origin = req.query.origin;
    if (req.query.destination) query.destination = req.query.destination;
    const data = await Pricing.find(query, { origin: 1, destination: 1, originWarehouse: 1, destinationWarehouse: 1, pickupFee: 1, deliveryFee: 1, lastMileOptions: 1, customerAddressGuidelines: 1 }).sort({ origin: 1, destination: 1 }).lean();
    return success(res, data.map((p) => ({ pricingId: p._id, ...p })), { legacy: { routes: data } });
  } catch (error) { return next(error); }
};

exports.getPricingMeta = async (_req, res, next) => {
  try {
    const [transportLines, packageTypes] = await Promise.all([
      listTransportLines({ isActive: true }, { limit: 1000 }),
      PackageType.find().select('label name description _id').lean(),
    ]);
    return success(res, { transportLines, packageTypes, unitTypes: ['kg', 'm3'] }, { legacy: { transportLines, packageTypes, unitTypes: ['kg', 'm3'] } });
  } catch (error) { return next(error); }
};

exports.getAllPricings = exports.getAllPricing;
exports.getDistinctLocations = async (_req, res, next) => {
  try {
    const [origins, destinations] = await Promise.all([Pricing.distinct('origin'), Pricing.distinct('destination')]);
    return success(res, { origins, destinations }, { legacy: { origins, destinations } });
  } catch (error) { return next(error); }
};
