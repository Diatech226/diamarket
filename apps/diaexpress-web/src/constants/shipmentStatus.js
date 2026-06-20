export const SHIPMENT_STATUS_FLOW = [
  { value: 'created', label: 'Expédition créée', badgeClass: 'bg-cyan-100 text-cyan-900', timelineLabel: 'Expédition créée' },
  { value: 'awaiting_pickup', label: 'En attente de collecte', badgeClass: 'bg-orange-100 text-orange-900', timelineLabel: 'Collecte ou dépôt attendu' },
  { value: 'picked_up', label: 'Colis collecté', badgeClass: 'bg-sky-100 text-sky-900', timelineLabel: 'Colis collecté' },
  { value: 'at_origin_hub', label: 'Au hub d’origine', badgeClass: 'bg-violet-100 text-violet-900', timelineLabel: 'Traitement au hub d’origine' },
  { value: 'in_transit', label: 'En transit', badgeClass: 'bg-blue-950 text-white', timelineLabel: 'Colis en transit' },
  { value: 'at_destination_hub', label: 'Au hub de destination', badgeClass: 'bg-violet-100 text-violet-900', timelineLabel: 'Arrivé au hub de destination' },
  { value: 'out_for_delivery', label: 'En livraison', badgeClass: 'bg-orange-100 text-orange-900', timelineLabel: 'Dernier kilomètre en cours' },
  { value: 'delivered', label: 'Livré', badgeClass: 'bg-green-100 text-green-700', timelineLabel: 'Livraison effectuée' },
  { value: 'delivery_failed', label: 'Livraison échouée', badgeClass: 'bg-red-100 text-red-700', timelineLabel: 'Tentative de livraison échouée' },
  { value: 'delayed', label: 'Retardé', badgeClass: 'bg-orange-100 text-orange-700', timelineLabel: 'Retard signalé' },
  { value: 'returned', label: 'Retourné', badgeClass: 'bg-stone-200 text-stone-900', timelineLabel: 'Retour expéditeur' },
  { value: 'cancelled', label: 'Expédition annulée', badgeClass: 'bg-gray-200 text-gray-800', timelineLabel: 'Expédition annulée' },
];
const LEGACY_STATUS_ALIASES = { draft: 'created', pending_dispatch: 'awaiting_pickup', scheduled: 'awaiting_pickup', at_hub: 'at_origin_hub', failed_delivery: 'delivery_failed' };
export const normalizeShipmentStatus = (status) => LEGACY_STATUS_ALIASES[status] || status;
export const SHIPMENT_STATUS_MAP = SHIPMENT_STATUS_FLOW.reduce((acc, status) => { acc[status.value] = status; return acc; }, {});
export const SHIPMENT_STATUS_OPTIONS = SHIPMENT_STATUS_FLOW.map(({ value, label }) => ({ value, label }));
export const getStatusBadgeClass = (status) => SHIPMENT_STATUS_MAP[normalizeShipmentStatus(status)]?.badgeClass || 'bg-gray-100 text-gray-700';
export const getStatusIndex = (status) => SHIPMENT_STATUS_FLOW.findIndex((item) => item.value === normalizeShipmentStatus(status));
export const formatStatusComment = (status) => SHIPMENT_STATUS_MAP[normalizeShipmentStatus(status)]?.timelineLabel || status;
export const formatShipmentStatus = (status) => SHIPMENT_STATUS_MAP[normalizeShipmentStatus(status)]?.label || status || 'Statut inconnu';
