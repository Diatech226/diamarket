import { notFound } from 'next/navigation';
import { payments } from '../../../../lib/api';
import { Badge, Button, Card, formatMoney, PageHeader } from '../../../../components/ui';

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const payment = payments.find((item) => item.id === params.id);
  if (!payment) notFound();
  return <><PageHeader title={`Paiement ${payment.reference}`} description="Détail paiement, provider, client, statut et action de remboursement si possible." action={payment.refundable ? <Button variant="danger">Rembourser</Button> : undefined}/><div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]"><Card><h2 className="mb-5 font-semibold">Informations paiement</h2><dl className="grid gap-4 sm:grid-cols-2">{[['ID', payment.id], ['Statut', payment.status], ['Méthode', payment.method], ['Provider', payment.provider], ['Montant', formatMoney(payment.amount, payment.currency)], ['Référence', payment.reference]].map(([k,v]) => <div key={k} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><dt className="text-xs uppercase text-slate-400">{k}</dt><dd className="mt-1 font-semibold">{k === 'Statut' ? <Badge value={v}/> : v}</dd></div>)}</dl></Card><Card><h2 className="mb-5 font-semibold">Client</h2><p className="text-2xl font-semibold">{payment.customer}</p><p className="mt-2 text-slate-500">{payment.email}</p><p className="mt-6 text-sm text-slate-500">Créé le {new Date(payment.createdAt).toLocaleString('fr-FR')}</p></Card></div></>;
}
