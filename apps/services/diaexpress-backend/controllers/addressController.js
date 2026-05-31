const Address = require('../models/Address');
const Pricing = require('../models/Pricing');
const { success, parseListQuery, ApiError } = require('../utils/http');

const ALLOWED_TYPES = new Set(['pickup', 'dropoff', 'billing', 'warehouse_proxy', 'contact', 'other']);
const toTrimmedOrNull = (value, { upper = false } = {}) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return upper ? trimmed.toUpperCase() : trimmed;
};
const toBoolean = (value) => (value === undefined || value === null ? undefined : ['true','1','yes','on',true].includes(value) ? true : ['false','0','no','off',false].includes(value) ? false : undefined);

const sanitizeAddressPayload = (payload = {}) => {
  const sanitized = {};
  const type = payload.type && typeof payload.type === 'string' ? payload.type.trim() : undefined;
  if (type && ALLOWED_TYPES.has(type)) sanitized.type = type;
  ['label', 'contactName', 'company', 'email', 'phone', 'line1', 'line2', 'postalCode', 'city', 'state', 'notes'].forEach((key) => {
    const value = toTrimmedOrNull(payload[key]);
    if (value !== undefined) sanitized[key] = value;
  });
  const country = toTrimmedOrNull(payload.country, { upper: true });
  if (country !== undefined) sanitized.country = country;
  if (Array.isArray(payload.tags)) sanitized.tags = Array.from(new Set(payload.tags.map((tag) => typeof tag === 'string' ? tag.trim() : '').filter(Boolean)));
  const isDefault = toBoolean(payload.isDefault); if (isDefault !== undefined) sanitized.isDefault = isDefault;
  if (payload.metadata && typeof payload.metadata === 'object') sanitized.metadata = payload.metadata;
  return sanitized;
};

const ensureUser = (req) => { if (!req.dbUser) throw new ApiError(401, 'UNAUTHORIZED', 'Profil utilisateur introuvable'); return req.dbUser; };

exports.list = async (req, res, next) => {
  try {
    const user = ensureUser(req);
    const list = parseListQuery(req.query, { allowedSortBy: ['createdAt', 'updatedAt', 'city', 'country'] });
    const query = { userId: user._id };
    if (req.query.type) query.type = req.query.type;
    if (list.search) query.$or = [{ label: new RegExp(list.search, 'i') }, { city: new RegExp(list.search, 'i') }, { country: new RegExp(list.search, 'i') }];

    const [data, total] = await Promise.all([
      Address.find(query).sort({ [list.sortBy]: list.sortOrder === 'asc' ? 1 : -1 }).skip(list.skip).limit(list.limit),
      Address.countDocuments(query),
    ]);

    let warehouses = [];
    const includeWarehouses = req.query.includeWarehouses === undefined || String(req.query.includeWarehouses) === 'true';
    if (includeWarehouses) {
      const pricingQuery = {};
      if (req.query.origin) pricingQuery.origin = req.query.origin;
      if (req.query.destination) pricingQuery.destination = req.query.destination;
      const pricings = await Pricing.find(pricingQuery, { origin: 1, destination: 1, originWarehouse: 1, destinationWarehouse: 1, pickupFee: 1, deliveryFee: 1, lastMileOptions: 1, customerAddressGuidelines: 1 }).lean();
      warehouses = pricings.flatMap((pricing) => [pricing.originWarehouse, pricing.destinationWarehouse].filter(Boolean).map((warehouse, idx) => ({ pricingId: pricing._id, scope: idx === 0 ? 'origin' : 'destination', origin: pricing.origin, destination: pricing.destination, ...warehouse })));
    }

    return success(res, data.map((d) => d.toObject()), {
      pagination: { page: list.page, limit: list.limit, total, totalPages: Math.ceil(total / list.limit) || 1 },
      meta: { filters: { type: req.query.type || null, search: list.search || null }, warehouses },
      legacy: { addresses: data.map((d) => d.toObject()), warehouses },
    });
  } catch (error) { return next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const user = ensureUser(req);
    const payload = sanitizeAddressPayload(req.body);
    const missing = ['line1', 'city', 'country'].filter((field) => !payload[field]);
    if (missing.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Missing required fields', Object.fromEntries(missing.map((m) => [m, [`${m} is required`]])));
    const address = await Address.create({ ...payload, userId: user._id, principalId: user.clerkUserId || user.externalId || null });
    if (address.isDefault && address.type) {
      await Address.updateMany({ userId: user._id, type: address.type, _id: { $ne: address._id } }, { $set: { isDefault: false } });
    }
    return success(res, address.toObject(), { status: 201, legacy: { address: address.toObject() } });
  } catch (error) { return next(error); }
};

exports.getOne = async (req, res, next) => {
  try {
    const user = ensureUser(req);
    const address = await Address.findOne({ _id: req.params.id, userId: user._id });
    if (!address) throw new ApiError(404, 'ADDRESS_NOT_FOUND', 'Adresse introuvable');
    return success(res, address.toObject(), { legacy: { address: address.toObject() } });
  } catch (error) { return next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const user = ensureUser(req);
    const address = await Address.findOne({ _id: req.params.id, userId: user._id });
    if (!address) throw new ApiError(404, 'ADDRESS_NOT_FOUND', 'Adresse introuvable');
    const payload = sanitizeAddressPayload(req.body);
    Object.entries(payload).forEach(([k, v]) => v !== undefined && address.set(k, v));
    await address.save();
    if (address.isDefault && address.type) {
      await Address.updateMany({ userId: user._id, type: address.type, _id: { $ne: address._id } }, { $set: { isDefault: false } });
    }
    return success(res, address.toObject(), { legacy: { address: address.toObject() } });
  } catch (error) { return next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const user = ensureUser(req);
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: user._id });
    if (!address) throw new ApiError(404, 'ADDRESS_NOT_FOUND', 'Adresse introuvable');
    return success(res, { deleted: true }, { legacy: { message: 'Adresse supprimée' } });
  } catch (error) { return next(error); }
};
