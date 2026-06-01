import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useBackendAuth } from '../auth/useBackendAuth';
import { API_BASE } from '../api/api';
import PaymentDialog from '../components/payments/PaymentDialog';
import { fetchClientQuotes } from '../api/logistics';
import { getQuoteStatusMeta } from '../constants/quoteStatus';
import { normalizeApiError } from '../utils/apiError';

const STATUS_CLASS_BY_TONE = {
  info: 'dx-status--info',
  warning: 'dx-status--warning',
  success: 'dx-status--success',
  danger: 'dx-status--danger',
};

const formatMoney = (value, currency = 'EUR') => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `${value} ${currency}`;
  }
};

const Quotes = () => {
  const router = useRouter();
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
    try {
      const token = await getToken();
      const list = await fetchClientQuotes(token);
      setQuotes(Array.isArray(list) ? list : []);
      setError('');
    } catch (err) {
      setError(normalizeApiError(err, 'Impossible de charger vos devis pour le moment.').message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const paymentEligibleStatuses = useMemo(() => new Set(['approved', 'awaiting_customer_approval']), []);

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
      if (!res.ok) {
        throw Object.assign(new Error(confirmation?.message || 'Erreur lors de la validation du devis'), {
          status: res.status,
        });
      }

      setPaymentReceipt({ payment: paymentResult, confirmation });
      await loadQuotes();
    } catch (err) {
      setPaymentError(normalizeApiError(err, "Le paiement n'a pas pu être validé.").message);
    } finally {
      setPaymentLoading(false);
      setSelectedQuote(null);
    }
  };

  const closePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedQuote(null);
  };

  return (
    <div className="dx-dashboard-shell">
      <div className="dx-dashboard">
        <header className="dx-dashboard__header">
          <span className="dx-dashboard__eyebrow">espace client</span>
          <h1 className="dx-dashboard__title">Mes devis</h1>
          <p className="dx-dashboard__subtitle">
            Parcours standard: <strong>Estimate</strong> → <strong>Quote review</strong> → <strong>Approval</strong> → <strong>Shipment</strong>.
          </p>
        </header>

        {router.query.submitted === '1' && (
          <section className="dx-card quotes-page__notice quotes-page__notice--success">
            Votre demande de devis a bien été envoyée. Suivez son statut ci-dessous.
          </section>
        )}

        {error && <section className="dx-card quotes-page__notice quotes-page__notice--error">{error}</section>}

        {loading ? (
          <section className="dx-section quotes-page__loading">Chargement de vos devis…</section>
        ) : quotes.length === 0 ? (
          <section className="dx-section quotes-page__empty">
            <h2>Aucun devis pour le moment</h2>
            <p>Commencez par estimer votre expédition, puis soumettez une demande de devis.</p>
            <a href="/quote-request" className="dx-button dx-button--primary">Demander un devis</a>
          </section>
        ) : (
          <section className="dx-section">
            <div className="quotes-page__table-wrap">
              <table className="quotes-page__table">
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th>Itinéraire</th>
                    <th>Transport</th>
                    <th>Montant estimé</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => {
                    const status = getQuoteStatusMeta(quote.status);
                    const toneClass = STATUS_CLASS_BY_TONE[status.tone] || STATUS_CLASS_BY_TONE.info;
                    const price = quote?.pricing?.estimatedPrice ?? quote.estimatedPrice;
                    const currency = quote?.pricing?.currency || quote.currency || 'EUR';

                    return (
                      <tr key={quote._id}>
                        <td>…{quote._id?.slice(-6) || '—'}</td>
                        <td>{quote.origin || quote?.route?.origin || '—'} → {quote.destination || quote?.route?.destination || '—'}</td>
                        <td>{quote.transportType || quote?.route?.transportType || '—'}</td>
                        <td>{formatMoney(price, currency)}</td>
                        <td>
                          <div className="quotes-page__status-cell">
                            <span className={`dx-status ${toneClass}`}>{status.label}</span>
                            <small>{status.description}</small>
                          </div>
                        </td>
                        <td>
                          {paymentEligibleStatuses.has(quote.status) ? (
                            <button className="dx-button dx-button--primary dx-button--sm" onClick={() => handlePayment(quote)}>
                              Payer
                            </button>
                          ) : (
                            <span className="quotes-page__muted">Aucune action</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {paymentLoading && <section className="dx-card quotes-page__notice">Traitement du paiement en cours…</section>}
        {paymentError && <section className="dx-card quotes-page__notice quotes-page__notice--error">{paymentError}</section>}
        {paymentReceipt?.confirmation?.message && (
          <section className="dx-card quotes-page__notice quotes-page__notice--success">{paymentReceipt.confirmation.message}</section>
        )}
      </div>

      <PaymentDialog isOpen={isPaymentDialogOpen} quote={selectedQuote} onClose={closePaymentDialog} onSuccess={handlePaymentSuccess} />
    </div>
  );
};

export default Quotes;
