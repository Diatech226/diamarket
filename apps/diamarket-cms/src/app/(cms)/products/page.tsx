"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { cmsService } from "@/services/cms-service";
import type { CategoryItem, MediaAsset, ProductItem, ProductPayload, VendorRef } from "@/types/cms";

const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const empty: ProductPayload = { name: "", slug: "", description: "", price: 0, currency: "FCFA", category: "", vendor: "", stock: 0, images: [], status: "draft" };
const idOf = (v?: string | { _id: string }) => typeof v === "string" ? v : v?._id ?? "";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [vendors, setVendors] = useState<VendorRef[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<ProductPayload>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => { setLoading(true); setError(""); try { const [p,c,v,m] = await Promise.all([cmsService.getProducts(), cmsService.getCategories(), cmsService.getVendors(), cmsService.getMedia()]); setProducts(p); setCategories(c); setVendors(v as VendorRef[]); setMedia(m); } catch (e) { setError((e as Error).message); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!form.name || !form.description || !form.category || !form.vendor) { setError("Nom, description, catégorie et vendeur sont obligatoires."); return; }
    setSaving(true); setError("");
    const payload = { ...form, slug: form.slug || slugify(form.name), price: Number(form.price), stock: Number(form.stock) };
    try { editingId ? await cmsService.updateProduct(editingId, payload) : await cmsService.createProduct(payload); setForm(empty); setEditingId(null); setMessage("Produit sauvegardé via API."); await load(); } catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  };
  const edit = (p: ProductItem) => { setEditingId(p._id); setForm({ name:p.name, slug:p.slug, description:p.description ?? "", price:p.price, currency:p.currency, category:idOf(p.category), vendor:idOf(p.vendor), stock:p.stock, images:p.images ?? [], weight:p.weight, length:p.length, width:p.width, height:p.height, status:p.status ?? "draft" }); };
  const remove = async (p: ProductItem) => { if (!confirm(`Supprimer ${p.name} ?`)) return; try { await cmsService.deleteProduct(p._id); setMessage("Produit supprimé."); await load(); } catch (e) { setError((e as Error).message); } };
  const upload = async (files: FileList | null) => { if (!files?.length) return; setSaving(true); try { const uploaded = await Promise.all(Array.from(files).map(file => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = async () => { try { const res = await cmsService.uploadMedia({ dataUrl: String(reader.result), fileName: file.name, alt: form.name }); resolve(res.data.url); } catch (e) { reject(e); } }; reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); }))); setForm(f => ({ ...f, images: [...(f.images ?? []), ...uploaded] })); setMessage("Image(s) uploadée(s)."); await load(); } catch (e) { setError((e as Error).message); } finally { setSaving(false); } };

  const rows = products.map(p => ({ id:p._id, searchableText:`${p.name} ${p.slug} ${p.status}`, cells:[p.name, typeof p.category === "string" ? p.category : p.category?.name ?? "—", typeof p.vendor === "string" ? p.vendor : p.vendor?.shopName ?? p.vendor?.businessName ?? "—", `${p.price} ${p.currency}`, <StatusBadge key="s" status={p.status === "active" ? "active" : p.status === "archived" ? "inactive" : "draft"} />, `Stock: ${p.stock}`, <span key="a" className="flex gap-2"><button onClick={()=>edit(p)} className="rounded border px-2 py-1">Modifier</button><button onClick={()=>remove(p)} className="rounded border px-2 py-1 text-red-700">Supprimer</button></span>] }));

  return <div className="space-y-6"><PageHeader title="Produits" subtitle="CRUD produits, images, catégories et vendeurs connectés à l’API" />{error&&<p className="rounded-xl bg-red-500/10 p-3 text-red-700">{error}</p>}{message&&<p className="rounded-xl bg-blue-500/10 p-3">{message}</p>}<section className="space-y-3 rounded-2xl border p-4 dark:border-zinc-800"><h3 className="font-semibold">{editingId ? "Modifier le produit" : "Création produit"}</h3><div className="grid gap-3 md:grid-cols-3"><input className="rounded-xl border p-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:form.slug||slugify(e.target.value)})} placeholder="Nom"/><input className="rounded-xl border p-2" value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} placeholder="Slug"/><input className="rounded-xl border p-2" type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} placeholder="Prix"/><input className="rounded-xl border p-2" type="number" value={form.stock} onChange={e=>setForm({...form,stock:Number(e.target.value)})} placeholder="Stock"/><select className="rounded-xl border p-2" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="">Catégorie</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select><select className="rounded-xl border p-2" value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})}><option value="">Vendeur</option>{vendors.map(v=><option key={v._id} value={v._id}>{v.shopName ?? v.businessName ?? v._id}</option>)}</select><select className="rounded-xl border p-2" value={form.status} onChange={e=>setForm({...form,status:e.target.value as ProductPayload["status"]})}><option value="draft">Brouillon</option><option value="active">Actif</option><option value="archived">Archivé</option></select><input className="rounded-xl border p-2" type="file" multiple onChange={e=>upload(e.target.files)} /><select className="rounded-xl border p-2" onChange={e=>e.target.value&&setForm({...form,images:[...(form.images??[]),e.target.value]})} value=""><option value="">Sélection médiathèque</option>{media.map(m=><option key={m._id} value={m.url}>{m.originalName ?? m.filename ?? m.url}</option>)}</select></div><textarea className="w-full rounded-xl border p-2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description"/><p className="text-xs text-zinc-500">Images sélectionnées : {(form.images ?? []).length ? form.images?.join(", ") : "aucune"}</p><div className="flex gap-2"><button disabled={saving} onClick={save} className="rounded-xl bg-olive-700 px-4 py-2 text-white disabled:opacity-60">{editingId ? "Mettre à jour" : "Créer"}</button>{editingId&&<button onClick={()=>{setEditingId(null);setForm(empty);}} className="rounded-xl border px-4 py-2">Annuler</button>}</div></section>{loading ? <p>Chargement des produits…</p> : rows.length ? <DataTable headers={["Produit","Catégorie","Vendeur","Prix","Statut","Inventaire","Actions"]} rows={rows} searchPlaceholder="Recherche rapide produits" /> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucun produit.</p>}</div>;
}
