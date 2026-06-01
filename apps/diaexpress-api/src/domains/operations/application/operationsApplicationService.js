const mongoose = require('mongoose');
const Reservation = require('../../../../models/Reservation');
const Schedule = require('../../../../models/Schedule');
const Shipment = require('../../../../models/Shipment');
const Embarkment = require('../../../../models/Embarkment');
const TransportLine = require('../../../../models/TransportLine');
const OperationalException = require('../../../../models/OperationalException');
const { ApiError } = require('../../../../utils/http');
const { identityHasRole } = require('../../../../services/diaexpressAuthService');
const { publishDomainEvent } = require('../../../shared/events/domainEventPublisher');
const { DOMAIN_EVENT_NAMES } = require('../../../shared/events/domainEventCatalog');

const ACTIVE_SCHEDULE_STATUSES = new Set(['planned', 'booking_open']);
const ACTIVE_EMBARKMENT_STATUSES = new Set(['planned', 'booking_open', 'open']);

function asObjectId(value) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  return mongoose.Types.ObjectId.isValid(String(value)) ? new mongoose.Types.ObjectId(String(value)) : null;
}

function asDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function raiseOperationalException({ code, message, identity, details = {}, refs = {} }) {
  const payload = {
    code,
    message,
    raisedBy: identity?.principalId || 'system',
    details,
    shipmentId: refs.shipmentId || null,
    reservationId: refs.reservationId || null,
    scheduleId: refs.scheduleId || null,
    embarkmentId: refs.embarkmentId || null,
  };

  try {
    const created = await OperationalException.create(payload);
    publishDomainEvent(DOMAIN_EVENT_NAMES.SHIPMENT_PLANNING_EXCEPTION, {
      exceptionId: String(created._id),
      code: created.code,
      shipmentId: created.shipmentId ? String(created.shipmentId) : null,
      scheduleId: created.scheduleId ? String(created.scheduleId) : null,
    });
  } catch (_error) {
    // Best effort logging only.
  }

  return payload;
}

function assertPlanningRole(identity) {
  if (!identityHasRole(identity, 'admin') && !identityHasRole(identity, 'operations')) {
    throw new ApiError(403, 'FORBIDDEN', 'Planning réservé aux rôles admin/operations');
  }
}

async function createReservation({ input, identity }) {
  assertPlanningRole(identity);

  const reservation = await Reservation.create({
    ...input,
    user: input.user || input.customerId || input.userId,
    customerId: input.customerId || input.user || input.userId,
    quoteId: asObjectId(input.quoteId),
    shipmentId: asObjectId(input.shipmentId),
    transportLineId: asObjectId(input.transportLineId),
    embarkmentId: asObjectId(input.embarkmentId),
    status: input.status || 'draft',
    requestedAt: input.requestedAt || new Date(),
  });

  publishDomainEvent(DOMAIN_EVENT_NAMES.RESERVATION_CREATED, {
    reservationId: String(reservation._id),
    status: reservation.status,
    shipmentId: reservation.shipmentId ? String(reservation.shipmentId) : null,
    quoteId: reservation.quoteId ? String(reservation.quoteId) : null,
  });

  return reservation;
}

async function transitionReservationStatus({ reservationId, status, reason, identity }) {
  assertPlanningRole(identity);
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) throw new ApiError(404, 'RESERVATION_NOT_FOUND', 'Réservation introuvable');

  reservation.status = status;
  if (status === 'confirmed') reservation.reservationConfirmedAt = reservation.reservationConfirmedAt || new Date();
  if (status === 'rejected') reservation.rejectionReason = reason || reservation.rejectionReason || null;
  if (status === 'cancelled') reservation.cancellationReason = reason || reservation.cancellationReason || null;
  if (status === 'converted_to_shipment_assignment') reservation.convertedToAssignmentAt = new Date();
  await reservation.save();

  if (status === 'confirmed') {
    publishDomainEvent(DOMAIN_EVENT_NAMES.RESERVATION_CONFIRMED, {
      reservationId: String(reservation._id),
      shipmentId: reservation.shipmentId ? String(reservation.shipmentId) : null,
    });
  }
  if (status === 'rejected') {
    publishDomainEvent(DOMAIN_EVENT_NAMES.RESERVATION_REJECTED, {
      reservationId: String(reservation._id),
      reason: reservation.rejectionReason || null,
    });
  }

  return reservation;
}

