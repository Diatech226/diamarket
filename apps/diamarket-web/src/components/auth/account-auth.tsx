'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AuthUser, publicAuth } from '@/lib/auth';

const CMS_ROLES = ['admin', 'editor', 'author'];
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001';

export function AccountAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAuth.session().then((session) => setUser(session.user ?? null)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const session = mode === 'register'
        ? await publicAuth.register({ name: String(data.get('name') || ''), email: String(data.get('email') || ''), password: String(data.get('password') || '') })
        : await publicAuth.login({ email: String(data.get('email') || ''), password: String(data.get('password') || '') });
      setUser(session.user ?? null);
      setMessage(mode === 'register' ? 'Compte créé avec succès.' : 'Connexion réussie.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible de continuer');
    }
  }

  async function logout() {
    await publicAuth.logout();
    setUser(null);
    setMessage('Vous êtes déconnecté.');
  }

  if (loading) return <p>Chargement du compte…</p>;
  if (user) return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Connecté en tant que</p>
        <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
        <p className="mt-1 text-sm">{user.email} · rôle : {user.role}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {CMS_ROLES.includes(user.role) && <a className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white" href={CMS_URL}>Accéder au CMS</a>}
          <button className="rounded-full border px-5 py-2 text-sm" onClick={logout}>Se déconnecter</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">{['Commandes', 'Profil', 'Notifications'].map((label) => <div key={label} className="rounded-2xl bg-white p-4 shadow-sm"><p className="font-semibold">{label}</p></div>)}</div>
    </section>
  );

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex rounded-full bg-slate-100 p-1">
        <button className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === 'login' ? 'bg-white font-semibold shadow-sm' : ''}`} onClick={() => setMode('login')}>Connexion</button>
        <button className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === 'register' ? 'bg-white font-semibold shadow-sm' : ''}`} onClick={() => setMode('register')}>Créer un compte</button>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        {mode === 'register' && <label className="block text-sm">Nom<input className="mt-1 w-full rounded-xl border px-3 py-2" name="name" autoComplete="name" /></label>}
        <label className="block text-sm">E-mail<input className="mt-1 w-full rounded-xl border px-3 py-2" name="email" type="email" autoComplete="email" required /></label>
        <label className="block text-sm">Mot de passe<input className="mt-1 w-full rounded-xl border px-3 py-2" name="password" type="password" minLength={8} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required /></label>
        <button className="w-full rounded-full bg-slate-900 px-5 py-2.5 font-semibold text-white" type="submit">{mode === 'register' ? 'Créer mon compte' : 'Se connecter'}</button>
      </form>
      {message && <p className="mt-4 text-sm" role="status">{message}</p>}
    </section>
  );
}
