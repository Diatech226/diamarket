export const QUOTE_STATUSES = {
  requested: ['Demandé', 'info'], under_review: ['En revue', 'warning'], info_requested: ['Infos requises', 'warning'], approved: ['Approuvé', 'success'], rejected: ['Rejeté', 'danger'], ready_for_shipment: ['Prêt expédition', 'success'], converted_to_shipment: ['Converti', 'success'], cancelled: ['Annulé', 'danger'],
};
export const SHIPMENT_STATUSES = {
  draft: ['Brouillon', 'neutral'], created: ['Créé', 'info'], pending_dispatch: ['Dispatch attendu', 'warning'], scheduled: ['Planifié', 'info'], picked_up: ['Pris en charge', 'info'], in_transit: ['En transit', 'info'], at_hub: ['Hub', 'warning'], out_for_delivery: ['En livraison', 'warning'], delivered: ['Livré', 'success'], failed_delivery: ['Échec livraison', 'danger'], delayed: ['Retardé', 'warning'], returned: ['Retourné', 'danger'], cancelled: ['Annulé', 'danger'],
};
export const labelFor = (map, status) => map[String(status || '').toLowerCase()]?.[0] || status || 'Inconnu';
export const toneFor = (map, status) => map[String(status || '').toLowerCase()]?.[1] || 'neutral';
export const StatusPill = ({ type = 'shipment', status }) => {
  const map = type === 'quote' ? QUOTE_STATUSES : SHIPMENT_STATUSES;
  return <span className={`dx-status dx-status--${toneFor(map, status)}`}>{labelFor(map, status)}</span>;
};
export const shipmentMilestones = ['created', 'picked_up', 'in_transit', 'at_hub', 'out_for_delivery', 'delivered'];
export const quoteStatusOptions = Object.keys(QUOTE_STATUSES);
export const shipmentStatusOptions = Object.keys(SHIPMENT_STATUSES);
