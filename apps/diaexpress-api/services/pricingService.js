const Pricing = require('../models/Pricing');
const CurrencyRate = require('../models/CurrencyRate');

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


function volumetricDivisorFor(transportType, configured) {
  if (configured != null && Number(configured) > 0) return Number(configured);
  if (['air', 'express'].includes(String(transportType || '').toLowerCase())) return 5000;
  return null;
}

function computeWeights({ transportType, weight, dimensions, volume, volumetricDivisor }) {
  const actual = toNumber(weight) || 0;
  const l = toNumber(dimensions?.length);
  const w = toNumber(dimensions?.width);
  const h = toNumber(dimensions?.height);
  const cubicMeters = computeVolume(dimensions, volume) || 0;
  const divisor = volumetricDivisorFor(transportType, volumetricDivisor);
  const type = String(transportType || '').toLowerCase();
  let volumetric = 0;
  if (['air', 'express'].includes(type) && divisor && [l, w, h].every((v) => v != null)) {
    volumetric = (l * w * h) / divisor;
  } else if (['sea', 'road'].includes(type)) {
    volumetric = cubicMeters;
  }
  return {
    weightActual: Number(actual.toFixed(3)),
    weightVolumetric: Number(volumetric.toFixed(3)),
    billableWeight: Number(Math.max(actual, volumetric).toFixed(3)),
    volume: Number(cubicMeters.toFixed(6)),
  };
}

function normalizeServices(services) {
  if (!services) return [];
  if (Array.isArray(services)) return services.map((x) => String(x)).filter(Boolean);
  return Object.entries(services).filter(([, enabled]) => Boolean(enabled)).map(([key]) => key);
}

function computeServiceCharges(config = {}, requested = [], subtotal = 0) {
  return requested.map((service) => {
    const keyMap = { collection: 'pickup', pickup: 'pickup', delivery: 'homeDelivery', home_delivery: 'homeDelivery', homeDelivery: 'homeDelivery', assurance: 'insurance' };
    const key = keyMap[service] || service;
    const raw = config?.[key] ?? 0;
    const amount = typeof raw === 'object' ? (raw.unit === 'percent' ? subtotal * Number(raw.value || 0) / 100 : Number(raw.value || 0)) : Number(raw || 0);
    return { service: key, amount: Number((Number.isFinite(amount) ? amount : 0).toFixed(2)) };
  });
}

function computeUnitPrice(transportPricing, weights) {
  const unit = transportPricing.unitType || transportPricing.allowedUnits?.[0];
  if (transportPricing.flatPrice != null || unit === 'flat') return { total: Number(transportPricing.flatPrice ?? transportPricing.pricePerUnit ?? 0), unitApplied: 'flat' };
  if (unit === 'kg' && weights.billableWeight != null) return { total: weights.billableWeight * Number(transportPricing.pricePerKg ?? transportPricing.pricePerUnit), unitApplied: 'kg' };
  if (unit === 'm3' && weights.volume != null) return { total: weights.volume * Number(transportPricing.pricePerM3 ?? transportPricing.pricePerUnit), unitApplied: 'm3' };
  return null;
}

async function ensureCurrencyRates() {
  const seed = [
    { code: 'XOF', name: 'West African CFA franc', symbol: 'F CFA', rateToDefault: 1, isDefault: true },
    { code: 'USD', name: 'US dollar', symbol: '$', rateToDefault: 600 },
    { code: 'EUR', name: 'Euro', symbol: '€', rateToDefault: 655.957 },
    { code: 'CAD', name: 'Canadian dollar', symbol: 'C$', rateToDefault: 440 },
  ];
  await CurrencyRate.bulkWrite(seed.map((currency) => ({
    updateOne: { filter: { code: currency.code }, update: { $setOnInsert: currency, $set: { lastUpdatedAt: new Date() } }, upsert: true },
  })), { ordered: false });
}

async function convertCurrency(amount, from, to) {
  const source = String(from || 'XOF').toUpperCase();
  const target = String(to || source).toUpperCase();
  if (source === target) return Number(amount.toFixed(2));
  await ensureCurrencyRates();
  const rates = await CurrencyRate.find({ code: { $in: [source, target] }, isActive: true }).lean();
  const byCode = new Map(rates.map((r) => [r.code, r]));
  if (!byCode.has(source) || !byCode.has(target)) return Number(amount.toFixed(2));
  const inDefault = amount * Number(byCode.get(source).rateToDefault || 1);
  return Number((inDefault / Number(byCode.get(target).rateToDefault || 1)).toFixed(2));
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

async function getInternalQuote({ origin, destination, originMarketPointId, destinationMarketPointId, transportType, weight, dimensions, volume, packageTypeId, transportLineId, additionalServices, currency }) {
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
  for (const pricing of pricings) {
    const tps = (pricing.transportPrices || []).filter((entry) => (!transportType ? true : entry.transportType === transportType));
    for (const tp of tps) {
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

      const weights = computeWeights({ transportType: tp.transportType, weight, dimensions, volume, volumetricDivisor: tp.volumetricDivisor });

      if (baseAmount == null) {
        const unitResult = computeUnitPrice(tp, weights);
        if (unitResult) {
          baseAmount = Number(unitResult.total);
          unitApplied = unitResult.unitApplied;
        }
      }

      if (baseAmount == null || !Number.isFinite(baseAmount)) {
        warnings.push('no_pricing_formula_matched');
        continue;
      }

      const surchargeAmount = computeSurcharges(tp.conditions, baseAmount);
      const servicesApplied = computeServiceCharges(tp.additionalServices, normalizeServices(additionalServices), baseAmount);
      const serviceAmount = servicesApplied.reduce((sum, item) => sum + item.amount, 0);
      const subtotal = baseAmount + surchargeAmount + serviceAmount;
      const minimumApplied = tp.minimumPrice != null && subtotal < Number(tp.minimumPrice);
      const totalInRuleCurrency = Number((minimumApplied ? Number(tp.minimumPrice) : subtotal).toFixed(2));
      const total = await convertCurrency(totalInRuleCurrency, pricing.currency || 'XOF', currency || pricing.currency || 'XOF');
      const specificityScore = [matchedRange ? 3 : 0, packageApplied ? 2 : 0, buildScopeScore(pricing)].reduce((a, b) => a + b, 0);

      candidates.push({
        provider: 'internal',
        estimatedPrice: total,
        currency: String(currency || pricing.currency || 'XOF').toUpperCase(),
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
          minDelayDays: tp.minDelayDays ?? pricing.meta?.minDelayDays ?? null,
          maxDelayDays: tp.maxDelayDays ?? pricing.meta?.maxDelayDays ?? null,
        },
        breakdown: {
          baseAmount,
          surchargeAmount,
          serviceAmount,
          servicesApplied,
          minimumPrice: tp.minimumPrice ?? null,
          minimumApplied,
          total: total,
          totalInRuleCurrency,
          ruleCurrency: pricing.currency || 'XOF',
          weightActual: weights.weightActual,
          weightVolumetric: weights.weightVolumetric,
          billableWeight: weights.billableWeight,
          computedWeight: weights.weightActual,
          computedVolume: weights.volume,
          matchedRange: matchedRange || null,
          packageApplied,
          conditionsApplied: tp.conditions || [],
          unitPrice: tp.pricePerUnit ?? null,
        },
        warnings,
      });
    }
  }

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

  return { ...best, estimatedDays: best.appliedRule.maxDelayDays || best.appliedRule.minDelayDays || null, explanation };
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
  computeWeights,
  ensureCurrencyRates,
  convertCurrency,
  overlapsDimensionRanges,
};