async function createSchedule({ input, identity }) {
  assertPlanningRole(identity);
  const schedule = await Schedule.create({
    ...input,
    transportLineId: asObjectId(input.transportLineId),
    expeditionLineId: asObjectId(input.expeditionLineId),
    embarkmentId: asObjectId(input.embarkmentId),
    totalCapacity: input.totalCapacity ?? input.capacity ?? null,
    reservedCapacity: input.reservedCapacity ?? 0,
    status: input.status || 'planned',
    active: input.active ?? true,
    arrivalEstimate: input.arrivalEstimate || input.arrivalDate || null,
    planningDeadline: input.planningDeadline || null,
    departureLockAt: input.departureLockAt || null,
  });

  publishDomainEvent(DOMAIN_EVENT_NAMES.SCHEDULE_CREATED, {
    scheduleId: String(schedule._id),
    transportLineId: schedule.transportLineId ? String(schedule.transportLineId) : null,
    embarkmentId: schedule.embarkmentId ? String(schedule.embarkmentId) : null,
  });

  return schedule;
}

async function updateSchedule({ scheduleId, input, identity }) {
  assertPlanningRole(identity);
  const patch = {
    ...input,
    transportLineId: asObjectId(input.transportLineId),
    expeditionLineId: asObjectId(input.expeditionLineId),
    embarkmentId: asObjectId(input.embarkmentId),
  };
  const schedule = await Schedule.findByIdAndUpdate(scheduleId, patch, { new: true });
  if (!schedule) throw new ApiError(404, 'SCHEDULE_NOT_FOUND', 'Schedule introuvable');
  return schedule;
}

async function listSchedules({ filters = {}, options = {} }) {
  const query = {};
  if (filters.active === true || filters.active === false) query.active = filters.active;
  if (filters.status) query.status = filters.status;
  if (filters.transportType) query.transportType = filters.transportType;
  if (filters.origin) query.origin = new RegExp(filters.origin, 'i');
  if (filters.destination) query.destination = new RegExp(filters.destination, 'i');
  if (filters.transportLineId && asObjectId(filters.transportLineId)) query.transportLineId = asObjectId(filters.transportLineId);

  const limit = Math.max(1, Math.min(Number(options.limit || 50), 200));
  const skip = Math.max(0, Number(options.skip || 0));
  return Schedule.find(query).sort({ departureDate: 1 }).skip(skip).limit(limit);
}

async function getAvailableSchedulesForRoute({ route, packageTypeId, requestedUnits = 1, at = new Date() }) {
  const line = route.transportLineId ? await TransportLine.findById(route.transportLineId).lean() : null;

  const schedules = await Schedule.find({
    active: true,
    status: { $in: [...ACTIVE_SCHEDULE_STATUSES] },
    ...(route.transportLineId ? { transportLineId: asObjectId(route.transportLineId) } : {}),
    ...(route.origin ? { origin: route.origin } : {}),
    ...(route.destination ? { destination: route.destination } : {}),
  }).sort({ departureDate: 1 }).lean();

  const available = [];
  for (const schedule of schedules) {
    const availability = evaluateScheduleAvailability({
      schedule,
      line,
      packageTypeId,
      requestedUnits,
      at,
    });
    if (availability.ok) available.push({ ...schedule, availability });
  }

  return available;
}

