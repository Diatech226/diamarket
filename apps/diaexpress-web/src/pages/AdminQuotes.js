import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAdminAuthGuard } from "../auth/useAdminAuthGuard";
import { fetchAdminQuotes as apiFetchAdminQuotes, updateQuoteStatus as apiUpdateQuoteStatus } from "../api/logistics";

const STATUS_VARIANTS = {
  pending: { label: "En attente", tone: "warning", icon: "⏳" },
  confirmed: { label: "Devis approuvé", tone: "success", icon: "✅" },
  dispatched: { label: "Expédition créée", tone: "info", icon: "📦" },
  paid: { label: "Payé", tone: "success", icon: "💳" },
  rejected: { label: "Rejeté", tone: "danger", icon: "❌" },
};

const formatCurrency = (value, currency = "EUR") => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return `${value}`;
  }

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch (err) {
    return `${numeric.toFixed(2)} ${currency}`;
  }
};

const resolveStatus = (status) => STATUS_VARIANTS[status] ?? STATUS_VARIANTS.pending;

const formatTransportLabel = (value) => {
  if (!value) {
    return '—';
  }

  const normalised = String(value).toLowerCase();
  switch (normalised) {
    case 'air':
      return 'Aérien';
    case 'sea':
      return 'Maritime';
    case 'road':
      return 'Routier';
    case 'rail':
      return 'Rail';
    default:
      return normalised.charAt(0).toUpperCase() + normalised.slice(1);
  }
};

