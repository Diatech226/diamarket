export default function ShipmentTimeline({ shipment = {} }) {
  const events = shipment.timeline || shipment.trackingUpdates || [];
  return <section className="dx-tracking-card"><h3>Timeline</h3>{events.length ? events.map((event, index) => <article key={`${event.timestamp || index}-${event.eventType || 'event'}`}><strong>{event.note || event.eventType || 'Shipment event'}</strong><p>{event.status || shipment.status} · {event.location || shipment.currentLocation || '—'}</p></article>) : <p>Aucun événement disponible.</p>}</section>;
}
