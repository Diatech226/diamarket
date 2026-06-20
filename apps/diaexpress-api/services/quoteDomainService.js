const { ApiError } = require('../utils/http');

const isValidObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ''));

const {
  QUOTE_STATUSES: CANONICAL_STATUSES,
  QUOTE_TRANSITIONS: STATUS_TRANSITIONS,
  normalizeQuoteStatus: normalizeStatus,
  canTransitionQuote: canTransition,
} = require('../src/domain/statuses');

const assertValidTransition = (from, to) => {
  const normalizedFrom = normalizeStatus(from);
  const normalizedTo = normalizeStatus(to);

  if (!CANONICAL_STATUSES.includes(normalizedTo)) {
    throw new ApiError(400, 'QUOTE_INVALID_STATUS', 'Invalid quote status', {
      status: [`Unsupported status: ${to}`],
    });
  }

  if (!canTransition(normalizedFrom, normalizedTo)) {
    throw new ApiError(409, 'QUOTE_INVALID_TRANSITION', 'Transition de statut non autorisée');
  }

  return normalizedTo;
};

const buildLifecyclePatch = ({ status, actorId, actorLabel, role, note, reason, metadata }) => {
  const nextStatus = normalizeStatus(status);
  const now = new Date();

  const patch = {
    status: nextStatus,
    reviewHistoryEntry: {
      action: 'status_transition',
      toStatus: nextStatus,
      actorId: actorId || null,
      actorLabel: actorLabel || null,
      role: role || null,
      note: note || reason || null,
      at: now,
      metadata: metadata || null,
    },
  };

  if (nextStatus === 'submitted' && !metadata?.keepSubmittedAt) {
    patch.submittedAt = now;
  }

  if (['under_review', 'approved', 'rejected', 'priced'].includes(nextStatus)) {
    patch.reviewedAt = now;
    if (isValidObjectId(actorId)) patch.reviewedBy = actorId;
  }

  if (nextStatus === 'approved') {
    patch.approvedAt = now;
    if (isValidObjectId(actorId)) patch.approvedBy = actorId;
    patch.rejectionReason = null;
  }

  if (nextStatus === 'rejected') {
    patch.rejectedAt = now;
    if (isValidObjectId(actorId)) patch.rejectedBy = actorId;
    patch.rejectionReason = reason || patch.rejectionReason || 'Rejected by admin';
  }

  if (nextStatus === 'approved') {
    patch.customerApprovedAt = now;
  }

  if (nextStatus === 'converted_to_shipment') {
    patch.convertedAt = now;
  }

  return patch;
};

const toCanonicalQuote = (quoteDoc) => {
  if (!quoteDoc) return null;
  const quote = typeof quoteDoc.toObject === 'function' ? quoteDoc.toObject() : quoteDoc;
  const status = normalizeStatus(quote.status || 'submitted');

  const createdAt = quote.createdAt ? new Date(quote.createdAt) : null;
  const reviewedAt = quote.reviewedAt ? new Date(quote.reviewedAt) : null;
  const now = Date.now();
  const ageHours = createdAt ? Math.max(0, Math.floor((now - createdAt.getTime()) / 3600000)) : null;
  const reviewAgeHours = reviewedAt ? Math.max(0, Math.floor((now - reviewedAt.getTime()) / 3600000)) : null;

  return {
    ...quote,
    status,
    source: quote.source || 'client',
    priority: quote.priority || 'normal',
    customer: {
      requestedBy: quote.requestedBy || null,
      requestedByType: quote.requestedByType || null,
      requestedByLabel: quote.requestedByLabel || null,
      userEmail: quote.userEmail || null,
      recipient: {
        name: quote.recipientContactName || null,
        phone: quote.recipientContactPhone || null,
        email: quote.recipientContactEmail || null,
      },
      contactPhone: quote.contactPhone || null,
    },
    route: {
      origin: quote.origin,
      destination: quote.destination,
      transportType: quote.transportType,
      transportLineId: quote.transportLineId || null,
      originMarketPointId: quote.originMarketPointId || null,
      destinationMarketPointId: quote.destinationMarketPointId || null,
      pickupOption: quote.pickupOption || 'pickup',
    },
    package: {
      packageTypeId: quote.packageTypeId || null,
      unitType: quote.unitType || null,
      quantity: quote.quantity || null,
      dimensions: {
        length: quote.length ?? null,
        width: quote.width ?? null,
        height: quote.height ?? null,
      },
      weight: quote.weight ?? null,
      volume: quote.volume ?? null,
    },
    pricing: {
      estimatedPrice: quote.estimatedPrice ?? null,
      finalPrice: quote.finalPrice ?? null,
      currency: quote.currency || 'USD',
      estimationMethod: quote.estimationMethod || null,
      pricingNote: quote.pricingNote || null,
      breakdown: quote.pricingBreakdown || null,
      matchedPricingId: quote.matchedPricingId || null,
      pricingAppliedId: quote.pricingAppliedId || null,
      provider: quote.provider || 'internal',
    },
    audit: {
      submittedAt: quote.submittedAt || null,
      reviewedAt: quote.reviewedAt || null,
      approvedAt: quote.approvedAt || null,
      rejectedAt: quote.rejectedAt || null,
      customerApprovedAt: quote.customerApprovedAt || null,
      convertedAt: quote.convertedAt || null,
      reviewedBy: quote.reviewedBy || null,
      approvedBy: quote.approvedBy || null,
      rejectedBy: quote.rejectedBy || null,
      reviewNotes: quote.reviewNotes || null,
      adminNotes: quote.adminNotes || null,
      reason: quote.rejectionReason || null,
      history: Array.isArray(quote.reviewHistory) ? quote.reviewHistory : [],
    },
    operations: {
      ageHours,
      reviewAgeHours,
      isOverdueReview: status === 'submitted' && ageHours !== null ? ageHours >= 24 : false,
    },
  };
};

