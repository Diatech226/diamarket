'use client';

import { FormEvent, useEffect, useState } from 'react';
import { cmsAuth } from '@/lib/auth-client';

export default function CmsLoginPage() {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cmsAuth.me().then((session) => {
      if (session.user?.role === 'admin') window.location.replace('/dashboard');
    }).catch(() => undefined);
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      const session = await cmsAuth.login(String(data.get('email')), String(data.get('password')));
      if (session.user?.role !== 'admin') {
        window.location.replace('/unauthorized');
        return;
      }
      window.location.replace('/dashboard');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Connexion impossible');
      setSubmitting(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm"><h1 className="mb-2 text-2xl font-bold">Connexion CMS</h1><p className="mb-5 text-sm text-zinc-600">Réservé aux administrateurs Diamarket.</p><form className="space-y-4" onSubmit={login}><label className="block text-sm">E-mail<input className="mt-1 w-full rounded-lg border px-3 py-2" name="email" type="email" autoComplete="email" required /></label><label className="block text-sm">Mot de passe<input className="mt-1 w-full rounded-lg border px-3 py-2" name="password" type="password" autoComplete="current-password" required /></label><button className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60" disabled={submitting}>{submitting ? 'Connexion…' : 'Se connecter'}</button></form>{message && <p className="mt-4 text-sm text-red-700" role="alert">{message}</p>}</div></main>;
}
