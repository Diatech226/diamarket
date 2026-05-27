import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";

export default function VendorsPage() {
  const rows = [
    { id: "v1", searchableText: "Naya Tech pending", cells: ["Naya Tech", "En attente", "1 980 000 FCFA", "12%", "Valider"] },
    { id: "v2", searchableText: "Casa Lab active", cells: ["Casa Lab", "Actif", "1 320 000 FCFA", "10%", "Suspendre"] },
  ];

  return <div className="space-y-6"><PageHeader title="Vendeurs" subtitle="Validation, revenus, commissions, analytics et performance" /><div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border p-4 dark:border-zinc-800"><p className="text-xs text-zinc-500">Vendeurs à valider</p><p className="text-2xl font-semibold">14</p></div><div className="rounded-2xl border p-4 dark:border-zinc-800"><p className="text-xs text-zinc-500">Commission moyenne</p><p className="text-2xl font-semibold">11.2%</p></div><div className="rounded-2xl border p-4 dark:border-zinc-800"><p className="text-xs text-zinc-500">Croissance GMV</p><p className="text-2xl font-semibold">+18%</p></div></div><DataTable headers={["Vendeur", "Statut", "Revenus", "Commission", "Action"]} rows={rows} /></div>;
}
