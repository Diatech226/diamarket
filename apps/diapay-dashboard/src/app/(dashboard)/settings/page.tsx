import { currentUser, providerDescriptors } from '../../../lib/api';
import { Badge, Button, Card, PageHeader } from '../../../components/ui';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Profil marchand, entreprise, providers de paiement, pays, devise par défaut et préférences notification." />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <h2 className="mb-5 font-semibold">Informations entreprise</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border bg-transparent px-4 py-3" defaultValue={currentUser.merchant} />
            <input className="rounded-2xl border bg-transparent px-4 py-3" defaultValue={currentUser.country} />
            <select className="rounded-2xl border bg-transparent px-4 py-3" defaultValue={currentUser.defaultCurrency}><option>XOF</option><option>USD</option><option>EUR</option></select>
            <input type="file" className="rounded-2xl border px-4 py-3" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Notifications email paiement réussi</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Alertes webhook en échec</label>
          </div>
          <div className="mt-6"><Button>Enregistrer</Button></div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Profil utilisateur</h2>
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-950 text-xl font-bold text-white dark:bg-white dark:text-slate-950">{currentUser.avatar}</div>
          <p className="mt-4 text-xl font-semibold">{currentUser.name}</p>
          <p className="text-slate-500">{currentUser.email}</p>
          <p className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold dark:bg-slate-800">{currentUser.role}</p>
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">Providers de paiement</h2>
              <p className="mt-1 text-sm text-slate-500">Connecteurs mock/test activés, prêts à être remplacés par des intégrations réelles lorsque les credentials seront disponibles.</p>
            </div>
            <Badge value="ready" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {providerDescriptors.map((provider) => (
              <div key={provider.id} className="rounded-3xl border p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{provider.name}</p>
                    <p className="text-sm text-slate-500">{provider.method} • {provider.implementation} • {provider.environment}</p>
                  </div>
                  <Badge value={provider.status} />
                </div>
                <p className="mt-3 text-sm text-slate-500">{provider.notes}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  {provider.currencies.map((currency) => <span key={currency} className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{currency}</span>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
