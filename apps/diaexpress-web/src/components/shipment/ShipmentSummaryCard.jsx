export default function ShipmentSummaryCard({ shipment = {} }) {
  const origin = shipment.originSnapshot?.label || shipment.routeSnapshot?.origin || shipment.meta?.quote?.origin || shipment.origin || '—';
  const destination = shipment.destinationSnapshot?.label || shipment.routeSnapshot?.destination || shipment.meta?.quote?.destination || shipment.destination || '—';
  return <section className="dx-tracking-card"><h3>Shipping Summary</h3><p>{origin} → {destination}</p><p>Tracking: <strong>{shipment.trackingCode || shipment.shipmentReference || '—'}</strong></p><p>Status: {shipment.status || 'created'}</p></section>;
}
