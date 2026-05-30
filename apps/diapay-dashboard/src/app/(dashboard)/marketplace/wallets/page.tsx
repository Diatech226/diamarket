export default function MarketplacePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-premium">
        <p className="text-sm uppercase tracking-[0.25em] text-mint">Diapay Marketplace</p>
        <h1 className="mt-3 text-3xl font-bold">Wallets marketplace</h1>
        <p className="mt-2 max-w-3xl text-slate-300">Suivez les merchant_wallet, vendor_wallet, platform_wallet, escrow_wallet et reserve_wallet avec soldes disponibles et en attente.</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-3"><li className="rounded-3xl border bg-white p-5 shadow-sm dark:bg-slate-900">vendor_wallet Kora Fashion: 85 000 FCFA disponibles</li><li className="rounded-3xl border bg-white p-5 shadow-sm dark:bg-slate-900">platform_wallet Diamarket: 10 000 FCFA de commissions</li><li className="rounded-3xl border bg-white p-5 shadow-sm dark:bg-slate-900">escrow_wallet Livraison #ORD-77398: 85 000 FCFA held</li></ul>
      <div className="rounded-3xl border bg-white p-6 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Contrôles opérationnels</h2>
        <p className="mt-2 text-sm text-slate-500">Connecté aux endpoints /api/v1/marketplace pour split payments, ledger, escrow release/refund et payouts vendeurs.</p>
      </div>
    </section>
  );
}
