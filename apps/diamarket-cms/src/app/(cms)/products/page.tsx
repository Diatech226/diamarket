"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { resolveMediaUrl } from "@/lib/api";
import { cmsService } from "@/services/cms-service";
import { MediaPicker } from "@/components/media/MediaPicker";
import type { ApiCollection, CategoryItem, MediaAsset, ProductItem, ProductPayload, VendorRef } from "@/types/cms";

type ProductStatus = NonNullable<ProductPayload["status"]>;
type ProductFilters = { page: number; limit: number; search: string; status: string; category: string; vendor: string };
type FormErrors = Partial<Record<keyof ProductPayload | "images", string>>;

const LOW_STOCK_THRESHOLD = 5;
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const idOf = (value?: string | { _id: string }) => (typeof value === "string" ? value : value?._id ?? "");
const emptyForm: ProductPayload = { name: "", slug: "", description: "", price: 0, currency: "FCFA", category: "", vendor: "", stock: 0, images: [], status: "draft" };

const statusLabels: Record<ProductStatus, string> = { draft: "Brouillon", active: "Publié", archived: "Désactivé" };

function validateProduct(form: ProductPayload) {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Le nom est obligatoire.";
  if (!form.slug.trim()) errors.slug = "Le slug est obligatoire.";
  if (!form.description.trim()) errors.description = "La description est obligatoire.";
  if (Number.isNaN(Number(form.price)) || Number(form.price) < 0) errors.price = "Le prix doit être positif.";
  if (!form.category) errors.category = "La catégorie est obligatoire.";
  if (!form.vendor) errors.vendor = "Le vendeur est obligatoire.";
  if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = "Le stock doit être un entier positif.";
  return errors;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [meta, setMeta] = useState<ApiCollection<ProductItem>["meta"]>();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [vendors, setVendors] = useState<VendorRef[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 10, search: "", status: "", category: "", vendor: "" });
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const categoryName = useMemo(() => new Map(categories.map((category) => [category._id, category.name])), [categories]);
  const vendorName = useMemo(() => new Map(vendors.map((vendor) => [vendor._id, vendor.shopName ?? vendor.businessName ?? vendor._id])), [vendors]);

  const loadProducts = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const response = await cmsService.getProducts(nextFilters);
      setProducts(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([cmsService.getAllCategories(), cmsService.getVendors(), cmsService.getMedia({ limit: 100, category: "product" })])
      .then(([categoryRows, vendorRows, mediaRows]) => { setCategories(categoryRows); setVendors(vendorRows as VendorRef[]); setMedia(mediaRows.data); })
      .catch((err) => setError((err as Error).message));
  }, []);

  useEffect(() => { void loadProducts(filters); }, [filters.page, filters.limit, filters.status, filters.category, filters.vendor]);

  const applySearch = () => { setFilters((current) => ({ ...current, page: 1, search: current.search.trim() })); void loadProducts({ ...filters, page: 1, search: filters.search.trim() }); };

  const save = async () => {
    const payload = { ...form, slug: slugify(form.slug || form.name), price: Number(form.price), stock: Number(form.stock), images: form.images ?? [] };
    const errors = validateProduct(payload);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    setSaving(true); setError(""); setMessage("");
    try {
      editingId ? await cmsService.updateProduct(editingId, payload) : await cmsService.createProduct(payload);
      setForm(emptyForm); setEditingId(null); setMessage(editingId ? "Produit modifié avec succès." : "Produit créé avec succès.");
      await loadProducts();
    } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  };

  const edit = (product: ProductItem) => {
    setEditingId(product._id);
    setForm({ name: product.name, slug: product.slug, description: product.description ?? "", price: product.price, currency: product.currency, category: idOf(product.category), vendor: idOf(product.vendor), stock: product.stock, images: product.images ?? [], weight: product.weight, length: product.length, width: product.width, height: product.height, status: product.status ?? "draft" });
    setFormErrors({}); setMessage("");
  };

  const remove = async (product: ProductItem) => {
    if (!window.confirm(`Supprimer définitivement le produit « ${product.name} » ?`)) return;
    setSaving(true); setError(""); setMessage("");
    try { await cmsService.deleteProduct(product._id); setMessage("Produit supprimé avec succès."); await loadProducts(); } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  };

  const quickUpdate = async (product: ProductItem, patch: Partial<ProductPayload>) => {
    setSaving(true); setError(""); setMessage("");
    try { await cmsService.updateProduct(product._id, patch); setMessage("Produit mis à jour."); await loadProducts(); } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = async () => { try { const response = await cmsService.uploadMedia({ dataUrl: String(reader.result), fileName: file.name, alt: form.name }); resolve(response.data.url); } catch (err) { reject(err); } }; reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); })));
      setForm((current) => ({ ...current, images: [...(current.images ?? []), ...uploaded] }));
      setMessage("Image(s) ajoutée(s) au produit.");
      setMedia((await cmsService.getMedia({ limit: 100, category: "product" })).data);
    } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  };

  const rows = products.map((product) => {
    const productCategory = typeof product.category === "string" ? categoryName.get(product.category) ?? product.category : product.category?.name ?? "—";
    const productVendor = typeof product.vendor === "string" ? vendorName.get(product.vendor) ?? product.vendor : product.vendor?.shopName ?? product.vendor?.businessName ?? "—";
    const stockClass = product.stock <= LOW_STOCK_THRESHOLD ? "text-red-700" : "text-zinc-700 dark:text-zinc-200";
    return { id: product._id, searchableText: `${product.name} ${product.slug} ${productCategory} ${productVendor}`, cells: [product.name, productCategory, productVendor, `${product.price} ${product.currency}`, <StatusBadge key="status" status={product.status === "active" ? "active" : product.status === "archived" ? "inactive" : "draft"} />, <span key="stock" className={stockClass}>{product.stock <= LOW_STOCK_THRESHOLD ? "⚠️ " : ""}{product.stock}</span>, <span key="actions" className="flex flex-wrap gap-2"><button onClick={() => edit(product)} className="rounded border px-2 py-1">Modifier</button><button onClick={() => quickUpdate(product, { status: product.status === "active" ? "archived" : "active" })} className="rounded border px-2 py-1">{product.status === "active" ? "Désactiver" : "Publier"}</button><input aria-label={`Stock ${product.name}`} className="w-20 rounded border px-2 py-1" type="number" min="0" defaultValue={product.stock} onBlur={(event) => Number(event.target.value) !== product.stock && quickUpdate(product, { stock: Number(event.target.value) })} /><button onClick={() => remove(product)} className="rounded border px-2 py-1 text-red-700">Supprimer</button></span>] };
  });

  return <div className="space-y-6"><PageHeader title="Produits" subtitle="Gestion production du catalogue, des statuts, stocks, médias, catégories et vendeurs" />{error && <p className="rounded-xl bg-red-500/10 p-3 text-red-700">{error}</p>}{message && <p className="rounded-xl bg-blue-500/10 p-3 text-blue-800 dark:text-blue-200">{message}</p>}<section className="space-y-3 rounded-2xl border p-4 dark:border-zinc-800"><h3 className="font-semibold">Filtres</h3><div className="grid gap-3 md:grid-cols-5"><input className="rounded-xl border p-2" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} onKeyDown={(event) => event.key === "Enter" && applySearch()} placeholder="Recherche nom, slug…" /><select className="rounded-xl border p-2" value={filters.status} onChange={(event) => setFilters({ ...filters, page: 1, status: event.target.value })}><option value="">Tous statuts</option><option value="draft">Brouillon</option><option value="active">Publié</option><option value="archived">Désactivé</option></select><select className="rounded-xl border p-2" value={filters.category} onChange={(event) => setFilters({ ...filters, page: 1, category: event.target.value })}><option value="">Toutes catégories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select><select className="rounded-xl border p-2" value={filters.vendor} onChange={(event) => setFilters({ ...filters, page: 1, vendor: event.target.value })}><option value="">Tous vendeurs</option>{vendors.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.shopName ?? vendor.businessName ?? vendor._id}</option>)}</select><button onClick={applySearch} className="rounded-xl bg-zinc-900 px-4 py-2 text-white dark:bg-white dark:text-zinc-900">Rechercher</button></div></section><section className="space-y-3 rounded-2xl border p-4 dark:border-zinc-800"><h3 className="font-semibold">{editingId ? "Edition Produit" : "Création Produit"}</h3><div className="grid gap-3 md:grid-cols-3"><label>Nom<input className="mt-1 w-full rounded-xl border p-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || slugify(event.target.value) })} /></label><label>Slug<input className="mt-1 w-full rounded-xl border p-2" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></label><label>Prix<input className="mt-1 w-full rounded-xl border p-2" type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label><label>Stock<input className="mt-1 w-full rounded-xl border p-2" type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} /></label><label>Devise<select className="mt-1 w-full rounded-xl border p-2" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value as ProductPayload["currency"] })}><option value="FCFA">FCFA</option><option value="USD">USD</option></select></label><label>Statut<select className="mt-1 w-full rounded-xl border p-2" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProductStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Catégorie<select className="mt-1 w-full rounded-xl border p-2" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="">Sélectionner</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label><label>Vendeur<select className="mt-1 w-full rounded-xl border p-2" value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })}><option value="">Sélectionner</option>{vendors.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.shopName ?? vendor.businessName ?? vendor._id}</option>)}</select></label><label>Upload local<input className="mt-1 w-full rounded-xl border p-2" type="file" accept="image/*" multiple onChange={(event) => upload(event.target.files)} /></label><label>Médiathèque<select className="mt-1 w-full rounded-xl border p-2" value="" onChange={(event) => event.target.value && setForm({ ...form, images: [...(form.images ?? []), event.target.value] })}><option value="">Ajouter une image existante</option>{media.map((asset) => <option key={asset._id} value={asset.url}>{asset.originalName ?? asset.filename ?? asset.url}</option>)}</select></label><div><span className="text-sm">MediaPicker</span><MediaPicker multiple category="product" value={media.filter((asset) => (form.images ?? []).includes(asset.url))} onChange={(selected) => setForm({ ...form, images: (Array.isArray(selected) ? selected : [selected]).map((asset) => asset.url) })} /></div></div><textarea className="min-h-24 w-full rounded-xl border p-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />{Object.values(formErrors).length > 0 && <ul className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700">{Object.values(formErrors).map((formError) => <li key={formError}>{formError}</li>)}</ul>}<div className="grid gap-2 md:grid-cols-4">{(form.images ?? []).map((image, index) => <div key={`${image}-${index}`} className="rounded-xl border p-2 text-xs"><img src={resolveMediaUrl(image)} alt="Produit" className="mb-2 h-24 w-full rounded object-cover" /><label className="flex items-center gap-2"><input type="radio" checked={index === 0} onChange={() => setForm({ ...form, images: [image, ...(form.images ?? []).filter((_, i) => i !== index)] })} /> Image principale</label><button className="mt-1 text-red-700" onClick={() => setForm({ ...form, images: (form.images ?? []).filter((_, i) => i !== index) })}>Retirer</button></div>)}</div><div className="flex gap-2"><button disabled={saving} onClick={save} className="rounded-xl bg-olive-700 px-4 py-2 text-white disabled:opacity-60">{saving ? "Enregistrement…" : editingId ? "Sauvegarder" : "Créer"}</button>{editingId && <button onClick={() => { setEditingId(null); setForm(emptyForm); setFormErrors({}); }} className="rounded-xl border px-4 py-2">Annuler</button>}</div></section>{loading ? <p className="rounded-xl border p-4">Chargement des produits…</p> : rows.length ? <><DataTable headers={["Produit", "Catégorie", "Vendeur", "Prix", "Statut", "Stock", "Actions"]} rows={rows} searchPlaceholder="Recherche locale" /><div className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Page {meta?.page ?? filters.page} / {meta?.totalPages ?? 1} — {meta?.total ?? products.length} produit(s)</span><span className="flex gap-2"><button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="rounded border px-3 py-1 disabled:opacity-50">Précédent</button><button disabled={!!meta && filters.page >= meta.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="rounded border px-3 py-1 disabled:opacity-50">Suivant</button></span></div></> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucun produit ne correspond aux filtres.</p>}</div>;
}
