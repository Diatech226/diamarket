import { ledgerEntries } from '../../../lib/api';
import { Card, PageHeader, formatMoney } from '../../../components/ui';

export default function LedgerPage() {
  return <><PageHeader title="Ledger comptable" description="Journal double entrée immutable: aucune modification historique, uniquement des écritures append-only et snapshots de balance." />
  <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Entry','Transaction','Compte','Direction','Type','Montant','Créé'].map((h) => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{ledgerEntries.map((entry) => <tr key={entry.id}><td className="py-4 font-mono text-xs">{entry.id}</td><td>{entry.transactionId}</td><td>{entry.account}</td><td className={entry.direction === 'credit' ? 'text-emerald-700' : 'text-rose-700'}>{entry.direction}</td><td>{entry.type}</td><td>{formatMoney(entry.amount, entry.currency)}</td><td>{new Date(entry.createdAt).toLocaleString('fr-FR')}</td></tr>)}</tbody></table></Card></>;
}
