const Pricing = require('../models/Pricing');

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const nowUtc = () => new Date();

function computeVolume(dimensions, fallbackVolume) {
  if (fallbackVolume != null && Number.isFinite(Number(fallbackVolume))) return Number(fallbackVolume);
  if (!dimensions) return null;
  const { length, width, height } = dimensions;
  if ([length, width, height].every((v) => Number.isFinite(Number(v)))) {
    return (Number(length) * Number(width) * Number(height)) / 1_000_000;
  }
  return null;
}

const rangeOverlaps = (aMin, aMax, bMin, bMax) => {
  const minA = aMin == null ? -Infinity : Number(aMin);
  const maxA = aMax == null ? Infinity : Number(aMax);
  const minB = bMin == null ? -Infinity : Number(bMin);
  const maxB = bMax == null ? Infinity : Number(bMax);
  return minA <= maxB && minB <= maxA;
};

function overlapsDimensionRanges(a = {}, b = {}) {
  return [
    ['minLength', 'maxLength'],
    ['minWidth', 'maxWidth'],
    ['minHeight', 'maxHeight'],
    ['minWeight', 'maxWeight'],
    ['minVolume', 'maxVolume'],
  ].every(([minKey, maxKey]) => rangeOverlaps(a[minKey], a[maxKey], b[minKey], b[maxKey]));
}

function validateTransportPricing(tp = {}, transportIndex = 0) {
  const errors = [];
  const seenPackages = new Set();

  if (!Array.isArray(tp.dimensionRanges)) tp.dimensionRanges = [];
  tp.dimensionRanges.forEach((range, idx) => {
    if (range.price == null || Number(range.price) < 0) {
      errors.push(`transportPrices[${transportIndex}].dimensionRanges[${idx}].price doit être >= 0`);
    }
    [
      ['minLength', 'maxLength'],
      ['minWidth', 'maxWidth'],
      ['minHeight', 'maxHeight'],
      ['minWeight', 'maxWeight'],
      ['minVolume', 'maxVolume'],
    ].forEach(([minKey, maxKey]) => {
      if (range[minKey] != null && range[maxKey] != null && Number(range[minKey]) > Number(range[maxKey])) {
        errors.push(`transportPrices[${transportIndex}].dimensionRanges[${idx}] ${minKey} > ${maxKey}`);
      }
    });
  });

  for (let i = 0; i < tp.dimensionRanges.length; i += 1) {
    for (let j = i + 1; j < tp.dimensionRanges.length; j += 1) {
      if (overlapsDimensionRanges(tp.dimensionRanges[i], tp.dimensionRanges[j])) {
        errors.push(`transportPrices[${transportIndex}] chevauchement dimensionRanges (${i}/${j})`);
      }
    }
  }

  (tp.packagePricing || []).forEach((pkg, idx) => {
    const key = String(pkg.packageTypeId || '');
    if (!key) errors.push(`transportPrices[${transportIndex}].packagePricing[${idx}].packageTypeId requis`);
    if (seenPackages.has(key)) errors.push(`transportPrices[${transportIndex}] packageType dupliqué (${key})`);
    seenPackages.add(key);
  });

  return errors;
}

function matchDimensionRange(ranges = [], context = {}) {
  const sorted = [...ranges].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
  const matches = sorted.filter((range) => {
    const checks = [
      range.minLength == null || (context.length != null && context.length >= range.minLength),
      range.maxLength == null || (context.length != null && context.length <= range.maxLength),
      range.minWidth == null || (context.width != null && context.width >= range.minWidth),
      range.maxWidth == null || (context.width != null && context.width <= range.maxWidth),
      range.minHeight == null || (context.height != null && context.height >= range.minHeight),
      range.maxHeight == null || (context.height != null && context.height <= range.maxHeight),
      range.minWeight == null || (context.weight != null && context.weight >= range.minWeight),
      range.maxWeight == null || (context.weight != null && context.weight <= range.maxWeight),
      range.minVolume == null || (context.volume != null && context.volume >= range.minVolume),
      range.maxVolume == null || (context.volume != null && context.volume <= range.maxVolume),
    ];
    return checks.every(Boolean);
  });
  return matches;
}

function computeUnitPrice(transportPricing, { weight, volume }) {
  if (transportPricing.pricePerUnit == null) return null;
  const unit = transportPricing.unitType || transportPricing.allowedUnits?.[0];
  if (unit === 'kg' && weight != null) return { total: weight * transportPricing.pricePerUnit, unitApplied: 'kg' };
  if (unit === 'm3' && volume != null) return { total: volume * transportPricing.pricePerUnit, unitApplied: 'm3' };
  return null;
}

function buildScopeScore(pricing) {
  if (pricing.transportLineId) return 3;
  if (pricing.scopeType === 'default') return 1;
  return 2;
}

function computeSurcharges(conditions = [], subtotal = 0) {
  return (conditions || []).reduce((acc, condition) => {
    if (!condition || condition.value == null) return acc;
    const amount = condition.unit === 'fixed' ? Number(condition.value) : (subtotal * Number(condition.value)) / 100;
    if (!Number.isFinite(amount)) return acc;
    return acc + amount;
  }, 0);
}

