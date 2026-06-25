import type { ExpeditionStatus, QuoteStatus, ShipmentStatus } from '@/src/types/logistics';

export type LogisticsStatusConfig = { label: string; className: string };

export const QUOTE_STATUS_OPTIONS = [
  'draft',
  'submitted',
  'under_review',
  'info_requested',
  'priced',
  'approved',
  'rejected',
  'expired',
  'converted_to_shipment',
  'cancelled',
] as const satisfies readonly QuoteStatus[];

export const SHIPMENT_STATUS_OPTIONS = [
  'created',
  'awaiting_pickup',
  'picked_up',
  'at_origin_hub',
  'in_transit',
  'at_destination_hub',
  'out_for_delivery',
  'delivered',
  'delivery_failed',
  'returned',
  'cancelled',
  'delayed',
] as const satisfies readonly ShipmentStatus[];

export const EXPEDITION_STATUS_OPTIONS = [
  'pending',
  'awaiting_pickup',
  'in_transit',
  'delivered',
  'cancelled',
] as const satisfies readonly ExpeditionStatus[];

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, LogisticsStatusConfig> = {
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

export const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, LogisticsStatusConfig> = {
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

export const EXPEDITION_STATUS_CONFIG: Record<ExpeditionStatus, LogisticsStatusConfig> = {
  pending: { label: 'En attente', className: 'badge--warning' },
  awaiting_pickup: { label: 'En attente de collecte', className: 'badge--orange' },
  in_transit: { label: 'En transit', className: 'badge--primary' },
  delivered: { label: 'Livré', className: 'badge--success' },
  cancelled: { label: 'Annulé', className: 'badge--muted' },
};

export const STATUS_LABELS = Object.fromEntries(
  Object.entries({ ...QUOTE_STATUS_CONFIG, ...SHIPMENT_STATUS_CONFIG, ...EXPEDITION_STATUS_CONFIG }).map(([status, config]) => [status, config.label])
) as Record<QuoteStatus | ShipmentStatus | ExpeditionStatus, string>;

export const STATUS_COLORS: Record<QuoteStatus | ShipmentStatus | ExpeditionStatus, string> = Object.fromEntries(
  Object.entries({ ...QUOTE_STATUS_CONFIG, ...SHIPMENT_STATUS_CONFIG, ...EXPEDITION_STATUS_CONFIG }).map(([status, config]) => [status, config.className])
) as Record<QuoteStatus | ShipmentStatus | ExpeditionStatus, string>;

const LEGACY_EXPEDITION_STATUS_MAP: Partial<Record<string, ExpeditionStatus>> = {
  scheduled: 'pending',
  pending_dispatch: 'pending',
  failed_delivery: 'cancelled',
};

export function normalizeExpeditionStatus(status: string | null | undefined): ExpeditionStatus {
  if (EXPEDITION_STATUS_OPTIONS.includes(status as ExpeditionStatus)) return status as ExpeditionStatus;
  return LEGACY_EXPEDITION_STATUS_MAP[status ?? ''] ?? 'pending';
}
