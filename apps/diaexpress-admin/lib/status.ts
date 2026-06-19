import type { Embarkment, Expedition, Quote, Shipment } from '@/src/types/logistics';

export type StatusConfig = {
  label: string;
  className: string;
};

export const quoteStatusConfig: Record<string, StatusConfig> = {
  requested: { label: 'Demandé', className: 'badge--warning' },
  pending: { label: 'En attente', className: 'badge--warning' },
  under_review: { label: 'En revue', className: 'badge--info' },
  info_requested: { label: 'Infos demandées', className: 'badge--orange' },
  approved: { label: 'Approuvé', className: 'badge--success' },
  confirmed: { label: 'Confirmé', className: 'badge--success' },
  rejected: { label: 'Rejeté', className: 'badge--danger' },
  ready_for_shipment: { label: 'Prêt expédition', className: 'badge--primary' },
  converted_to_shipment: { label: 'Converti shipment', className: 'badge--secondary' },
  dispatched: { label: 'Expédié', className: 'badge--info' },
  cancelled: { label: 'Annulé', className: 'badge--danger' },
};

export const shipmentStatusConfig: Record<Shipment['status'], StatusConfig> = {
  draft: { label: 'Brouillon', className: 'badge--muted' },
  created: { label: 'Créé', className: 'badge--primary' },
  pending_dispatch: { label: 'En attente dispatch', className: 'badge--warning' },
  scheduled: { label: 'Planifié', className: 'badge--secondary' },
  picked_up: { label: 'Collecté', className: 'badge--primary' },
  in_transit: { label: 'En transit', className: 'badge--info' },
  delayed: { label: 'Retardé', className: 'badge--orange' },
  at_hub: { label: 'Au hub', className: 'badge--secondary' },
  out_for_delivery: { label: 'En livraison', className: 'badge--info' },
  delivered: { label: 'Livré', className: 'badge--success' },
  failed_delivery: { label: 'Échec livraison', className: 'badge--danger' },
  returned: { label: 'Retourné', className: 'badge--danger' },
  cancelled: { label: 'Annulé', className: 'badge--danger' },
};

export const embarkmentStatusConfig: Record<NonNullable<Embarkment['status']>, StatusConfig> = {
  planned: { label: 'Planifié', className: 'badge--warning' },
  booking_open: { label: 'Ouvert', className: 'badge--primary' },
  open: { label: 'Ouvert', className: 'badge--primary' },
  closed: { label: 'Clôturé', className: 'badge--secondary' },
  completed: { label: 'Terminé', className: 'badge--success' },
  cancelled: { label: 'Annulé', className: 'badge--danger' },
};

export const paymentStatusConfig: Record<string, StatusConfig> = {
  pending: { label: 'En attente', className: 'badge--warning' },
  processing: { label: 'En traitement', className: 'badge--info' },
  succeeded: { label: 'Réussi', className: 'badge--success' },
  failed: { label: 'Échec', className: 'badge--danger' },
};

export const expeditionStatusConfig: Record<Expedition['status'], StatusConfig> = {
  pending: { label: 'En attente', className: 'badge--warning' },
  scheduled: { label: 'Programmé', className: 'badge--secondary' },
  in_transit: { label: 'En transit', className: 'badge--info' },
  delivered: { label: 'Livré', className: 'badge--success' },
  cancelled: { label: 'Annulé', className: 'badge--danger' },
};

export function resolveStatusLabel(status: string, config: Record<string, StatusConfig>) {
  return config[status]?.label ?? status;
}

export function resolveStatusClass(status: string, config: Record<string, StatusConfig>) {
  return config[status]?.className ?? 'badge--muted';
}
