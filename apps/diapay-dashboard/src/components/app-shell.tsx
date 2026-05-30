import Link from 'next/link';
import { currentUser } from '../lib/api';

const nav = [
  ['Dashboard', '/dashboard'],
  ['Paiements', '/payments'],
  ['Checkout', '/checkout-sessions'],
  ['Transactions', '/transactions'],
  ['Wallets', '/wallets'],
  ['Balances', '/balances'],
  ['Vendors', '/vendor-accounts'],
  ['Escrow', '/escrow'],
  ['Ledger', '/ledger'],
  ['Commissions', '/commissions'],
  ['Analytics', '/marketplace-analytics'],
  ['API Keys', '/api-keys'],
  ['Webhooks', '/webhooks'],
  ['Customers', '/customers'],
  ['Refunds', '/refunds'],
  ['Payouts', '/payouts'],
  ['Wallets', '/marketplace/wallets'],
  ['Balances', '/marketplace/balances'],
  ['Vendors', '/marketplace/vendors'],
  ['Escrow', '/marketplace/escrow'],
  ['Ledger', '/marketplace/ledger'],
  ['Commissions', '/marketplace/commissions'],
  ['Analytics', '/marketplace/analytics'],
  ['Developers', '/developers'],
  ['Settings', '/settings'],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),radial-gradient(circle_at_top_right,#ccfbf1,transparent_25%)] dark:bg-[radial-gradient(circle_at_top_left,#172554,transparent_28%),radial-gradient(circle_at_top_right,#064e3b,transparent_24%)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-white/80 p-5 backdrop-blur-xl dark:bg-slate-950/80 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-3xl bg-slate-950 p-3 text-white shadow-premium dark:bg-white dark:text-slate-950">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint font-black text-ink">D</span>
          <span><span className="block text-lg font-semibold">Diapay</span><span className="text-xs opacity-70">Merchant OS</span></span>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map(([label, href]) => <Link key={href} href={href} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white">{label}</Link>)}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-3xl border bg-white p-4 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</p>
          <div className="mt-3 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-800"><span className="rounded-xl bg-white py-2 text-center shadow-sm dark:bg-slate-950">Test</span><span className="py-2 text-center text-slate-500">Live</span></div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-white/70 px-4 py-3 backdrop-blur-xl dark:bg-slate-950/70 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="lg:hidden"><span className="rounded-2xl bg-slate-950 px-3 py-2 font-bold text-white">Diapay</span></div>
            <div className="hidden max-w-lg flex-1 rounded-2xl border bg-white px-4 py-2 text-sm text-slate-400 dark:bg-slate-900 md:block">Rechercher paiement, client, référence…</div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">API opérationnelle</span>
              <div className="text-right text-sm"><p className="font-semibold">{currentUser.name}</p><p className="text-xs text-slate-500">{currentUser.role}</p></div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">{currentUser.avatar}</div>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">{nav.map(([label, href]) => <Link className="shrink-0 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold dark:bg-slate-900" href={href} key={href}>{label}</Link>)}</nav>
        </header>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
