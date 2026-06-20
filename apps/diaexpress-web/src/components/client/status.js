export const QUOTE_STATUSES = {
  draft: ['Brouillon', 'neutral'], submitted: ['Demande envoyée', 'info'], under_review: ['En cours d’étude', 'warning'], info_requested: ['Informations demandées', 'warning'], priced: ['Prix proposé', 'info'], approved: ['Devis approuvé', 'success'], rejected: ['Devis refusé', 'danger'], expired: ['Devis expiré', 'neutral'], converted_to_shipment: ['Expédition créée', 'success'], cancelled: ['Devis annulé', 'danger'],
};
export const SHIPMENT_STATUSES = {
  created: ['Expédition créée', 'info'], awaiting_pickup: ['En attente de collecte', 'warning'], picked_up: ['Colis collecté', 'info'], at_origin_hub: ['Au hub d’origine', 'warning'], in_transit: ['En transit', 'info'], at_destination_hub: ['Au hub de destination', 'warning'], out_for_delivery: ['En livraison', 'warning'], delivered: ['Livré', 'success'], delivery_failed: ['Livraison échouée', 'danger'], delayed: ['Retardé', 'warning'], returned: ['Retourné', 'danger'], cancelled: ['Expédition annulée', 'danger'],
};
export const labelFor = (map, status) => map[String(status || '').toLowerCase()]?.[0] || status || 'Inconnu';
export const toneFor = (map, status) => map[String(status || '').toLowerCase()]?.[1] || 'neutral';
export const StatusPill = ({ type = 'shipment', status }) => {
  const map = type === 'quote' ? QUOTE_STATUSES : SHIPMENT_STATUSES;
  return <span className={`dx-status dx-status--${toneFor(map, status)}`}>{labelFor(map, status)}</span>;
};
export const shipmentMilestones = ['created', 'awaiting_pickup', 'picked_up', 'at_origin_hub', 'in_transit', 'at_destination_hub', 'out_for_delivery', 'delivered'];
export const quoteStatusOptions = Object.keys(QUOTE_STATUSES);
export const shipmentStatusOptions = Object.keys(SHIPMENT_STATUSES);
