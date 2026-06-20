import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useBackendAuth } from '../auth/useBackendAuth';
import { API_BASE } from '../api/api';
import PaymentDialog from '../components/payments/PaymentDialog';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageStates';

const toAmount = (quote) => quote?.approvedAmount || quote?.approvedPrice || quote?.estimatedPrice || '-';
const toMode = (quote) => quote?.transportMode || quote?.transportType || '—';
const toRoute = (quote) => `${quote?.origin || 'Origine non renseignée'} → ${quote?.destination || 'Destination non renseignée'}`;
const toReference = (quote) => quote?.reference || quote?.quoteReference || quote?._id?.slice(-8) || '—';

const normalizeStatus = (status) => {
  const value = (status || '').toLowerCase();

  if (['approved', 'paid', 'converted_to_shipment'].includes(value)) return 'approved';
  if (['rejected', 'declined'].includes(value)) return 'rejected';
  if (['submitted'].includes(value)) return 'submitted';

  return 'pending';
};

const STATUS_CONFIG = {
  submitted: { label: 'Demande envoyée', tone: 'info' },
  pending: { label: 'En attente', tone: 'warning' },
  approved: { label: 'Approuvé', tone: 'success' },
  rejected: { label: 'Rejeté', tone: 'danger' },
};

const nextActionLabel = (quote) => {
  const status = normalizeStatus(quote?.status);
  if (status === 'pending') return 'Continuer';
  if (status === 'approved') return 'Convertir';
  return 'Voir';
};

