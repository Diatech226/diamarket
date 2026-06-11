import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  SHIPMENT_STATUS_MAP,
  formatStatusComment,
} from '../constants/shipmentStatus';
import { trackShipment } from '../api/shipments';
import { ANALYTICS_EVENTS, trackEvent } from '../analytics/trackEvent';

const STATUS_THEME = {
  delivered: 'success',
  transit: 'info',
  pending: 'warning',
  processing: 'processing',
  customs: 'customs',
  delayed: 'danger',
  failed: 'danger',
};

const toneFromStatus = (status = '') => {
  const normalized = status.toLowerCase();
  if (normalized.includes('livr')) return STATUS_THEME.delivered;
  if (normalized.includes('transit') || normalized.includes('route')) return STATUS_THEME.transit;
  if (normalized.includes('douane') || normalized.includes('custom')) return STATUS_THEME.customs;
  if (normalized.includes('retard') || normalized.includes('delay')) return STATUS_THEME.delayed;
  if (normalized.includes('echec') || normalized.includes('failed') || normalized.includes('annul')) return STATUS_THEME.failed;
  if (normalized.includes('prep') || normalized.includes('process')) return STATUS_THEME.processing;
  if (normalized.includes('attente') || normalized.includes('pending')) return STATUS_THEME.pending;
  return 'info';
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
};

const TrackShipment = () => {
  const router = useRouter();
  const initialCode = typeof router.query.code === 'string' ? router.query.code : '';
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [hasSearched, setHasSearched] = useState(Boolean(initialCode));
  const [errorType, setErrorType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = useCallback(async (code) => {
    const value = (code || trackingCode).trim();
    if (!value) return;

    try {
      setIsLoading(true);
      setHasSearched(true);
      setInputError('');
      setErrorType('');
      setErrorMessage('');
      setShipment(null);
      const response = await trackShipment(value);
      const mergedShipment = response?.shipment
        ? { ...response.shipment, statusHistory: response.shipment.statusHistory || response.statusHistory || [] }
        : null;
      setShipment(mergedShipment);
    } catch (err) {
      const message = err?.message || 'Service de suivi temporairement indisponible.';
      const notFound = message.toLowerCase().includes('introuvable') || message.toLowerCase().includes('not found');
      setErrorType(notFound ? 'not_found' : 'backend_unavailable');
      setErrorMessage(notFound ? 'Code non trouvé. Vérifiez votre numéro puis réessayez.' : message);
    } finally {
      setIsLoading(false);
    }
  }, [trackingCode]);

  useEffect(() => {
    if (!router.isReady || !initialCode) return;
    setTrackingCode(initialCode);
    handleSearch(initialCode);
  }, [router.isReady, initialCode, handleSearch]);

  const timeline = useMemo(() => {
    if (!Array.isArray(shipment?.statusHistory)) return [];
    return [...shipment.statusHistory]
      .filter((entry) => entry?.status)
      .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
  }, [shipment]);

  const eta = shipment?.estimatedDeliveryDate || shipment?.estimatedDelivery || shipment?.eta || shipment?.quoteId?.estimatedDeliveryDate;

  const submit = (e) => {
    e.preventDefault();
    const trimmed = trackingCode.trim();
    if (!trimmed) {
      setInputError('Veuillez renseigner un code de suivi valide.');
      setErrorType('invalid_code');
      return;
    }
    handleSearch(trimmed);
    trackEvent(ANALYTICS_EVENTS.TRACKING_SEARCH, { location: 'tracking_page', tracking_code_prefix: trimmed.slice(0, 4) });
  };

  return (
    <div className="track-premium">
      <section className="track-premium__hero">
        <div>
          <span className="track-premium__kicker">Tracking international</span>
          <h2>Suivez votre expédition en temps réel</h2>
          <p>Un suivi clair à chaque checkpoint, avec une lecture immédiate du statut, du trajet et des dernières mises à jour.</p>
        </div>
        <form className="track-search-card" onSubmit={submit}>
          <label htmlFor="trackingCode">Code de suivi</label>
          <input id="trackingCode" value={trackingCode} onChange={(e) => { setTrackingCode(e.target.value); setInputError(''); }} placeholder="Ex: DEX-2025-00045" />
          <small>Exemple: DEX-2025-00045 · reçu par email/SMS</small>
          {inputError && <p className="track-state track-state--invalid">{inputError}</p>}
          <button type="submit" disabled={isLoading}>{isLoading ? 'Recherche en cours…' : 'Suivre maintenant'}</button>
        </form>
      </section>

      <section className="track-premium__body">
        {isLoading && <div className="track-loading" role="status" aria-live="polite"><div /><div /><div /></div>}

        {!isLoading && shipment && (
          <>
            <article className="track-overview-card">
              <header>
                <p>N° {shipment.trackingCode || trackingCode}</p>
                <span className={`track-badge track-badge--${toneFromStatus(shipment.status)}`}>{SHIPMENT_STATUS_MAP[shipment.status]?.label || shipment.status || '—'}</span>
              </header>
              <div className="track-overview-grid">
                <p><strong>Origine</strong><span>{shipment.quoteId?.origin || '—'}</span></p>
                <p><strong>Destination</strong><span>{shipment.quoteId?.destination || '—'}</span></p>
                <p><strong>Transport</strong><span>{shipment.quoteId?.transportType || '—'}</span></p>
                <p><strong>Transporteur</strong><span>{shipment.provider || shipment.carrier || '—'}</span></p>
                <p><strong>Livraison estimée</strong><span>{formatDate(eta)}</span></p>
                <p><strong>Dernière mise à jour</strong><span>{formatDate(shipment.updatedAt || timeline[timeline.length - 1]?.timestamp)}</span></p>
              </div>
            </article>

            <article className="track-timeline-card">
              <h3>Timeline de livraison</h3>
              {timeline.length === 0 ? (
                <div className="track-state">Aucun événement disponible pour le moment. Réessayez plus tard ou contactez le support.</div>
              ) : (
                <ol>
                  {timeline.map((entry, index) => {
                    const isCurrent = index === timeline.length - 1;
                    const tone = toneFromStatus(entry.status);
                    return (
                      <li key={`${entry.status}-${entry.timestamp || index}`} className={isCurrent ? 'is-current' : ''}>
                        <span className={`dot dot--${tone}`} />
                        <div>
                          <header>
                            <strong>{SHIPMENT_STATUS_MAP[entry.status]?.label || entry.status}</strong>
                            <time>{formatDate(entry.timestamp)}</time>
                          </header>
                          <p>{entry.comment || formatStatusComment(entry.status)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </article>
          </>
        )}

        {!isLoading && !shipment && hasSearched && (
          <div className="track-state track-state--error">
            <p>{errorMessage || 'Impossible de récupérer ce suivi.'}</p>
            <div>
              <button type="button" onClick={() => handleSearch(trackingCode)}>Réessayer</button>
              <Link href="/contact">Support client</Link>
            </div>
          </div>
        )}

        {!isLoading && !shipment && !hasSearched && (
          <div className="track-state">Entrez votre code pour afficher la progression détaillée de votre envoi.</div>
        )}
      </section>
    </div>
  );
};

export default TrackShipment;
