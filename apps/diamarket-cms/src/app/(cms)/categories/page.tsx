"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { cmsService } from "@/services/cms-service";
import type { ApiCollection, CategoryItem, CategoryPayload } from "@/types/cms";

const emptyForm: CategoryPayload = { name: "", slug: "", description: "", image: "", icon: "", order: 0, active: true };
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [meta, setMeta] = useState<ApiCollection<CategoryItem>["meta"]>();
  const [form, setForm] = useState<CategoryPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: "", status: "", page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const response = await cmsService.getCategories(filters); setItems(response.data); setMeta(response.meta); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [filters.page, filters.status]);

  const payload = useMemo(() => ({ ...form, name: form.name.trim(), slug: (form.slug || slugify(form.name)).trim(), description: form.description?.trim(), image: form.image?.trim(), icon: form.icon?.trim(), order: Number(form.order) || 0 }), [form]);

  const save = async () => {
    if (!payload.name) { setError("Le nom est obligatoire."); return; }
    if (!payload.slug) { setError("Le slug est obligatoire."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      editingId ? await cmsService.updateCategory(editingId, payload) : await cmsService.createCategory(payload);
      setForm(emptyForm); setEditingId(null); setMessage(editingId ? "Catégorie modifiée avec succès." : "Catégorie créée avec succès."); await load();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const edit = (item: CategoryItem) => { setEditingId(item._id); setError(""); setMessage(""); setForm({ name: item.name, slug: item.slug, description: item.description ?? "", image: item.image ?? "", icon: item.icon ?? "", order: item.order ?? 0, active: item.active !== false }); };
  const cancel = () => { setEditingId(null); setForm(emptyForm); setError(""); };
  const remove = async (item: CategoryItem) => {
    if ((item.productCount ?? 0) > 0) { setError(`Suppression impossible : ${item.productCount} produit(s) utilisent cette catégorie. Désactivez-la plutôt.`); return; }
    if (!confirm(`Supprimer définitivement la catégorie « ${item.name} » ?`)) return;
    setDeletingId(item._id); setError(""); setMessage("");
    try { await cmsService.deleteCategory(item._id); setMessage("Catégorie supprimée avec succès."); await load(); }
    catch (e) { setError((e as Error).message); }
    finally { setDeletingId(null); }
  };
  const disable = async (item: CategoryItem) => { setDeletingId(item._id); setError(""); try { await cmsService.updateCategory(item._id, { active: false }); setMessage("Catégorie désactivée."); await load(); } catch (e) { setError((e as Error).message); } finally { setDeletingId(null); } };
  const applySearch = () => { setFilters({ ...filters, page: 1 }); void load(); };

  const rows = items.map((item) => ({ id: item._id, searchableText: `${item.name} ${item.slug} ${item.description ?? ""}`, cells: [
    <span key="name" className="font-medium">{item.name}</span>, item.slug, item.description || "—", item.order ?? 0, item.productCount ?? 0,
    <StatusBadge key="status" status={item.active === false ? "inactive" : "active"} />,
    <span key="actions" className="flex flex-wrap gap-2"><button className="rounded border px-2 py-1" disabled={saving || deletingId === item._id} onClick={() => edit(item)}>Modifier</button>{item.active !== false && <button className="rounded border px-2 py-1" disabled={deletingId === item._id} onClick={() => disable(item)}>Désactiver</button>}<button className="rounded border px-2 py-1 text-red-700 disabled:opacity-50" disabled={deletingId === item._id || (item.productCount ?? 0) > 0} title={(item.productCount ?? 0) > 0 ? "Catégorie liée à des produits" : "Supprimer"} onClick={() => remove(item)}>{deletingId === item._id ? "Action…" : "Supprimer"}</button></span>
  ] }));

  return <div className="space-y-6"><PageHeader title="Catégories" subtitle="Gestion complète des catégories reliées aux produits" />{error && <p className="rounded-xl bg-red-500/10 p-3 text-red-700">{error}</p>}{message && <p className="rounded-xl bg-green-500/10 p-3 text-green-800 dark:text-green-200">{message}</p>}<section className="space-y-3 rounded-2xl border p-4 dark:border-zinc-800"><h3 className="font-semibold">Filtres</h3><div className="grid gap-3 md:grid-cols-4"><input className="rounded-xl border p-2" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} onKeyDown={e=>e.key === "Enter" && applySearch()} placeholder="Recherche nom ou slug"/><select className="rounded-xl border p-2" value={filters.status} onChange={e=>setFilters({...filters,page:1,status:e.target.value})}><option value="">Tous statuts</option><option value="active">Actives</option><option value="inactive">Inactives</option></select><button onClick={applySearch} disabled={loading} className="rounded-xl bg-zinc-900 px-4 py-2 text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900">Rechercher</button></div></section><section className="space-y-3 rounded-2xl border p-4 dark:border-zinc-800"><h3 className="font-semibold">{editingId ? "Édition Catégorie" : "Création Catégorie"}</h3><div className="grid gap-3 md:grid-cols-3"><label>Nom *<input className="mt-1 w-full rounded-xl border p-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:form.slug || slugify(e.target.value)})}/></label><label>Slug *<input className="mt-1 w-full rounded-xl border p-2" value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})}/></label><label>Ordre<input className="mt-1 w-full rounded-xl border p-2" type="number" value={form.order} onChange={e=>setForm({...form,order:Number(e.target.value)})}/></label><label>Image<input className="mt-1 w-full rounded-xl border p-2" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="URL image"/></label><label>Icône<input className="mt-1 w-full rounded-xl border p-2" value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} placeholder="Nom ou URL icône"/></label><label className="flex items-center gap-2 pt-7"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Active</label></div><textarea className="min-h-24 w-full rounded-xl border p-2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description"/><div className="flex gap-2"><button disabled={saving} onClick={save} className="rounded-md bg-olive-700 px-4 py-2 text-white disabled:opacity-60">{saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Créer"}</button>{editingId && <button disabled={saving} onClick={cancel} className="rounded-md border px-4 py-2">Annuler</button>}</div></section>{loading ? <p className="rounded-xl border p-4">Chargement des catégories…</p> : rows.length ? <><DataTable headers={["Nom","Slug","Description","Ordre","Produits","Statut","Actions"]} rows={rows} searchPlaceholder="Recherche locale"/><div className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Page {meta?.page ?? filters.page} / {meta?.totalPages ?? 1} — {meta?.total ?? items.length} catégorie(s)</span><span className="flex gap-2"><button disabled={filters.page <= 1} onClick={() => setFilters({...filters,page:filters.page - 1})} className="rounded border px-3 py-1 disabled:opacity-50">Précédent</button><button disabled={!!meta && filters.page >= meta.totalPages} onClick={() => setFilters({...filters,page:filters.page + 1})} className="rounded border px-3 py-1 disabled:opacity-50">Suivant</button></span></div></> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucune catégorie ne correspond aux filtres.</p>}</div>;
}
