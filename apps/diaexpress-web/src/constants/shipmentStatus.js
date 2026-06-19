export const SHIPMENT_STATUS_FLOW = [
  { value: 'draft', label: 'Brouillon', badgeClass: 'bg-gray-100 text-gray-700', timelineLabel: 'Expédition en brouillon' },
  { value: 'created', label: 'Créé', badgeClass: 'bg-slate-100 text-slate-700', timelineLabel: 'Expédition créée' },
  { value: 'pending_dispatch', label: 'Dispatch attendu', badgeClass: 'bg-yellow-100 text-yellow-700', timelineLabel: 'En attente de dispatch' },
  { value: 'scheduled', label: 'Planifié', badgeClass: 'bg-purple-100 text-purple-700', timelineLabel: 'Départ planifié' },
  { value: 'picked_up', label: 'Collecté', badgeClass: 'bg-indigo-100 text-indigo-700', timelineLabel: 'Colis collecté' },
  { value: 'in_transit', label: 'En transit', badgeClass: 'bg-blue-100 text-blue-700', timelineLabel: 'Colis en route' },
  { value: 'at_hub', label: 'Au hub', badgeClass: 'bg-cyan-100 text-cyan-700', timelineLabel: 'Traitement en hub' },
  { value: 'out_for_delivery', label: 'En livraison', badgeClass: 'bg-indigo-100 text-indigo-700', timelineLabel: 'Dernier kilomètre en cours' },
  { value: 'delivered', label: 'Livré', badgeClass: 'bg-green-100 text-green-700', timelineLabel: 'Livraison effectuée' },
  { value: 'failed_delivery', label: 'Échec livraison', badgeClass: 'bg-red-100 text-red-700', timelineLabel: 'Tentative de livraison échouée' },
  { value: 'delayed', label: 'Retardé', badgeClass: 'bg-orange-100 text-orange-700', timelineLabel: 'Retard signalé' },
  { value: 'returned', label: 'Retourné', badgeClass: 'bg-red-100 text-red-700', timelineLabel: 'Retour expéditeur' },
  { value: 'cancelled', label: 'Annulé', badgeClass: 'bg-red-100 text-red-700', timelineLabel: 'Expédition annulée' },
];

const LEGACY_STATUS_ALIASES = {
  'En attente': 'pending_dispatch',
  'Préparation': 'created',
  'En transit': 'in_transit',
  'Bloqué douane': 'delayed',
  'Arrivé à destination': 'at_hub',
  'En livraison': 'out_for_delivery',
  'Livré': 'delivered',
  'Rejeté': 'cancelled',
};

export const normalizeShipmentStatus = (status) => LEGACY_STATUS_ALIASES[status] || status;

export const SHIPMENT_STATUS_MAP = SHIPMENT_STATUS_FLOW.reduce((acc, status) => {
  acc[status.value] = status;
  return acc;
}, {});

export const SHIPMENT_STATUS_OPTIONS = SHIPMENT_STATUS_FLOW.map(({ value, label }) => ({ value, label }));

export const getStatusBadgeClass = (status) =>
  SHIPMENT_STATUS_MAP[normalizeShipmentStatus(status)]?.badgeClass || 'bg-gray-100 text-gray-700';

export const getStatusIndex = (status) =>
  SHIPMENT_STATUS_FLOW.findIndex((item) => item.value === normalizeShipmentStatus(status));

export const formatStatusComment = (status) =>
  SHIPMENT_STATUS_MAP[normalizeShipmentStatus(status)]?.timelineLabel || status;

export const formatShipmentStatus = (status) =>
  SHIPMENT_STATUS_MAP[normalizeShipmentStatus(status)]?.label || status || 'Statut inconnu';
