import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  SHIPMENT_STATUS_FLOW,
  formatStatusComment,
  getStatusIndex,
  formatShipmentStatus,
  normalizeShipmentStatus,
} from '../constants/shipmentStatus';
import { trackShipment } from '../api/shipments';
import { ProgressStepper, TimelineStatus, StatusBadge, TransportBadge } from '../design-system/StatusBadges';

const TrackShipment = () => {
  const router = useRouter();
  const queryCode = router.query.code;
  const initialCode = typeof queryCode === 'string' ? queryCode : '';
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(
    async (code) => {
      const codeToSearch = (code ?? trackingCode).trim();
      if (!codeToSearch) {
        setError('Vérifiez votre code de suivi : il est nécessaire pour afficher votre colis.');
        return;
      }

      try {
        setIsLoading(true);
        const data = await trackShipment(codeToSearch);
        const source = data?.shipment || data;
        const events = source?.statusHistory || source?.timeline || source?.trackingUpdates || data?.events || data?.statusHistory || [];
        const mergedShipment = source?.trackingCode || data?.trackingCode
          ? {
              ...source,
              trackingCode: source.trackingCode || data.trackingCode,
              status: normalizeShipmentStatus(source.status || data.status),
              statusHistory: events.map((event) => ({
                ...event,
                status: normalizeShipmentStatus(event.status || source.status || data.status),
                comment: event.comment || event.note,
              })),
            }
          : null;
        setShipment(mergedShipment);
        setError('');
      } catch (err) {
        setShipment(null);
        setError(err.message || 'Vérifiez votre code de suivi. Aucun résultat public disponible pour le moment.');
      } finally {
        setIsLoading(false);
      }
    },
    [trackingCode]
  );

  useEffect(() => {
    if (!router.isReady) return;
    if (!initialCode) return;
    setTrackingCode(initialCode);
    handleSearch(initialCode);
  }, [router.isReady, initialCode, handleSearch]);

  const statusHistory = useMemo(() => {
    if (!shipment?.statusHistory || !Array.isArray(shipment.statusHistory)) {
      return [];
    }

    return [...shipment.statusHistory]
      .filter((entry) => entry?.status)
      .sort((a, b) => {
        const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        return aTime - bTime;
      });
  }, [shipment]);

  const currentStepIndex = shipment?.status
    ? getStatusIndex(shipment.status)
    : -1;

  const renderTimestamp = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="track-shipment-page">
      <h2>Suivre mon colis</h2>
      <div className="track-form">
        <input
          type="text"
          placeholder="Ex. DX-2026-000123" aria-label="Code de suivi"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Recherche…' : 'Suivre mon colis'}
        </button>
      </div>

      {!shipment && !isLoading && !error && <p className="empty-history">Entrez un code de tracking pour afficher le statut public sans données sensibles.</p>}
      {isLoading && <p className="empty-history">Recherche du tracking en cours…</p>}
      {error && <p className="error">{error}</p>}

      {shipment && (
        <div className="shipment-info">
          <h3>Détails de l&apos;envoi :</h3>
          <p><strong>Tracking :</strong> {shipment.trackingCode || trackingCode}</p>
          <p><strong>Origine :</strong> {shipment.origin || shipment.meta?.quote?.origin || shipment.quoteId?.origin || '—'}</p>
          <p><strong>Destination :</strong> {shipment.destination || shipment.meta?.quote?.destination || shipment.quoteId?.destination || '—'}</p>
          <p><strong>Transport :</strong> <TransportBadge transport={shipment.quoteId?.transportType || shipment.transportType || shipment.carrier || shipment.provider} /></p>
          <p><strong>Statut actuel :</strong> <StatusBadge status={shipment.status} label={formatShipmentStatus(shipment.status)} /></p>

          <ProgressStepper flow={SHIPMENT_STATUS_FLOW} currentIndex={currentStepIndex} />
          <div className="logistic-map-placeholder" role="img" aria-label="Carte logistique simplifiée">
            <span>Origine</span><strong>→</strong><span>Hub DiaExpress</span><strong>→</strong><span>Destination</span>
          </div>

          <div className="status-history">
            <h4>Historique des statuts</h4>
            {statusHistory.length === 0 ? (
              <p className="empty-history">Aucun historique disponible.</p>
            ) : (
              <ul>
                {statusHistory.map((entry, idx) => {
                  return (
                    <TimelineStatus key={`${entry.status}-${entry.timestamp || idx}`} status={entry.status} date={renderTimestamp(entry.timestamp)} comment={entry.comment || formatStatusComment(entry.status)} />
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackShipment;
