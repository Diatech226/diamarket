import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useBackendAuth } from '../auth/useBackendAuth';
import { createShipmentFromQuote, fetchClientQuotes, fetchClientShipments } from '../api/logistics';
import { formatLogisticsDate, getQuoteStatusMeta, getShipmentStatusMeta } from '../constants/logisticsStatus';

const UserQuotes = () => {
  const { getToken } = useBackendAuth();
  const [quotes, setQuotes] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const [quoteList, shipmentList] = await Promise.all([
        fetchClientQuotes(token),
        fetchClientShipments(token),
      ]);
      setQuotes(Array.isArray(quoteList) ? quoteList : []);
      setShipments(Array.isArray(shipmentList) ? shipmentList : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const shipmentByQuote = useMemo(() => {
    const map = new Map();
    shipments.forEach((s) => {
      const quoteId = s?.quoteId?._id || s?.quoteId;
      if (quoteId) map.set(String(quoteId), s);
    });
    return map;
  }, [shipments]);

  const handleCreateShipment = async (quoteId) => {
    try {
      const token = await getToken();
      await createShipmentFromQuote(quoteId, token);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l’expédition');
    }
  };

  return (
    <div className="dx-dashboard-shell"><div className="dx-dashboard">
      <header className="dx-dashboard__header">
        <span className="dx-dashboard__eyebrow">quotes lifecycle</span>
        <h1 className="dx-dashboard__title">Mes demandes de devis</h1>
      </header>
      {loading ? <div className="dx-empty">Chargement de la timeline…</div> : null}
      {error ? <div className="dx-empty">❌ {error}</div> : null}
      {!loading && quotes.length === 0 ? <div className="dx-empty">Aucune demande de devis.</div> : null}
      <section className="dx-section">
        <div className="dx-grid dx-grid--two">
          {quotes.map((quote) => {
            const shipment = shipmentByQuote.get(String(quote._id));
            const quoteMeta = getQuoteStatusMeta(quote, Boolean(shipment));
            const shipmentMeta = getShipmentStatusMeta(shipment?.status);
            return (
              <article key={quote._id} className="dx-card">
                <div className="dx-card__title">{quote.origin} → {quote.destination}</div>
                <div className="dx-meta">
                  <span>Transport: {quote.transportType || '—'}</span>
                  <span>Marchandise: {quote.productType || '—'}</span>
                  <span>Estimation: {quote.price ? `${quote.price} €` : '—'}</span>
                  <span>Créé: {formatLogisticsDate(quote.createdAt)}</span>
                </div>
                <span className={`dx-status dx-status--${quoteMeta.tone}`}>{quoteMeta.label}</span>
                {shipment ? (
                  <>
                    <div className="dx-meta">
                      <span>Expédition liée: {shipment.trackingCode || shipment._id}</span>
                      <span>Statut expédition: {shipmentMeta.label}</span>
                    </div>
                    <Link className="dx-button dx-button--ghost dx-button--sm" href={`/track-shipment?code=${encodeURIComponent(shipment.trackingCode || '')}`}>
                      Suivre l’expédition
                    </Link>
                  </>
                ) : (
                  <button className="dx-button dx-button--primary dx-button--sm" onClick={() => handleCreateShipment(quote._id)}>
                    Convertir en expédition
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div></div>
  );
};

export default UserQuotes;
