import React, { useEffect, useMemo, useState } from "react";
import { useAdminAuthGuard } from "../auth/useAdminAuthGuard";
import {
  fetchAdminQuotes as apiFetchAdminQuotes,
  updateQuoteStatus as apiUpdateQuoteStatus,
} from "../api/logistics";

const STATUS_VARIANTS = {
  requested: { label: "Soumis", tone: "warning", icon: "📨" },
  under_review: { label: "En revue", tone: "info", icon: "🕵️" },
  approved: { label: "Approuvé", tone: "success", icon: "✅" },
  awaiting_customer_approval: { label: "Attente client", tone: "warning", icon: "⏳" },
  customer_approved: { label: "Client OK", tone: "success", icon: "👍" },
  rejected: { label: "Rejeté", tone: "danger", icon: "❌" },
  ready_for_shipment: { label: "Prêt expédition", tone: "info", icon: "📦" },
  converted: { label: "Converti", tone: "info", icon: "🚚" },
  cancelled: { label: "Annulé", tone: "danger", icon: "🛑" },
  expired: { label: "Expiré", tone: "danger", icon: "⌛" },
};

const PRIORITY_LABELS = {
  urgent: "Urgent",
  normal: "Normal",
  low: "Bas",
};

const resolveStatus = (status) => STATUS_VARIANTS[status] ?? { label: status || "Inconnu", tone: "warning", icon: "ℹ️" };
const formatCurrency = (value, currency = "EUR") => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(numeric);
};

const AdminQuotes = () => {
  const { requireAdminToken, isAdminReady } = useAdminAuthGuard();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [agingFilter, setAgingFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadQuotes = async () => {
    if (!isAdminReady) return;
    setLoading(true);
    try {
      const token = await requireAdminToken();
      const data = await apiFetchAdminQuotes(token);
      setQuotes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [isAdminReady]);

  const updateStatus = async (quoteId, status) => {
    try {
      const token = await requireAdminToken();
      await apiUpdateQuoteStatus(quoteId, status, token);
      await loadQuotes();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const filteredQuotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return quotes.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (priorityFilter !== "all" && (q.priority || "normal") !== priorityFilter) return false;
      if (sourceFilter !== "all" && (q.source || "client") !== sourceFilter) return false;

      const ageHours = q?.operations?.ageHours ?? 0;
      if (agingFilter === "overdue_review" && !(q?.operations?.isOverdueReview || ageHours >= 24)) return false;
      if (agingFilter === "fresh" && ageHours >= 24) return false;

      if (query) {
        const hay = [q._id, q.origin, q.destination, q.userEmail, q.requestedByLabel]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [quotes, statusFilter, priorityFilter, sourceFilter, agingFilter, searchTerm]);

  return (
    <div className="dx-dashboard-shell">
      <div className="dx-dashboard">
        <h1 className="dx-dashboard__title">Queue opérationnelle des devis</h1>

        <div className="dx-filterbar">
          <select className="dx-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous statuts</option>
            {Object.entries(STATUS_VARIANTS).map(([key, v]) => <option key={key} value={key}>{v.label}</option>)}
          </select>
          <select className="dx-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">Toutes priorités</option>
            {Object.entries(PRIORITY_LABELS).map(([key, v]) => <option key={key} value={key}>{v}</option>)}
          </select>
          <select className="dx-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="all">Toutes sources</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
            <option value="partner">Partner</option>
            <option value="import">Import</option>
          </select>
          <select className="dx-select" value={agingFilter} onChange={(e) => setAgingFilter(e.target.value)}>
            <option value="all">Âge: tous</option>
            <option value="fresh">&lt; 24h</option>
            <option value="overdue_review">Overdue review</option>
          </select>
          <input className="dx-search" placeholder="Rechercher…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {loading ? <div className="dx-empty">Chargement…</div> : error ? <div className="dx-empty">{error}</div> : (
          <table className="dx-table">
            <thead>
              <tr>
                <th>Devis</th><th>Client</th><th>Route</th><th>Montant</th><th>Priorité</th><th>Aging</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((q) => {
                const status = resolveStatus(q.status);
                return (
                  <tr key={q._id}>
                    <td>{q._id?.slice(-6)}</td>
                    <td>{q?.customer?.userEmail || q.userEmail || q.requestedByLabel || "N/A"}</td>
                    <td>{q?.route?.origin || q.origin} → {q?.route?.destination || q.destination}</td>
                    <td>{formatCurrency(q?.pricing?.estimatedPrice ?? q.estimatedPrice, q?.pricing?.currency || q.currency || "USD")}</td>
                    <td>{PRIORITY_LABELS[q.priority || "normal"]}</td>
                    <td>{q?.operations?.ageHours ?? "-"}h</td>
                    <td><span className={`dx-status dx-status--${status.tone}`}>{status.icon} {status.label}</span></td>
                    <td>
                      <div className="dx-actions">
                        {q.status === "requested" && <button className="dx-button dx-button--sm" onClick={() => updateStatus(q._id, "under_review")}>Prendre en revue</button>}
                        {q.status === "under_review" && <>
                          <button className="dx-button dx-button--primary dx-button--sm" onClick={() => updateStatus(q._id, "approved")}>Approuver</button>
                          <button className="dx-button dx-button--outline dx-button--sm" onClick={() => updateStatus(q._id, "awaiting_customer_approval")}>Demander info</button>
                          <button className="dx-button dx-button--danger dx-button--sm" onClick={() => updateStatus(q._id, "rejected")}>Rejeter</button>
                        </>}
                        {q.status === "customer_approved" && <button className="dx-button dx-button--sm" onClick={() => updateStatus(q._id, "ready_for_shipment")}>Ready shipment</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminQuotes;
