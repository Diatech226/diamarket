const QUOTE_STATUSES = ['draft','submitted','under_review','info_requested','priced','approved','rejected','expired','converted_to_shipment','cancelled'];
const SHIPMENT_STATUSES = ['created','awaiting_pickup','picked_up','at_origin_hub','in_transit','at_destination_hub','out_for_delivery','delivered','delivery_failed','returned','cancelled','delayed'];
const LEGACY_QUOTE_STATUS_MAP = { requested: 'submitted', pending: 'submitted', confirmed: 'approved', ready_for_shipment: 'approved', converted: 'converted_to_shipment', dispatched: 'converted_to_shipment', awaiting_customer_approval: 'priced', customer_approved: 'approved' };
const LEGACY_SHIPMENT_STATUS_MAP = { draft: 'created', pending_dispatch: 'awaiting_pickup', scheduled: 'awaiting_pickup', at_hub: 'at_origin_hub', failed_delivery: 'delivery_failed', booked: 'created', arrived: 'at_origin_hub' };
const QUOTE_TRANSITIONS = {
  draft: ['submitted', 'cancelled'], submitted: ['under_review', 'cancelled', 'expired'], under_review: ['info_requested', 'priced', 'rejected', 'expired'], info_requested: ['submitted', 'under_review', 'cancelled', 'expired'], priced: ['approved', 'rejected', 'expired'], approved: ['converted_to_shipment', 'cancelled', 'expired'], rejected: [], expired: [], converted_to_shipment: [], cancelled: []
};
const SHIPMENT_TRANSITIONS = {
  created: ['awaiting_pickup', 'cancelled'], awaiting_pickup: ['picked_up', 'cancelled', 'delayed'], picked_up: ['at_origin_hub', 'in_transit', 'delayed'], at_origin_hub: ['in_transit', 'delayed', 'cancelled'], in_transit: ['at_destination_hub', 'delayed', 'returned'], at_destination_hub: ['out_for_delivery', 'delayed', 'returned'], out_for_delivery: ['delivered', 'delivery_failed', 'delayed'], delivered: [], delivery_failed: ['out_for_delivery', 'returned', 'delayed', 'cancelled'], returned: [], cancelled: [], delayed: ['awaiting_pickup', 'picked_up', 'at_origin_hub', 'in_transit', 'at_destination_hub', 'out_for_delivery', 'returned', 'cancelled']
};
const QUOTE_STATUS_LABELS = { draft: 'Brouillon', submitted: 'Demande envoyée', under_review: 'En cours d’étude', info_requested: 'Informations demandées', priced: 'Prix proposé', approved: 'Devis approuvé', rejected: 'Devis refusé', expired: 'Devis expiré', converted_to_shipment: 'Expédition créée', cancelled: 'Devis annulé' };
const SHIPMENT_STATUS_LABELS = { created: 'Expédition créée', awaiting_pickup: 'En attente de collecte', picked_up: 'Colis collecté', at_origin_hub: 'Au hub d’origine', in_transit: 'En transit', at_destination_hub: 'Au hub de destination', out_for_delivery: 'En livraison', delivered: 'Livré', delivery_failed: 'Livraison échouée', returned: 'Retourné', cancelled: 'Expédition annulée', delayed: 'Retardé' };
const normalize = (value, map) => { if (!value) return value; const key = String(value).trim().toLowerCase(); return map[key] || key; };
const normalizeQuoteStatus = (status) => normalize(status, LEGACY_QUOTE_STATUS_MAP);
const normalizeShipmentStatus = (status) => normalize(status, LEGACY_SHIPMENT_STATUS_MAP);
const canTransition = (transitions, normalizeFn, from, to) => { const current = normalizeFn(from); const next = normalizeFn(to); if (!current || !next) return false; if (current === next) return true; return (transitions[current] || []).includes(next); };
const canTransitionQuote = (from, to) => canTransition(QUOTE_TRANSITIONS, normalizeQuoteStatus, from, to);
const canTransitionShipment = (from, to) => canTransition(SHIPMENT_TRANSITIONS, normalizeShipmentStatus, from, to);
const getQuoteStatusLabel = (status) => QUOTE_STATUS_LABELS[normalizeQuoteStatus(status)] || status || 'Inconnu';
const getShipmentStatusLabel = (status) => SHIPMENT_STATUS_LABELS[normalizeShipmentStatus(status)] || status || 'Inconnu';
module.exports = { QUOTE_STATUSES, SHIPMENT_STATUSES, LEGACY_QUOTE_STATUS_MAP, LEGACY_SHIPMENT_STATUS_MAP, QUOTE_TRANSITIONS, SHIPMENT_TRANSITIONS, normalizeQuoteStatus, normalizeShipmentStatus, canTransitionQuote, canTransitionShipment, getQuoteStatusLabel, getShipmentStatusLabel };
