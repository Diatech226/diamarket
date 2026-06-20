import type { MarketPoint, Quote, Shipment, ShipmentStatus } from '@/src/types/logistics';

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  'draft',
  'created',
  'awaiting_pickup',
  'awaiting_pickup',
  'picked_up',
  'in_transit',
  'at_origin_hub',
  'out_for_delivery',
  'delivered',
  'delivery_failed',
  'delayed',
  'returned',
  'cancelled',
];

export const PREPARED_HUBS = [
  { name: 'Ouagadougou', country: 'BF', status: 'active', capacity: 1200, coordinates: { lat: 12.3714, lng: -1.5197 } },
  { name: 'Bobo', country: 'BF', status: 'planned', capacity: 650, coordinates: { lat: 11.1771, lng: -4.2979 } },
  { name: 'Accra', country: 'GH', status: 'planned', capacity: 900, coordinates: { lat: 5.6037, lng: -0.187 } },
  { name: 'Abidjan', country: 'CI', status: 'planned', capacity: 1100, coordinates: { lat: 5.36, lng: -4.0083 } },
  { name: 'Montréal', country: 'CA', status: 'planned', capacity: 750, coordinates: { lat: 45.5019, lng: -73.5674 } },
] as const;

export function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function getQuoteMetrics(quotes: Quote[]) {
  return {
    today: quotes.filter((quote) => isToday(quote.createdAt || quote.createdAtOperational)).length,
    pending: quotes.filter((quote) => ['submitted', 'under_review', 'info_requested'].includes(quote.status)).length,
    approved: quotes.filter((quote) => ['approved'].includes(quote.status)).length,
    converted: quotes.filter((quote) => ['converted_to_shipment'].includes(quote.status) || Boolean(quote.shipmentId)).length,
  };
}

export function getShipmentMetrics(shipments: Shipment[]) {
  const trackingEvents = shipments.flatMap((shipment) => shipment.timeline?.length ? shipment.timeline : shipment.trackingUpdates || []);
  return {
    created: shipments.filter((shipment) => ['created', 'awaiting_pickup'].includes(shipment.status)).length,
    inTransit: shipments.filter((shipment) => ['picked_up', 'in_transit', 'at_origin_hub', 'out_for_delivery'].includes(shipment.status)).length,
    delivered: shipments.filter((shipment) => shipment.status === 'delivered').length,
    delayed: shipments.filter((shipment) => shipment.status === 'delayed').length,
    cancelled: shipments.filter((shipment) => shipment.status === 'cancelled').length,
    movementsToday: trackingEvents.filter((event) => isToday(event.timestamp)).length,
    anomalies: shipments.filter((shipment) => ['delayed', 'delivery_failed', 'returned', 'cancelled'].includes(shipment.status)).length,
  };
}

export function getOperationalKpis(shipments: Shipment[], revenue: number) {
  const delivered = shipments.filter((shipment) => shipment.status === 'delivered');
  const delayed = shipments.filter((shipment) => shipment.status === 'delayed');
  const deliveryDurations = delivered
    .map((shipment) => {
      const start = shipment.createdAt ? new Date(shipment.createdAt).getTime() : 0;
      const end = shipment.deliveredAt ? new Date(shipment.deliveredAt).getTime() : shipment.updatedAt ? new Date(shipment.updatedAt).getTime() : 0;
      return start && end && end >= start ? Math.round((end - start) / 86_400_000) : null;
    })
    .filter((value): value is number => typeof value === 'number');

  const averageDeliveryDays = deliveryDurations.length
    ? Math.round(deliveryDurations.reduce((sum, value) => sum + value, 0) / deliveryDurations.length)
    : 0;

  return {
    averageDeliveryDays,
    deliveryRate: shipments.length ? Math.round((delivered.length / shipments.length) * 100) : 0,
    delayRate: shipments.length ? Math.round((delayed.length / shipments.length) * 100) : 0,
    revenue,
  };
}

export function getShipmentSource(shipment: Shipment) {
  const raw = String(shipment.meta?.source || shipment.provider || '').toLowerCase();
  return raw.includes('diamarket') ? 'Diamarket' : 'DiaExpress';
}

export function buildAlerts(shipments: Shipment[], quotes: Quote[]) {
  const shipmentAlerts = shipments
    .filter((shipment) => ['delayed', 'delivery_failed'].includes(shipment.status))
    .map((shipment) => ({
      id: shipment._id,
      priority: shipment.status === 'delivery_failed' ? 'Critique' : 'Important',
      type: shipment.status === 'delivery_failed' ? 'Livraison échouée' : 'Retard',
      subject: shipment.trackingCode,
      detail: `${shipment.origin || shipment.meta?.quote?.origin || '—'} → ${shipment.destination || shipment.meta?.quote?.destination || '—'}`,
      date: shipment.updatedAt,
    }));

  const staleTrackingAlerts = shipments
    .filter((shipment) => !shipment.updatedAt || Date.now() - new Date(shipment.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 3)
    .slice(0, 8)
    .map((shipment) => ({
      id: `stale-${shipment._id}`,
      priority: 'Normal',
      type: 'Tracking bloqué',
      subject: shipment.trackingCode,
      detail: 'Aucun mouvement récent détecté',
      date: shipment.updatedAt,
    }));

  const paymentAlerts = quotes
    .filter((quote) => quote.paymentStatus === 'pending' || ['approved'].includes(quote.status))
    .slice(0, 8)
    .map((quote) => ({
      id: `payment-${quote._id}`,
      priority: 'Important',
      type: 'Paiement en attente',
      subject: quote._id,
      detail: `${quote.origin || '—'} → ${quote.destination || '—'}`,
      date: quote.updatedAt || quote.createdAt,
    }));

  return [...shipmentAlerts, ...staleTrackingAlerts, ...paymentAlerts];
}

export function mergePreparedHubs(marketPoints: MarketPoint[], shipments: Shipment[]) {
  return PREPARED_HUBS.map((hub) => {
    const matchingPoint = marketPoints.find((point) => [point.name, point.label, point.city].some((value) => value?.toLowerCase().includes(hub.name.toLowerCase())));
    const volume = shipments.filter((shipment) => String(shipment.currentLocation || shipment.origin || shipment.destination || '').toLowerCase().includes(hub.name.toLowerCase())).length;
    return {
      ...hub,
      id: matchingPoint?._id || hub.name,
      status: matchingPoint?.isActive ? 'active' : hub.status,
      volume,
    };
  });
}
