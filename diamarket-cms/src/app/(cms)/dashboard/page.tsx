import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

const orderRows = [
  { id: "1", searchableText: "CMD-1001 Marie paid dhl", cells: ["CMD-1001", "Marie", <StatusBadge key="s1" status="active" />, "12 min"] },
  { id: "2", searchableText: "CMD-1002 John pending fedex", cells: ["CMD-1002", "John", <StatusBadge key="s2" status="inactive" />, "4 min"] },
];

const vendorRows = [
  { id: "v1", searchableText: "Naya Tech 93", cells: ["Naya Tech", "93%", "1 980 000 FCFA"] },
  { id: "v2", searchableText: "Casa Lab 87", cells: ["Casa Lab", "87%", "1 320 000 FCFA"] },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics Dashboard" subtitle="Pilotage live des ventes, paiements, expéditions et performance vendeurs" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Revenus (30j)" value="19 450 000 FCFA" />
        <StatCard label="Paiements réussis" value="98.4%" />
        <StatCard label="Commandes live" value={42} />
        <StatCard label="Expéditions actives" value={17} />
        <StatCard label="Panier moyen" value="61 500 FCFA" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold">Revenue trend (mock)</h3>
          <div className="h-52 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-violet-500/20" />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold">Commandes live</h3>
          <div className="space-y-2 text-sm"><p>● CMD-1001 — Paiement confirmé</p><p>● CMD-1002 — En préparation</p><p>● CMD-1003 — Expédiée</p></div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTable headers={["Commande", "Client", "Statut", "Dernière maj"]} rows={orderRows} searchPlaceholder="Recherche rapide commandes" />
        <DataTable headers={["Vendeur", "SLA", "Revenus"]} rows={vendorRows} searchPlaceholder="Recherche vendeur" />
      </div>
    </div>
  );
}
