"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { cmsService } from "@/services/cms-service";
import type { CategoryItem } from "@/types/cms";

const emptyForm = { name: "", slug: "", order: 0, active: true };
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setItems(await cmsService.getCategories()); } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!form.name.trim()) { setError("Le nom est obligatoire."); return; }
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    setSaving(true); setError("");
    try { editingId ? await cmsService.updateCategory(editingId, payload) : await cmsService.createCategory(payload); setForm(emptyForm); setEditingId(null); setMessage("Catégorie sauvegardée."); await load(); }
    catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  };

  const edit = (item: CategoryItem) => { setEditingId(item._id); setForm({ name: item.name, slug: item.slug, order: item.order ?? 0, active: item.active !== false }); };
  const remove = async (item: CategoryItem) => { if (!confirm(`Supprimer ${item.name} ?`)) return; try { await cmsService.deleteCategory(item._id); setMessage("Catégorie supprimée."); await load(); } catch (e) { setError((e as Error).message); } };

  const rows = items.map((item) => ({ id: item._id, searchableText: `${item.name} ${item.slug}`, cells: [item.name, item.slug, item.order ?? 0, <StatusBadge key="s" status={item.active === false ? "inactive" : "active"} />, <span key="a" className="flex gap-2"><button className="rounded border px-2 py-1" onClick={() => edit(item)}>Modifier</button><button className="rounded border px-2 py-1 text-red-700" onClick={() => remove(item)}>Supprimer</button></span>] }));

  return <div className="space-y-6"><PageHeader title="Catégories" subtitle="CRUD catégories connecté à l’API" />{error && <p className="rounded-xl bg-red-500/10 p-3 text-red-700">{error}</p>}{message && <p className="rounded-xl bg-blue-500/10 p-3">{message}</p>}<section className="grid gap-3 rounded-2xl border p-4 md:grid-cols-5 dark:border-zinc-800"><input className="rounded-xl border p-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:form.slug||slugify(e.target.value)})} placeholder="Nom"/><input className="rounded-xl border p-2" value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} placeholder="Slug"/><input className="rounded-xl border p-2" type="number" value={form.order} onChange={e=>setForm({...form,order:Number(e.target.value)})} placeholder="Ordre"/><label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Active</label><button disabled={saving} onClick={save} className="rounded-md bg-olive-700 px-4 py-2 text-white disabled:opacity-60">{editingId ? "Mettre à jour" : "Créer"}</button></section>{loading ? <p>Chargement des catégories…</p> : rows.length ? <DataTable headers={["Nom","Slug","Ordre","Statut","Action"]} rows={rows} /> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucune catégorie.</p>}</div>;
}
