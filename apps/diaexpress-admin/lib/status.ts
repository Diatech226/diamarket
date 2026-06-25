import type { Embarkment, Quote, Shipment } from '@/src/types/logistics';
import {
  EXPEDITION_STATUS_CONFIG,
  QUOTE_STATUS_CONFIG,
  SHIPMENT_STATUS_CONFIG,
} from '@/src/constants/logistics-status';

export type StatusConfig = { label: string; className: string };

export const quoteStatusConfig = QUOTE_STATUS_CONFIG;
export const shipmentStatusConfig = SHIPMENT_STATUS_CONFIG;
export const expeditionStatusConfig = EXPEDITION_STATUS_CONFIG;

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
export function resolveStatusLabel(status: string, config: Record<string, StatusConfig>) { return config[status]?.label ?? status; }
export function resolveStatusClass(status: string, config: Record<string, StatusConfig>) { return config[status]?.className ?? 'badge--muted'; }
