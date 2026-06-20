import Link from 'next/link';
import type { Shipment } from '@/src/types/logistics';

export function ShipmentReferenceCard({ shipment }: { shipment: Shipment }) {
  const quoteId = typeof shipment.quoteId === 'string' ? shipment.quoteId : shipment.quoteId?._id;
  return (
    <div className="stat-card">
      <p>Références</p>
      <strong className="mono">{shipment.shipmentReference || shipment.trackingCode}</strong>
      <p className="muted">Tracking {shipment.trackingCode}</p>
      {quoteId ? <Link href={`/admin/quotes/${quoteId}`} className="button button--ghost">Ouvrir le quote source</Link> : null}
    </div>
  );
}
