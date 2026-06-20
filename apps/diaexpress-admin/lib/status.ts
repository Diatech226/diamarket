import type { Embarkment, Expedition, Quote, Shipment } from '@/src/types/logistics';

export type StatusConfig = { label: string; className: string };

export const quoteStatusConfig: Record<string, StatusConfig> = {
  draft: { label: 'Brouillon', className: 'badge--muted' },
  submitted: { label: 'Demande envoyée', className: 'badge--info' },
  under_review: { label: 'En cours d’étude', className: 'badge--orange' },
  info_requested: { label: 'Informations demandées', className: 'badge--secondary' },
  priced: { label: 'Prix proposé', className: 'badge--primary' },
  approved: { label: 'Devis approuvé', className: 'badge--success' },
  rejected: { label: 'Devis refusé', className: 'badge--danger' },
  expired: { label: 'Devis expiré', className: 'badge--muted' },
  converted_to_shipment: { label: 'Expédition créée', className: 'badge--success' },
  cancelled: { label: 'Devis annulé', className: 'badge--muted' },
};

export const shipmentStatusConfig: Record<Shipment['status'], StatusConfig> = {
  created: { label: 'Expédition créée', className: 'badge--primary' },
  awaiting_pickup: { label: 'En attente de collecte', className: 'badge--orange' },
  picked_up: { label: 'Colis collecté', className: 'badge--info' },
  at_origin_hub: { label: 'Au hub d’origine', className: 'badge--violet' },
  in_transit: { label: 'En transit', className: 'badge--primary' },
  at_destination_hub: { label: 'Au hub de destination', className: 'badge--violet' },
  out_for_delivery: { label: 'En livraison', className: 'badge--orange' },
  delivered: { label: 'Livré', className: 'badge--success' },
  delivery_failed: { label: 'Livraison échouée', className: 'badge--danger' },
  returned: { label: 'Retourné', className: 'badge--secondary' },
  cancelled: { label: 'Expédition annulée', className: 'badge--muted' },
  delayed: { label: 'Retardé', className: 'badge--orange' },
};

export const QUOTE_TRANSITIONS: Record<string, string[]> = {
  draft: ['submitted', 'cancelled'], submitted: ['under_review', 'cancelled', 'expired'], under_review: ['info_requested', 'priced', 'rejected', 'expired'], info_requested: ['submitted', 'under_review', 'cancelled', 'expired'], priced: ['approved', 'rejected', 'expired'], approved: ['converted_to_shipment', 'cancelled', 'expired'], rejected: [], expired: [], converted_to_shipment: [], cancelled: [],
};
export const SHIPMENT_TRANSITIONS: Record<string, string[]> = {
  created: ['awaiting_pickup', 'cancelled'], awaiting_pickup: ['picked_up', 'cancelled', 'delayed'], picked_up: ['at_origin_hub', 'in_transit', 'delayed'], at_origin_hub: ['in_transit', 'delayed', 'cancelled'], in_transit: ['at_destination_hub', 'delayed', 'returned'], at_destination_hub: ['out_for_delivery', 'delayed', 'returned'], out_for_delivery: ['delivered', 'delivery_failed', 'delayed'], delivered: [], delivery_failed: ['out_for_delivery', 'returned', 'delayed', 'cancelled'], returned: [], cancelled: [], delayed: ['awaiting_pickup', 'picked_up', 'at_origin_hub', 'in_transit', 'at_destination_hub', 'out_for_delivery', 'returned', 'cancelled'],
};
export const getAvailableQuoteActions = (status: Quote['status']) => QUOTE_TRANSITIONS[status] || [];
export const getAvailableShipmentActions = (status: Shipment['status']) => SHIPMENT_TRANSITIONS[status] || [];

export const embarkmentStatusConfig: Record<NonNullable<Embarkment['status']>, StatusConfig> = { planned: { label: 'Planifié', className: 'badge--warning' }, booking_open: { label: 'Ouvert', className: 'badge--primary' }, open: { label: 'Ouvert', className: 'badge--primary' }, closed: { label: 'Clôturé', className: 'badge--secondary' }, completed: { label: 'Terminé', className: 'badge--success' }, cancelled: { label: 'Annulé', className: 'badge--muted' } };
export const paymentStatusConfig: Record<string, StatusConfig> = { pending: { label: 'En attente', className: 'badge--warning' }, processing: { label: 'En traitement', className: 'badge--info' }, succeeded: { label: 'Réussi', className: 'badge--success' }, failed: { label: 'Échec', className: 'badge--danger' } };
export const expeditionStatusConfig: Record<Expedition['status'], StatusConfig> = { pending: { label: 'En attente', className: 'badge--warning' }, scheduled: { label: 'Programmé', className: 'badge--secondary' }, in_transit: { label: 'En transit', className: 'badge--primary' }, delivered: { label: 'Livré', className: 'badge--success' }, cancelled: { label: 'Annulé', className: 'badge--muted' } };
export function resolveStatusLabel(status: string, config: Record<string, StatusConfig>) { return config[status]?.label ?? status; }
export function resolveStatusClass(status: string, config: Record<string, StatusConfig>) { return config[status]?.className ?? 'badge--muted'; }
