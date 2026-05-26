import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";

export default function DashboardPage() {
  return <div><PageHeader title="Dashboard" subtitle="Vue globale de la marketplace" /><div className="mb-6 grid gap-4 md:grid-cols-4"><StatCard label="Commandes" value={0} /><StatCard label="Ventes" value="0 FCFA" /><StatCard label="Produits" value={0} /><StatCard label="Vendeurs" value={0} /></div><div className="grid gap-4 lg:grid-cols-2"><DataTable headers={["Commande","Client","Statut"]} rows={[]} /><DataTable headers={["Produit","Vendeur","Stock"]} rows={[]} /></div></div>;
}
