const test = require('node:test');
const assert = require('node:assert/strict');
const { canTransitionQuote, canTransitionShipment, normalizeQuoteStatus, normalizeShipmentStatus, getQuoteStatusLabel, getShipmentStatusLabel } = require('../src/domain/statuses');

test('canonical quote transitions', () => {
  [['draft','submitted'],['submitted','under_review'],['under_review','info_requested'],['info_requested','submitted'],['under_review','priced'],['priced','approved'],['approved','converted_to_shipment']].forEach(([from,to]) => assert.equal(canTransitionQuote(from,to), true));
  assert.equal(canTransitionQuote('draft', 'approved'), false);
  assert.equal(normalizeQuoteStatus('requested'), 'submitted');
  assert.equal(getQuoteStatusLabel('requested'), 'Demande envoyée');
});

test('canonical shipment transitions', () => {
  [['created','awaiting_pickup'],['awaiting_pickup','picked_up'],['picked_up','at_origin_hub'],['at_origin_hub','in_transit'],['in_transit','at_destination_hub'],['at_destination_hub','out_for_delivery'],['out_for_delivery','delivered'],['out_for_delivery','delivery_failed']].forEach(([from,to]) => assert.equal(canTransitionShipment(from,to), true));
  assert.equal(canTransitionShipment('created', 'delivered'), false);
  assert.equal(normalizeShipmentStatus('failed_delivery'), 'delivery_failed');
  assert.equal(getShipmentStatusLabel('failed_delivery'), 'Livraison échouée');
});