async function getInternalQuote({ origin, destination, originMarketPointId, destinationMarketPointId, transportType, weight, dimensions, volume, packageTypeId, transportLineId }) {
  const currentDate = nowUtc();
  const query = {
    isActive: true,
    validFrom: { $lte: currentDate },
    $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gte: currentDate } }],
  };

  if (transportLineId) query.transportLineId = transportLineId;
  else if (originMarketPointId && destinationMarketPointId) {
    query.originMarketPointId = originMarketPointId;
    query.destinationMarketPointId = destinationMarketPointId;
  } else {
    query.origin = origin;
    query.destination = destination;
  }
  if (transportType) query['transportPrices.transportType'] = transportType;

  const pricings = await Pricing.find(query).lean();
  if (!pricings.length) return { errorCode: 'PRICING_NOT_FOUND', warnings: ['no_active_pricing_for_scope'] };

  const context = {
    weight: toNumber(weight),
    volume: computeVolume(dimensions, volume),
    length: dimensions?.length != null ? toNumber(dimensions.length) : null,
    width: dimensions?.width != null ? toNumber(dimensions.width) : null,
    height: dimensions?.height != null ? toNumber(dimensions.height) : null,
  };

  const candidates = [];
  pricings.forEach((pricing) => {
    const tps = (pricing.transportPrices || []).filter((entry) => (!transportType ? true : entry.transportType === transportType));
    tps.forEach((tp) => {
      const warnings = [];
      const rangeMatches = matchDimensionRange(tp.dimensionRanges, context);
      if (rangeMatches.length > 1) warnings.push('multiple_dimension_ranges_matched_using_priority');
      const matchedRange = rangeMatches[0] || null;

      let baseAmount = null;
      let unitApplied = null;
      let packageApplied = null;

      if (packageTypeId && Array.isArray(tp.packagePricing)) {
        const pkg = tp.packagePricing.find((p) => p.packageTypeId && String(p.packageTypeId) === String(packageTypeId));
        if (pkg) {
          baseAmount = Number(pkg.basePrice);
          unitApplied = 'package';
          packageApplied = { packageTypeId: pkg.packageTypeId, packageName: pkg.name, basePrice: pkg.basePrice };
        } else {
          warnings.push('package_type_not_found_in_rule');
        }
      }

      if (matchedRange) {
        baseAmount = Number(matchedRange.price);
        unitApplied = 'dimension_range';
      }

      if (baseAmount == null) {
        const unitResult = computeUnitPrice(tp, context);
        if (unitResult) {
          baseAmount = Number(unitResult.total);
          unitApplied = unitResult.unitApplied;
        }
      }

      if (baseAmount == null || !Number.isFinite(baseAmount)) {
        warnings.push('no_pricing_formula_matched');
        return;
      }

      const surchargeAmount = computeSurcharges(tp.conditions, baseAmount);
      const total = Number((baseAmount + surchargeAmount).toFixed(2));
      const specificityScore = [matchedRange ? 3 : 0, packageApplied ? 2 : 0, buildScopeScore(pricing)].reduce((a, b) => a + b, 0);

      candidates.push({
        provider: 'internal',
        estimatedPrice: total,
        currency: pricing.currency || 'USD',
        specificityScore,
        scopeScore: buildScopeScore(pricing),
        appliedRule: {
          pricingId: pricing._id,
          transportPricingId: tp._id,
          transportLineId: pricing.transportLineId || null,
          expeditionLineId: pricing.expeditionLineId || null,
          scopeType: pricing.scopeType || (pricing.transportLineId ? 'lane' : 'legacy_route'),
          route: { origin: pricing.origin, destination: pricing.destination },
          transportType: tp.transportType,
          packageTypeId: packageTypeId || null,
          matchedDimensionRangeId: matchedRange?._id || null,
          unitApplied,
        },
        breakdown: {
          baseAmount,
          surchargeAmount,
          total,
          computedWeight: context.weight,
          computedVolume: context.volume,
          matchedRange: matchedRange || null,
          packageApplied,
          conditionsApplied: tp.conditions || [],
          unitPrice: tp.pricePerUnit ?? null,
        },
        warnings,
      });
    });
  });

  if (!candidates.length) return { errorCode: 'PRICING_NOT_FOUND', warnings: ['no_eligible_rule_found'] };
  candidates.sort((a, b) => b.specificityScore - a.specificityScore || a.estimatedPrice - b.estimatedPrice || String(a.appliedRule.pricingId).localeCompare(String(b.appliedRule.pricingId)));

  const best = candidates[0];
  const sameTop = candidates.filter((c) => c.specificityScore === best.specificityScore && c.estimatedPrice === best.estimatedPrice);

  const explanation = {
    strategy: 'highest_specificity_then_lowest_price',
    candidatesEvaluated: candidates.length,
    selectedPricingId: best.appliedRule.pricingId,
    selectedTransportPricingId: best.appliedRule.transportPricingId,
    laneLinked: Boolean(best.appliedRule.transportLineId),
    fallbackUsed: best.appliedRule.scopeType !== 'lane',
    warnings: [...best.warnings],
  };

  if (sameTop.length > 1) {
    return {
      errorCode: 'PRICING_AMBIGUOUS',
      warnings: ['multiple_rules_with_same_priority_and_price'],
      explanation: { ...explanation, ambiguousPricingIds: sameTop.map((x) => x.appliedRule.pricingId) },
    };
  }

  return { ...best, explanation };
}

function validatePricingPayload(payload = {}) {
  const errors = [];
  if (!payload.origin || !payload.destination) errors.push('origin et destination sont requis');
  if (!Array.isArray(payload.transportPrices) || payload.transportPrices.length === 0) errors.push('transportPrices est requis');
  if (payload.validFrom && payload.validUntil && new Date(payload.validFrom) > new Date(payload.validUntil)) {
    errors.push('validFrom doit être antérieur à validUntil');
  }
  if (payload.currency && !/^[A-Z]{3}$/.test(String(payload.currency).toUpperCase())) {
    errors.push('currency doit être au format ISO 4217 (ex: USD, EUR, XAF)');
  }
  (payload.transportPrices || []).forEach((tp, index) => errors.push(...validateTransportPricing(tp, index)));
  return errors;
}

module.exports = {
  getInternalQuote,
  validatePricingPayload,
  overlapsDimensionRanges,
};
