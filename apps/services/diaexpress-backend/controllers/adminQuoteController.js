const Quote = require('../models/Quote');
const { push: notify } = require('../services/notificationService');
const { ensureRequestIdentity } = require('../services/diaexpressAuthService');
const { ApiError } = require('../utils/http');
const {
  assertValidTransition,
  buildLifecyclePatch,
  toCanonicalQuote,
} = require('../services/quoteDomainService');

const resolveIdentity = (req) => req.identity || ensureRequestIdentity(req);

const appendReviewAction = (quote, action, req, extra = {}) => {
  const identity = resolveIdentity(req);
  quote.reviewHistory = Array.isArray(quote.reviewHistory) ? quote.reviewHistory : [];
  quote.reviewHistory.push({
    action,
    fromStatus: extra.fromStatus || quote.status,
    toStatus: extra.toStatus || quote.status,
    actorId: identity?.principalId || null,
    actorLabel: identity?.label || null,
    role: identity?.type || 'admin',
    note: extra.note || null,
    metadata: extra.metadata || null,
    at: new Date(),
  });
  return identity;
};

exports.listAll = async (req, res) => {
  try {
    const items = await Quote.find().sort({ createdAt: -1 });
    res.json({ quotes: items.map(toCanonicalQuote) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      finalPrice,
      currency,
      notes,
      estimationMethod,
      matchedPricingId,
      productType,
      productLocation,
      contactPhone,
      carrier,
      pricingNote,
      priority,
      adminNotes,
      reviewNotes,
    } = req.body;

    const q = await Quote.findById(id);
    if (!q) return res.status(404).json({ message: 'Quote non trouvé' });

    if (finalPrice != null) q.finalPrice = finalPrice;
    if (currency) q.currency = currency;
    if (notes) q.notes = notes;
    if (estimationMethod) q.estimationMethod = estimationMethod;
    if (matchedPricingId) q.matchedPricingId = matchedPricingId;
    if (productType) q.productType = productType;
    if (productLocation) q.productLocation = productLocation;
    if (contactPhone) q.contactPhone = contactPhone;
    if (carrier) q.carrier = carrier;
    if (pricingNote) q.pricingNote = pricingNote;
    if (priority) q.priority = priority;
    if (adminNotes) q.adminNotes = adminNotes;
    if (reviewNotes) q.reviewNotes = reviewNotes;

    appendReviewAction(q, 'admin_update', req, {
      note: 'Admin updated quote review fields',
      metadata: { finalPrice, currency, priority, pricingNote },
    });

    await q.save();

    if (q.userId) {
      await notify({
        userId: q.userId,
        type: 'quote',
        title: 'Devis mis à jour',
        message: `Votre devis #${q._id} a été mis à jour par l’admin.`,
        entity: { entityType: 'Quote', entityId: q._id },
        channels: { inApp: true },
      });
    }

    res.json({ quote: toCanonicalQuote(q) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.markUnderReview = async (req, res) => {
  try {
    const { id } = req.params;
    const q = await Quote.findById(id);
    if (!q) return res.status(404).json({ message: 'Quote non trouvé' });

    const next = assertValidTransition(q.status, 'under_review');
    const patch = buildLifecyclePatch({ status: next, note: req.body?.note, actorId: resolveIdentity(req)?.principalId });
    const { reviewHistoryEntry, ...fields } = patch;
    q.set(fields);
    if (reviewHistoryEntry) {
      q.reviewHistory = Array.isArray(q.reviewHistory) ? q.reviewHistory : [];
      q.reviewHistory.push(reviewHistoryEntry);
    }
    await q.save();

    res.json({ quote: toCanonicalQuote(q) });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    res.status(status).json({ message: e.message, code: e.code || 'QUOTE_REVIEW_ERROR' });
  }
};

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalPrice, currency = 'USD', note } = req.body;

    const q = await Quote.findById(id);
    if (!q) return res.status(404).json({ message: 'Quote non trouvé' });

    const next = assertValidTransition(q.status, 'approved');
    if (finalPrice != null) q.finalPrice = finalPrice;
    q.currency = currency;

    const patch = buildLifecyclePatch({
      status: next,
      actorId: resolveIdentity(req)?.principalId,
      note: note || 'Quote approved by admin',
    });
    const { reviewHistoryEntry, ...fields } = patch;
    q.set(fields);
    if (reviewHistoryEntry) {
      q.reviewHistory = Array.isArray(q.reviewHistory) ? q.reviewHistory : [];
      q.reviewHistory.push(reviewHistoryEntry);
    }

    await q.save();

    if (q.userId) {
      await notify({
        userId: q.userId,
        type: 'quote',
        title: 'Devis approuvé',
        message: `Votre devis #${q._id} a été approuvé. Montant: ${q.finalPrice || q.estimatedPrice} ${q.currency}.`,
        entity: { entityType: 'Quote', entityId: q._id },
      });
    }

    res.json({ quote: toCanonicalQuote(q) });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    res.status(status).json({ message: e.message, code: e.code || 'QUOTE_APPROVE_ERROR' });
  }
};

exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, note } = req.body;

    const q = await Quote.findById(id);
    if (!q) return res.status(404).json({ message: 'Quote non trouvé' });

    const next = assertValidTransition(q.status, 'rejected');
    const patch = buildLifecyclePatch({
      status: next,
      actorId: resolveIdentity(req)?.principalId,
      reason: reason || 'Rejeté par l’admin',
      note: note || reason,
    });
    const { reviewHistoryEntry, ...fields } = patch;
    q.set(fields);
    if (reviewHistoryEntry) {
      q.reviewHistory = Array.isArray(q.reviewHistory) ? q.reviewHistory : [];
      q.reviewHistory.push(reviewHistoryEntry);
    }

    await q.save();

    if (q.userId) {
      await notify({
        userId: q.userId,
        type: 'quote',
        title: 'Devis refusé',
        message: `Votre devis #${q._id} a été refusé. Motif: ${reason || '—'}.`,
        entity: { entityType: 'Quote', entityId: q._id },
      });
    }

    res.json({ quote: toCanonicalQuote(q) });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    res.status(status).json({ message: e.message, code: e.code || 'QUOTE_REJECT_ERROR' });
  }
};