function evaluateScheduleAvailability({ schedule, line, shipment, packageTypeId, requestedUnits = 1, at = new Date() }) {
  const reasons = [];
  const now = asDate(at) || new Date();
  const cutoff = asDate(schedule.closingDate);
  const planningDeadline = asDate(schedule.planningDeadline);

  if (cutoff && now > cutoff) reasons.push('cutoff_missed');
  if (planningDeadline && now > planningDeadline) reasons.push('schedule_unavailable');

  const availableCapacity = typeof schedule.totalCapacity === 'number'
    ? Math.max(0, schedule.totalCapacity - (schedule.reservedCapacity || 0))
    : null;

  if (typeof availableCapacity === 'number' && availableCapacity < requestedUnits) {
    reasons.push('capacity_exceeded');
  }

  if (packageTypeId && Array.isArray(schedule.supportedPackageTypes) && schedule.supportedPackageTypes.length) {
    const compatible = schedule.supportedPackageTypes.some((id) => String(id) === String(packageTypeId));
    if (!compatible) reasons.push('incompatible_package_type');
  }

  if (line && shipment?.transportLineId && String(shipment.transportLineId) !== String(line._id || line.id)) {
    reasons.push('invalid_route_assignment');
  }

  return {
    ok: reasons.length === 0,
    reasons,
    capacity: {
      total: schedule.totalCapacity ?? null,
      reserved: schedule.reservedCapacity || 0,
      available: availableCapacity,
      requested: requestedUnits,
    },
    cutoff,
  };
}

async function evaluateEmbarkmentAvailability({ embarkment, packageTypeId, requestedUnits = 1, at = new Date() }) {
  const reasons = [];
  const now = asDate(at) || new Date();
  if (embarkment.cutoffDate && now > new Date(embarkment.cutoffDate)) reasons.push('cutoff_missed');
  if (!ACTIVE_EMBARKMENT_STATUSES.has(embarkment.status)) reasons.push('schedule_unavailable');

  const availableCapacity = typeof embarkment.capacity === 'number'
    ? Math.max(0, embarkment.capacity - (embarkment.reservedCapacity || 0))
    : null;
  if (typeof availableCapacity === 'number' && availableCapacity < requestedUnits) reasons.push('capacity_exceeded');

  if (packageTypeId && Array.isArray(embarkment.allowedPackageTypes) && embarkment.allowedPackageTypes.length) {
    const compatible = embarkment.allowedPackageTypes.some((id) => String(id) === String(packageTypeId));
    if (!compatible) reasons.push('incompatible_package_type');
  }

  return {
    ok: reasons.length === 0,
    reasons,
    capacity: {
      total: embarkment.capacity ?? null,
      reserved: embarkment.reservedCapacity || 0,
      available: availableCapacity,
      requested: requestedUnits,
    },
  };
}