const Quotes = () => {
  const { getToken } = useBackendAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/quotes/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Impossible de charger les devis');
      const data = await res.json();
      setQuotes(data.quotes || []);
    } catch (err) {
      setError(err.message || 'Impossible de charger les devis');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const kpis = useMemo(() => {
    const normalized = quotes.map((quote) => normalizeStatus(quote.status));

    return {
      total: quotes.length,
      pending: normalized.filter((status) => status === 'pending' || status === 'submitted').length,
      approved: normalized.filter((status) => status === 'approved').length,
      rejected: normalized.filter((status) => status === 'rejected').length,
    };
  }, [quotes]);

  const handlePayment = (quote) => {
    setSelectedQuote(quote);
    setPaymentDialogOpen(true);
    setPaymentError('');
    setPaymentReceipt(null);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    if (!selectedQuote) return;

    setPaymentDialogOpen(false);
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/quotes/${selectedQuote._id}/pay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const confirmation = await res.json();
      if (!res.ok) throw new Error(confirmation?.message || 'Erreur lors de la validation du devis');

      setPaymentReceipt({ payment: paymentResult, confirmation });
      await loadQuotes();
    } catch (err) {
      setPaymentError(err.message || "Le paiement n'a pas pu être validé.");
    } finally {
      setPaymentLoading(false);
      setSelectedQuote(null);
    }
  };

  return (
    <div className="dx-dashboard-shell">
      <div className="dx-dashboard">
        <header className="dx-dashboard__header">
          <span className="dx-dashboard__eyebrow">espace client · devis</span>
          <h1 className="dx-dashboard__title">Mes devis</h1>
          <p className="dx-dashboard__subtitle">
            Suivez vos demandes de devis, visualisez les tarifs disponibles et poursuivez rapidement la prochaine étape.
          </p>
          <div className="dx-dashboard__actions">
            <Link href="/quote-request" className="dx-button dx-button--primary">Nouveau devis</Link>
          </div>
        </header>

        {!loading && !error && quotes.length > 0 ? (
          <section className="dx-grid dx-grid--four">
            <article className="dx-card"><p className="dx-card__subtitle">Total devis</p><strong className="dx-card__value">{kpis.total}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">Demandés / en attente</p><strong className="dx-card__value">{kpis.pending}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">Approuvés</p><strong className="dx-card__value">{kpis.approved}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">Rejetés</p><strong className="dx-card__value">{kpis.rejected}</strong></article>
          </section>
        ) : null}

        <section className="dx-section">
          <div className="dx-section__header">
            <span className="dx-section__eyebrow">suivi du cycle de devis</span>
            <h2 className="dx-section__title">Demandé → En attente → Approuvé / Rejeté</h2>
            <p className="dx-section__subtitle">Chaque ligne affiche le trajet, le mode de transport, le montant et l’action recommandée.</p>
          </div>

          <div className="dx-chip-list dx-quote-legend" aria-label="Légende des statuts de devis">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <span key={status} className={`dx-status dx-status--${config.tone}`}>{config.label}</span>
            ))}
          </div>

          {loading ? <LoadingState message="Chargement des devis..." /> : null}
          {!loading && error ? <ErrorState message="Impossible de charger les devis" onRetry={loadQuotes} /> : null}
          {!loading && !error && quotes.length === 0 ? (
            <EmptyState
              title="Aucun devis pour le moment"
              helper="Créez votre premier devis pour recevoir une estimation personnalisée."
              cta={<Link href="/quote-request" className="dx-button dx-button--primary dx-button--sm">Demander un devis</Link>}
            />
          ) : null}

          {!loading && !error && quotes.length > 0 ? (
            <>
              <div className="dx-table-wrapper dx-desktop-table">
                <table className="dx-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Trajet</th>
                      <th>Mode</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote) => {
                      const status = normalizeStatus(quote.status);
                      const statusConfig = STATUS_CONFIG[status];

                      return (
                        <tr key={quote._id}>
                          <td><strong>#{toReference(quote)}</strong></td>
                          <td>{toRoute(quote)}</td>
                          <td>{toMode(quote)}</td>
                          <td>{toAmount(quote)} {quote.currency || 'USD'}</td>
                          <td><span className={`dx-status dx-status--${statusConfig.tone}`}>{statusConfig.label}</span></td>
                          <td>
                            <div className="dx-actions">
                              <Link href={`/new-shipment/${quote._id}`} className="dx-button dx-button--outline dx-button--sm">{nextActionLabel(quote)}</Link>
                              {quote.status === 'approved' ? (
                                <button type="button" className="dx-button dx-button--primary dx-button--sm" onClick={() => handlePayment(quote)}>
                                  Payer
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="dx-mobile-list">
                {quotes.map((quote) => {
                  const status = normalizeStatus(quote.status);
                  const statusConfig = STATUS_CONFIG[status];

                  return (
                    <article key={`q-mobile-${quote._id}`} className="dx-card dx-quote-card">
                      <div className="dx-quote-card__head">
                        <strong>#{toReference(quote)}</strong>
                        <span className={`dx-status dx-status--${statusConfig.tone}`}>{statusConfig.label}</span>
                      </div>

                      <div className="dx-meta">
                        <p className="dx-card__subtitle"><strong>Trajet :</strong> {toRoute(quote)}</p>
                        <p className="dx-card__subtitle"><strong>Mode :</strong> {toMode(quote)}</p>
                        <p className="dx-card__subtitle"><strong>Prix :</strong> {toAmount(quote)} {quote.currency || 'USD'}</p>
                      </div>

                      <div className="dx-actions">
                        <Link href={`/new-shipment/${quote._id}`} className="dx-button dx-button--outline dx-button--sm">{nextActionLabel(quote)}</Link>
                        {quote.status === 'approved' ? (
                          <button type="button" className="dx-button dx-button--primary dx-button--sm" onClick={() => handlePayment(quote)}>
                            Payer
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : null}

          {paymentLoading ? <LoadingState message="Traitement du paiement en cours..." /> : null}
          {paymentError ? <ErrorState message={paymentError} /> : null}
          {paymentReceipt ? (
            <div className="dx-empty dx-empty--success">
              <p>Paiement confirmé.</p>
              <small>
                Référence: {paymentReceipt?.payment?.transactionReference || paymentReceipt?.payment?.reference || paymentReceipt?.payment?.receipt || paymentReceipt?.payment?.id || '-'}
              </small>
            </div>
          ) : null}
        </section>

        <PaymentDialog isOpen={isPaymentDialogOpen} quote={selectedQuote} onClose={() => setPaymentDialogOpen(false)} onSuccess={handlePaymentSuccess} />
      </div>
    </div>
  );
};

export default Quotes;
