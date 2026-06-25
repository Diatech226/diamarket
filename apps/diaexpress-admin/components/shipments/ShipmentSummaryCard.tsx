import { formatCurrency } from '@/src/lib/format';
import type { Shipment } from '@/src/types/logistics';

const read = (value: unknown, key: string) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined);

export function ShipmentSummaryCard({ shipment }: { shipment: Shipment }) {
  const origin = read(shipment.originSnapshot, 'label') || read(shipment.routeSnapshot, 'origin') || shipment.meta?.quote?.origin || shipment.origin || '—';
  const destination = read(shipment.destinationSnapshot, 'label') || read(shipment.routeSnapshot, 'destination') || shipment.meta?.quote?.destination || shipment.destination || '—';
  const transport = read(shipment.transportSnapshot, 'transportType') || shipment.meta?.quote?.transportType || shipment.carrier || shipment.provider || '—';
  const services = read(shipment.serviceSnapshot, 'services');
  return (
    <div className="panel">
      <div className="panel__title">Shipping Summary</div>
      <div className="summary-grid">
        <div><strong>Route</strong><p>{String(origin)} → {String(destination)}</p></div>
        <div><strong>Transport</strong><p>{String(transport)}</p></div>
        <div><strong>Poids facturé</strong><p>{shipment.billableWeight ?? shipment.weight ?? '—'} kg</p></div>
        <div><strong>Volume</strong><p>{String(shipment.volume ?? read(shipment.packageSnapshot, 'volume') ?? '—')} m³</p></div>
        <div><strong>Valeur</strong><p>{String(read(shipment.packageSnapshot, 'declaredValue') ?? '—')}</p></div>
        <div><strong>Prix validé</strong><p>{formatCurrency(shipment.priceAccepted, shipment.currency)}</p></div>
        <div><strong>Services</strong><p>{Array.isArray(services) ? services.join(', ') || '—' : '—'}</p></div>
        <div><strong>Source</strong><p>{String(shipment.source || shipment.meta?.source || 'manual')}</p></div>
      </div>
    </div>
  );
}
