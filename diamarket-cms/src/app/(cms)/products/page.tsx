import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { FormInput } from "@/components/ui/form-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function Page() {
  return <div className="space-y-6"><PageHeader title="products" subtitle="Gestion products" /><div className="grid gap-4 md:grid-cols-3"><FormInput label="Recherche" placeholder="Mot clé" /><FormInput label="Filtre" placeholder="Statut / catégorie" /><button className="rounded-md bg-olive-700 px-4 py-2 text-white">Créer</button></div><DataTable headers={["Nom","Statut","Action"]} rows={[["Exemple", <StatusBadge key='s' status='active' />, <ConfirmModal key='c' />]]} /></div>;
}
