import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useBackendAuth } from '../auth/useBackendAuth';
import { fetchClientShipments } from '../api/logistics';
import { formatLogisticsDate, getShipmentStatusMeta } from '../constants/logisticsStatus';

const UserShipments = () => {
  const { getToken } = useBackendAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const list = await fetchClientShipments(token);
        setShipments(Array.isArray(list) ? list : []);
        setError('');
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des colis');
      } finally { setLoading(false); }
    };
    load();
  }, [getToken]);

  const grouped = useMemo(() => {
    return shipments.reduce((acc, s) => {
      const meta = getShipmentStatusMeta(s.status);
      const group = meta.key === 'delivered' ? 'completed' : meta.key === 'delayed' ? 'delayed' : 'active';
      acc[group].push({ shipment: s, meta });
      return acc;
    }, { active: [], completed: [], delayed: [] });
  }, [shipments]);

  if (loading) return <div className="dx-empty">Chargement des expéditions…</div>;
  if (error) return <div className="dx-empty">❌ {error}</div>;

  return <div className="dx-dashboard-shell"><div className="dx-dashboard"><h1 className="dx-dashboard__title">Mes colis</h1>
    {['active', 'delayed', 'completed'].map((section) => (
      <section className="dx-section" key={section}><h2 className="dx-section__title">{section}</h2>
      {grouped[section].length === 0 ? <div className="dx-empty">Aucun colis.</div> : <div className="dx-grid dx-grid--two">{grouped[section].map(({ shipment, meta }) => (
        <article key={shipment._id} className="dx-card">
          <div className="dx-card__title">{shipment.origin || shipment.quoteId?.origin || '—'} → {shipment.destination || shipment.quoteId?.destination || '—'}</div>
          <span className={`dx-status dx-status--${meta.tone}`}>{meta.label}</span>
          <div className="dx-meta"><span>Tracking: {shipment.trackingCode || '—'}</span><span>Dernière mise à jour: {formatLogisticsDate(shipment.updatedAt)}</span></div>
          <div style={{ height: 8, borderRadius: 99, background: '#e2e8f0' }}><div style={{ height: '100%', width: `${meta.progress}%`, borderRadius: 99, background: '#2563eb' }} /></div>
          <Link href={`/track-shipment?code=${encodeURIComponent(shipment.trackingCode || '')}`} className="dx-button dx-button--ghost dx-button--sm">Tracking</Link>
        </article>))}</div>}
      </section>
    ))}
  </div></div>;
};

export default UserShipments;
