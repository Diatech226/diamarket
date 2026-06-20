const Shipment = require('../models/Shipment');
const ShipmentAuditLog = require('../models/ShipmentAuditLog');
const { ensureRequestIdentity, identityHasRole } = require('../services/diaexpressAuthService');
const { success, parseListQuery, ApiError } = require('../utils/http');
const {
  SHIPMENT_STATUSES,
  normalizeTrackingEvents,
  normalizeShipmentStatus,
} = require('../services/shipmentService');
const {
  convertQuoteToShipment,
  updateShipmentStatus,
  addShipmentHistory,
  findShipmentOrThrow,
} = require('../src/domains/shipment/application/shipmentApplicationService');
const { assignShipmentToOperation } = require('../src/domains/operations/application/operationsApplicationService');
const { logger } = require('../src/lib/observability/logger');
const notificationService = require('../services/notificationService');
const { NOTIFICATION_EVENTS, STATUS_EVENT_MAP } = require('../src/lib/events/notificationEvents');

function ensureIdentity(req) {
  const identity = ensureRequestIdentity(req);
  if (!identity?.principalId) throw new ApiError(401, 'UNAUTHORIZED', 'Authentification requise');
  return identity;
}

function formatShipmentResponse(shipment) {
  const events = normalizeTrackingEvents(shipment.trackingUpdates || []);
  return {
    ...shipment.toObject(),
    trackingUpdates: events,
    timeline: events,
    lastEventAt: events.length ? events[events.length - 1].timestamp : shipment.updatedAt,
  };
}

exports.trackShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ trackingCode: req.params.trackingCode }).populate('quoteId');
    if (!shipment) throw new ApiError(404, 'SHIPMENT_NOT_FOUND', 'Colis introuvable');
    return success(res, formatShipmentResponse(shipment), { legacy: { shipment } });
  } catch (error) { return next(error); }
};

exports.createFromQuote = async (req, res, next) => {
  try {
    const identity = ensureIdentity(req);
    const { quoteId, note } = req.body || {};
    if (!quoteId) throw new ApiError(400, 'VALIDATION_ERROR', 'quoteId requis', { quoteId: ['quoteId requis'] });

    if (!identityHasRole(identity, 'admin')) {
      throw new ApiError(403, 'FORBIDDEN', 'Accès réservé aux administrateurs');
    }

    const result = await convertQuoteToShipment({ quoteId, identity, notes: note });
    if (result.created) {
      await notificationService.notify({ userId: result.shipment.userId, recipientEmail: result.shipment.clientSnapshot?.email || result.shipment.meta?.customerEmail, eventType: NOTIFICATION_EVENTS.ShipmentCreated, template: 'shipment_created', type: 'shipment', relatedType: 'Shipment', relatedId: result.shipment._id, metadata: { trackingCode: result.shipment.trackingCode } });
    }
    return success(res, {
      shipment: formatShipmentResponse(result.shipment),
      conversion: {
        sourceQuoteId: quoteId,
        idempotent: !result.created,
        convertedAt: result.shipment.convertedAt || result.shipment.createdAt,
        convertedBy: result.shipment.convertedBy || identity.principalId,
      },
    }, {
      status: result.created ? 201 : 200,
      legacy: {
        shipment: result.shipment,
        quote: { id: result.quote._id, trackingNumber: result.quote.trackingNumber },
        message: result.created ? 'Shipment créé' : 'Shipment déjà existant',
      },
    });
  } catch (error) { return next(error); }
};

exports.getMine = async (req, res, next) => {
  try {
    const identity = ensureIdentity(req);
    const list = parseListQuery(req.query, { allowedSortBy: ['createdAt', 'updatedAt', 'status'] });
    const filters = { principalId: identity.principalId };
    if (req.query.status) filters.status = normalizeShipmentStatus(req.query.status);

    const [data, total] = await Promise.all([
      Shipment.find(filters).sort({ [list.sortBy]: list.sortOrder === 'asc' ? 1 : -1 }).skip(list.skip).limit(list.limit),
      Shipment.countDocuments(filters),
    ]);

    const payload = data.map((shipment) => formatShipmentResponse(shipment));
    return success(res, payload, {
      pagination: { page: list.page, limit: list.limit, total, totalPages: Math.ceil(total / list.limit) || 1 },
      legacy: { shipments: payload },
    });
  } catch (error) { return next(error); }
};

