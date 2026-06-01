import { SHIPMENT_STATUS_MAP } from './shipmentStatus';

const QUOTE_STATUS_META = {
  pending: { label: 'En attente', tone: 'warning', progress: 15 },
  approved: { label: 'Approuvé', tone: 'info', progress: 35 },
  processing: { label: 'En traitement', tone: 'info', progress: 50 },
  converted: { label: 'Converti en expédition', tone: 'success', progress: 75 },
  cancelled: { label: 'Annulé', tone: 'danger', progress: 100 },
};

export const getQuoteStatusMeta = (quote, hasShipment) => {
  const normalized = String(quote?.status || '').toLowerCase();
  if (hasShipment) {
    return { key: 'converted', ...QUOTE_STATUS_META.converted };
  }
  if (QUOTE_STATUS_META[normalized]) {
    return { key: normalized, ...QUOTE_STATUS_META[normalized] };
  }
  return { key: 'pending', ...QUOTE_STATUS_META.pending };
};

export const getShipmentStatusMeta = (status) => {
  const key = String(status || '').toLowerCase();
  const flowMeta = SHIPMENT_STATUS_MAP[key] || { label: key || '—' };
  const tone = ['delivered'].includes(key)
    ? 'success'
    : ['cancelled', 'failed_delivery', 'returned'].includes(key)
    ? 'danger'
    : ['pending_dispatch', 'delayed'].includes(key)
    ? 'warning'
    : 'info';

  const progressByStatus = {
    created: 10,
    pending_dispatch: 20,
    scheduled: 35,
    in_transit: 55,
    delayed: 55,
    at_hub: 70,
    out_for_delivery: 85,
    delivered: 100,
    failed_delivery: 100,
    returned: 100,
    cancelled: 100,
  };

  return {
    key,
    label: flowMeta.label || key,
    timelineLabel: flowMeta.timelineLabel || key,
    tone,
    progress: progressByStatus[key] ?? 0,
  };
};

export const formatLogisticsDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
