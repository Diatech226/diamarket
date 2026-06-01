export const SHIPMENT_STATUS_FLOW = [
  { value: 'created', label: 'Créé', timelineLabel: 'Shipment créé' },
  { value: 'pending_dispatch', label: 'En attente dispatch', timelineLabel: 'En attente de dispatch' },
  { value: 'scheduled', label: 'Planifié', timelineLabel: 'Départ planifié' },
  { value: 'in_transit', label: 'En transit', timelineLabel: 'En transit' },
  { value: 'delayed', label: 'Retardé', timelineLabel: 'Retard opérationnel' },
  { value: 'at_hub', label: 'Au hub', timelineLabel: 'Arrivé au hub' },
  { value: 'out_for_delivery', label: 'En livraison', timelineLabel: 'Sorti pour livraison' },
  { value: 'delivered', label: 'Livré', timelineLabel: 'Livraison effectuée' },
  { value: 'failed_delivery', label: 'Échec livraison', timelineLabel: 'Livraison échouée' },
  { value: 'returned', label: 'Retourné', timelineLabel: 'Colis retourné' },
  { value: 'cancelled', label: 'Annulé', timelineLabel: 'Shipment annulé' },
];

export const SHIPMENT_STATUS_MAP = SHIPMENT_STATUS_FLOW.reduce((acc, status) => {
  acc[status.value] = status;
  return acc;
}, {});

export const SHIPMENT_STATUS_OPTIONS = SHIPMENT_STATUS_FLOW.map(({ value, label }) => ({ value, label }));

export const getStatusIndex = (status) => SHIPMENT_STATUS_FLOW.findIndex((item) => item.value === status);

export const formatStatusComment = (status) => SHIPMENT_STATUS_MAP[status]?.timelineLabel || status;
