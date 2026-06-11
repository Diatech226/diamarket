import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAdminAuthGuard } from "../auth/useAdminAuthGuard";
import {
  fetchAdminShipments as apiFetchAdminShipments,
  updateShipmentStatus as apiUpdateShipmentStatus,
  deleteShipment as apiDeleteShipment,
} from "../api/logistics";
import {
  SHIPMENT_STATUS_FLOW,
  SHIPMENT_STATUS_OPTIONS,
  getStatusIndex,
} from "../constants/shipmentStatus";

const STATUS_TONES = {
  "En attente": { tone: "warning", icon: "🕒" },
  Préparation: { tone: "info", icon: "🧰" },
  "En transit": { tone: "info", icon: "🚚" },
  "Bloqué douane": { tone: "danger", icon: "🛃" },
  "Arrivé à destination": { tone: "info", icon: "📍" },
  "En livraison": { tone: "info", icon: "📬" },
  Livré: { tone: "success", icon: "🎉" },
  Rejeté: { tone: "danger", icon: "⚠️" },
};

const resolveTone = (status) => STATUS_TONES[status] ?? { tone: "info", icon: "📦" };

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (err) {
    return value;
  }
};

const formatTransportLabel = (value) => {
  if (!value) {
    return "—";
  }

  const normalised = String(value).toLowerCase();
  switch (normalised) {
    case "air":
      return "Aérien";
    case "sea":
      return "Maritime";
    case "road":
      return "Routier";
    case "rail":
      return "Rail";
    default:
      return normalised.charAt(0).toUpperCase() + normalised.slice(1);
  }
};

