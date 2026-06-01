const mongoose = require('mongoose');
const Quote = require('../models/Quote');
const Pricing = require('../models/Pricing');
const { getInternalQuote } = require('../services/pricingService');
const { ensureRequestIdentity, identityHasRole } = require('../services/diaexpressAuthService');
const { success, parseListQuery, ApiError } = require('../utils/http');
const {
  CANONICAL_STATUSES,
  normalizeStatus,
  toCanonicalQuote,
} = require('../services/quoteDomainService');
const { requestQuote, transitionQuoteStatus } = require('../src/domains/quote/application/quoteApplicationService');
const { getMasterDataSummary, resolveRouteContext, listMarketPoints } = require('../src/domains/network/application/masterDataService');
const { logger } = require('../src/shared/observability/logger');

const resolveIdentity = (req) => req.identity || ensureRequestIdentity(req);

const requireQuoteId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'INVALID_ID', 'Identifiant de devis invalide');
  }
};

exports.createQuote = async (req, res, next) => {
  try {
    const identity = resolveIdentity(req);
    if (!identity?.principalId) throw new ApiError(401, 'UNAUTHORIZED', 'Utilisateur non authentifié');
    const { quote, canonical } = await requestQuote({ body: req.body, identity });
    return success(res, canonical, {
      status: 201,
      legacy: { quote, message: '✅ Devis créé avec succès' },
    });
  } catch (error) {
    if (error?.status && error?.code) {
      return next(new ApiError(error.status, error.code, error.message, error.details));
    }
    return next(error);
  }
};

exports.getQuoteById = async (req, res, next) => {
  try {
    requireQuoteId(req.params.id);
    const identity = resolveIdentity(req);
    const quote = await Quote.findById(req.params.id).populate('packageTypeId');
    if (!quote) throw new ApiError(404, 'QUOTE_NOT_FOUND', 'Devis introuvable');
    if (!identityHasRole(identity, 'admin') && quote.requestedBy !== identity?.principalId) throw new ApiError(403, 'FORBIDDEN', 'Accès non autorisé');
    return success(res, toCanonicalQuote(quote), { legacy: { quote } });
  } catch (error) { return next(error); }
};

const buildQueryFilters = (query = {}) => {
  const filters = {};
  if (query.status) filters.status = normalizeStatus(query.status);
  if (query.priority) filters.priority = query.priority;
  if (query.source) filters.source = query.source;
  if (query.dateFrom || query.dateTo) {
    filters.createdAt = {};
    if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
  }
  return filters;
};

exports.getUserQuotes = async (req, res, next) => {
  try {
    const identity = resolveIdentity(req);
    if (!identity?.principalId) throw new ApiError(401, 'UNAUTHORIZED', 'Utilisateur non authentifié');
    const list = parseListQuery(req.query, {
      allowedSortBy: ['createdAt', 'updatedAt', 'status', 'estimatedPrice', 'priority', 'submittedAt', 'reviewedAt'],
    });
    const filters = { ...buildQueryFilters(req.query), requestedBy: identity.principalId };

    const [data, total] = await Promise.all([
      Quote.find(filters).sort({ [list.sortBy]: list.sortOrder === 'asc' ? 1 : -1 }).skip(list.skip).limit(list.limit),
      Quote.countDocuments(filters),
    ]);
    const mapped = data.map(toCanonicalQuote);

    return success(res, mapped, {
      pagination: { page: list.page, limit: list.limit, total, totalPages: Math.ceil(total / list.limit) || 1 },
      legacy: { quotes: data },
    });
  } catch (error) { return next(error); }
};

exports.getAllQuotes = async (req, res, next) => {
  try {
    const list = parseListQuery(req.query, {
      allowedSortBy: ['createdAt', 'updatedAt', 'status', 'estimatedPrice', 'priority', 'submittedAt', 'reviewedAt'],
    });
    const filters = buildQueryFilters(req.query);
    if (list.search) {
      filters.$or = [
        { origin: new RegExp(list.search, 'i') },
        { destination: new RegExp(list.search, 'i') },
        { userEmail: new RegExp(list.search, 'i') },
        { requestedByLabel: new RegExp(list.search, 'i') },
      ];
    }

    const [data, total] = await Promise.all([
      Quote.find(filters).sort({ [list.sortBy]: list.sortOrder === 'asc' ? 1 : -1 }).skip(list.skip).limit(list.limit),
      Quote.countDocuments(filters),
    ]);

    const mapped = data.map(toCanonicalQuote).filter((quote) => {
      if (req.query.aging === 'overdue_review') return quote.operations?.isOverdueReview;
      if (req.query.aging === 'fresh') return (quote.operations?.ageHours || 0) < 24;
      return true;
    });

    return success(res, mapped, {
      pagination: { page: list.page, limit: list.limit, total, totalPages: Math.ceil(total / list.limit) || 1 },
      meta: {
        filters: {
          status: req.query.status || null,
          search: list.search || null,
          source: req.query.source || null,
          priority: req.query.priority || null,
          aging: req.query.aging || null,
        },
      },
      legacy: { quotes: data },
    });
  } catch (error) { return next(error); }
};

