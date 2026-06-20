import { fetchOperationsBoard } from '@/src/services/api/operations';
import { OperationsBoard } from '@/components/operations/OperationsBoard';
import { PageHeader } from '@/components/ui/page-header';
export default async function BoardPage() { const data = await fetchOperationsBoard(); return <><PageHeader title="Operations Board" description="À traiter, en cours, en retard, échecs livraison, retours et résolus." /><OperationsBoard shipments={data.shipments} incidents={data.incidents} /></>; }
