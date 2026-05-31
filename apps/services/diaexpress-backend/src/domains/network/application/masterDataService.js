const mongoose = require('mongoose');
const Country = require('../../../../models/Country');
const MarketPoint = require('../../../../models/MarketPoint');
const Address = require('../../../../models/Address');
const TransportLine = require('../../../../models/TransportLine');
const ExpeditionLine = require('../../../../models/ExpeditionLine');
const Embarkment = require('../../../../models/Embarkment');
const { publishDomainEvent } = require('../../../shared/events/domainEventPublisher');
const { DOMAIN_EVENT_NAMES } = require('../../../shared/events/domainEventCatalog');

const TRANSPORT_TYPES = ['air', 'sea', 'road'];
const MARKET_POINT_TYPES = ['city', 'port', 'hub', 'airport', 'agency', 'relay', 'country_hub', 'pickup_point'];

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  return mongoose.Types.ObjectId.isValid(String(value)) ? new mongoose.Types.ObjectId(String(value)) : null;
};

const asTrimmed = (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
const asUpper = (value) => {
  const v = asTrimmed(value);
  return v ? v.toUpperCase() : undefined;
};

const normalizeTransportType = (value) => {
  const v = asTrimmed(value)?.toLowerCase();
  return TRANSPORT_TYPES.includes(v) ? v : null;
};

const normalizeMarketPointType = (value) => {
  const v = asTrimmed(value)?.toLowerCase();
  if (!v) return 'city';
  if (v === 'pickup_point') return 'pickup_point';
  if (v === 'relay') return 'relay';
  return MARKET_POINT_TYPES.includes(v) ? v : 'city';
};

const toCountryDto = (doc) => {
  if (!doc) return null;
  const item = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(item._id || item.id),
    code: item.code,
    name: item.name,
    active: item.active !== false,
  };
};

const toMarketPointDto = (doc) => {
  if (!doc) return null;
  const item = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(item._id || item.id),
    name: item.name || item.label || item.city,
    countryId: item.countryId ? String(item.countryId._id || item.countryId) : null,
    countryCode: item.countryCode || item.countryId?.code || null,
    countryName: item.countryName || item.countryId?.name || null,
    type: normalizeMarketPointType(item.type),
    city: item.city || null,
    label: item.label || item.name || null,
    geo: item.geo || (item.lat != null && item.lng != null ? { lat: item.lat, lng: item.lng } : null),
    active: item.active !== false,
  };
};

const toTransportLineDto = (doc) => {
  if (!doc) return null;
  const item = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const transportTypes = Array.isArray(item.transportTypes) && item.transportTypes.length
    ? item.transportTypes
    : item.transportType
      ? [item.transportType]
      : [];
  const primaryType = normalizeTransportType(item.transportType || transportTypes[0]);
  return {
    id: String(item._id || item.id),
    lineCode: item.lineCode,
    origin: item.origin,
    destination: item.destination,
    originMarketPointId: item.originMarketPointId ? String(item.originMarketPointId._id || item.originMarketPointId) : null,
    destinationMarketPointId: item.destinationMarketPointId ? String(item.destinationMarketPointId._id || item.destinationMarketPointId) : null,
    transportType: primaryType,
    transportTypes,
    active: item.isActive !== false && item.active !== false,
    estimatedTransitDays: item.estimatedTransitDays ?? null,
  };
};

const toEmbarkmentDto = (doc) => {
  if (!doc) return null;
  const item = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(item._id || item.id),
    transportLineId: item.transportLineId ? String(item.transportLineId._id || item.transportLineId) : null,
    transportType: normalizeTransportType(item.transportType),
    departureDate: item.startDate || item.departureWindowStart || null,
    arrivalEstimate: item.endDate || item.departureWindowEnd || null,
    capacity: item.capacity ?? null,
    reservedCapacity: item.reservedCapacity || 0,
    availableCapacity: typeof item.capacity === 'number' ? Math.max(0, item.capacity - (item.reservedCapacity || 0)) : null,
    cutoffDate: item.cutoffDate || null,
    status: item.status || 'planned',
    active: item.active !== false,
    label: item.label || null,
  };
};

async function createCountry(input = {}) {
  const payload = {
    code: asUpper(input.code),
    name: asTrimmed(input.name),
    active: input.active ?? input.isActive ?? true,
  };
  const created = await Country.create(payload);
  return toCountryDto(created);
}

