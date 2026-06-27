import { resolveMediaUrl } from "@/lib/api";
import type { MediaAsset, ProductItem } from "@/types/cms";

export function ProductStatusBadge({ status }: { status?: ProductItem["status"] }) {
  const styles = status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : status === "archived" ? "bg-stone-100 text-stone-600 border-stone-200" : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}>{status === "active" ? "Publié" : status === "archived" ? "Archivé" : "Brouillon"}</span>;
}

export function ProductStatsCards({ products }: { products: ProductItem[] }) {
  const active = products.filter((p) => p.status === "active").length;
  const low = products.filter((p) => p.stock <= 5).length;
  return <div className="grid gap-3 md:grid-cols-4">{[["Catalogue", products.length], ["Actifs", active], ["Stock bas", low], ["Archivés", products.filter((p) => p.status === "archived").length]].map(([label, value]) => <article key={label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.25em] text-stone-500">{label}</p><p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p></article>)}</div>;
}

export function ProductExportButton() {
  return <a href="/products/export" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">Exporter CSV</a>;
}

export function ProductImagePicker({ assets, selected, onSelect }: { assets: MediaAsset[]; selected: string[]; onSelect: (urls: string[]) => void }) {
  return <div className="grid gap-2 sm:grid-cols-3">{assets.slice(0, 6).map((asset) => { const checked = selected.includes(asset.url); return <button type="button" key={asset._id} onClick={() => onSelect(checked ? selected.filter((url) => url !== asset.url) : [...selected, asset.url])} className={`rounded-xl border p-2 text-left ${checked ? "border-amber-500 bg-amber-50" : "border-stone-200"}`}><img src={resolveMediaUrl(asset.url)} alt={asset.alt || asset.name || "Asset"} className="h-20 w-full rounded-lg object-cover"/><span className="mt-1 block truncate text-xs">{asset.name || asset.originalName || asset.filename}</span></button>; })}</div>;
}

export function ProductTable({ products }: { products: ProductItem[] }) { return <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><table className="w-full text-sm"><thead className="bg-stone-50 text-stone-500"><tr><th className="p-3 text-left">Produit</th><th className="p-3">Prix</th><th className="p-3">Stock</th><th className="p-3">Statut</th></tr></thead><tbody>{products.map((p) => <tr key={p._id} className="border-t"><td className="p-3 font-medium">{p.name}</td><td className="p-3 text-center">{p.price} {p.currency}</td><td className="p-3 text-center">{p.stock}</td><td className="p-3 text-center"><ProductStatusBadge status={p.status}/></td></tr>)}</tbody></table></div>; }

export function ProductForm({ mode = "create" }: { mode?: "create" | "edit" }) { return <div className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="text-lg font-semibold">{mode === "edit" ? "Édition produit" : "Création produit"}</h2><p className="mt-1 text-sm text-stone-500">Formulaire découpé en identité, prix, stock, images médiathèque, variantes simples et métadonnées luxe.</p></div>; }
