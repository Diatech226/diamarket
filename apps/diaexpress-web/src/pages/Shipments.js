import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useBackendAuth } from '../auth/useBackendAuth';
import { fetchClientShipments } from '../api/logistics';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageStates';

const PAGE_SIZE = 6;

const STATUS_TONES = {
  'En attente': 'warning',
  Préparation: 'info',
  'En transit': 'info',
  'En livraison': 'warning',
  'Arrivé à destination': 'success',
  Livré: 'success',
  Rejeté: 'danger',
  'Bloqué douane': 'danger',
};

const STATUS_OPTIONS = ['Tous', 'En transit', 'En attente', 'Livré', 'Arrivé à destination', 'En livraison', 'Préparation', 'Bloqué douane', 'Rejeté'];

const ATTENTION_STATUSES = ['Rejeté', 'Bloqué douane', 'En livraison'];
const TRANSIT_STATUSES = ['En transit', 'Préparation', 'En livraison'];

const resolveStatusTone = (status) => STATUS_TONES[status] || 'info';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR');
};

const shipmentRoute = (shipment) => {
  const origin = shipment?.origin || shipment?.quoteId?.origin || shipment?.pickupAddress?.city || 'Origine non renseignée';
  const destination = shipment?.destination || shipment?.quoteId?.destination || shipment?.deliveryAddress?.city || 'Destination non renseignée';
  return `${origin} → ${destination}`;
};

const shipmentCode = (shipment) => shipment?.trackingCode || shipment?.trackingNumber || shipment?._id?.slice(-8) || '—';

const dashboardKpis = (shipments) => {
  const delivered = shipments.filter((s) => ['Livré', 'Arrivé à destination'].includes(s.status)).length;
  const inTransit = shipments.filter((s) => TRANSIT_STATUSES.includes(s.status)).length;
  const issues = shipments.filter((s) => ATTENTION_STATUSES.includes(s.status)).length;
  return {
    total: shipments.length,
    inTransit,
    delivered,
    issues,
  };
};

const shipmentTrackHref = (shipment) => {
  const trackingValue = shipment.trackingCode || shipment.trackingNumber;
  if (!trackingValue) return '/track-shipment';
  return `/track-shipment?tracking=${encodeURIComponent(trackingValue)}`;
};