async function listCountries(filters = {}, options = {}) {
  const query = {};
  if (filters.active === true || filters.active === false) query.active = filters.active;
  if (filters.code) query.code = asUpper(filters.code);
  const limit = Math.max(1, Math.min(Number(options.limit || 50), 200));
  const skip = Math.max(0, Number(options.skip || 0));
  const docs = await Country.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean();
  return docs.map(toCountryDto);
}

async function getCountry(countryIdOrCode) {
  if (!countryIdOrCode) return null;
  const objectId = toObjectId(countryIdOrCode);
  const doc = objectId
    ? await Country.findById(objectId).lean()
    : await Country.findOne({ code: asUpper(countryIdOrCode) }).lean();
  return toCountryDto(doc);
}

async function buildMarketPointPayload(input = {}) {
  const payload = {
    name: asTrimmed(input.name || input.label || input.city),
    city: asTrimmed(input.city || input.name || input.label),
    label: asTrimmed(input.label || input.name || input.city),
    type: normalizeMarketPointType(input.type),
    active: input.active ?? input.isActive ?? true,
    geo: input.geo,
    lat: input.geo?.lat ?? input.lat,
    lng: input.geo?.lng ?? input.lng,
    addressText: asTrimmed(input.addressText),
    contactName: asTrimmed(input.contactName),
    contactPhone: asTrimmed(input.contactPhone || input.phone),
    contactEmail: asTrimmed(input.contactEmail),
  };

  const countryId = toObjectId(input.countryId || input.country || input.countryRefId);
  if (countryId) {
    const country = await Country.findById(countryId).lean();
    if (country) {
      payload.countryId = countryId;
      payload.countryCode = country.code;
      payload.countryName = country.name;
    }
  }

  const providedCode = asUpper(input.countryCode || input.country);
  if (!payload.countryCode && providedCode) {
    payload.countryCode = providedCode;
    const country = await Country.findOne({ code: providedCode }).lean();
    if (country) {
      payload.countryId = country._id;
      payload.countryName = country.name;
    }
  }

  if (!payload.countryName && input.countryName) payload.countryName = asTrimmed(input.countryName);
  return payload;
}

