export default function MarketplacePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-premium">
        <p className="text-sm uppercase tracking-[0.25em] text-mint">Diapay Marketplace</p>
        <h1 className="mt-3 text-3xl font-bold">Marketplace Payouts</h1>
        <p className="mt-2 max-w-3xl text-slate-300">Déclenchez payouts manuels, automatiques ou planifiés avec seuil minimum.</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-3"><li className="rounded-3xl border bg-white p-5 shadow-sm dark:bg-slate-900">Mobile money processing • 250 000 FCFA</li><li className="rounded-3xl border bg-white p-5 shadow-sm dark:bg-slate-900">Bank transfer scheduled • 1 200 000 FCFA</li><li className="rounded-3xl border bg-white p-5 shadow-sm dark:bg-slate-900">Crypto completed • 500 USDT</li></ul>
      <div className="rounded-3xl border bg-white p-6 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Contrôles opérationnels</h2>
        <p className="mt-2 text-sm text-slate-500">Connecté aux endpoints /api/v1/marketplace pour split payments, ledger, escrow release/refund et payouts vendeurs.</p>
      </div>
    </section>
  );
}