exports.getAll = async (req, res, next) => {
  try {
    const identity = ensureIdentity(req);
    if (!identityHasRole(identity, 'admin')) throw new ApiError(403, 'FORBIDDEN', 'Accès réservé aux administrateurs');

    const list = parseListQuery(req.query, { allowedSortBy: ['createdAt', 'updatedAt', 'status', 'provider'] });
    const filters = {};
    ['status', 'provider', 'principalId', 'source'].forEach((k) => {
      if (req.query[k]) filters[k] = k === 'status' ? normalizeShipmentStatus(req.query[k]) : req.query[k];
    });
    if (req.query.trackingCode) filters.trackingCode = { $regex: req.query.trackingCode, $options: 'i' };
    if (req.query.search) {
      const search = String(req.query.search).trim();
      filters.$or = [{ trackingCode: { $regex: search, $options: 'i' } }, { principalLabel: { $regex: search, $options: 'i' } }, { carrier: { $regex: search, $options: 'i' } }];
    }

    const [data, total] = await Promise.all([
      Shipment.find(filters).sort({ [list.sortBy]: list.sortOrder === 'asc' ? 1 : -1 }).skip(list.skip).limit(list.limit),
      Shipment.countDocuments(filters),
    ]);

    const payload = data.map((shipment) => formatShipmentResponse(shipment));
    return success(res, payload, {
      pagination: { page: list.page, limit: list.limit, total, totalPages: Math.ceil(total / list.limit) || 1 },
      meta: { filters, statuses: SHIPMENT_STATUSES },
      legacy: { shipments: payload },
    });
  } catch (error) { return next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const identity = ensureRequestIdentity(req);
    const shipment = await Shipment.findById(req.params.shipmentId).populate('quoteId').populate('embarkmentId');
    if (!shipment) throw new ApiError(404, 'SHIPMENT_NOT_FOUND', 'Shipment introuvable');
    if (!identityHasRole(identity, 'admin') && shipment.principalId !== identity?.principalId) {
      throw new ApiError(403, 'FORBIDDEN', 'Accès non autorisé');
    }
    return success(res, formatShipmentResponse(shipment), { legacy: { shipment } });
  } catch (error) { return next(error); }
};

exports.assignEmbarkment = async (req, res, next) => {
  try {
    const identity = ensureRequestIdentity(req);
    if (!identityHasRole(identity, 'admin')) throw new ApiError(403, 'FORBIDDEN', 'Accès réservé aux administrateurs');

    const shipment = await assignShipmentToOperation({
      shipmentId: req.params.shipmentId,
      identity,
      input: {
        embarkmentId: req.body?.embarkmentId,
        scheduleId: req.body?.scheduleId,
        transportLineId: req.body?.transportLineId,
        requestedUnits: req.body?.requestedUnits,
        packageTypeId: req.body?.packageTypeId,
        assignmentReason: req.body?.assignmentReason,
        assignmentNote: req.body?.assignmentNote,
      },
    });

    logger.info('planning', 'shipment.assigned_operation', {
      shipmentId: String(shipment._id),
      embarkmentId: shipment.embarkmentId ? String(shipment.embarkmentId) : null,
      actorId: req.user?._id?.toString?.() || identity?.principalId || null,
    });
    return success(res, formatShipmentResponse(shipment), { legacy: { shipment, message: 'Shipment assigné à une opération' } });
  } catch (error) { return next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const identity = ensureRequestIdentity(req);
    const shipment = await findShipmentOrThrow(req.params.shipmentId);
    if (!identityHasRole(identity, 'admin') && shipment.principalId !== identity?.principalId) throw new ApiError(403, 'FORBIDDEN', 'Accès non autorisé');

    await updateShipmentStatus({ shipment, identity, input: req.body || {} });

    const statusEventType = STATUS_EVENT_MAP[shipment.status];
    if (statusEventType) {
      await notificationService.notify({ userId: shipment.userId, recipientEmail: shipment.clientSnapshot?.email || shipment.meta?.customerEmail, eventType: statusEventType, template: shipment.status === 'delivered' ? 'shipment_delivered' : shipment.status === 'delayed' ? 'shipment_delayed' : shipment.status === 'out_for_delivery' ? 'shipment_out_for_delivery' : shipment.status === 'delivery_failed' || shipment.status === 'failed_delivery' ? 'delivery_failed' : 'shipment_in_transit', type: 'shipment', relatedType: 'Shipment', relatedId: shipment._id, metadata: { trackingCode: shipment.trackingCode, status: shipment.status } });
    }

    logger.info('shipment_lifecycle', 'shipment.status_changed', {
      shipmentId: String(shipment._id),
      status: shipment.status,
      actorId: req.user?._id?.toString?.() || identity?.principalId || null,
    });

    return success(res, formatShipmentResponse(shipment), { legacy: { shipment, message: 'Shipment mis à jour' } });
  } catch (error) {
    if (error?.status && error?.code) {
      return next(new ApiError(error.status, error.code, error.message, error.details));
    }
    return next(error);
  }
};

