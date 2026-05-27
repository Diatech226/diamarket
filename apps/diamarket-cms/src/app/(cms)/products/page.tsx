"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export default function ProductsPage() {
  const [uploaded, setUploaded] = useState<string[]>([]);
  const rows = [
    { id: "p1", searchableText: "Sneaker urban active", cells: ["Sneaker Urban", "42 variants", <StatusBadge key="s1" status="active" />, "Stock: 78"] },
    { id: "p2", searchableText: "Backpack lite inactive", cells: ["Backpack Lite", "8 variants", <StatusBadge key="s2" status="inactive" />, "Stock: 11"] },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Produits" subtitle="Création fluide, variantes, stock et dimensions colis" />
      <div className="grid gap-4 xl:grid-cols-3">
        <section className="space-y-3 rounded-2xl border p-4 xl:col-span-2 dark:border-zinc-800">
          <h3 className="font-semibold">Création produit rapide</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Nom produit" />
            <input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="SKU" />
            <input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Prix" />
            <input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Stock" />
          </div>
          <div className="rounded-xl border border-dashed p-6 text-sm dark:border-zinc-700">
            <p className="mb-2">Upload images (drag/drop)</p>
            <input type="file" multiple onChange={(e) => setUploaded(Array.from(e.target.files ?? []).map((f) => f.name))} />
            {uploaded.length > 0 && <p className="mt-2 text-xs text-zinc-500">{uploaded.join(", ")}</p>}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Poids colis (kg)" />
            <input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Longueur (cm)" />
            <input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Largeur/Hauteur (cm)" />
          </div>
        </section>
        <section className="rounded-2xl border p-4 dark:border-zinc-800">
          <h3 className="mb-2 font-semibold">Toasts admin</h3>
          <div className="space-y-2 text-sm"><div className="rounded-lg bg-emerald-500/15 p-2">✅ Produit enregistré</div><div className="rounded-lg bg-amber-500/15 p-2">⚠️ Stock bas détecté</div><div className="rounded-lg bg-red-500/15 p-2">⛔ Erreur paiement fournisseur</div></div>
        </section>
      </div>
      <DataTable headers={["Produit", "Variantes", "Statut", "Inventaire"]} rows={rows} searchPlaceholder="Recherche rapide produits" />
    </div>
  );
}
