import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useBackendAuth } from '../auth/useBackendAuth';
import { fetchClientShipments } from '../api/logistics';
import { ClientAppShell, ClientEmptyState, ClientErrorState, ShipmentCard } from '../components/client/ClientWorkspaceComponents';

const UserShipments = () => {
  const { getToken } = useBackendAuth();
  const [shipments, setShipments] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [status, setStatus] = useState('all');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const token = await getToken(); setShipments(await fetchClientShipments(token)); } catch (e) { setError(e.message || 'Erreur'); } finally { setLoading(false); } }, [getToken]);
  useEffect(() => { load(); }, [load]);
  const statuses = useMemo(() => ['all', ...new Set(shipments.map((s) => String(s.status || 'inconnu').toLowerCase()))], [shipments]);
  const filtered = useMemo(() => status === 'all' ? shipments : shipments.filter((s) => String(s.status || 'inconnu').toLowerCase() === status), [shipments, status]);
  return <ClientAppShell eyebrow="espace client · expéditions" title="Mes colis" subtitle="Suivez vos expéditions, leurs statuts et les actions de tracking." actions={<><Link href="/quote-request" className="dx-button dx-button--primary">Nouvelle demande</Link><Link href="/track-shipment" className="dx-button dx-button--outline">Suivre un colis</Link></>}>
    <section className="dx-section"><div className="dx-filterbar"><label className="dx-field"><span>Filtrer par statut</span><select className="dx-select" value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((item) => <option key={item} value={item}>{item === 'all' ? 'Tous' : item}</option>)}</select></label><button type="button" className="dx-button dx-button--ghost" onClick={load}>Actualiser</button></div>
    {loading ? <div className="dx-empty"><p>Chargement des expéditions…</p></div> : null}
    {!loading && error ? <ClientErrorState message={error} onRetry={load} /> : null}
    {!loading && !error && !filtered.length ? <ClientEmptyState title="Aucune expédition" helper="Les expéditions apparaîtront ici après confirmation de devis." ctaHref="/quotes" ctaLabel="Voir mes devis" /> : null}
    {!loading && !error && filtered.length ? <div className="dx-grid dx-grid--three">{filtered.map((s) => <ShipmentCard key={s._id} shipment={s} />)}</div> : null}
    </section>
  </ClientAppShell>;
};

export default UserShipments;
