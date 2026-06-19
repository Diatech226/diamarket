import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { fetchDashboardSnapshot } from '@/src/services/api/dashboard';

export default async function GlobalSearchRoute({ searchParams }: { searchParams?: { q?: string } }) {
  const query = (searchParams?.q || '').toLowerCase();
  const { quotes, shipments } = await fetchDashboardSnapshot();
  const quoteResults = quotes.items.filter((quote) => [quote._id, quote.origin, quote.destination, quote.userEmail, quote.requestedBy].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
  const shipmentResults = shipments.items.filter((shipment) => [shipment._id, shipment.trackingCode, shipment.quoteId, shipment.origin, shipment.destination, shipment.meta?.customerEmail, shipment.meta?.customerName].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
  return <div className="page-stack"><PageHeader title="Global Search" description="Recherche globale admin : tracking, quote, client et shipment." breadcrumbs={[{ label: 'Ops', href: '/admin' }, { label: 'Search' }]} /><form className="panel search-panel"><input className="input" name="q" placeholder="Tracking, quote, client, shipment…" defaultValue={searchParams?.q || ''} /><button className="button button--secondary" type="submit">Rechercher</button></form><div className="layout-panels"><div className="panel"><div className="panel__title">Quotes</div>{quoteResults.map((quote) => <Link className="search-result" key={quote._id} href={`/admin/quotes/${quote._id}`}><strong>{quote._id}</strong><span>{quote.userEmail || quote.requestedBy || 'Client'} · {quote.origin} → {quote.destination}</span></Link>)}</div><div className="panel"><div className="panel__title">Shipments</div>{shipmentResults.map((shipment) => <Link className="search-result" key={shipment._id} href={`/admin/shipments/${shipment._id}`}><strong>{shipment.trackingCode}</strong><span>{shipment.meta?.customerName || shipment.meta?.customerEmail || 'Client'} · {shipment.origin || shipment.meta?.quote?.origin || '—'} → {shipment.destination || shipment.meta?.quote?.destination || '—'}</span></Link>)}</div></div></div>;
}