exports.deleteQuote = async (req, res, next) => {
  try {
    requireQuoteId(req.params.id);
    await Quote.findByIdAndDelete(req.params.id);
    return success(res, { deleted: true }, { legacy: { message: 'Devis supprimé' } });
  } catch (error) { return next(error); }
};

exports.updateQuoteStatus = async (req, res, next) => {
  try {
    const identity = resolveIdentity(req);
    const requestedStatus = req.body?.status;
    requireQuoteId(req.params.id);

    const quote = await Quote.findById(req.params.id);
    if (!quote) throw new ApiError(404, 'QUOTE_NOT_FOUND', 'Devis introuvable');

    await transitionQuoteStatus({
      quote,
      requestedStatus,
      identity,
      reason: req.body?.reason,
      note: req.body?.note,
    });
    return success(res, toCanonicalQuote(quote), { legacy: { success: true, quote } });
  } catch (error) {
    if (error?.status && error?.code) {
      return next(new ApiError(error.status, error.code, error.message, error.details));
    }
    return next(error);
  }
};

exports.payQuote = async (req, res, next) => {
  try {
    requireQuoteId(req.params.id);
    const identity = resolveIdentity(req);
    const quote = await Quote.findById(req.params.id);
    if (!quote) throw new ApiError(404, 'QUOTE_NOT_FOUND', 'Devis introuvable');
    if (!identity?.principalId || quote.requestedBy !== identity.principalId) throw new ApiError(403, 'FORBIDDEN', 'Non autorisé');

    await transitionQuoteStatus({
      quote,
      requestedStatus: 'customer_approved',
      identity,
      note: 'Customer approved quote after payment',
      metadata: { source: 'payment' },
    });

    quote.paymentStatus = 'confirmed';
    await quote.save();
    return success(res, toCanonicalQuote(quote), { legacy: { success: true, quote } });
  } catch (error) { return next(error); }
};

exports.estimateQuote = async (req, res, next) => {
  try {
    const { origin, destination, originMarketPointId, destinationMarketPointId, transportType, weight, volume, length, width, height, packageTypeId, transportLineId } = req.body || {};
    const route = await resolveRouteContext({
      origin,
      destination,
      originMarketPointId,
      destinationMarketPointId,
      transportType,
      transportLineId,
    });

    const resolvedOrigin = route.origin;
    const resolvedDestination = route.destination;
    const resolvedTransportType = route.transportType;
    const resolvedTransportLineId = route.transportLineId && mongoose.Types.ObjectId.isValid(String(route.transportLineId))
      ? new mongoose.Types.ObjectId(String(route.transportLineId))
      : null;
    const resolvedOriginMarketPointId = route.originMarketPointId && mongoose.Types.ObjectId.isValid(String(route.originMarketPointId))
      ? new mongoose.Types.ObjectId(String(route.originMarketPointId))
      : null;
    const resolvedDestinationMarketPointId = route.destinationMarketPointId && mongoose.Types.ObjectId.isValid(String(route.destinationMarketPointId))
      ? new mongoose.Types.ObjectId(String(route.destinationMarketPointId))
      : null;

    if (!resolvedOrigin || !resolvedDestination || !resolvedTransportType) throw new ApiError(400, 'VALIDATION_ERROR', 'Origine, destination et mode de transport sont requis');

    const internalQuote = await getInternalQuote({
      origin: resolvedOrigin,
      destination: resolvedDestination,
      originMarketPointId: resolvedOriginMarketPointId,
      destinationMarketPointId: resolvedDestinationMarketPointId,
      transportType: resolvedTransportType,
      weight,
      volume,
      dimensions: { length, width, height },
      packageTypeId,
      transportLineId: resolvedTransportLineId,
    });
    if (!internalQuote || internalQuote.errorCode) {
      if (internalQuote?.errorCode === 'PRICING_AMBIGUOUS') {
        throw new ApiError(409, 'PRICING_AMBIGUOUS', 'Plusieurs règles de prix ambiguës correspondent à cette configuration', { explanation: internalQuote.explanation || null });
      }
      throw new ApiError(404, 'PRICING_NOT_FOUND', 'Aucun tarif trouvé pour cette configuration.');
    }

    const estimate = {
      estimateId: `est_${Date.now()}`,
      temporary: true,
      estimateType: 'temporary_pricing',
      expiresInSeconds: 1800,
      totalPrice: internalQuote.estimatedPrice,
      currency: internalQuote.currency,
      appliedRule: internalQuote.appliedRule,
      breakdown: internalQuote.breakdown,
      explanation: internalQuote.explanation || null,
      warnings: internalQuote.warnings || [],
      provider: internalQuote.provider || 'internal',
      transportType: resolvedTransportType,
      route: {
        origin: resolvedOrigin,
        destination: resolvedDestination,
        transportType: resolvedTransportType,
        transportLineId: resolvedTransportLineId || null,
        originMarketPointId: resolvedOriginMarketPointId || null,
        destinationMarketPointId: resolvedDestinationMarketPointId || null,
      },
      package: {
        packageTypeId: packageTypeId || null,
        weight: weight != null ? Number(weight) : null,
        volume: volume != null ? Number(volume) : null,
        dimensions: {
          length: length != null ? Number(length) : null,
          width: width != null ? Number(width) : null,
          height: height != null ? Number(height) : null,
        },
      },
      pricing: {
        estimatedPrice: internalQuote.estimatedPrice,
        currency: internalQuote.currency,
        appliedRule: internalQuote.appliedRule,
        breakdown: internalQuote.breakdown,
      },
      quoteDraftPayload: {
        route: {
          origin: resolvedOrigin,
          destination: resolvedDestination,
          transportType: resolvedTransportType,
          transportLineId: resolvedTransportLineId || null,
          originMarketPointId: resolvedOriginMarketPointId || null,
          destinationMarketPointId: resolvedDestinationMarketPointId || null,
        },
        package: {
          packageTypeId: packageTypeId || null,
          weight: weight != null ? Number(weight) : null,
          volume: volume != null ? Number(volume) : null,
          dimensions: {
            length: length != null ? Number(length) : null,
            width: width != null ? Number(width) : null,
            height: height != null ? Number(height) : null,
          },
        },
        pricing: {
          estimatedPrice: internalQuote.estimatedPrice,
          currency: internalQuote.currency,
          breakdown: internalQuote.breakdown,
          appliedRule: internalQuote.appliedRule,
          provider: internalQuote.provider || 'internal',
        },
      },
    };

    return success(res, estimate, {
      legacy: {
        success: true,
        quoteEstimate: estimate,
        quotes: [{
          estimatedPrice: estimate.totalPrice,
          currency: estimate.currency,
          provider: estimate.provider,
          transportType: resolvedTransportType,
          temporary: true,
        }],
      },
    });
  } catch (error) { return next(error); }
};

