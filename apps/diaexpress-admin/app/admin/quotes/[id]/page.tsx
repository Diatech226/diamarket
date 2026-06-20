'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { QuoteNotes } from '@/components/quotes/QuoteNotes';
import { QuoteTimeline } from '@/components/quotes/QuoteTimeline';
import { ConvertQuoteButton } from '@/components/quotes/ConvertQuoteButton';
import { StatusBadge } from '@/components/quotes/StatusBadge';
import { confirmQuote, deleteQuote, fetchQuoteById, markQuoteReadyForShipment, markQuoteUnderReview, rejectQuote, requestQuoteInfo } from '@/lib/api/quotes';
import { formatCurrency, toTitle } from '@/src/lib/format';
import type { Quote } from '@/src/types/logistics';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'review' | 'info' | 'confirm' | 'ready' | 'reject' | 'convert' | 'delete' | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (!id) throw new Error('Identifiant de devis manquant');
      const data = await fetchQuoteById(id as string);
      setQuote(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Impossible de charger le devis.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (key: NonNullable<typeof busyAction>, success: string, action: () => Promise<Quote | void>) => {
    try {
      setBusyAction(key);
      setActionError(null);
      const updated = await action();
      if (updated) setQuote(updated);
      setActionMessage(success);
      await load();
    } catch (err) {
      setActionError((err as Error).message || 'Action impossible sur ce devis.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleReview = async () => {
    if (!quote) return;
    await runAction('review', 'Devis marqué en revue.', () => markQuoteUnderReview(quote._id, 'Revue admin démarrée.'));
  };

  const handleRequestInfo = async () => {
    if (!quote) return;
    const message = window.prompt('Informations à demander au client', 'Merci de compléter les dimensions, le poids ou les documents manquants.');
    if (message === null) return;
    await runAction('info', 'Demande d’information enregistrée.', () => requestQuoteInfo(quote._id, message));
  };

  const handleConfirm = async () => {
    if (!quote) return;
await runAction('confirm', 'Devis approuvé.', () => confirmQuote(quote._id, { finalPrice: quote.finalPrice ?? quote.estimatedPrice }));
  };

  const handleReject = async () => {
    if (!quote) return;
if (!window.confirm('Refuser définitivement ce devis ?')) return;
    await runAction('reject', 'Devis rejeté.', () => rejectQuote(quote._id, 'Rejet opéré depuis la fiche devis admin'));
  };

  const handleReady = async () => {
    if (!quote) return;
    await runAction('ready', 'Devis prêt pour expédition.', () => markQuoteReadyForShipment(quote._id));
  };

  const handleDelete = async () => {
    if (!quote) return;
    if (!window.confirm('Supprimer ce devis ? Cette action est sensible.')) return;
    await runAction('delete', 'Devis supprimé.', async () => {
      await deleteQuote(quote._id);
      router.push('/admin/quotes');
    });
  };

  if (!id) return null;

  return (
    <div className="page-stack">
      <PageHeader
        title={`Quote ${id}`}
        description="Fiche complète devis: timeline, pricing, client, notes et actions."
        actions={
          <Button variant="ghost" onClick={() => router.push('/admin/quotes')}>
            Retour aux quotes
          </Button>
        }
      />

      {error ? <div className="alert alert--error">{error}</div> : null}
      {actionError ? <div className="alert alert--error">{actionError}</div> : null}
      {actionMessage ? <div className="alert alert--success">{actionMessage}</div> : null}

      {loading ? (
        <div className="panel"><div className="skeleton" style={{ width: '100%', height: 80 }} /></div>
      ) : quote ? (
        <>
          <div className="panel">
            <div className="panel__header">
              <div>
                <div className="panel__title">Statut & actions</div>
                <StatusBadge status={quote.status} />
              </div>
              <div className="panel__actions">
                {!['under_review', 'approved', 'approved', 'approved', 'converted_to_shipment', 'rejected', 'cancelled'].includes(quote.status) ? (
                  <Button variant="ghost" onClick={handleReview} disabled={busyAction === 'review'}>
                    {busyAction === 'review' ? 'Revue...' : 'Marquer en revue'}
                  </Button>
                ) : null}
                {!['approved', 'approved', 'approved', 'converted_to_shipment', 'rejected', 'cancelled'].includes(quote.status) ? (
                  <Button variant="ghost" onClick={handleRequestInfo} disabled={busyAction === 'info'}>
                    {busyAction === 'info' ? 'Envoi...' : 'Demander infos'}
                  </Button>
                ) : null}
                {['submitted', 'under_review', 'info_requested'].includes(quote.status) ? (
                  <Button variant="secondary" onClick={handleConfirm} disabled={busyAction === 'confirm'}>
                    {busyAction === 'confirm' ? 'Validation...' : 'Approuver'}
                  </Button>
                ) : null}
                {quote.status !== 'rejected' ? (
                  <Button variant="ghost" onClick={handleReject} disabled={busyAction === 'reject'}>
                    {busyAction === 'reject' ? 'Rejet...' : 'Rejeter'}
                  </Button>
                ) : null}
                {['approved', 'approved'].includes(quote.status) ? (
                  <Button variant="secondary" onClick={handleReady} disabled={busyAction === 'ready'}>
                    {busyAction === 'ready' ? 'MAJ...' : 'Prêt expédition'}
                  </Button>
                ) : null}
                {quote.status === 'approved' ? <ConvertQuoteButton quote={quote} onError={setActionError} /> : null}
                {!['converted_to_shipment'].includes(quote.status) ? (
                  <Button variant="ghost" onClick={handleDelete} disabled={busyAction === 'delete'}>
                    {busyAction === 'delete' ? 'Suppression...' : 'Supprimer'}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="status-grid">
            <div className="stat-card">
              <p>Pricing summary</p>
              <strong>{formatCurrency(quote.finalPrice ?? quote.estimatedPrice, quote.currency)}</strong>
              <p className="muted">Estimation: {formatCurrency(quote.estimatedPrice, quote.currency)}</p>
            </div>
            <div className="stat-card">
              <p>Client</p>
              <strong>{quote.recipientContactName || quote.userEmail || '—'}</strong>
              <p className="muted">{quote.recipientContactEmail || quote.userEmail || 'Email non renseigné'}</p>
            </div>
            <div className="stat-card">
              <p>Route</p>
              <strong>{quote.origin} → {quote.destination}</strong>
              <p className="muted">{toTitle(quote.transportType)}</p>
            </div>
          </div>

          <div className="panel">
            <div className="panel__title">Timeline</div>
            <QuoteTimeline quote={quote} />
          </div>

          <div className="panel">
            <div className="panel__title">Colis, dimensions et documents</div>
            <div className="summary-grid">
              <div><strong>Poids</strong><p>{quote.weight ?? '—'} kg</p></div>
              <div><strong>Volume</strong><p>{quote.volume ?? '—'} m³</p></div>
              <div><strong>Dimensions</strong><p>{quote.length ?? '—'} × {quote.width ?? '—'} × {quote.height ?? '—'} cm</p></div>
              <div><strong>Paiement</strong><p>{quote.paymentStatus || '—'}</p></div>
              <div><strong>Shipment lié</strong><p className="mono">{quote.shipmentId || quote.trackingNumber || '—'}</p></div>
              <div><strong>Documents</strong><p>Non renseignés par l’API actuelle</p></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel__title">Notes admin</div>
            <QuoteNotes quote={quote} />
          </div>
        </>
      ) : (
        <div className="panel">Aucun devis trouvé.</div>
      )}
    </div>
  );
}
