import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { BackendOffline } from '@/components/system/backend-offline';
import { fetchShipmentById } from '@/src/services/api/logisticsShipments';
import { ApiError } from '@/lib/api/client';
import { formatDate } from '@/src/lib/format';
import { resolveStatusLabel, shipmentStatusConfig } from '@/lib/status';

export default async function ShipmentDetailPage({ params }: { params: { id: string } }) {
  try {
    const shipment = await fetchShipmentById(params.id);
    const routeLabel =
      shipment.meta?.quote?.origin && shipment.meta?.quote?.destination
        ? `${shipment.meta.quote.origin} → ${shipment.meta.quote.destination}`
        : `${shipment.origin || '—'} → ${shipment.destination || '—'}`;

    const timeline = [...(shipment.timeline || shipment.trackingUpdates || [])].sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });

    return (
      <div className="page-stack">
        <PageHeader title={`Shipment ${shipment.trackingCode}`} description="Fiche opérationnelle shipment" />

        <div className="status-grid">
          <div className="stat-card"><p>Statut</p><strong>{resolveStatusLabel(shipment.status, shipmentStatusConfig)}</strong></div>
          <div className="stat-card"><p>Route</p><strong>{routeLabel}</strong></div>
          <div className="stat-card"><p>Quote source</p><strong className="mono">{shipment.quoteId || '—'}</strong></div>
          <div className="stat-card"><p>Dernière MAJ</p><strong>{formatDate(shipment.updatedAt)}</strong></div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div>
              <div className="panel__title">Données opérationnelles</div>
              <p className="panel__muted">Provider, localisation, ETA et assignation.</p>
            </div>
            <div className="panel__actions">
              <Link href="/admin/shipments" className="button button--ghost">Retour Shipments</Link>
            </div>
          </div>
          <div className="summary-grid">
            <div><strong>Provider</strong><p>{shipment.provider || 'internal'}</p></div>
            <div><strong>Current location</strong><p>{shipment.currentLocation || '—'}</p></div>
            <div><strong>ETA</strong><p>{formatDate(shipment.estimatedDelivery)}</p></div>
            <div><strong>Embarkment</strong><p className="mono">{shipment.embarkmentId || '—'}</p></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__title">Timeline</div>
          {timeline.length ? (
            <div className="stack gap-3">
              {timeline.map((event, idx) => (
                <div key={`${event.timestamp || idx}-${event.eventType || idx}`} className="alert alert--info">
                  <strong>{event.eventType || 'status_update'}</strong>
                  <p>{resolveStatusLabel(event.status || shipment.status, shipmentStatusConfig)} · {event.location || shipment.currentLocation || '—'}</p>
                  <p className="muted">{formatDate(event.timestamp)} · {event.note || 'Sans note'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucun événement de tracking.</div>
          )}
        </div>

        <div className="panel">
          <div className="panel__title">Notes</div>
          <div className="empty-state">Les notes opérationnelles sont gérées via le drawer de la page Shipments.</div>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="page-stack">
        <PageHeader title="Shipment indisponible" description="Impossible de charger ce détail pour le moment." />
        <BackendOffline message={(error as Error).message} />
      </div>
    );
  }
}
