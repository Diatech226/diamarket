import { formatDate } from '@/src/lib/format';
import { resolveStatusLabel, shipmentStatusConfig } from '@/lib/status';
import type { Shipment } from '@/src/types/logistics';

export function ShipmentTimeline({ shipment }: { shipment: Shipment }) {
  const events = [...(shipment.timeline || shipment.trackingUpdates || [])].sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
  if (!events.length) return <div className="empty-state">Aucune timeline disponible.</div>;
  return (
    <div className="stack gap-3">
      {events.map((event, index) => (
        <div className="alert alert--info" key={`${event.timestamp || index}-${event.eventType || 'event'}`}>
          <strong>{event.note || event.eventType || 'Événement shipment'}</strong>
          <p>{resolveStatusLabel(event.status || shipment.status, shipmentStatusConfig)} · {event.location || shipment.currentLocation || '—'}</p>
          <p className="muted">{formatDate(event.timestamp)} · {event.actorLabel || event.source || 'system'}</p>
        </div>
      ))}
    </div>
  );
}
