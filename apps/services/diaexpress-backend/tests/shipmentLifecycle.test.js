const assert = require('assert');
const {
  assertShipmentTransition,
  normalizeShipmentStatus,
  buildTrackingEvent,
} = require('../services/shipmentService');

function run() {
  assert.strictEqual(normalizeShipmentStatus('BOOKED'), 'created');
  assert.strictEqual(normalizeShipmentStatus('arrived'), 'at_hub');

  assert.doesNotThrow(() => {
    assertShipmentTransition({ currentStatus: 'created', nextStatus: 'pending_dispatch', identityRole: 'admin' });
  });

  assert.throws(() => {
    assertShipmentTransition({ currentStatus: 'delivered', nextStatus: 'in_transit', identityRole: 'admin' });
  }, /Invalid transition/);

  const event = buildTrackingEvent({
    shipment: { status: 'created', currentLocation: 'Douala' },
    status: 'scheduled',
    location: 'Lagos',
    note: 'Planifié pour départ',
    identity: { principalId: 'usr_1', label: 'Ops Agent' },
    eventType: 'shipment_scheduled',
  });

  assert.strictEqual(event.eventType, 'shipment_scheduled');
  assert.strictEqual(event.status, 'scheduled');
  assert.strictEqual(event.location, 'Lagos');
  assert.strictEqual(event.actorId, 'usr_1');
}

run();
console.log('shipmentLifecycle.test.js passed');
