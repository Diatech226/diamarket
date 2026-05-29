'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '../../lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('merchant');
  const [loading, setLoading] = useState(false);

  function submit() {
    setLoading(true);
    document.cookie = `diapay_session=demo-session; path=/; max-age=86400; samesite=lax`;
    document.cookie = `diapay_role=${role}; path=/; max-age=86400; samesite=lax`;
    router.push('/dashboard');
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(21,245,186,.35),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(37,99,235,.45),transparent_30%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint font-black text-ink">D</span><span className="text-2xl font-semibold">Diapay</span></div>
          <div><p className="text-sm uppercase tracking-[0.3em] text-mint">Fintech dashboard</p><h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight">Pilotez vos paiements avec une expérience fiable comme Stripe.</h1><p className="mt-5 max-w-lg text-slate-300">Mobile money, cartes, banque, crypto, webhooks, refunds et payouts dans une interface premium.</p></div>
          <div className="grid grid-cols-3 gap-3 text-sm"><div className="rounded-3xl bg-white/10 p-4"><b>96.8%</b><p className="text-slate-300">succès</p></div><div className="rounded-3xl bg-white/10 p-4"><b>4</b><p className="text-slate-300">méthodes</p></div><div className="rounded-3xl bg-white/10 p-4"><b>Live/Test</b><p className="text-slate-300">ready</p></div></div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-[2rem] border bg-white p-8 shadow-premium dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ocean dark:text-mint">Connexion</p>
          <h2 className="mt-3 text-3xl font-semibold">Accès Diapay</h2>
          <p className="mt-2 text-sm text-slate-500">Démo sécurisée avec rôles merchant, admin et super_admin. L’itération suivante branchera l’auth API.</p>
          <label className="mt-6 block text-sm font-medium">Email</label><input className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3" defaultValue="aicha@kora-payments.ci" />
          <label className="mt-4 block text-sm font-medium">Mot de passe</label><input className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3" type="password" defaultValue="diapay-demo" />
          <label className="mt-4 block text-sm font-medium">Rôle</label><select className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3" value={role} onChange={(e) => setRole(e.target.value as UserRole)}><option value="merchant">merchant</option><option value="admin">admin</option><option value="super_admin">super_admin</option></select>
          <button onClick={submit} className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">{loading ? 'Connexion…' : 'Se connecter'}</button>
        </div>
      </section>
    </main>
  );
}