async function assignShipmentToOperation({ shipmentId, input, identity }) {
  assertPlanningRole(identity);

  const shipment = await Shipment.findById(shipmentId);
  if (!input.scheduleId && !input.embarkmentId && !input.transportLineId) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'scheduleId, embarkmentId ou transportLineId requis');
  }
  if (!shipment) throw new ApiError(404, 'SHIPMENT_NOT_FOUND', 'Shipment introuvable');

  const schedule = input.scheduleId ? await Schedule.findById(input.scheduleId) : null;
  const embarkment = input.embarkmentId ? await Embarkment.findById(input.embarkmentId) : null;

  if (input.scheduleId && !schedule) throw new ApiError(404, 'SCHEDULE_NOT_FOUND', 'Schedule introuvable');
  if (input.embarkmentId && !embarkment) throw new ApiError(404, 'EMBARKMENT_NOT_FOUND', 'Embarquement introuvable');

  if (schedule) {
    const availability = evaluateScheduleAvailability({
      schedule,
      shipment,
      packageTypeId: input.packageTypeId || shipment?.meta?.packageTypeId || null,
      requestedUnits: Number(input.requestedUnits || shipment?.meta?.requestedUnits || 1),
    });

    if (!availability.ok) {
      await raiseOperationalException({
        code: availability.reasons[0],
        message: 'Shipment cannot be assigned to selected schedule',
        identity,
        refs: { shipmentId: shipment._id, scheduleId: schedule._id },
        details: availability,
      });
      throw new ApiError(409, 'SHIPMENT_ASSIGNMENT_BLOCKED', 'Schedule indisponible pour cette expédition', availability);
    }

    if (typeof schedule.totalCapacity === 'number') {
      schedule.reservedCapacity = (schedule.reservedCapacity || 0) + Number(input.requestedUnits || 1);
      await schedule.save();
      if (schedule.reservedCapacity >= schedule.totalCapacity) {
        publishDomainEvent(DOMAIN_EVENT_NAMES.EMBARKMENT_CAPACITY_REACHED, {
          scheduleId: String(schedule._id),
          totalCapacity: schedule.totalCapacity,
        });
      }
    }
  }

  if (embarkment) {
    const availability = await evaluateEmbarkmentAvailability({
      embarkment,
      packageTypeId: input.packageTypeId || shipment?.meta?.packageTypeId || null,
      requestedUnits: Number(input.requestedUnits || shipment?.meta?.requestedUnits || 1),
    });

    if (!availability.ok) {
      await raiseOperationalException({
        code: availability.reasons[0],
        message: 'Shipment cannot be assigned to selected embarkment',
        identity,
        refs: { shipmentId: shipment._id, embarkmentId: embarkment._id },
        details: availability,
      });
      throw new ApiError(409, 'SHIPMENT_ASSIGNMENT_BLOCKED', 'Embarquement indisponible pour cette expédition', availability);
    }

    if (typeof embarkment.capacity === 'number') {
      embarkment.reservedCapacity = (embarkment.reservedCapacity || 0) + Number(input.requestedUnits || 1);
      await embarkment.save();
      if (embarkment.reservedCapacity >= embarkment.capacity) {
        publishDomainEvent(DOMAIN_EVENT_NAMES.EMBARKMENT_CAPACITY_REACHED, {
          embarkmentId: String(embarkment._id),
          totalCapacity: embarkment.capacity,
        });
      }
    }
  }

  shipment.transportLineId = input.transportLineId || schedule?.transportLineId || embarkment?.transportLineId || shipment.transportLineId;
  shipment.scheduleId = schedule?._id || shipment.scheduleId || null;
  shipment.embarkmentId = embarkment?._id || shipment.embarkmentId || null;
  shipment.assignmentStatus = 'assigned';
  shipment.assignmentReason = input.assignmentReason || shipment.assignmentReason || null;
  shipment.assignmentNote = input.assignmentNote || null;
  shipment.assignedAt = new Date();
  shipment.assignedBy = identity?.principalId || null;
  shipment.planningStatus = shipment.scheduleId ? 'scheduled' : 'assigned';
  shipment.status = shipment.status === 'created' ? 'scheduled' : shipment.status;
  shipment.scheduledAt = shipment.scheduledAt || new Date();

  shipment.meta = {
    ...(shipment.meta || {}),
    operationAssignment: {
      scheduleId: shipment.scheduleId,
      embarkmentId: shipment.embarkmentId,
      assignedBy: shipment.assignedBy,
      assignedAt: shipment.assignedAt,
      note: shipment.assignmentNote,
      reason: shipment.assignmentReason,
    },
  };

  await shipment.save();

  publishDomainEvent(DOMAIN_EVENT_NAMES.SHIPMENT_ASSIGNED, {
    shipmentId: String(shipment._id),
    transportLineId: shipment.transportLineId ? String(shipment.transportLineId) : null,
    scheduleId: shipment.scheduleId ? String(shipment.scheduleId) : null,
    embarkmentId: shipment.embarkmentId ? String(shipment.embarkmentId) : null,
  });

  return shipment;
}

module.exports = {
  createReservation,
  transitionReservationStatus,
  createSchedule,
  updateSchedule,
  listSchedules,
  getAvailableSchedulesForRoute,
  evaluateScheduleAvailability,
  evaluateEmbarkmentAvailability,
  assignShipmentToOperation,
  raiseOperationalException,
};
