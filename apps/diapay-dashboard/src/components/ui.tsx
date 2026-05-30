import Link from 'next/link';
import type { ReactNode } from 'react';

const statusTone: Record<string, string> = {
  succeeded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  retrying: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  requires_action: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  paused: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  disabled: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  degraded: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  canceled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

export function formatMoney(amount: number, currency = 'XOF') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: currency === 'XOF' ? 0 : 2 }).format(amount);
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border bg-white/85 p-6 shadow-sm backdrop-blur dark:bg-slate-900/80 ${className}`}>{children}</section>;
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-ocean dark:text-mint">Diapay</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Button({ children, variant = 'primary', href }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger'; href?: string }) {
  const className = variant === 'primary'
    ? 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950'
    : variant === 'danger'
      ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
      : 'border bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800';
  const classes = `inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${className}`;
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button className={classes}>{children}</button>;
}

export function Badge({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[value] ?? statusTone.pending}`}>{value.replace('_', ' ')}</span>;
}

export function StatCard({ label, value, detail, accent = 'from-blue-500 to-cyan-400' }: { label: string; value: string; detail: string; accent?: string }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-xl`} />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-3xl border border-dashed p-10 text-center"><p className="font-semibold">{title}</p><p className="mt-2 text-sm text-slate-500">{description}</p></div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{message}</div>;
}

export function LoadingRows() {
  return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}</div>;
}
