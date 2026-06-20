import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useBackendAuth } from '../auth/useBackendAuth';
import { myPayments } from '../api/payment';
import { fetchClientShipments } from '../api/logistics';
import { myNotifications } from '../api/notifications';
import { fetchUserQuotes } from '../api/quotes';
import { ClientAppShell, DashboardKpiCard, ClientErrorState, ClientEmptyState, ShipmentCard, QuoteCard, PaymentCard, ClientPageHeader } from '../components/client/ClientWorkspaceComponents';

const ClientPage = () => {
  const { getToken } = useBackendAuth();
  const [quotes, setQuotes] = useState([]); const [shipments, setShipments] = useState([]); const [payments, setPayments] = useState([]); const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const [quotesData, shipmentsData, paymentsData, notifData] = await Promise.all([
        fetchUserQuotes(token), fetchClientShipments(token), myPayments(token), myNotifications(token).catch(() => [])
      ]);
      setQuotes(quotesData?.quotes || []); setShipments(shipmentsData || []); setPayments(paymentsData?.payments || paymentsData || []); setNotifications(notifData?.notifications || notifData || []);
    } catch (e) { setError(e.message || 'Erreur de chargement.'); }
    finally { setLoading(false); }
  }, [getToken]);
  useEffect(() => { load(); }, [load]);
  const kpis = useMemo(() => ({ quotesPending: quotes.filter((q) => ['pending', 'submitted', 'submitted'].includes(String(q.status || '').toLowerCase())).length, activeShipments: shipments.filter((s) => !['delivered', 'completed'].includes(String(s.status || '').toLowerCase())).length, paymentsCount: payments.length, addressesCta: 'Gérer' }), [quotes, shipments, payments]);
  return <ClientAppShell eyebrow="espace client · dashboard" title="Centre logistique" subtitle="Pilotez vos devis, expéditions, paiements et actions prioritaires en un coup d’œil." actions={<><Link href="/quote-request" className="dx-button dx-button--primary">Nouvelle demande</Link><Link href="/track-shipment" className="dx-button dx-button--outline">Suivre un colis</Link></>}>
    {loading ? <div className="dx-empty"><p>Chargement du dashboard…</p></div> : null}
    {!loading && error ? <ClientErrorState message={error} onRetry={load} /> : null}
    {!loading && !error ? <>
      <section className="dx-grid dx-grid--four"><DashboardKpiCard label="Devis en attente" value={kpis.quotesPending} /><DashboardKpiCard label="Shipments actifs" value={kpis.activeShipments} /><DashboardKpiCard label="Paiements" value={kpis.paymentsCount} /><DashboardKpiCard label="Adresses" value={<Link href="/profile/addresses">{kpis.addressesCta}</Link>} /></section>
      <section className="dx-section"><ClientPageHeader title="Shipments actifs" description="Vos expéditions en cours de traitement ou de transit." />{shipments.length ? <div className="dx-grid dx-grid--three">{shipments.slice(0, 3).map((s) => <ShipmentCard key={s._id} shipment={s} />)}</div> : <ClientEmptyState title="Aucun colis actif" helper="Les nouveaux colis apparaîtront ici." ctaHref="/quotes" ctaLabel="Voir mes devis" />}</section>
      <section className="dx-section"><ClientPageHeader title="Devis en attente" description="Suivez les devis à valider ou compléter." />{quotes.length ? <div className="dx-grid dx-grid--three">{quotes.slice(0, 3).map((q) => <QuoteCard key={q._id} quote={q} />)}</div> : <ClientEmptyState title="Aucun devis" helper="Créez une demande de devis pour démarrer." ctaHref="/quote-request" ctaLabel="Nouvelle demande" />}</section>
      <section className="dx-section"><ClientPageHeader title="Paiements récents" description="Historique des dernières transactions." />{payments.length ? <div className="dx-grid dx-grid--three">{payments.slice(0, 3).map((p) => <PaymentCard key={p._id || p.id} payment={p} />)}</div> : <ClientEmptyState title="Aucun paiement" helper="Les transactions seront visibles ici." ctaHref="/payments" ctaLabel="Historique paiements" />}</section>
      {notifications.length ? <section className="dx-section"><ClientPageHeader title="Alertes" description="Notifications récentes." /><div className="dx-grid">{notifications.slice(0, 5).map((n, i) => <article key={n._id || i} className="dx-card"><p>{n.title || n.message || 'Notification'}</p></article>)}</div></section> : null}
    </> : null}
  </ClientAppShell>;
};

export default ClientPage;