exports.addHistory = async (req, res, next) => {
  try {
    const identity = ensureRequestIdentity(req);
    const shipment = await findShipmentOrThrow(req.params.shipmentId);
    if (!identityHasRole(identity, 'admin') && shipment.principalId !== identity?.principalId) throw new ApiError(403, 'FORBIDDEN', 'Accès non autorisé');

    await addShipmentHistory({ shipment, identity, input: req.body || {} });
    return success(res, formatShipmentResponse(shipment), { legacy: { shipment, message: 'Historique ajouté' } });
  } catch (error) {
    if (error?.status && error?.code) {
      return next(new ApiError(error.status, error.code, error.message, error.details));
    }
    return next(error);
  }
};

exports.getTimeline = async (req, res, next) => {
  try {
    const identity = ensureRequestIdentity(req);
    const shipment = await Shipment.findById(req.params.shipmentId || req.params.id);
    if (!shipment) throw new ApiError(404, 'SHIPMENT_NOT_FOUND', 'Shipment introuvable');
    if (!identityHasRole(identity, 'admin') && shipment.principalId !== identity?.principalId) throw new ApiError(403, 'FORBIDDEN', 'Accès non autorisé');
    const timeline = normalizeTrackingEvents(shipment.trackingUpdates || []);
    return success(res, { timeline }, { legacy: { timeline } });
  } catch (error) { return next(error); }
};

exports.dashboard = async (req, res, next) => {
  try {
    const identity = ensureRequestIdentity(req);
    if (!identityHasRole(identity, 'admin')) throw new ApiError(403, 'FORBIDDEN', 'Accès réservé aux administrateurs');
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const terminal = ['delivered', 'returned', 'cancelled'];
    const [createdToday, active, delayed, delivered] = await Promise.all([
      Shipment.countDocuments({ createdAt: { $gte: start } }),
      Shipment.countDocuments({ status: { $nin: terminal } }),
      Shipment.countDocuments({ $or: [{ status: 'delayed' }, { estimatedDelivery: { $lt: new Date() }, status: { $nin: terminal } }] }),
      Shipment.countDocuments({ status: 'delivered' }),
    ]);
    return success(res, { createdToday, active, delayed, delivered });
  } catch (error) { return next(error); }
};

exports.deleteShipment = async (req, res, next) => {
  try {
    const deleted = await Shipment.findByIdAndDelete(req.params.shipmentId);
    if (!deleted) throw new ApiError(404, 'SHIPMENT_NOT_FOUND', 'Shipment introuvable');
    return success(res, { deleted: true }, { legacy: { message: 'Shipment supprimé' } });
  } catch (error) { return next(error); }
};
