import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { BackendOffline } from '@/components/system/backend-offline';
import { fetchShipmentById } from '@/src/services/api/logisticsShipments';
import { ApiError } from '@/lib/api/client';
import { formatDate } from '@/src/lib/format';
import { ShipmentReferenceCard } from '@/components/shipments/ShipmentReferenceCard';
import { ShipmentSummaryCard } from '@/components/shipments/ShipmentSummaryCard';
import { ShipmentTimeline } from '@/components/shipments/ShipmentTimeline';
import { resolveStatusLabel, shipmentStatusConfig } from '@/lib/status';

export default async function ShipmentDetailPage({ params }: { params: { id: string } }) {
  try {
    const shipment = await fetchShipmentById(params.id);
    const routeLabel =
      shipment.meta?.quote?.origin && shipment.meta?.quote?.destination
        ? `${shipment.meta.quote.origin} → ${shipment.meta.quote.destination}`
        : `${shipment.origin || '—'} → ${shipment.destination || '—'}`;


    return (
      <div className="page-stack">
        <PageHeader title={`Shipment ${shipment.trackingCode}`} description="Fiche opérationnelle shipment" />

        <div className="status-grid">
          <div className="stat-card"><p>Statut</p><strong>{resolveStatusLabel(shipment.status, shipmentStatusConfig)}</strong></div>
          <div className="stat-card"><p>Route</p><strong>{routeLabel}</strong></div>
          <ShipmentReferenceCard shipment={shipment} />
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

        <ShipmentSummaryCard shipment={shipment} />

        <div className="panel">
          <div className="panel__title">Timeline</div>
          <ShipmentTimeline shipment={shipment} />
        </div>

        <div className="panel">
          <div className="panel__title">Documents · Proofs · Notifications</div>
          <div className="summary-grid">
            <div><strong>Documents</strong><p>Upload, visibilité client/admin/public et suppression via API admin.</p></div>
            <div><strong>Proofs</strong><p>Preuves de collecte et livraison avec photo, signature, agent, date et localisation.</p></div>
            <div><strong>Notifications</strong><p>Historique notifications shipment relié aux changements de statut.</p></div>
          </div>
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
