import { Card, PageHeader } from '../../../components/ui';

export default function DevelopersPage() { return <><PageHeader title="Developers" description="Documentation rapide pour intégrer l’API Diapay, créer un paiement et vérifier un webhook." /> <div className="grid gap-6 lg:grid-cols-2"><Card><h2 className="mb-4 font-semibold">Créer un paiement</h2><pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-mint"><code>{`curl -X POST $DIAPAY_API/api/v1/payments \\
  -H "Authorization: Bearer sk_test_***" \\
  -H "Content-Type: application/json" \\
  -d '{"amount":125000,"currency":"XOF","method":"mobile-money"}'`}</code></pre></Card><Card><h2 className="mb-4 font-semibold">Webhook Node.js</h2><pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-mint"><code>{`app.post('/webhooks/diapay', express.raw(), (req, res) => {
  // Vérifier la signature whsec_***
  res.sendStatus(200);
});`}</code></pre></Card><Card className="lg:col-span-2"><a className="font-semibold text-ocean" href="/docs">Ouvrir diapay-docs →</a><p className="mt-2 text-sm text-slate-500">Lien prévu vers l’application apps/diapay-docs lorsque le déploiement multi-apps sera activé.</p></Card></div></>; }
