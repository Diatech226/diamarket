export default function ShipmentReferenceCard({ shipment = {} }) {
  return <section className="dx-tracking-card"><h3>Shipment Reference</h3><p><strong>{shipment.shipmentReference || shipment.trackingCode || '—'}</strong></p><p>Quote source: {typeof shipment.quoteId === 'string' ? shipment.quoteId : shipment.quoteId?._id || '—'}</p></section>;
}