const pick = (...values) => values.find((value) => value !== undefined && value !== null);

const buildCreateQuotePayload = (body = {}) => ({
  origin: pick(body.route?.origin, body.origin),
  destination: pick(body.route?.destination, body.destination),
  transportType: pick(body.route?.transportType, body.transportType),
  transportLineId: pick(body.route?.transportLineId, body.transportLineId),
  originMarketPointId: pick(body.route?.originMarketPointId, body.originMarketPointId),
  destinationMarketPointId: pick(body.route?.destinationMarketPointId, body.destinationMarketPointId),
  provider: pick(body.pricing?.provider, body.provider, 'internal'),
  estimatedPrice: pick(body.pricing?.estimatedPrice, body.pricing?.totalPrice, body.estimatedPrice),
  finalPrice: pick(body.pricing?.finalPrice, body.finalPrice),
  currency: pick(body.pricing?.currency, body.currency, 'USD'),
  estimationMethod: pick(body.pricing?.estimationMethod, body.estimationMethod, body.pricing?.appliedRule?.scopeType),
  pricingNote: pick(body.pricing?.pricingNote, body.pricingNote),
  packageTypeId: pick(body.package?.packageTypeId, body.packageTypeId),
  weight: pick(body.package?.weight, body.weight),
  volume: pick(body.package?.volume, body.volume),
  length: pick(body.package?.dimensions?.length, body.length),
  width: pick(body.package?.dimensions?.width, body.width),
  height: pick(body.package?.dimensions?.height, body.height),
  unitType: pick(body.package?.unitType, body.unitType),
  quantity: pick(body.package?.quantity, body.quantity),
  pickupOption: pick(body.route?.pickupOption, body.pickupOption, 'pickup'),
  senderAddressId: pick(body.customer?.senderAddressId, body.senderAddressId),
  recipientAddressId: pick(body.customer?.recipientAddressId, body.recipientAddressId),
  billingAddressId: pick(body.customer?.billingAddressId, body.billingAddressId),
  recipientContactName: pick(body.customer?.recipient?.name, body.recipientContactName),
  recipientContactPhone: pick(body.customer?.recipient?.phone, body.recipientContactPhone),
  recipientContactEmail: pick(body.customer?.recipient?.email, body.recipientContactEmail),
  productType: pick(body.product?.type, body.productType),
  productLocation: pick(body.product?.location, body.productLocation),
  contactPhone: pick(body.customer?.contactPhone, body.contactPhone),
  photoUrl: pick(body.product?.photoUrl, body.photoUrl),
  source: pick(body.source, 'client'),
  priority: pick(body.priority, 'normal'),
  notes: pick(body.notes),
  pricingBreakdown: pick(body.pricing?.breakdown, body.pricingBreakdown),
  matchedPricingId: pick(body.pricing?.matchedPricingId, body.matchedPricingId),
  pricingAppliedId: pick(body.pricing?.pricingAppliedId, body.pricing?.appliedRule?.pricingId, body.pricingAppliedId),
});

module.exports = {
  CANONICAL_STATUSES,
  STATUS_TRANSITIONS,
  normalizeStatus,
  canTransition,
  assertValidTransition,
  buildLifecyclePatch,
  toCanonicalQuote,
  buildCreateQuotePayload,
};
