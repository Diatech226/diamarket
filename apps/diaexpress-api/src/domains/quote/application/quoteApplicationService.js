const Quote = require('../../../../models/Quote');
const { syncUserFromIdentity } = require('../../../../services/userIdentityService');
const {
  toCanonicalQuote,
  buildCreateQuotePayload,
  assertValidTransition,
  buildLifecyclePatch,
} = require('../../../../services/quoteDomainService');
const { publishDomainEvent } = require('../../../lib/events/domainEventPublisher');
const { resolveRouteContext } = require('../../network/application/masterDataService');
const { DOMAIN_EVENT_NAMES } = require('../../../lib/events/domainEventCatalog');
const { getInternalQuote } = require('../../../../services/pricingService');

async function requestQuote({ body, identity }) {
  await syncUserFromIdentity(identity);
  const payload = buildCreateQuotePayload(body);
  const route = await resolveRouteContext({
    origin: payload.origin,
    destination: payload.destination,
    originMarketPointId: payload.originMarketPointId,
    destinationMarketPointId: payload.destinationMarketPointId,
    transportType: payload.transportType,
    transportLineId: payload.transportLineId,
  });

  payload.origin = route.origin || payload.origin;
  payload.destination = route.destination || payload.destination;
  payload.transportType = route.transportType || payload.transportType;
  payload.transportLineId = route.transportLineId || payload.transportLineId || null;
  payload.originMarketPointId = route.originMarketPointId || payload.originMarketPointId || null;
  payload.destinationMarketPointId = route.destinationMarketPointId || payload.destinationMarketPointId || null;
  const estimate = await getInternalQuote({
    origin: payload.origin,
    destination: payload.destination,
    originMarketPointId: payload.originMarketPointId,
    destinationMarketPointId: payload.destinationMarketPointId,
    transportType: payload.transportType,
    weight: payload.weight,
    volume: payload.volume,
    dimensions: { length: payload.length, width: payload.width, height: payload.height },
    packageTypeId: payload.packageTypeId,
    transportLineId: payload.transportLineId,
    additionalServices: body.additionalServices || body.services,
    currency: payload.currency,
  });
  if (!estimate || estimate.errorCode) {
    const error = new Error('Pricing rule not found');
    error.status = estimate?.errorCode === 'PRICING_AMBIGUOUS' ? 409 : 404;
    error.code = estimate?.errorCode || 'PRICING_NOT_FOUND';
    error.details = estimate?.explanation || null;
    throw error;
  }
  payload.estimatedPrice = estimate.estimatedPrice;
  payload.currency = estimate.currency;
  payload.estimationMethod = estimate.appliedRule?.scopeType || 'pricing_engine';
  payload.pricingBreakdown = estimate.breakdown;
  payload.pricingAppliedId = estimate.appliedRule?.pricingId || payload.pricingAppliedId;
  payload.matchedPricingId = estimate.appliedRule?.pricingId || payload.matchedPricingId;
  payload.pricingSnapshot = {
    capturedAt: new Date(),
    provider: estimate.provider || 'internal',
    estimatedPrice: estimate.estimatedPrice,
    currency: estimate.currency,
    route: estimate.appliedRule?.route || { origin: payload.origin, destination: payload.destination },
    transportType: payload.transportType,
    appliedRule: estimate.appliedRule,
    breakdown: estimate.breakdown,
  };
  payload.weightActual = estimate.breakdown?.weightActual;
  payload.weightVolumetric = estimate.breakdown?.weightVolumetric;
  payload.billableWeight = estimate.breakdown?.billableWeight;

  const missing = ['origin', 'destination', 'transportType'].filter((k) => !payload[k]);
  if (missing.length || payload.estimatedPrice == null) {
    const error = new Error('Missing required quote fields');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = {
      ...Object.fromEntries(missing.map((m) => [m, [`${m} is required`]])),
      ...(payload.estimatedPrice == null ? { estimatedPrice: ['estimatedPrice is required'] } : {}),
    };
    throw error;
  }

  const now = new Date();
  const quote = await Quote.create({
    ...payload,
    requestedBy: identity.principalId,
    requestedByType: identity.type || 'user',
    requestedByLabel: identity.label || null,
    status: 'submitted',
    submittedAt: now,
    reviewHistory: [{
      action: 'created',
      toStatus: 'submitted',
      actorId: identity.principalId,
      actorLabel: identity.label || null,
      role: identity.type || 'user',
      at: now,
      note: 'Quote request submitted',
    }],
  });
  publishDomainEvent(DOMAIN_EVENT_NAMES.QUOTE_REQUESTED, {
    quoteId: String(quote._id),
    requestedBy: identity.principalId,
    status: quote.status,
    originMarketPointId: quote.originMarketPointId ? String(quote.originMarketPointId) : null,
    destinationMarketPointId: quote.destinationMarketPointId ? String(quote.destinationMarketPointId) : null,
    transportLineId: quote.transportLineId ? String(quote.transportLineId) : null,
  });

  return { quote, canonical: toCanonicalQuote(quote) };
}

async function transitionQuoteStatus({ quote, requestedStatus, identity, reason, note, metadata = null }) {
  const targetStatus = assertValidTransition(quote.status, requestedStatus);
  const patch = buildLifecyclePatch({
    status: targetStatus,
    actorId: identity?.principalId,
    actorLabel: identity?.label,
    role: identity?.type,
    reason,
    note,
    metadata,
  });

  const { reviewHistoryEntry, ...updateFields } = patch;
  quote.set(updateFields);
  if (reviewHistoryEntry) {
    quote.reviewHistory = Array.isArray(quote.reviewHistory) ? quote.reviewHistory : [];
    quote.reviewHistory.push(reviewHistoryEntry);
  }

  await quote.save();
  if (targetStatus === 'approved') {
    publishDomainEvent(DOMAIN_EVENT_NAMES.QUOTE_APPROVED, {
      quoteId: String(quote._id),
      approvedBy: identity?.principalId || null,
    });
  }
  return quote;
}

module.exports = {
  requestQuote,
  transitionQuoteStatus,
};
