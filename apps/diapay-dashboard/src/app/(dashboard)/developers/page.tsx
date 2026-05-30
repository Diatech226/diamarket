import { Card, PageHeader } from '../../../components/ui';

const steps = ['Créer compte', 'Créer API Key', 'Tester sandbox', 'Recevoir webhook', 'Passer en production'];
const events = ['payment.succeeded', 'payment.failed', 'checkout.completed', 'refund.succeeded', 'payout.completed'];

export default function DevelopersPage() {
  return <><PageHeader title="Developers" description="Onboarding, snippets, Webhook Tester et liens vers le portail développeur Diapay." />
    <div className="grid gap-6 xl:grid-cols-5">{steps.map((step, index) => <Card key={step}><span className="text-xs font-bold text-ocean">Étape {index + 1}</span><h2 className="mt-2 font-semibold">{step}</h2><p className="mt-2 text-sm text-slate-500">{index === 4 ? 'Checklist go-live, clés production et monitoring.' : 'Action guidée pour intégrer Diapay en moins de 10 minutes.'}</p></Card>)}</div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><Card><h2 className="mb-4 font-semibold">Créer un paiement</h2><pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-mint"><code>{`curl -X POST $DIAPAY_API/api/v1/payments \\
  -H "Authorization: Bearer sk_test_***" \\
  -H "Content-Type: application/json" \\
  -d '{"amount":125000,"currency":"XOF","method":"mobile-money"}'`}</code></pre></Card><Card><h2 className="mb-4 font-semibold">Webhook Node.js</h2><pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-mint"><code>{`app.post('/webhooks/diapay', express.raw({ type: 'application/json' }), (req, res) => {
  const valid = diapay.webhooks.verify(req.body.toString(), req.header('diapay-signature'), process.env.DIAPAY_WEBHOOK_SECRET);
  res.sendStatus(valid ? 200 : 400);
});`}</code></pre></Card>
    <Card><h2 className="mb-4 font-semibold">Webhook Tester</h2><select className="mb-3 w-full rounded-2xl border bg-transparent px-3 py-2">{events.map((event) => <option key={event}>{event}</option>)}</select><button className="rounded-2xl bg-slate-950 px-4 py-2 font-bold text-white">Send Test Event</button><div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm"><span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">delivered</span><span className="rounded-2xl bg-rose-50 p-3 text-rose-700">failed</span><span className="rounded-2xl bg-amber-50 p-3 text-amber-700">retry</span></div></Card><Card><h2 className="mb-4 font-semibold">Portail développeur</h2><a className="font-semibold text-ocean" href="http://localhost:3101">Ouvrir diapay-docs →</a><p className="mt-2 text-sm text-slate-500">Quick Start, API Playground, générateur de code, SDK JS/Node, sandbox et erreurs.</p></Card></div></>;
}
