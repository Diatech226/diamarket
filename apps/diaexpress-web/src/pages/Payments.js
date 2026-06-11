import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useBackendAuth } from '../auth/useBackendAuth';
import { myPayments } from '../api/payment';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageStates';

const normalizeStatus = (status) => {
  const value = String(status || '').toLowerCase();

  if (value.includes('success') || value.includes('paid') || value.includes('complete') || value.includes('succeed')) {
    return { key: 'succeeded', label: status || 'Payé', tone: 'success' };
  }

  if (
    value.includes('pending')
    || value.includes('await')
    || value.includes('processing')
    || value.includes('progress')
  ) {
    return { key: 'pending', label: status || 'En attente', tone: 'warning' };
  }

  if (value.includes('fail') || value.includes('reject') || value.includes('error')) {
    return { key: 'failed', label: status || 'Échoué', tone: 'danger' };
  }

  if (value.includes('cancel') || value.includes('refund')) {
    return { key: 'cancelled', label: status || 'Annulé / remboursé', tone: 'info' };
  }

  return { key: 'other', label: status || 'Inconnu', tone: 'info' };
};

const parseAmount = (payment) => Number(payment.amount ?? payment.total ?? 0);
const paymentCurrency = (payment) => payment.currency || payment.currencyCode || '';
const paymentAmount = (payment) => `${payment.amount ?? payment.total ?? '-'} ${paymentCurrency(payment)}`.trim();
const paymentLabel = (payment) => payment.status || payment.state || '—';
const paymentRef = (payment) => payment.transactionReference || payment.reference || payment.receipt || payment._id || payment.id || '-';

const relatedRecord = (payment) => {
  if (payment.quote?.transportType || payment.quote?.origin || payment.quote?.destination) {
    return `Devis: ${payment.quote.transportType || ''} ${payment.quote.origin ? `· ${payment.quote.origin}` : ''}${payment.quote.destination ? ` → ${payment.quote.destination}` : ''}`.trim();
  }
  if (payment.quoteId?.transportType) return `Devis: ${payment.quoteId.transportType}`;
  if (payment.shipment?.trackingCode || payment.shipmentId?.trackingCode) return `Expédition: ${payment.shipment?.trackingCode || payment.shipmentId?.trackingCode}`;
  return payment.quoteId || payment.shipmentId || 'Non lié';
};

const paymentProvider = (payment) => payment.provider || payment.gateway || payment.method || payment.paymentMethod || 'Non précisé';

const isLocalDiaPayMode = () => {
  if (typeof window === 'undefined') return false;
  const envDisabledLegacy = String(process.env.NEXT_PUBLIC_DIAPAY_DISABLED || '').toLowerCase() === 'true';
  const envDisabled = String(process.env.NEXT_PUBLIC_ENABLE_DIAPAY || '').toLowerCase() === 'false';
  return envDisabledLegacy || envDisabled || ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

const formatDate = (value, withTime = true) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return withTime ? date.toLocaleString('fr-FR') : date.toLocaleDateString('fr-FR');
};