const Shipments = () => {
  const { getToken, isLoaded } = useBackendAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [searchCode, setSearchCode] = useState('');

  const loadShipments = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Session expirée. Veuillez vous reconnecter.');
      const data = await fetchClientShipments(token);
      setShipments(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Erreur chargement expéditions client', err);
      setError(err.message || 'Impossible de charger vos expéditions.');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) loadShipments();
  }, [isLoaded, loadShipments]);

  const kpis = useMemo(() => dashboardKpis(shipments), [shipments]);

  const filteredShipments = useMemo(() => {
    let list = shipments;

    if (attentionOnly) {
      list = list.filter((shipment) => ATTENTION_STATUSES.includes(shipment.status));
    }

    if (statusFilter !== 'Tous') {
      list = list.filter((shipment) => shipment.status === statusFilter);
    }

    const query = searchCode.trim().toLowerCase();
    if (!query) return list;

    return list.filter((shipment) => {
      const code = shipmentCode(shipment).toLowerCase();
      return code.includes(query);
    });
  }, [shipments, attentionOnly, statusFilter, searchCode]);

  const paginatedShipments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredShipments.slice(start, start + PAGE_SIZE);
  }, [page, filteredShipments]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / PAGE_SIZE));

  useEffect(() => setPage(1), [attentionOnly, statusFilter, searchCode]);

  return (
    <div className="dx-dashboard-shell">
      <div className="dx-dashboard">
        <header className="dx-dashboard__header">
          <span className="dx-dashboard__eyebrow">espace client · expéditions</span>
          <h1 className="dx-dashboard__title">Pilotez vos expéditions en un coup d’œil</h1>
          <p className="dx-dashboard__subtitle">Consultez les statuts, priorisez les colis sensibles et lancez le suivi détaillé en quelques secondes.</p>
          <div className="dx-dashboard__actions">
            <Link href="/quote-request" className="dx-button dx-button--primary">Créer un envoi</Link>
          </div>
        </header>

        {!loading && !error && shipments.length > 0 && (
          <section className="dx-grid dx-grid--four">
            <article className="dx-card"><p className="dx-card__subtitle">Total expéditions</p><strong className="dx-card__value">{kpis.total}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">En transit</p><strong className="dx-card__value">{kpis.inTransit}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">Livrées</p><strong className="dx-card__value">{kpis.delivered}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">Nécessitent attention</p><strong className="dx-card__value">{kpis.issues}</strong></article>
          </section>
        )}

        <section className="dx-section">
          <div className="dx-section__header">
            <span className="dx-section__eyebrow">liste opérationnelle</span>
            <h2 className="dx-section__title">Historique de vos envois</h2>
            <p className="dx-section__subtitle">Filtrez par statut, cherchez un code et ouvrez rapidement l’action de suivi.</p>
          </div>

          <div className="dx-filterbar">
            <label className="dx-field" htmlFor="status-filter">
              <span>Statut</span>
              <select
                id="status-filter"
                className="dx-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="dx-field" htmlFor="code-search">
              <span>Rechercher un code</span>
              <input
                id="code-search"
                className="dx-search"
                type="search"
                placeholder="Ex. DX-20391"
                value={searchCode}
                onChange={(event) => setSearchCode(event.target.value)}
              />
            </label>

            <div className="dx-actions dx-actions--wrap">
              <button type="button" className={`dx-button ${attentionOnly ? 'dx-button--primary' : 'dx-button--outline'}`} onClick={() => setAttentionOnly((prev) => !prev)}>
                {attentionOnly ? 'Voir tous les envois' : 'Voir les envois sensibles'}
              </button>
              <button type="button" className="dx-button dx-button--ghost" onClick={loadShipments}>Actualiser</button>
            </div>
          </div>

          {loading ? <LoadingState message="Chargement de vos expéditions…" /> : null}
          {!loading && error ? <ErrorState message={`Service momentanément indisponible. ${error}`} onRetry={loadShipments} /> : null}
          {!loading && !error && filteredShipments.length === 0 ? (
            <EmptyState
              title={shipments.length === 0 ? 'Aucune expédition pour le moment.' : 'Aucun résultat pour ces filtres.'}
              helper={shipments.length === 0 ? 'Démarrez avec une demande de devis, puis suivez chaque envoi ici.' : 'Essayez un autre statut ou recherchez un autre code colis.'}
              cta={
                shipments.length === 0
                  ? <Link href="/quote-request" className="dx-button dx-button--primary dx-button--sm">Demander un devis</Link>
                  : <button type="button" className="dx-button dx-button--outline dx-button--sm" onClick={() => { setStatusFilter('Tous'); setSearchCode(''); setAttentionOnly(false); }}>Réinitialiser les filtres</button>
              }
            />
          ) : null}

          {!loading && !error && filteredShipments.length > 0 ? (
            <>
              <div className="dx-table-wrapper dx-desktop-table">
                <table className="dx-table">
                  <thead><tr><th>Code</th><th>Statut</th><th>Itinéraire</th><th>Dernière mise à jour</th><th>Action</th></tr></thead>
                  <tbody>
                    {paginatedShipments.map((shipment) => (
                      <tr key={shipment._id}>
                        <td><strong>{shipmentCode(shipment)}</strong></td>
                        <td><span className={`dx-status dx-status--${resolveStatusTone(shipment.status)}`}>{shipment.status || 'En suivi'}</span></td>
                        <td>{shipmentRoute(shipment)}</td>
                        <td>{formatDate(shipment.updatedAt || shipment.lastStatusUpdateAt || shipment.createdAt)}</td>
                        <td>
                          <Link href={shipmentTrackHref(shipment)} className="dx-button dx-button--outline dx-button--sm">
                            Suivre
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="dx-mobile-list">
                {paginatedShipments.map((shipment) => (
                  <article key={`mobile-${shipment._id}`} className="dx-card">
                    <div className="dx-actions"><strong>{shipmentCode(shipment)}</strong><span className={`dx-status dx-status--${resolveStatusTone(shipment.status)}`}>{shipment.status || 'En suivi'}</span></div>
                    <p className="dx-card__subtitle">{shipmentRoute(shipment)}</p>
                    <p className="dx-card__subtitle">Dernière mise à jour : {formatDate(shipment.updatedAt || shipment.lastStatusUpdateAt || shipment.createdAt)}</p>
                    <div className="dx-actions">
                      <Link href={shipmentTrackHref(shipment)} className="dx-button dx-button--outline dx-button--sm">Suivre</Link>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && <div className="dx-pagination">{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageIndex) => <button key={pageIndex} className={pageIndex === page ? 'active' : undefined} onClick={() => setPage(pageIndex)}>{pageIndex}</button>)}</div>}
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default Shipments;
