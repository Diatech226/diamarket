"use client";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { cmsService } from "@/services/cms-service";
import type { ApiMeta, ProductItem, OrderAdminItem, VendorAdminItem, VendorRequestItem, VendorDetailResponse } from "@/types/cms";

const statusLabels: Record<string, string> = { pending: "En attente", active: "Actif", suspended: "Suspendu", rejected: "Rejeté", approved: "Approuvée" };
const productStatusLabels: Record<string, string> = { active: "Actif", draft: "Brouillon", archived: "Désactivé" };

type Filters = { page: number; limit: number; search: string; status: string; sortBy: string; sortDir: "asc" | "desc" };

function money(value?: number, currency = "FCFA") { return `${Math.round(value ?? 0).toLocaleString("fr-FR")} ${currency}`; }
function percent(value?: number) { return `${Math.round((value ?? 0) * 100)}%`; }
function ownerName(vendor?: VendorAdminItem) { return vendor?.owner?.name || vendor?.owner?.email || "—"; }

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorAdminItem[]>([]);
  const [requests, setRequests] = useState<VendorRequestItem[]>([]);
  const [meta, setMeta] = useState<ApiMeta | undefined>();
  const [detail, setDetail] = useState<VendorDetailResponse | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<VendorRequestItem | null>(null);
  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 10, search: "", status: "", sortBy: "createdAt", sortDir: "desc" });
  const [requestStatus, setRequestStatus] = useState("pending");
  const [adminComment, setAdminComment] = useState("");
  const [commission, setCommission] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadVendors = async (next = filters) => {
    setLoading(true); setError("");
    try { const response = await cmsService.getVendors(next); setVendors(response.data); setMeta(response.meta); }
    catch (event) { setError(event instanceof Error ? event.message : "Chargement vendeurs impossible"); }
    finally { setLoading(false); }
  };
  const loadRequests = async () => { try { setRequests(await cmsService.getVendorRequests({ status: requestStatus })); } catch (event) { setError(event instanceof Error ? event.message : "Chargement demandes impossible"); } };
  useEffect(() => { void loadVendors(); }, [filters.page, filters.limit, filters.status, filters.sortBy, filters.sortDir]);
  useEffect(() => { void loadRequests(); }, [requestStatus]);

  const openVendor = async (id: string) => {
    setActionLoading(`detail-${id}`); setError("");
    try { const response = await cmsService.getVendor(id); setDetail(response.data); setCommission(String(Math.round((response.data.vendor.commissionRate ?? response.data.stats.globalCommissionRate) * 100))); }
    catch (event) { setError(event instanceof Error ? event.message : "Détail vendeur indisponible"); }
    finally { setActionLoading(""); }
  };

  const vendorAction = async (id: string, status: "active" | "suspended") => {
    if (!window.confirm(`${status === "active" ? "Activer/réactiver" : "Suspendre"} ce vendeur ?`)) return;
    setActionLoading(`${status}-${id}`); setMessage(""); setError("");
    try { await cmsService.updateVendorStatus(id, status); setMessage(status === "active" ? "Vendeur actif." : "Vendeur suspendu."); await loadVendors(); if (detail?.vendor._id === id) await openVendor(id); }
    catch (event) { setError(event instanceof Error ? event.message : "Action vendeur impossible"); }
    finally { setActionLoading(""); }
  };

  const reviewRequest = async (id: string, action: "approve" | "reject") => {
    if (!window.confirm(`${action === "approve" ? "Approuver" : "Refuser"} cette demande vendeur ?`)) return;
    setActionLoading(`${action}-${id}`); setMessage(""); setError("");
    try { await cmsService.reviewVendorRequest(id, action, adminComment); setMessage(action === "approve" ? "Demande approuvée." : "Demande refusée."); setAdminComment(""); setSelectedRequest(null); await Promise.all([loadRequests(), loadVendors()]); }
    catch (event) { setError(event instanceof Error ? event.message : "Traitement demande impossible"); }
    finally { setActionLoading(""); }
  };

  const saveCommission = async () => {
    if (!detail) return;
    const rate = Number(commission) / 100;
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) { setError("La commission doit être comprise entre 0 et 100%."); return; }
    if (!window.confirm("Modifier la commission de ce vendeur ?")) return;
    setActionLoading(`commission-${detail.vendor._id}`); setError(""); setMessage("");
    try { await cmsService.updateVendorCommission(detail.vendor._id, rate); setMessage("Commission vendeur mise à jour."); await Promise.all([loadVendors(), openVendor(detail.vendor._id)]); }
    catch (event) { setError(event instanceof Error ? event.message : "Modification commission impossible"); }
    finally { setActionLoading(""); }
  };

  const applySearch = () => { const next = { ...filters, page: 1 }; setFilters(next); void loadVendors(next); };
  const requestRows = requests.map((request) => ({ id: request._id, searchableText: `${request.businessName} ${request.businessEmail ?? ""} ${request.status}`, cells: [request.businessName, request.businessEmail ?? "—", request.phone ?? "—", `${request.city ?? "—"}, ${request.country ?? "—"}`, statusLabels[request.status] ?? request.status, request.adminComment ?? "—", <span key={request._id} className="flex flex-wrap gap-2"><button onClick={() => setSelectedRequest(request)} className="rounded border px-2 py-1">Voir</button><button disabled={!!actionLoading || request.status !== "pending"} onClick={() => reviewRequest(request._id, "approve")} className="rounded bg-olive-700 px-2 py-1 text-white disabled:opacity-50">Approuver</button><button disabled={!!actionLoading || request.status !== "pending"} onClick={() => reviewRequest(request._id, "reject")} className="rounded border px-2 py-1 disabled:opacity-50">Refuser</button></span>] }));
  const vendorRows = vendors.map((vendor) => ({ id: vendor._id, searchableText: `${vendor.shopName} ${vendor.owner?.email ?? ""} ${vendor.status}`, cells: [vendor.shopName || "—", ownerName(vendor), vendor.owner?.email ?? "—", vendor.phone ?? "—", vendor.country ?? "—", vendor.city ?? "—", statusLabels[vendor.status] ?? vendor.status, percent(vendor.commissionRate), vendor.productCount ?? 0, vendor.orderCount ?? 0, money(vendor.revenue), vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString("fr-FR") : "—", <span key={vendor._id} className="flex flex-wrap gap-2"><button onClick={() => openVendor(vendor._id)} className="rounded border px-2 py-1">Fiche</button><button disabled={!!actionLoading} onClick={() => vendorAction(vendor._id, "active")} className="rounded border px-2 py-1 disabled:opacity-50">Activer</button><button disabled={!!actionLoading} onClick={() => vendorAction(vendor._id, "suspended")} className="rounded border px-2 py-1 disabled:opacity-50">Suspendre</button></span>] }));
  const productRows = useMemo(() => (detail?.products ?? []).map((product: ProductItem) => ({ id: product._id, searchableText: product.name, cells: [product.name, productStatusLabels[product.status ?? ""] ?? product.status ?? "—", product.stock, money(product.price, product.currency), <span key={product._id} className="flex gap-2"><a className="rounded border px-2 py-1" href={`/products?vendor=${detail?.vendor._id}`}>Voir</a><a className="rounded border px-2 py-1" href={`/products`}>Modifier</a><span className="rounded border px-2 py-1 text-zinc-500">Désactiver via Produits</span></span>] })), [detail]);
  const orderRows = useMemo(() => (detail?.orders ?? []).map((order: OrderAdminItem) => ({ id: order._id, searchableText: `${order._id} ${order.status}`, cells: [order._id.slice(-8), order.status, order.paymentStatus, order.shipmentStatus, money(order.totalAmount, order.currency), order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : "—", <a key={order._id} className="rounded border px-2 py-1" href={`/orders`}>Voir commandes</a>] })), [detail]);

  return <div className="space-y-6"><PageHeader title="Vendeurs" subtitle="Gestion production des demandes, boutiques, commissions, produits et commandes vendeur" />{message && <p className="rounded-xl bg-blue-500/10 p-3 text-blue-800 dark:text-blue-200">{message}</p>}{error && <p className="rounded-xl bg-red-500/10 p-3 text-red-700">{error}</p>}<section className="space-y-3 rounded-2xl border p-4 dark:border-zinc-800"><h2 className="font-semibold">Demandes vendeur</h2><div className="flex flex-wrap gap-2"><select className="rounded-xl border p-2" value={requestStatus} onChange={(event) => setRequestStatus(event.target.value)}><option value="pending">En attente</option><option value="approved">Approuvées</option><option value="rejected">Refusées</option><option value="">Toutes</option></select><input className="min-w-72 rounded-xl border p-2" value={adminComment} onChange={(event) => setAdminComment(event.target.value)} placeholder="Commentaire admin pour approbation/refus" /></div>{requestRows.length ? <DataTable headers={["Entreprise", "Email", "Téléphone", "Ville/Pays", "Statut", "Commentaire", "Actions"]} rows={requestRows} searchPlaceholder="Recherche demande" /> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucune demande vendeur pour ce statut.</p>}</section>{selectedRequest && <section className="rounded-2xl border p-4 dark:border-zinc-800"><div className="flex items-center justify-between"><h2 className="font-semibold">Demande — {selectedRequest.businessName}</h2><button className="rounded border px-2 py-1" onClick={() => setSelectedRequest(null)}>Fermer</button></div><dl className="mt-3 grid gap-2 md:grid-cols-3"><div><dt className="text-xs text-zinc-500">Email</dt><dd>{selectedRequest.businessEmail ?? "—"}</dd></div><div><dt className="text-xs text-zinc-500">Téléphone</dt><dd>{selectedRequest.phone ?? "—"}</dd></div><div><dt className="text-xs text-zinc-500">Localisation</dt><dd>{selectedRequest.city ?? "—"}, {selectedRequest.country ?? "—"}</dd></div><div className="md:col-span-3"><dt className="text-xs text-zinc-500">Notes</dt><dd>{selectedRequest.notes ?? "—"}</dd></div></dl><h3 className="mt-4 font-medium">Historique décision</h3><ul className="text-sm text-zinc-600">{selectedRequest.decisionHistory?.length ? selectedRequest.decisionHistory.map((entry, index) => <li key={index}>{entry.action} — {entry.comment || "sans commentaire"} — {entry.decidedAt ? new Date(entry.decidedAt).toLocaleString("fr-FR") : "—"}</li>) : <li>Aucune décision enregistrée.</li>}</ul></section>}<section className="space-y-3 rounded-2xl border p-4 dark:border-zinc-800"><h2 className="font-semibold">Liste vendeurs</h2><div className="grid gap-3 md:grid-cols-6"><input className="rounded-xl border p-2" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} onKeyDown={(event) => event.key === "Enter" && applySearch()} placeholder="Recherche boutique" /><select className="rounded-xl border p-2" value={filters.status} onChange={(event) => setFilters({ ...filters, page: 1, status: event.target.value })}><option value="">Tous statuts</option><option value="pending">En attente</option><option value="active">Actif</option><option value="suspended">Suspendu</option><option value="rejected">Rejeté</option></select><select className="rounded-xl border p-2" value={filters.sortBy} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}><option value="createdAt">Création</option><option value="shopName">Boutique</option><option value="status">Statut</option><option value="commissionRate">Commission</option></select><select className="rounded-xl border p-2" value={filters.sortDir} onChange={(event) => setFilters({ ...filters, sortDir: event.target.value as Filters["sortDir"] })}><option value="desc">Desc</option><option value="asc">Asc</option></select><button onClick={applySearch} className="rounded-xl bg-zinc-900 px-4 py-2 text-white dark:bg-white dark:text-zinc-900">Rechercher</button></div>{loading ? <p className="rounded-xl border p-4">Chargement vendeurs…</p> : vendorRows.length ? <><DataTable headers={["Boutique", "Propriétaire", "Email", "Téléphone", "Pays", "Ville", "Statut", "Commission", "Produits", "Commandes", "CA", "Création", "Actions"]} rows={vendorRows} searchPlaceholder="Recherche locale" /><div className="flex justify-between rounded-xl border p-3 text-sm"><span>Page {meta?.page ?? filters.page} / {meta?.totalPages ?? 1} — {meta?.total ?? vendors.length} vendeur(s)</span><span className="flex gap-2"><button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="rounded border px-3 py-1 disabled:opacity-50">Précédent</button><button disabled={!!meta && filters.page >= meta.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="rounded border px-3 py-1 disabled:opacity-50">Suivant</button></span></div></> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucun vendeur ne correspond aux filtres.</p>}</section>{detail && <section className="space-y-4 rounded-2xl border p-4 dark:border-zinc-800"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Fiche vendeur — {detail.vendor.shopName}</h2><p className="text-sm text-zinc-500">{ownerName(detail.vendor)} · {detail.vendor.owner?.email ?? "email indisponible"}</p></div><button className="rounded border px-3 py-1" onClick={() => setDetail(null)}>Fermer</button></div><div className="grid gap-3 md:grid-cols-5"><div className="rounded-xl border p-3"><p className="text-xs text-zinc-500">CA vendeur</p><strong>{money(detail.stats.revenue)}</strong></div><div className="rounded-xl border p-3"><p className="text-xs text-zinc-500">Panier moyen</p><strong>{money(detail.stats.averageOrderValue)}</strong></div><div className="rounded-xl border p-3"><p className="text-xs text-zinc-500">Commandes attente</p><strong>{detail.stats.pendingOrders}</strong></div><div className="rounded-xl border p-3"><p className="text-xs text-zinc-500">Commandes livrées</p><strong>{detail.stats.deliveredOrders}</strong></div><div className="rounded-xl border p-3"><p className="text-xs text-zinc-500">Commission estimée</p><strong>{money(detail.stats.estimatedCommission)}</strong></div></div><div className="grid gap-3 md:grid-cols-3"><label>Commission vendeur (%)<input className="mt-1 w-full rounded-xl border p-2" type="number" min="0" max="100" value={commission} onChange={(event) => setCommission(event.target.value)} /></label><div className="rounded-xl border p-3 text-sm">Commission globale marketplace : <strong>{percent(detail.stats.globalCommissionRate)}</strong><br />Commission effective : <strong>{percent(detail.stats.effectiveCommissionRate)}</strong></div><button disabled={!!actionLoading} onClick={saveCommission} className="self-end rounded-xl bg-olive-700 px-4 py-2 text-white disabled:opacity-50">Modifier commission</button></div><div className="grid gap-3 md:grid-cols-3"><p className="rounded-xl border p-3">Produits actifs : <strong>{detail.stats.activeProducts}</strong></p><p className="rounded-xl border p-3">Brouillons : <strong>{detail.stats.draftProducts}</strong></p><p className="rounded-xl border p-3">Désactivés : <strong>{detail.stats.archivedProducts}</strong></p></div><h3 className="font-semibold">Produits vendeur</h3>{productRows.length ? <DataTable headers={["Produit", "Statut", "Stock", "Prix", "Actions"]} rows={productRows} /> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucun produit vendeur.</p>}<h3 className="font-semibold">Commandes vendeur</h3>{orderRows.length ? <DataTable headers={["Commande", "Statut", "Paiement", "Livraison", "Total", "Date", "Actions"]} rows={orderRows} /> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucune commande vendeur.</p>}</section>}</div>;
}