const formatProviderLabel = (provider) => {
  if (!provider) {
    return "Équipe interne";
  }

  const normalised = String(provider).toLowerCase();
  if (normalised === "internal") {
    return "Équipe interne";
  }
  if (normalised === "cma-cgm" || normalised === "cma cgm") {
    return "CMA CGM";
  }
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

const computeProgressStep = (status) => {
  const index = getStatusIndex(status);
  return index < 0 ? 0 : index + 1;
};

const AdminShipments = () => {
  const { requireAdminToken, isAdminReady } = useAdminAuthGuard();
  const [shipments, setShipments] = useState([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const PAGE_SIZE = 8;

  const fetchShipments = useCallback(async () => {
    const token = await requireAdminToken();
    return apiFetchAdminShipments(token);
  }, [requireAdminToken]);

  const loadShipments = useCallback(async () => {
    if (!isAdminReady) {
      return;
    }

    setLoading(true);
    try {
      const list = await fetchShipments();
      setShipments(list);
    } catch (err) {
      setShipments([]);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [fetchShipments, isAdminReady]);

  useEffect(() => {
    if (!isAdminReady) {
      return;
    }

    loadShipments();
  }, [isAdminReady, loadShipments]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, destinationFilter, providerFilter, transportFilter, searchTerm]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadShipments();
    setRefreshing(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = await requireAdminToken();
      await apiUpdateShipmentStatus(id, newStatus, token);
      showToast(`Statut mis à jour : ${newStatus}`);
      await loadShipments();
    } catch (err) {
      console.error("Erreur modification statut:", err);
      showToast(err.message || "Erreur modification statut", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de cette expédition ?")) return;

    try {
      const token = await requireAdminToken();
      await apiDeleteShipment(id, token);
      showToast("Expédition supprimée");
      await loadShipments();
    } catch (err) {
      showToast(err.message || "Erreur suppression", "error");
    }
  };

  const filteredShipments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const quote =
        shipment.quoteId && typeof shipment.quoteId === "object" ? shipment.quoteId : {};
      const destination = quote.destination || shipment.destination || "";
      const transportType = (quote.transportType || shipment.transportType || "").toString().toLowerCase();
      const provider = shipment.provider ? String(shipment.provider).toLowerCase() : "internal";
      const tracking = shipment.trackingCode || "";
      const status = shipment.status || "";

      if (statusFilter && status !== statusFilter) {
        return false;
      }

      if (
        destinationFilter &&
        !destination.toLowerCase().includes(destinationFilter.toLowerCase())
      ) {
        return false;
      }

      if (providerFilter !== "all" && provider !== providerFilter) {
        return false;
      }

      if (transportFilter !== "all" && transportType !== transportFilter) {
        return false;
      }

      if (search) {
        const haystack = [
          tracking,
          shipment.bookingReference,
          quote.origin,
          quote.destination,
          quote.productType,
          quote.userEmail,
          shipment.currentLocation,
          shipment.provider,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        if (!haystack.some((value) => value.includes(search))) {
          return false;
        }
      }

      return true;
    });
  }, [
    shipments,
    statusFilter,
    destinationFilter,
    providerFilter,
    transportFilter,
    searchTerm,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / PAGE_SIZE));

  const paginatedShipments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredShipments.slice(start, end);
  }, [filteredShipments, page]);

  const providerOptionsList = useMemo(() => {
    const providers = new Set();
    shipments.forEach((shipment) => {
      const provider = shipment.provider ? String(shipment.provider).toLowerCase() : "internal";
      providers.add(provider);
    });
    return Array.from(providers).sort();
  }, [shipments]);

  const transportOptionsList = useMemo(() => {
    const transports = new Set();
    shipments.forEach((shipment) => {
      const quote =
        shipment.quoteId && typeof shipment.quoteId === "object" ? shipment.quoteId : {};
      const transportType = quote.transportType || shipment.transportType;
      if (transportType) {
        transports.add(String(transportType).toLowerCase());
      }
    });
    return Array.from(transports).sort();
  }, [shipments]);

  const filtersActive =
    statusFilter ||
    destinationFilter ||
    searchTerm.trim() !== "" ||
    providerFilter !== "all" ||
    transportFilter !== "all";

  const resetFilters = () => {
    setStatusFilter("");
    setDestinationFilter("");
    setProviderFilter("all");
    setTransportFilter("all");
    setSearchTerm("");
  };

  const summary = useMemo(() => {
    const destinations = new Set();
    const statusCounts = {
      total: shipments.length,
      pending: 0,
      inTransit: 0,
      delivered: 0,
      blocked: 0,
    };

    shipments.forEach((shipment) => {
      const status = shipment.status;
      const destination = shipment.quoteId?.destination || shipment.destination;
      if (destination) {
        destinations.add(destination);
      }

      if (status === "En attente" || status === "Préparation") {
        statusCounts.pending += 1;
      } else if (status === "En transit" || status === "En livraison") {
        statusCounts.inTransit += 1;
      } else if (status === "Livré" || status === "Arrivé à destination") {
        statusCounts.delivered += 1;
      } else if (status === "Bloqué douane") {
        statusCounts.blocked += 1;
      }
    });

    return {
      ...statusCounts,
      destinations: destinations.size,
    };
  }, [shipments]);

  return (
    <div className="dx-dashboard-shell">
      <div className="dx-dashboard">
        <header className="dx-dashboard__header">
          <span className="dx-dashboard__eyebrow">supervision logistique</span>
          <h1 className="dx-dashboard__title">Suivi temps réel des expéditions</h1>
          <p className="dx-dashboard__subtitle">
            Surveillez l’avancement des colis, anticipez les blocages douaniers et
            accompagnez vos clients grâce à une vision claire du pipeline de livraison.
          </p>
          <div className="dx-dashboard__actions">
            <button
              className="dx-button dx-button--primary dx-button--sm"
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              {refreshing ? "Actualisation…" : "Actualiser"}
            </button>
            <button
              className="dx-button dx-button--ghost dx-button--sm"
              onClick={resetFilters}
              disabled={!filtersActive}
            >
              Vider les filtres
            </button>
          </div>
        </header>

        <section className="dx-section dx-section--surface">
          <div className="dx-section__header">
            <span className="dx-section__eyebrow">indicateurs clés</span>
            <h2 className="dx-section__title">Vue d’ensemble des opérations</h2>
            <p className="dx-section__subtitle">
              Identifiez immédiatement les flux à prioriser pour tenir vos engagements.
            </p>
          </div>
          <div className="dx-grid dx-grid--two">
            <div className="dx-card">
              <span className="dx-card__title">Expéditions actives</span>
              <span className="dx-card__value">{summary.total}</span>
              <p className="dx-card__subtitle">
                {summary.destinations} destination{summary.destinations > 1 ? "s" : ""} en
                cours de desserte.
              </p>
            </div>
            <div className="dx-card">
              <span className="dx-card__title">En préparation ou attente</span>
              <span className="dx-card__value">{summary.pending}</span>
              <p className="dx-card__subtitle">
                Organisez les ramassages et contrôlez les documents requis.
              </p>
            </div>
            <div className="dx-card">
              <span className="dx-card__title">En transit</span>
              <span className="dx-card__value">{summary.inTransit}</span>
              <p className="dx-card__subtitle">
                Monitorer les routes critiques et ajuster les ETA en conséquence.
              </p>
            </div>
            <div className="dx-card">
              <span className="dx-card__title">Livrés / Arrivés</span>
              <span className="dx-card__value">{summary.delivered}</span>
              <p className="dx-card__subtitle">
                Confirmez les POD et prévenez vos clients de l’arrivée.
              </p>
            </div>
          </div>
          <div className="dx-chip-list">
            <span className="dx-chip">🛃 Bloqués douane : {summary.blocked}</span>
            <span className="dx-chip">📦 Total suivi : {summary.total}</span>
          </div>
        </section>

        <section className="dx-section">
          <div className="dx-section__header">
            <span className="dx-section__eyebrow">filtres dynamiques</span>
            <h2 className="dx-section__title">Affinez vos recherches</h2>
            <p className="dx-section__subtitle">
              Croisez les informations pour isoler une expédition, un client ou un statut.
            </p>
          </div>
          <div className="dx-filterbar">
            <div className="dx-field dx-field--grow">
              <label htmlFor="shipment-search">Recherche libre</label>
              <input
                id="shipment-search"
                type="search"
                placeholder="Tracking, booking, client…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="dx-search"
              />
            </div>

            <div className="dx-field">
              <label htmlFor="shipment-destination">Destination</label>
              <input
                id="shipment-destination"
                type="text"
                placeholder="Ville, pays…"
                value={destinationFilter}
                onChange={(event) => setDestinationFilter(event.target.value)}
                className="dx-input"
              />
            </div>

            <div className="dx-field">
              <label htmlFor="shipment-status">Statut</label>
              <select
                id="shipment-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="dx-select"
              >
                <option value="">Tous</option>
                {SHIPMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="dx-field">
              <label htmlFor="shipment-provider">Transporteur</label>
              <select
                id="shipment-provider"
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                className="dx-select"
              >
                <option value="all">Tous</option>
                {providerOptionsList.map((option) => (
                  <option key={option} value={option}>
                    {formatProviderLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="dx-field">
              <label htmlFor="shipment-transport">Mode</label>
              <select
                id="shipment-transport"
                value={transportFilter}
                onChange={(event) => setTransportFilter(event.target.value)}
                className="dx-select"
              >
                <option value="all">Tous</option>
                {transportOptionsList.map((option) => (
                  <option key={option} value={option}>
                    {formatTransportLabel(option)}
                  </option>
                ))}
              </select>
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
        </section>

        <section className="dx-section">
          <div className="dx-section__header">
            <span className="dx-section__eyebrow">tableau d&apos;exécution</span>
            <h2 className="dx-section__title">Suivi détaillé des expéditions</h2>
            <p className="dx-section__subtitle">
              Consultez chaque expédition, mettez à jour son statut et ouvrez le suivi
              client en un clic.
            </p>
          </div>

          {loading ? (
            <div className="dx-empty">Chargement des expéditions…</div>
          ) : paginatedShipments.length === 0 ? (
            <div className="dx-empty">
              Aucun résultat avec vos filtres. Ajustez les critères pour retrouver vos
              expéditions.
            </div>
          ) : (
            <>
              <div className="dx-table-wrapper">
                <table className="dx-table">
                  <thead>
                    <tr>
                      <th>Expédition</th>
                      <th>Parcours</th>
                      <th>Progression</th>
                      <th>Détails</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedShipments.map((shipment) => {
                      const status = resolveTone(shipment.status);
                      const quote =
                        shipment.quoteId && typeof shipment.quoteId === "object"
                          ? shipment.quoteId
                          : {};
                      const provider = shipment.provider
                        ? String(shipment.provider).toLowerCase()
                        : "internal";
                      const transportType = quote.transportType || shipment.transportType;
                      const transportLabel = formatTransportLabel(transportType);
                      const metrics = [];
                      if (quote.weight || shipment.weight) {
                        metrics.push(`${quote.weight ?? shipment.weight} kg`);
                      }
                      if (quote.volume || shipment.volume) {
                        metrics.push(`${quote.volume ?? shipment.volume} m³`);
                      }
                      const progressStep = computeProgressStep(shipment.status);
                      const progressClass = `dx-progress dx-progress--step-${progressStep}`;
                      const stage = SHIPMENT_STATUS_FLOW[getStatusIndex(shipment.status)]?.timelineLabel;
                      const lastEvent = Array.isArray(shipment.trackingUpdates)
                        ? shipment.trackingUpdates[shipment.trackingUpdates.length - 1]
                        : null;
                      const customerEmail = shipment.userId?.email || quote.userEmail;
                      const quoteReference = quote._id || shipment.quoteId;

                      return (
                        <tr key={shipment._id}>
                          <td>
                            <div className="dx-meta">
                              <strong>{shipment.trackingCode || "Sans tracking"}</strong>
                              <span className="dx-meta__hint">{formatProviderLabel(provider)}</span>
                              {quote.productType && (
                                <span className="dx-meta__hint">{quote.productType}</span>
                              )}
                              {quoteReference && (
                                <span className="dx-meta__hint">Devis #{String(quoteReference).slice(-6)}</span>
                              )}
                              {shipment.trackingCode && (
                                <a
                                  className="dx-link"
                                  href={`/track-shipment?code=${encodeURIComponent(
                                    shipment.trackingCode,
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Ouvrir le suivi
                                </a>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="dx-meta">
                              <strong>
                                {(quote.origin || shipment.origin || "—")} →
                                {` ${quote.destination || shipment.destination || "—"}`}
                              </strong>
                              <span>
                                {transportLabel}
                                {metrics.length ? ` · ${metrics.join(" · ")}` : ""}
                              </span>
                              {shipment.currentLocation && (
                                <span className="dx-meta__hint">
                                  Localisation : {shipment.currentLocation}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className={progressClass}>
                              <div className="dx-progress__bar" />
                            </div>
                            <div className="dx-meta">
                              {stage && <span className="dx-meta__hint">{stage}</span>}
                              {lastEvent && (
                                <span className="dx-meta__hint">
                                  {formatDateTime(lastEvent.timestamp)} — {lastEvent.note || lastEvent.status}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="dx-meta">
                              <strong>{formatDateTime(shipment.updatedAt)}</strong>
                              {shipment.estimatedDelivery && (
                                <span className="dx-meta__hint">
                                  ETA {formatDateTime(shipment.estimatedDelivery)}
                                </span>
                              )}
                              {customerEmail && (
                                <span className="dx-meta__hint">Client : {customerEmail}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`dx-status dx-status--${status.tone}`}>
                              <span>{status.icon}</span>
                              <span>{shipment.status || "—"}</span>
                            </span>
                          </td>
                          <td>
                            <div className="dx-actions dx-actions--wrap">
                              <select
                                className="dx-select"
                                value={shipment.status || ""}
                                onChange={(e) => handleStatusChange(shipment._id, e.target.value)}
                              >
                                {SHIPMENT_STATUS_FLOW.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="dx-button dx-button--danger dx-button--sm"
                                onClick={() => handleDelete(shipment._id)}
                              >
                                Supprimer
                              </button>
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

      {toast && (
        <div
          className={`dx-toast ${
            toast.type === "error" ? "dx-toast--error" : "dx-toast--success"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminShipments;