const Payments = () => {
  const { getToken } = useBackendAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePaymentId, setActivePaymentId] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    setActivePaymentId(null);
    try {
      const token = await getToken();
      const data = await myPayments(token);
      if (data?.error || data?.success === false) {
        throw new Error(data?.message || data?.error || 'Impossible de récupérer les paiements.');
      }
      setPayments(data.payments || data || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des paiements.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    if (statusFilter === 'all') return payments;
    return payments.filter((payment) => normalizeStatus(paymentLabel(payment)).key === statusFilter);
  }, [payments, statusFilter]);

  const summary = useMemo(() => {
    const successfulPayments = payments.filter((payment) => normalizeStatus(paymentLabel(payment)).key === 'succeeded');
    const failedPayments = payments.filter((payment) => normalizeStatus(paymentLabel(payment)).key === 'failed');
    const pendingPayments = payments.filter((payment) => normalizeStatus(paymentLabel(payment)).key === 'pending');
    const latest = [...payments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

    const hasNumericPaidAmounts = successfulPayments.some((payment) => {
      const amount = parseAmount(payment);
      return Number.isFinite(amount) && amount > 0;
    });

    return {
      totalPaid: hasNumericPaidAmounts
        ? successfulPayments.reduce((acc, payment) => {
          const amount = parseAmount(payment);
          return Number.isFinite(amount) ? acc + amount : acc;
        }, 0)
        : null,
      pendingCount: pendingPayments.length,
      failedCount: failedPayments.length,
      latestDate: latest?.createdAt || null,
      latestAmount: latest ? paymentAmount(latest) : '—',
    };
  }, [payments]);

  const localMode = isLocalDiaPayMode();
  const activePayment = filteredPayments.find((payment) => (payment._id || payment.id) === activePaymentId) || null;

  return (
    <div className="dx-dashboard-shell">
      <div className="dx-dashboard">
        <header className="dx-dashboard__header">
          <span className="dx-dashboard__eyebrow">espace client · finance</span>
          <h1 className="dx-dashboard__title">Mes paiements</h1>
          <p className="dx-dashboard__subtitle">Suivez votre historique de paiements, vérifiez les statuts de transaction et retrouvez rapidement les références liées à vos devis et expéditions.</p>
          <div className="dx-dashboard__actions">
            <Link href="/quotes" className="dx-button dx-button--primary">Voir mes devis</Link>
          </div>
        </header>

        {localMode ? (
          <section className="dx-section dx-section--surface">
            <div className="dx-empty dx-empty--info" role="status" aria-live="polite">
              <p>diaPay est désactivé en mode local.</p>
              <small>La consultation de votre historique reste disponible, mais les paiements en direct ne sont pas activés sur cet environnement.</small>
            </div>
          </section>
        ) : null}

        {!loading && !error && payments.length > 0 ? (
          <section className="dx-grid dx-grid--four">
            <article className="dx-card"><p className="dx-card__subtitle">Total payé</p><strong className="dx-card__value">{summary.totalPaid !== null ? summary.totalPaid.toLocaleString('fr-FR') : '—'}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">Paiements en attente</p><strong className="dx-card__value">{summary.pendingCount}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">Paiements échoués</p><strong className="dx-card__value">{summary.failedCount}</strong></article>
            <article className="dx-card"><p className="dx-card__subtitle">Dernier paiement</p><strong className="dx-card__value dx-card__value--compact">{summary.latestDate ? `${formatDate(summary.latestDate, false)} · ${summary.latestAmount}` : '—'}</strong></article>
          </section>
        ) : null}

        <section className="dx-section">
          <div className="dx-filterbar">
            <label className="dx-field" htmlFor="payment-status-filter">
              <span>Filtrer par statut</span>
              <select id="payment-status-filter" className="dx-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Tous</option>
                <option value="succeeded">Payés</option>
                <option value="pending">En attente / en traitement</option>
                <option value="failed">Échoués</option>
                <option value="cancelled">Annulés / remboursés</option>
              </select>
            </label>
            <div className="dx-actions dx-actions--wrap">
              <button type="button" className="dx-button dx-button--ghost" onClick={fetchPayments}>Actualiser</button>
            </div>
          </div>

          {loading ? <LoadingState message="Chargement des paiements…" /> : null}
          {!loading && error ? <ErrorState message="Impossible de charger l’historique des paiements" onRetry={fetchPayments} /> : null}
          {!loading && !error && filteredPayments.length === 0 ? (
            <EmptyState title="Aucun paiement pour le moment" helper="Vos transactions apparaîtront ici dès leur enregistrement." cta={<Link href="/quotes" className="dx-button dx-button--primary dx-button--sm">Voir mes devis</Link>} />
          ) : null}

          {!loading && !error && filteredPayments.length > 0 ? (
            <>
              <div className="dx-table-wrapper dx-desktop-table">
                <table className="dx-table">
                  <thead><tr><th>Référence</th><th>Montant</th><th>Statut</th><th>Lié à</th><th>Méthode / fournisseur</th><th>Date</th></tr></thead>
                  <tbody>
                    {filteredPayments.map((payment) => {
                      const status = normalizeStatus(paymentLabel(payment));

                      return (
                        <tr key={payment._id || payment.id}>
                          <td><strong>{paymentRef(payment)}</strong></td>
                          <td><strong>{paymentAmount(payment)}</strong></td>
                          <td><span className={`dx-status dx-status--${status.tone}`}>{status.label}</span></td>
                          <td>{relatedRecord(payment)}</td>
                          <td>{paymentProvider(payment)}</td>
                          <td>{formatDate(payment.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="dx-mobile-list">
                {filteredPayments.map((payment) => {
                  const status = normalizeStatus(paymentLabel(payment));

                  return (
                    <article key={`p-mobile-${payment._id || payment.id}`} className="dx-card dx-payment-card">
                      <div className="dx-payment-card__head">
                        <strong>{paymentAmount(payment)}</strong>
                        <span className={`dx-status dx-status--${status.tone}`}>{status.label}</span>
                      </div>
                      <div className="dx-meta">
                        <p className="dx-card__subtitle"><strong>Référence :</strong> {paymentRef(payment)}</p>
                        <p className="dx-card__subtitle"><strong>Lié à :</strong> {relatedRecord(payment)}</p>
                        <p className="dx-card__subtitle"><strong>Méthode / fournisseur :</strong> {paymentProvider(payment)}</p>
                        <p className="dx-card__subtitle"><strong>Date :</strong> {formatDate(payment.createdAt)}</p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {activePayment ? (
                <article className="dx-card dx-payment-detail" aria-live="polite">
                  <h3 className="dx-card__title">Détail du paiement</h3>
                  <div className="dx-meta">
                    <p><strong>Référence :</strong> {paymentRef(activePayment)}</p>
                    <p><strong>Statut :</strong> {paymentLabel(activePayment)}</p>
                    <p><strong>Montant :</strong> {paymentAmount(activePayment)}</p>
                    <p><strong>Méthode / fournisseur :</strong> {paymentProvider(activePayment)}</p>
                    <p><strong>Lié à :</strong> {relatedRecord(activePayment)}</p>
                    <p><strong>Date de création :</strong> {formatDate(activePayment.createdAt)}</p>
                    <p><strong>Dernière mise à jour :</strong> {formatDate(activePayment.updatedAt)}</p>
                  </div>
                </article>
              ) : null}
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default Payments;
