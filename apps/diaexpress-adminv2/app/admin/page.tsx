import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { BackendOffline } from '@/components/system/backend-offline';
import { formatCurrency, formatDate, toTitle } from '@/src/lib/format';
import { fetchDashboardSnapshot } from '@/src/services/api/dashboard';

export default async function AdminDashboard() {
  const { quotes, shipments, paymentSummary, metrics, errors } = await fetchDashboardSnapshot();
  const isBackendOffline = errors.some((message) =>
    /impossible de contacter le serveur|requête expirée|backend offline/i.test(message),
  );

  const delayedShipments = shipments.items.filter((shipment) => shipment.status === 'delayed').length;
  const inTransit = shipments.items.filter((shipment) => shipment.status === 'in_transit').length;
  const completed = shipments.items.filter((shipment) => shipment.status === 'delivered').length;

  const stats = [
    { title: 'Pending Quotes', value: String(metrics.pendingQuotes) },
    { title: 'Active Shipments', value: String(inTransit || metrics.shipmentsInTransit) },
    { title: 'Delivered', value: String(completed || metrics.shipmentsDelivered) },
    {
      title: 'Revenue',
      value: formatCurrency(paymentSummary?.byStatus?.succeeded ?? metrics.totalPayments ?? 0, paymentSummary?.currency),
    },
  ];

  const bars = [
    { label: 'Pending quotes', value: metrics.pendingQuotes, tone: 'warning' },
    { label: 'In transit', value: inTransit || metrics.shipmentsInTransit, tone: 'info' },
    { label: 'Delivered', value: completed || metrics.shipmentsDelivered, tone: 'success' },
    { label: 'Delayed', value: delayedShipments, tone: 'danger' },
  ];
  const maxBar = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="page-stack">
      <PageHeader
        title="Operations Dashboard"
        description="Premium control center for quotes, shipments, tracking and revenue."
        breadcrumbs={[{ label: 'Ops', href: '/admin' }, { label: 'Dashboard' }]}
      />
      {errors.length ? (
        <div className="alert alert--error">
          <strong>Erreurs API :</strong>
          <ul>
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {isBackendOffline ? <BackendOffline /> : null}

      <div className="status-grid">
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <p>{stat.title}</p>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="layout-panels">
        <div className="panel">
          <div className="panel__header">
            <div>
              <div className="panel__title">Performance overview</div>
              <p className="panel__muted">Operational volume snapshot.</p>
            </div>
          </div>
          <div className="mini-chart">
            {bars.map((bar) => (
              <div key={bar.label} className="mini-chart__row">
                <span>{bar.label}</span>
                <div className="mini-chart__track">
                  <div
                    className={`mini-chart__bar mini-chart__bar--${bar.tone}`}
                    style={{ width: `${(bar.value / maxBar) * 100}%` }}
                  />
                </div>
                <strong>{bar.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel__title">Recent activity</div>
          <ul className="activity-list">
            {shipments.items.slice(0, 5).map((shipment) => (
              <li key={shipment._id}>
                <span className="activity-list__dot" />
                <div>
                  <strong>{shipment.trackingCode}</strong>
                  <p>
                    {toTitle(shipment.status)} · {formatDate(shipment.updatedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="layout-panels">
        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Latest quotes</div>
            <Link className="button button--ghost" href="/admin/quotes">
              View all
            </Link>
          </div>
          <table className="table-preview">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Client</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes.items.slice(0, 6).map((quote) => (
                <tr key={quote._id}>
                  <td>{quote._id}</td>
                  <td>{quote.userEmail || quote.requestedBy || '—'}</td>
                  <td>{formatCurrency(quote.finalPrice ?? quote.estimatedPrice, quote.currency)}</td>
                  <td>{toTitle(quote.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Latest shipments</div>
            <Link className="button button--ghost" href="/admin/shipments">
              View all
            </Link>
          </div>
          <table className="table-preview">
            <thead>
              <tr>
                <th>Tracking</th>
                <th>Route</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {shipments.items.slice(0, 6).map((shipment) => (
                <tr key={shipment._id}>
                  <td>{shipment.trackingCode}</td>
                  <td>
                    {shipment.origin || shipment.meta?.quote?.origin || '—'} →{' '}
                    {shipment.destination || shipment.meta?.quote?.destination || '—'}
                  </td>
                  <td>{toTitle(shipment.status)}</td>
                  <td>{formatDate(shipment.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