const formatProviderLabel = (provider) => {
  if (!provider) {
    return 'Équipe interne';
  }

  const normalised = String(provider).toLowerCase();
  if (normalised === 'internal') {
    return 'Équipe interne';
  }
  if (normalised === 'cma-cgm' || normalised === 'cma cgm') {
    return 'CMA CGM';
  }
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

const formatPaymentStatus = (status) => {
  if (!status) {
    return 'en attente';
  }

  const normalised = String(status).toLowerCase();
  switch (normalised) {
    case 'approved':
      return 'confirmé';
    case 'failed':
      return 'échoué';
    case 'pending':
      return 'en attente';
    default:
      return normalised;
  }
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (err) {
    return value;
  }
};

const AdminQuotes = () => {
  const { requireAdminToken, isAdminReady } = useAdminAuthGuard();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [transportFilter, setTransportFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const quotesPerPage = 6;

  const fetchQuotes = useCallback(async () => {
    const token = await requireAdminToken();
    return apiFetchAdminQuotes(token);
  }, [requireAdminToken]);

  const loadQuotes = useCallback(async (withSpinner = true) => {
    if (!isAdminReady) {
      return;
    }

    if (withSpinner) {
      setLoading(true);
    }

    setError(null);

    try {
      const list = await fetchQuotes();
      setQuotes(list);
    } catch (err) {
      setQuotes([]);
      setError(err.message);
    } finally {
      if (withSpinner) {
        setLoading(false);
      }
    }
  }, [fetchQuotes, isAdminReady]);

  useEffect(() => {
    if (!isAdminReady) {
      return;
    }

    loadQuotes(true);
  }, [isAdminReady, loadQuotes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQuotes(false);
    setRefreshing(false);
  };

  const updateStatus = async (id, newStatus) => {
    if (newStatus === "approved") {
      const confirmAction = window.confirm("Confirmer ce devis ?");
      if (!confirmAction) return;
    }

    try {
      const token = await requireAdminToken();
      await apiUpdateQuoteStatus(id, newStatus, token);
      await loadQuotes(false);
    } catch (err) {
      window.alert(err.message);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [quotes.length, statusFilter, transportFilter, providerFilter, searchTerm]);

  const summary = useMemo(() => {
    const counts = {
      total: quotes.length,
      pending: 0,
      confirmed: 0,
      dispatched: 0,
      rejected: 0,
      paid: 0,
    };

    const clients = new Set();
    let totalAmount = 0;

    quotes.forEach((quote) => {
      const status = quote?.status ?? "pending";
      if (counts[status] !== undefined) {
        counts[status] += 1;
      } else {
        counts.pending += 1;
      }

      const estimated = quote?.estimatedPrice ?? quote?.price;
      const numeric = Number(estimated);
      if (Number.isFinite(numeric)) {
        totalAmount += numeric;
      }

      if (quote?.userEmail) {
        clients.add(quote.userEmail);
      }
    });

    return {
      ...counts,
      totalAmount,
      clients: clients.size,
    };
  }, [quotes]);

  const transportOptions = useMemo(() => {
    const options = new Set();
    quotes.forEach((quote) => {
      if (quote?.transportType) {
        options.add(String(quote.transportType).toLowerCase());
      }
    });
    return Array.from(options).sort();
  }, [quotes]);

  const providerOptions = useMemo(() => {
    const providers = new Set();
    quotes.forEach((quote) => {
      const provider = quote?.provider ? String(quote.provider).toLowerCase() : 'internal';
      providers.add(provider);
    });
    return Array.from(providers).sort();
  }, [quotes]);

  const filtersActive =
    statusFilter !== 'all' ||
    transportFilter !== 'all' ||
    providerFilter !== 'all' ||
    searchTerm.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setTransportFilter('all');
    setProviderFilter('all');
    setSearchTerm('');
  };

  const filteredQuotes = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return quotes.filter((quote) => {
      const status = quote?.status ?? 'pending';
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }

      const transportType = quote?.transportType
        ? String(quote.transportType).toLowerCase()
        : '';
      if (transportFilter !== 'all' && transportType !== transportFilter) {
        return false;
      }

      const provider = quote?.provider ? String(quote.provider).toLowerCase() : 'internal';
      if (providerFilter !== 'all' && provider !== providerFilter) {
        return false;
      }

      if (search) {
        const haystack = [
          quote?.userEmail,
          quote?.company,
          quote?.origin,
          quote?.destination,
          quote?._id,
          quote?.trackingNumber,
          quote?.provider,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        if (!haystack.some((value) => value.includes(search))) {
          return false;
        }
      }

      return true;
    });
  }, [quotes, statusFilter, transportFilter, providerFilter, searchTerm]);

  const displayedQuotes = useMemo(() => {
    const start = (page - 1) * quotesPerPage;
    const end = start + quotesPerPage;
    return filteredQuotes.slice(start, end);
  }, [page, filteredQuotes, quotesPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / quotesPerPage));

  return (
    <div className="dx-dashboard-shell">
      <div className="dx-dashboard">
        <header className="dx-dashboard__header">
          <span className="dx-dashboard__eyebrow">pilotage des devis</span>
          <h1 className="dx-dashboard__title">Gestion centralisée des demandes clients</h1>
          <p className="dx-dashboard__subtitle">
            Visualisez les demandes reçues, validez les propositions commerciales et
            déclenchez les expéditions au bon moment. Chaque statut reflète votre flux
            opérationnel en temps réel.
          </p>
          <div className="dx-dashboard__actions">
            <button
              className="dx-button dx-button--primary dx-button--sm"
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              {refreshing ? "Actualisation…" : "Actualiser les données"}
            </button>
            <button
              className="dx-button dx-button--ghost dx-button--sm"
              onClick={() => setPage(1)}
              disabled={loading}
            >
              Revenir au début
            </button>
          </div>
        </header>

        <section className="dx-section dx-section--surface">
          <div className="dx-section__header">
            <span className="dx-section__eyebrow">indicateurs clés</span>
            <h2 className="dx-section__title">Vue synthétique des devis</h2>
            <p className="dx-section__subtitle">
              Un aperçu immédiat de votre charge commerciale et des prochaines actions à
              engager.
            </p>
          </div>
          <div className="dx-grid dx-grid--three">
            <div className="dx-card">
              <span className="dx-card__title">Devis suivis</span>
              <span className="dx-card__value">{summary.total}</span>
              <p className="dx-card__subtitle">
                {summary.clients} client{summary.clients > 1 ? "s" : ""} actifs sur la période
              </p>
            </div>
            <div className="dx-card">
              <span className="dx-card__title">En attente de décision</span>
              <span className="dx-card__value">{summary.pending}</span>
              <p className="dx-card__subtitle">
                Priorisez ces demandes pour réduire votre délai de réponse.
              </p>
            </div>
            <div className="dx-card">
              <span className="dx-card__title">Valeur prévisionnelle</span>
              <span className="dx-card__value">
                {formatCurrency(summary.totalAmount || 0)}
              </span>
              <p className="dx-card__subtitle">
                Somme estimée des devis confirmables ou en négociation.
              </p>
            </div>
          </div>
          <div className="dx-chip-list">
            <span className="dx-chip">✅ Devis approuvés : {summary.confirmed}</span>
            <span className="dx-chip">📦 Expédition créées : {summary.dispatched}</span>
            <span className="dx-chip">💳 Payés : {summary.paid}</span>
            <span className="dx-chip">❌ Rejetés : {summary.rejected}</span>
          </div>
        </section>

        <section className="dx-section">
          <div className="dx-section__header">
            <span className="dx-section__eyebrow">liste opérationnelle</span>
            <h2 className="dx-section__title">Détails des devis clients</h2>
            <p className="dx-section__subtitle">
              Filtrez les informations clés et actionnez le bon statut sans quitter la
              vue.
            </p>
          </div>

          <div className="dx-filterbar">
            <div className="dx-field">
              <label htmlFor="quote-status-filter">Statut</label>
              <select
                id="quote-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="dx-select"
              >
                <option value="all">Tous</option>
                {Object.entries(STATUS_VARIANTS).map(([value, variant]) => (
                  <option key={value} value={value}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="dx-field">
              <label htmlFor="quote-transport-filter">Transport</label>
              <select
                id="quote-transport-filter"
                value={transportFilter}
                onChange={(event) => setTransportFilter(event.target.value)}
                className="dx-select"
              >
                <option value="all">Tous</option>
                {transportOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatTransportLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="dx-field">
              <label htmlFor="quote-provider-filter">Offre</label>
              <select
                id="quote-provider-filter"
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                className="dx-select"
              >
                <option value="all">Toutes</option>
                {providerOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatProviderLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="dx-field dx-field--grow">
              <label htmlFor="quote-search">Recherche</label>
              <input
                id="quote-search"
                type="search"
                placeholder="Email, destination, numéro…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="dx-search"
              />
            </div>

            <button
              type="button"
              className="dx-button dx-button--ghost dx-button--sm"
              onClick={resetFilters}
              disabled={!filtersActive}
            >
              Réinitialiser
            </button>
          </div>

          {loading ? (
            <div className="dx-empty">Chargement des devis…</div>
          ) : error ? (
            <div className="dx-empty">{error}</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="dx-empty">
              {quotes.length === 0
                ? "Aucun devis n’a encore été enregistré. Rapprochez-vous de vos équipes commerciales pour initier les premières demandes."
                : "Aucun devis ne correspond à vos filtres. Ajustez vos critères pour retrouver une demande."}
            </div>
          ) : (
            <>
              <div className="dx-table-wrapper">
                <table className="dx-table">
                  <thead>
                    <tr>
                      <th>Client & contact</th>
                      <th>Itinéraire</th>
                      <th>Offre sélectionnée</th>
                      <th>Montant</th>
                      <th>Mise à jour</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedQuotes.map((quote) => {
                      const status = resolveStatus(quote.status);
                      const provider = quote?.provider ? String(quote.provider).toLowerCase() : 'internal';
                      const transportLabel = formatTransportLabel(quote.transportType);
                      const quantityLabel = (() => {
                        if (!quote?.quantity) {
                          return null;
                        }
                        const unit = quote?.unitType ? ` ${quote.unitType}` : '';
                        return `${quote.quantity}${unit}`;
                      })();

                      return (
                        <tr key={quote._id}>
                          <td>
                            <div className="dx-meta">
                              <strong>{quote.userEmail || "Contact direct"}</strong>
                              {quote.company && <span>{quote.company}</span>}
                              <span className="dx-meta__hint">Réf. {quote._id?.slice(-6) || '—'}</span>
                              {quote.notes && <span className="dx-meta__hint">{quote.notes}</span>}
                            </div>
                          </td>
                          <td>
                            <div className="dx-meta">
                              <strong>
                                {quote.origin || 'Origine inconnue'} → {quote.destination || 'Destination inconnue'}
                              </strong>
                              <span>
                                {transportLabel}
                                {quantityLabel ? ` · ${quantityLabel}` : ''}
                              </span>
                              {quote.transportType && quote.estimationMethod && (
                                <span className="dx-meta__hint">
                                  Calcul : {quote.estimationMethod}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="dx-meta">
                              <span className="dx-chip dx-chip--muted">{formatProviderLabel(provider)}</span>
                              {quote.matchedPricingId && (
                                <span className="dx-meta__hint">Pricing #{String(quote.matchedPricingId).slice(-5)}</span>
                              )}
                              {quote.transportType && (
                                <span className="dx-meta__hint">Mode : {transportLabel}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="dx-meta">
                              <strong>
                                {formatCurrency(quote.estimatedPrice ?? quote.price, quote.currency)}
                              </strong>
                              {quote.finalPrice && (
                                <span className="dx-meta__hint">
                                  Devis approuvé : {formatCurrency(quote.finalPrice, quote.currency)}
                                </span>
                              )}
                              {quote.paymentStatus && (
                                <span className="dx-meta__hint">
                                  Paiement : {formatPaymentStatus(quote.paymentStatus)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="dx-meta">
                              <strong>{formatDateTime(quote.updatedAt)}</strong>
                              <span className="dx-meta__hint">Créé le {formatDateTime(quote.createdAt)}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`dx-status dx-status--${status.tone}`}>
                              <span>{status.icon}</span>
                              <span>{status.label}</span>
                            </span>
                          </td>
                          <td>
                            <div className="dx-actions">
                              {quote.status === "pending" && (
                                <button
                                  className="dx-button dx-button--primary dx-button--sm"
                                  onClick={() => updateStatus(quote._id, "approved")}
                                >
                                  Valider
                                </button>
                              )}
                              {quote.status === "approved" && (
                                <>
                                  <button
                                    className="dx-button dx-button--outline dx-button--sm"
                                    onClick={() => updateStatus(quote._id, "converted_to_shipment")}
                                  >
                                    Expédier
                                  </button>
                                  <button
                                    className="dx-button dx-button--danger dx-button--sm"
                                    onClick={() => updateStatus(quote._id, "rejected")}
                                  >
                                    Refuser
                                  </button>
                                </>
                              )}
                              {quote.status === "converted_to_shipment" && (
                                <button
                                  className="dx-button dx-button--ghost dx-button--sm"
                                  onClick={() => updateStatus(quote._id, "paid")}
                                >
                                  Marquer payé
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="dx-pagination">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageIndex) => (
                    <button
                      key={pageIndex}
                      className={pageIndex === page ? "active" : undefined}
                      onClick={() => setPage(pageIndex)}
                    >
                      {pageIndex}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminQuotes;
