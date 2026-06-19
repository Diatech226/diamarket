import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/src/lib/format';
import { buildAlerts, getOperationalKpis, getQuoteMetrics, getShipmentMetrics, getShipmentSource, mergePreparedHubs } from '@/src/lib/operations';
import type { MarketPoint, Quote, Shipment } from '@/src/types/logistics';

type Props = { title: string; description: string; quotes: Quote[]; shipments: Shipment[]; revenue?: number; marketPoints?: MarketPoint[]; mode?: 'dashboard' | 'operations' | 'hubs' | 'alerts' | 'reports' };

export function OperationsOverview({ title, description, quotes, shipments, revenue = 0, marketPoints = [], mode = 'dashboard' }: Props) {
  const quoteMetrics = getQuoteMetrics(quotes);
  const shipmentMetrics = getShipmentMetrics(shipments);
  const kpis = getOperationalKpis(shipments, revenue);
  const alerts = buildAlerts(shipments, quotes);
  const hubs = mergePreparedHubs(marketPoints, shipments);

  return <div className="page-stack">
    <PageHeader title={title} description={description} breadcrumbs={[{ label: 'Ops', href: '/admin' }, { label: title }]} />
    <div className="status-grid operations-kpi-grid">
      {[
        ['Quotes aujourd’hui', quoteMetrics.today], ['Quotes en attente', quoteMetrics.pending], ['Quotes approuvés', quoteMetrics.approved], ['Quotes convertis', quoteMetrics.converted],
        ['Shipments créés', shipmentMetrics.created], ['En transit', shipmentMetrics.inTransit], ['Livrés', shipmentMetrics.delivered], ['Retardés', shipmentMetrics.delayed], ['Annulés', shipmentMetrics.cancelled],
        ['Mouvements aujourd’hui', shipmentMetrics.movementsToday], ['Anomalies', shipmentMetrics.anomalies], ['Revenus', formatCurrency(kpis.revenue)],
      ].map(([label, value]) => <div key={label} className="stat-card"><p>{label}</p><strong>{value}</strong></div>)}
    </div>
    <div className="layout-panels">
      <div className="panel"><div className="panel__header"><div><div className="panel__title">Centre expéditions</div><p className="panel__muted">Tracking, client, route, transport, statut, date et source.</p></div><Link className="button button--ghost" href="/admin/operations">Ouvrir</Link></div><div className="table-wrapper"><table className="table-preview"><thead><tr><th>Tracking</th><th>Client</th><th>Origine</th><th>Destination</th><th>Transport</th><th>Statut</th><th>Date</th><th>Source</th></tr></thead><tbody>{shipments.slice(0, mode === 'operations' ? 20 : 8).map((shipment) => <tr key={shipment._id}><td className="mono">{shipment.trackingCode}</td><td>{shipment.meta?.customerName || shipment.meta?.customerEmail || shipment.meta?.quote?.userEmail || '—'}</td><td>{shipment.origin || shipment.meta?.quote?.origin || '—'}</td><td>{shipment.destination || shipment.meta?.quote?.destination || '—'}</td><td>{shipment.carrier || shipment.provider || shipment.meta?.quote?.transportType || '—'}</td><td>{shipment.status}</td><td>{formatDate(shipment.updatedAt || shipment.createdAt)}</td><td>{getShipmentSource(shipment)}</td></tr>)}</tbody></table></div></div>
      <div className="panel"><div className="panel__title">KPI performance</div><div className="operations-score"><strong>{kpis.averageDeliveryDays} j</strong><span>Temps moyen livraison</span></div><div className="operations-score"><strong>{kpis.deliveryRate}%</strong><span>Taux livraison</span></div><div className="operations-score"><strong>{kpis.delayRate}%</strong><span>Taux retard</span></div></div>
    </div>
    <div className="layout-panels">
      <div className="panel"><div className="panel__header"><div><div className="panel__title">Hubs logistiques</div><p className="panel__muted">Capacité, statut et volume traité.</p></div><Link className="button button--ghost" href="/admin/hubs">Hubs</Link></div><div className="hub-grid">{hubs.map((hub) => <div className="hub-card" key={hub.name}><strong>{hub.name}</strong><Badge>{hub.status}</Badge><span>Capacité {hub.capacity}</span><span>Volume {hub.volume}</span></div>)}</div></div>
      <div className="panel"><div className="panel__header"><div><div className="panel__title">Alertes</div><p className="panel__muted">Retards, tracking bloqué, livraison échouée, paiement.</p></div><Link className="button button--ghost" href="/admin/alerts">Alertes</Link></div><div className="stack gap-3">{alerts.slice(0, mode === 'alerts' ? 20 : 6).map((alert) => <div className="alert-row" key={alert.id}><Badge>{alert.priority}</Badge><strong>{alert.type}</strong><span>{alert.subject}</span><small>{alert.detail}</small></div>)}</div></div>
    </div>
    <div className="panel"><div className="panel__header"><div><div className="panel__title">Shipment Location Layer</div><p className="panel__muted">Architecture prête pour géolocalisation tracking + hubs sans carte réelle.</p></div></div><div className="location-layer">{hubs.map((hub) => <span key={hub.name}>{hub.name} · {hub.coordinates.lat}, {hub.coordinates.lng}</span>)}</div></div>
  </div>;
}
