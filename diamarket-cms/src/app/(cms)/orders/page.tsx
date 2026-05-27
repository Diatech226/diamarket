import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";

export default function OrdersPage() {
  const rows = [
    { id: "o1", searchableText: "CMD-1001 timeline paid", cells: ["CMD-1001", "Paiement > Préparation > Expédition", "Payé", "Voir"] },
    { id: "o2", searchableText: "CMD-1002 timeline transit", cells: ["CMD-1002", "Paiement > Préparation > Transit", "En transit", "Voir"] },
  ];

  return <div className="space-y-6"><PageHeader title="Commandes & Livraison" subtitle="Timeline, statuts visuels, suivi paiement et actions rapides" /><div className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border p-4 dark:border-zinc-800"><h3 className="mb-3 text-sm font-semibold">Timeline commande #CMD-1001</h3><ol className="space-y-2 text-sm"><li>✅ 08:40 Paiement confirmé</li><li>✅ 09:10 Préparation validée</li><li>🚚 10:20 Colis pris en charge</li><li>📍 Livraison estimée: demain</li></ol></div><div className="rounded-2xl border p-4 dark:border-zinc-800"><h3 className="mb-3 text-sm font-semibold">Alertes live</h3><div className="space-y-2 text-sm"><p className="rounded-lg bg-red-500/15 p-2">Échec paiement - CMD-1008</p><p className="rounded-lg bg-blue-500/15 p-2">Livraison retardée - CMD-0991</p></div></div></div><DataTable headers={["Commande", "Timeline", "Paiement", "Action rapide"]} rows={rows} /></div>;
}