async function createMarketPoint(input = {}) {
  const payload = await buildMarketPointPayload(input);
  if (!payload.name) {
    const error = new Error('Market point name is required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  if (!payload.countryId && !payload.countryCode) {
    const error = new Error('Market point country is required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const created = await MarketPoint.create(payload);
  const dto = toMarketPointDto(created);
  publishDomainEvent(DOMAIN_EVENT_NAMES.NETWORK_MARKET_POINT_CREATED, dto);
  return dto;
}

async function getMarketPoint(marketPointId) {
  const objectId = toObjectId(marketPointId);
  if (!objectId) return null;
  const doc = await MarketPoint.findById(objectId).populate('countryId').lean();
  return toMarketPointDto(doc);
}

async function listMarketPoints(filters = {}, options = {}) {
  const query = {};
  if (filters.countryId && toObjectId(filters.countryId)) query.countryId = toObjectId(filters.countryId);
  if (filters.countryCode) query.countryCode = asUpper(filters.countryCode);
  if (filters.active === true || filters.active === false) query.active = filters.active;
  if (filters.search) {
    query.$or = ['name', 'city', 'label', 'countryName'].map((field) => ({ [field]: new RegExp(filters.search, 'i') }));
  }
  if (filters.type) query.type = normalizeMarketPointType(filters.type);

  const limit = Math.max(1, Math.min(Number(options.limit || 100), 200));
  const skip = Math.max(0, Number(options.skip || 0));
  const docs = await MarketPoint.find(query).sort({ countryName: 1, city: 1, name: 1 }).skip(skip).limit(limit).populate('countryId').lean();
  return docs.map(toMarketPointDto);
}

async function listAddresses(filters = {}, options = {}) {
  const query = {};
  if (filters.marketPointId && toObjectId(filters.marketPointId)) query.marketPointId = toObjectId(filters.marketPointId);
  if (filters.active === true || filters.active === false) query.active = filters.active;
  const limit = Math.max(1, Math.min(Number(options.limit || 100), 200));
  const skip = Math.max(0, Number(options.skip || 0));
  const docs = await Address.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).populate('marketPointId').lean();
  return docs;
}

async function createAddress(input = {}) {
  const payload = {
    label: input.label,
    contactName: input.contactName,
    contactPhone: input.contactPhone || input.phone,
    phone: input.contactPhone || input.phone,
    line1: input.addressText || input.line1 || input.addressLine1,
    line2: input.line2,
    city: input.city || 'N/A',
    country: (input.country || input.countryCode || '').toString().trim().toUpperCase(),
    countryCode: input.countryCode || input.country,
    addressText: input.addressText,
    marketPointId: toObjectId(input.marketPointId) || null,
    geo: input.geo,
    latitude: input.geo?.lat,
    longitude: input.geo?.lng,
    active: input.active ?? input.isActive ?? true,
  };
  return Address.create(payload);
}

async function listAgencies(filters = {}, options = {}) {
  return listMarketPoints({ ...filters, type: 'agency' }, options);
}

function buildTransportLinePayload(input = {}) {
  const originMarketPointId = toObjectId(input.originMarketPointId);
  const destinationMarketPointId = toObjectId(input.destinationMarketPointId);
  const primaryType = normalizeTransportType(input.transportType || (Array.isArray(input.transportTypes) ? input.transportTypes[0] : null));
  const allTypes = Array.from(new Set((Array.isArray(input.transportTypes) ? input.transportTypes : [primaryType]).map(normalizeTransportType).filter(Boolean)));

  return {
    lineCode: asTrimmed(input.lineCode),
    origin: asTrimmed(input.origin),
    destination: asTrimmed(input.destination),
    originMarketPointId,
    destinationMarketPointId,
    transportType: primaryType,
    transportTypes: allTypes.length ? allTypes : (primaryType ? [primaryType] : []),
    isActive: input.isActive ?? input.active ?? true,
    estimatedTransitDays: input.estimatedTransitDays,
    notes: input.notes,
  };
}

async function hydrateLineLocationFields(payload) {
  const next = { ...payload };
  if (next.originMarketPointId && !next.origin) {
    const mp = await MarketPoint.findById(next.originMarketPointId).lean();
    if (mp) next.origin = mp.name || mp.label || mp.city;
  }
  if (next.destinationMarketPointId && !next.destination) {
    const mp = await MarketPoint.findById(next.destinationMarketPointId).lean();
    if (mp) next.destination = mp.name || mp.label || mp.city;
  }
  return next;
}

async function createTransportLine(input = {}) {
  const payload = await hydrateLineLocationFields(buildTransportLinePayload(input));
  if (!payload.origin || !payload.destination) {
    const error = new Error('origin and destination are required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  if (!payload.transportTypes?.length) {
    const error = new Error('transportType is required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const created = await TransportLine.create(payload);
  const dto = toTransportLineDto(created);
  publishDomainEvent(DOMAIN_EVENT_NAMES.NETWORK_TRANSPORT_LINE_CREATED, dto);
  return dto;
}

async function getTransportLine(transportLineId) {
  const objectId = toObjectId(transportLineId);
  if (!objectId) return null;
  const doc = await TransportLine.findById(objectId).lean();
  return toTransportLineDto(doc);
}

async function listTransportLines(filters = {}, options = {}) {
  const query = {};
  if (filters.isActive === true || filters.isActive === false) query.isActive = filters.isActive;
  if (filters.origin) query.origin = new RegExp(filters.origin, 'i');
  if (filters.destination) query.destination = new RegExp(filters.destination, 'i');
  if (filters.originMarketPointId && toObjectId(filters.originMarketPointId)) query.originMarketPointId = toObjectId(filters.originMarketPointId);
  if (filters.destinationMarketPointId && toObjectId(filters.destinationMarketPointId)) query.destinationMarketPointId = toObjectId(filters.destinationMarketPointId);

  const transportType = normalizeTransportType(filters.transportType);
  if (transportType) query.transportTypes = { $in: [transportType] };

  if (filters.search) {
    query.$or = [{ origin: new RegExp(filters.search, 'i') }, { destination: new RegExp(filters.search, 'i') }, { lineCode: new RegExp(filters.search, 'i') }];
  }

  const limit = Math.max(1, Math.min(Number(options.limit || 100), 200));
  const skip = Math.max(0, Number(options.skip || 0));
  const docs = await TransportLine.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();
  return docs.map(toTransportLineDto);
}

async function findTransportLine(...args) {
  if (args.length === 1) {
    const [first] = args;
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const { originMarketPointId, destinationMarketPointId, transportType, origin, destination, activeOnly = true } = first;
      const query = {};
      if (activeOnly) query.isActive = true;
      if (originMarketPointId && toObjectId(originMarketPointId)) query.originMarketPointId = toObjectId(originMarketPointId);
      if (destinationMarketPointId && toObjectId(destinationMarketPointId)) query.destinationMarketPointId = toObjectId(destinationMarketPointId);
      if (!query.originMarketPointId && origin) query.origin = asTrimmed(origin);
      if (!query.destinationMarketPointId && destination) query.destination = asTrimmed(destination);
      const normalizedType = normalizeTransportType(transportType);
      if (normalizedType) query.transportTypes = { $in: [normalizedType] };
      const line = await TransportLine.findOne(query).lean();
      return line ? toTransportLineDto(line) : null;
    }

    const byId = await getTransportLine(first);
    return byId;
  }

  const [origin, destination, transportType] = args;
  return findTransportLine({ origin, destination, transportType });
}

async function resolveMarketPointFromLegacy(value, { countryCode } = {}) {
  const candidate = asTrimmed(value);
  if (!candidate) return null;
  const query = {
    active: { $ne: false },
    $or: [{ name: new RegExp(`^${candidate}$`, 'i') }, { city: new RegExp(`^${candidate}$`, 'i') }, { label: new RegExp(`^${candidate}$`, 'i') }],
  };
  if (countryCode) query.countryCode = asUpper(countryCode);
  const doc = await MarketPoint.findOne(query).lean();
  return toMarketPointDto(doc);
}

async function resolveRouteContext(input = {}) {
  let originMarketPointId = toObjectId(input.originMarketPointId);
  let destinationMarketPointId = toObjectId(input.destinationMarketPointId);

  const originMarketPoint = !originMarketPointId && input.origin ? await resolveMarketPointFromLegacy(input.origin) : null;
  const destinationMarketPoint = !destinationMarketPointId && input.destination ? await resolveMarketPointFromLegacy(input.destination) : null;

  if (!originMarketPointId && originMarketPoint?.id) originMarketPointId = toObjectId(originMarketPoint.id);
  if (!destinationMarketPointId && destinationMarketPoint?.id) destinationMarketPointId = toObjectId(destinationMarketPoint.id);

  const transportType = normalizeTransportType(input.transportType);
  const line = await findTransportLine({
    originMarketPointId,
    destinationMarketPointId,
    origin: input.origin,
    destination: input.destination,
    transportType,
    activeOnly: true,
  });

  return {
    originMarketPointId: originMarketPointId ? String(originMarketPointId) : originMarketPoint?.id || null,
    destinationMarketPointId: destinationMarketPointId ? String(destinationMarketPointId) : destinationMarketPoint?.id || null,
    transportLineId: line?.id || (input.transportLineId ? String(input.transportLineId) : null),
    transportLine: line,
    transportType: transportType || line?.transportType || null,
    origin: input.origin || line?.origin || originMarketPoint?.name || originMarketPoint?.city || null,
    destination: input.destination || line?.destination || destinationMarketPoint?.name || destinationMarketPoint?.city || null,
    mappingSource: {
      usedLegacyOrigin: Boolean(input.origin && !input.originMarketPointId),
      usedLegacyDestination: Boolean(input.destination && !input.destinationMarketPointId),
      matchedTransportLine: Boolean(line),
    },
  };
}

function applyLineDefaults(payload = {}, line) {
  if (!line) return payload;
  const dto = line.id ? line : toTransportLineDto(line);
  return {
    ...payload,
    origin: payload.origin || dto.origin,
    destination: payload.destination || dto.destination,
    originMarketPointId: payload.originMarketPointId || dto.originMarketPointId || null,
    destinationMarketPointId: payload.destinationMarketPointId || dto.destinationMarketPointId || null,
    transportType: payload.transportType || dto.transportType || null,
    transportLineId: payload.transportLineId || dto.id,
  };
}

async function createExpeditionLine(input = {}) {
  const doc = await ExpeditionLine.create(input);
  return doc;
}

async function listExpeditionLines(filters = {}, options = {}) {
  const query = {};
  if (filters.originCountry) query.originCountry = asUpper(filters.originCountry);
  if (filters.destinationCountry) query.destinationCountry = asUpper(filters.destinationCountry);
  if (filters.transportType) query.transportTypes = { $in: [normalizeTransportType(filters.transportType)] };
  if (filters.originMarketPointId && toObjectId(filters.originMarketPointId)) query.originMarketPointId = toObjectId(filters.originMarketPointId);
  if (filters.destinationMarketPointId && toObjectId(filters.destinationMarketPointId)) query.destinationMarketPointId = toObjectId(filters.destinationMarketPointId);
  if (filters.active === true || filters.active === false) query.active = filters.active;
  const limit = Math.max(1, Math.min(Number(options.limit || 100), 200));
  const skip = Math.max(0, Number(options.skip || 0));
  return ExpeditionLine.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit)
    .populate('originCountryRef destinationCountryRef originAddressId destinationAddressId originMarketPointId destinationMarketPointId');
}

async function createEmbarkment(input = {}) {
  const transportLineId = toObjectId(input.transportLineId || input.expeditionLineId);
  if (!transportLineId) {
    const error = new Error('transportLineId is required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const line = await TransportLine.findById(transportLineId).lean();
  if (!line) {
    const error = new Error('transportLineId is invalid');
    error.status = 400;
    error.code = 'INVALID_REFERENCE';
    throw error;
  }

  const transportType = normalizeTransportType(input.transportType || line.transportType || line.transportTypes?.[0]);
  if (!transportType) {
    const error = new Error('transportType is required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const payload = {
    transportLineId,
    expeditionLineId: toObjectId(input.expeditionLineId) || null,
    transportType,
    departureWindowStart: input.departureDate || input.startDate || input.departureWindowStart,
    departureWindowEnd: input.arrivalEstimate || input.endDate || input.departureWindowEnd,
    startDate: input.departureDate || input.startDate || input.departureWindowStart,
    endDate: input.arrivalEstimate || input.endDate || input.departureWindowEnd,
    cutoffDate: input.cutoffDate || null,
    capacity: input.capacity ?? null,
    status: input.status || 'planned',
    label: input.label,
    active: input.active ?? input.isActive ?? true,
  };

  if (!payload.departureWindowStart || !payload.departureWindowEnd) {
    const error = new Error('departure and arrival windows are required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const created = await Embarkment.create(payload);
  const dto = toEmbarkmentDto(created);
  publishDomainEvent(DOMAIN_EVENT_NAMES.NETWORK_EMBARKMENT_CREATED, dto);
  return dto;
}

async function listEmbarkments(filters = {}, options = {}) {
  const query = {};
  const transportLineId = toObjectId(filters.transportLineId || filters.expeditionLineId);
  if (transportLineId) query.transportLineId = transportLineId;
  if (filters.status) query.status = filters.status;
  if (filters.transportType) query.transportType = normalizeTransportType(filters.transportType);
  if (filters.active === true || filters.active === false) query.active = filters.active;

  if (filters.departureFrom || filters.departureTo) {
    query.departureWindowStart = {};
    if (filters.departureFrom) query.departureWindowStart.$gte = new Date(filters.departureFrom);
    if (filters.departureTo) query.departureWindowStart.$lte = new Date(filters.departureTo);
  }

  const limit = Math.max(1, Math.min(Number(options.limit || 100), 200));
  const skip = Math.max(0, Number(options.skip || 0));
  const docs = await Embarkment.find(query).sort({ departureWindowStart: 1 }).skip(skip).limit(limit)
    .populate('transportLineId')
    .populate('allowedPackageTypes')
    .lean();

  return docs.map(toEmbarkmentDto);
}

async function getMasterDataSummary() {
  const [countries, marketPoints, transportLines, expeditionLines, embarkments, addresses] = await Promise.all([
    Country.countDocuments({}),
    MarketPoint.countDocuments({}),
    TransportLine.countDocuments({}),
    ExpeditionLine.countDocuments({}),
    Embarkment.countDocuments({}),
    Address.countDocuments({}),
  ]);

  return {
    countries,
    marketPoints,
    transportLines,
    expeditionLines,
    embarkments,
    addresses,
  };
}

module.exports = {
  TRANSPORT_TYPES,
  MARKET_POINT_TYPES,
  createCountry,
  listCountries,
  getCountry,
  createMarketPoint,
  getMarketPoint,
  listMarketPoints,
  listAgencies,
  createAddress,
  listAddresses,
  createTransportLine,
  getTransportLine,
  listTransportLines,
  findTransportLine,
  resolveMarketPointFromLegacy,
  resolveRouteContext,
  applyLineDefaults,
  createExpeditionLine,
  listExpeditionLines,
  createEmbarkment,
  listEmbarkments,
  getMasterDataSummary,
  toMarketPointDto,
  toTransportLineDto,
  toEmbarkmentDto,
};