exports.getQuoteMeta = async (req, res, next) => {
  try {
    const [pricings, marketPoints] = await Promise.all([
      Pricing.find().populate('transportPrices.packagePricing.packageTypeId'),
      listMarketPoints({ active: true }, { limit: 1000 }),
    ]);

    const groupedOrigins = new Map();
    pricings.forEach((pricing) => {
      if (!pricing?.origin || !pricing?.destination) return;
      const originKey = pricing.origin;
      const destinationKey = pricing.destination;
      if (!groupedOrigins.has(originKey)) groupedOrigins.set(originKey, new Map());
      const destinationMap = groupedOrigins.get(originKey);
      if (!destinationMap.has(destinationKey)) {
        destinationMap.set(destinationKey, { destination: destinationKey, transportTypes: [], packageTypes: [] });
      }
      const entry = destinationMap.get(destinationKey);
      const transportType = pricing.transportType;
      if (transportType && !entry.transportTypes.includes(transportType)) entry.transportTypes.push(transportType);
    });

    const origins = Array.from(groupedOrigins.entries()).map(([origin, destinationMap]) => ({
      origin,
      destinations: Array.from(destinationMap.values()),
    }));

    const grouped = marketPoints.reduce((acc, point) => {
      const countryCode = (point.countryCode || 'N/A').toUpperCase();
      if (!acc[countryCode]) acc[countryCode] = { countryCode, countryName: point.countryName || countryCode, points: [] };
      acc[countryCode].points.push({ id: point.id || point._id, city: point.city, label: point.label || point.name, type: point.type });
      return acc;
    }, {});

    const masterData = await getMasterDataSummary();
    const payload = {
      origins,
      marketPoints: Object.values(grouped),
      lifecycleStatuses: CANONICAL_STATUSES,
      masterData,
    };
    return success(res, payload, { legacy: payload });
  } catch (error) { return next(error); }
};

const adminStatusUpdate = (status, legacyStatus) => async (req, res, next) => {
  try {
    const identity = resolveIdentity(req);
    requireQuoteId(req.params.quoteId);
    const quote = await Quote.findById(req.params.quoteId);
    if (!quote) throw new ApiError(404, 'QUOTE_NOT_FOUND', 'Quote not found');

    await transitionQuoteStatus({
      quote,
      requestedStatus: status,
      identity,
      reason: req.body?.reason,
      note: req.body?.note,
      metadata: { source: 'admin_review' },
    });
    quote.set(req.body || {});
    await quote.save();
    logger.info('quote_lifecycle', 'quote.status_changed', {
      quoteId: String(quote._id),
      status: quote.status,
      actorId: req.user?._id?.toString?.() || identity?.principalId || null,
      action: legacyStatus,
    });
    return success(res, toCanonicalQuote(quote), { legacy: { success: true, status: legacyStatus, quote } });
  } catch (error) { return next(error); }
};

exports.confirmQuote = adminStatusUpdate('approved', 'confirmed');
exports.rejectQuote = adminStatusUpdate('rejected', 'rejected');
exports.dispatchQuote = adminStatusUpdate('ready_for_shipment', 'dispatched');