exports.requestMoreInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const q = await Quote.findById(id);
    if (!q) return res.status(404).json({ message: 'Quote non trouvé' });

    const next = assertValidTransition(q.status, 'awaiting_customer_approval');
    const patch = buildLifecyclePatch({
      status: next,
      actorId: resolveIdentity(req)?.principalId,
      note: req.body?.note || 'Admin requested customer confirmation',
    });
    const { reviewHistoryEntry, ...fields } = patch;
    q.set(fields);
    if (reviewHistoryEntry) {
      q.reviewHistory = Array.isArray(q.reviewHistory) ? q.reviewHistory : [];
      q.reviewHistory.push(reviewHistoryEntry);
    }

    if (req.body?.reviewNotes) q.reviewNotes = req.body.reviewNotes;

    await q.save();
    res.json({ quote: toCanonicalQuote(q) });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    res.status(status).json({ message: e.message, code: e.code || 'QUOTE_REQUEST_INFO_ERROR' });
  }
};

exports.markReadyForShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const q = await Quote.findById(id);
    if (!q) return res.status(404).json({ message: 'Quote non trouvé' });

    const next = assertValidTransition(q.status, 'ready_for_shipment');
    const patch = buildLifecyclePatch({
      status: next,
      actorId: resolveIdentity(req)?.principalId,
      note: req.body?.note || 'Quote marked ready for shipment',
    });
    const { reviewHistoryEntry, ...fields } = patch;
    q.set(fields);
    if (reviewHistoryEntry) {
      q.reviewHistory = Array.isArray(q.reviewHistory) ? q.reviewHistory : [];
      q.reviewHistory.push(reviewHistoryEntry);
    }

    await q.save();
    res.json({ quote: toCanonicalQuote(q) });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    res.status(status).json({ message: e.message, code: e.code || 'QUOTE_READY_ERROR' });
  }
};

exports.dispatch = exports.markReadyForShipment;

exports.updateTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, trackingUrl, eta } = req.body;

    const q = await Quote.findByIdAndUpdate(
      id,
      {
        ...(status && { deliveryStatus: status }),
        ...(trackingNumber && { trackingNumber }),
        ...(trackingUrl && { trackingUrl }),
        ...(eta && { eta }),
      },
      { new: true, runValidators: true }
    );
    if (!q) return res.status(404).json({ message: 'Quote non trouvé' });

    res.json({ quote: toCanonicalQuote(q) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
