'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';
import { confirmQuote, convertQuoteToShipment, fetchQuoteById, rejectQuote } from '@/lib/api/quotes';
import { formatCurrency, formatDate, toTitle } from '@/src/lib/format';
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
  const [busyAction, setBusyAction] = useState<'confirm' | 'reject' | 'convert' | null>(null);

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

  const timeline = useMemo(() => {
    if (!quote) return [];
    return [
      quote.createdAt ? { label: 'Création', date: quote.createdAt } : null,
      quote.updatedAt ? { label: 'Dernière mise à jour', date: quote.updatedAt } : null,
      quote.convertedAt ? { label: 'Conversion shipment', date: quote.convertedAt } : null,
      quote.dispatchedAt ? { label: 'Dispatch', date: quote.dispatchedAt } : null,
      quote.deliveredAt ? { label: 'Livraison', date: quote.deliveredAt } : null,
    ].filter(Boolean) as Array<{ label: string; date: string }>;
  }, [quote]);

  const handleConfirm = async () => {
    if (!quote) return;
    try {
      setBusyAction('confirm');
      setActionError(null);
      const updated = await confirmQuote(quote._id, { finalPrice: quote.finalPrice ?? quote.estimatedPrice });
      setQuote(updated);
      setActionMessage('Devis approuvé.');
    } catch (err) {
      setActionError((err as Error).message || 'Impossible de confirmer le devis.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleReject = async () => {
    if (!quote) return;
    try {
      setBusyAction('reject');
      setActionError(null);
      const updated = await rejectQuote(quote._id, 'Rejet opéré depuis la fiche devis admin');
      setQuote(updated);
      setActionMessage('Devis rejeté.');
    } catch (err) {
      setActionError((err as Error).message || 'Impossible de rejeter le devis.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleConvert = async () => {
    if (!quote) return;
    try {
      setBusyAction('convert');
      setActionError(null);
      const result = await convertQuoteToShipment(quote._id);
      setActionMessage('Shipment créé depuis ce devis.');
      if (result?.shipment?._id) {
        router.push(`/admin/shipments/${result.shipment._id}`);
      }
    } catch (err) {
      setActionError((err as Error).message || 'Conversion en shipment impossible.');
    } finally {
      setBusyAction(null);
    }
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
                <QuoteStatusBadge status={quote.status} />
              </div>
              <div className="panel__actions">
                {quote.status === 'pending' ? (
                  <Button variant="secondary" onClick={handleConfirm} disabled={busyAction === 'confirm'}>
                    {busyAction === 'confirm' ? 'Validation...' : 'Approuver'}
                  </Button>
                ) : null}
                {quote.status !== 'rejected' ? (
                  <Button variant="ghost" onClick={handleReject} disabled={busyAction === 'reject'}>
                    {busyAction === 'reject' ? 'Rejet...' : 'Rejeter'}
                  </Button>
                ) : null}
                {quote.status === 'confirmed' ? (
                  <Button variant="primary" onClick={handleConvert} disabled={busyAction === 'convert'}>
                    {busyAction === 'convert' ? 'Conversion...' : 'Convertir en shipment'}
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
            <div className="stack gap-3">
              {timeline.length ? timeline.map((item) => (
                <div key={`${item.label}-${item.date}`} className="border p-3 rounded">
                  <strong>{item.label}</strong>
                  <p className="muted">{formatDate(item.date)}</p>
                </div>
              )) : <div className="empty-state">Aucun événement de timeline.</div>}
            </div>
          </div>

          <div className="panel">
            <div className="panel__title">Notes admin</div>
            {quote.notes ? <p>{quote.notes}</p> : <div className="empty-state">Aucune note interne.</div>}
          </div>
        </>
      ) : (
        <div className="panel">Aucun devis trouvé.</div>
      )}
    </div>
  );
}
