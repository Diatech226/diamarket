const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const Reservation = require('../models/Reservation');
const Schedule = require('../models/Schedule');
const Shipment = require('../models/Shipment');
const Embarkment = require('../models/Embarkment');
const OperationalException = require('../models/OperationalException');
const { subscribeDomainEvent } = require('../src/shared/events/domainEventPublisher');
const {
  createReservation,
  transitionReservationStatus,
  evaluateScheduleAvailability,
  assignShipmentToOperation,
} = require('../src/domains/operations/application/operationsApplicationService');

const original = {
  reservationCreate: Reservation.create,
  reservationFindById: Reservation.findById,
  scheduleFindById: Schedule.findById,
  shipmentFindById: Shipment.findById,
  embarkmentFindById: Embarkment.findById,
  operationalExceptionCreate: OperationalException.create,
};

afterEach(() => {
  Reservation.create = original.reservationCreate;
  Reservation.findById = original.reservationFindById;
  Schedule.findById = original.scheduleFindById;
  Shipment.findById = original.shipmentFindById;
  Embarkment.findById = original.embarkmentFindById;
  OperationalException.create = original.operationalExceptionCreate;
});

test('reservation lifecycle supports creation then confirmation transition', async () => {
  let createdPayload;
  Reservation.create = async (payload) => {
    createdPayload = payload;
    return { _id: 'res_1', ...payload };
  };

  const reservation = {
    _id: 'res_1',
    status: 'pending_validation',
    reservationConfirmedAt: null,
    save: async () => {},
  };
  Reservation.findById = async () => reservation;

  await createReservation({
    input: {
      user: 'user_1',
      customerId: 'user_1',
      type: 'FCL',
      provider: 'INTERNAL',
      origin: 'Paris',
      destination: 'Lome',
      departureDate: new Date('2026-05-01T10:00:00.000Z'),
      status: 'pending_validation',
    },
    identity: { principalId: 'admin_1', role: 'admin' },
  });

  assert.equal(createdPayload.status, 'pending_validation');

  const updated = await transitionReservationStatus({
    reservationId: 'res_1',
    status: 'confirmed',
    identity: { principalId: 'admin_1', role: 'admin' },
  });

  assert.equal(updated.status, 'confirmed');
  assert.ok(updated.reservationConfirmedAt instanceof Date);
});

test('schedule availability blocks cutoff-missed and capacity-exceeded scenarios', () => {
  const result = evaluateScheduleAvailability({
    schedule: {
      closingDate: new Date('2026-01-01T00:00:00.000Z'),
      planningDeadline: new Date('2026-01-05T00:00:00.000Z'),
      totalCapacity: 5,
      reservedCapacity: 5,
      supportedPackageTypes: [],
    },
    requestedUnits: 1,
    at: new Date('2026-02-01T00:00:00.000Z'),
  });

  assert.equal(result.ok, false);
  assert.ok(result.reasons.includes('cutoff_missed'));
  assert.ok(result.reasons.includes('capacity_exceeded'));
});

test('shipment assignment emits shipment.assigned event when capacity allows', async () => {
  const events = [];
  const unsubscribe = subscribeDomainEvent('shipment.assigned', (event) => events.push(event));

  const scheduleDoc = {
    _id: 'schedule_1',
    transportLineId: 'line_1',
    closingDate: new Date('2026-07-01T00:00:00.000Z'),
    planningDeadline: null,
    totalCapacity: 10,
    reservedCapacity: 2,
    supportedPackageTypes: [],
    save: async function save() { return this; },
  };

  const shipmentDoc = {
    _id: 'shipment_1',
    transportLineId: 'line_1',
    status: 'created',
    meta: {},
    save: async function save() { return this; },
  };

  Schedule.findById = async () => scheduleDoc;
  Embarkment.findById = async () => null;
  Shipment.findById = async () => shipmentDoc;
  OperationalException.create = async () => ({ _id: 'ex_1' });

  const result = await assignShipmentToOperation({
    shipmentId: 'shipment_1',
    input: {
      scheduleId: 'schedule_1',
      requestedUnits: 3,
      assignmentReason: 'planification hebdomadaire',
    },
    identity: { principalId: 'admin_1', role: 'admin' },
  });

  unsubscribe();

  assert.equal(result.assignmentStatus, 'assigned');
  assert.equal(result.planningStatus, 'scheduled');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'shipment.assigned');
});

test('assignment raises operational exception when capacity is exceeded', async () => {
  const captured = [];

  Schedule.findById = async () => ({
    _id: 'schedule_1',
    transportLineId: 'line_1',
    closingDate: new Date('2026-07-01T00:00:00.000Z'),
    totalCapacity: 2,
    reservedCapacity: 2,
    supportedPackageTypes: [],
    save: async function save() { return this; },
  });
  Shipment.findById = async () => ({
    _id: 'shipment_1',
    transportLineId: 'line_1',
    status: 'created',
    meta: {},
    save: async function save() { return this; },
  });
  Embarkment.findById = async () => null;
  OperationalException.create = async (payload) => {
    captured.push(payload);
    return { _id: 'ex_2', ...payload };
  };

  await assert.rejects(() => assignShipmentToOperation({
    shipmentId: 'shipment_1',
    input: { scheduleId: 'schedule_1', requestedUnits: 1 },
    identity: { principalId: 'admin_1', role: 'admin' },
  }), (error) => {
    assert.equal(error.code, 'SHIPMENT_ASSIGNMENT_BLOCKED');
    return true;
  });

  assert.equal(captured.length, 1);
  assert.equal(captured[0].code, 'capacity_exceeded');
});
