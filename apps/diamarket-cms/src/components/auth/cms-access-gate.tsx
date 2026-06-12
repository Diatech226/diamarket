'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { CMS_ALLOWED_ROLES, CmsSession, cmsAuth } from '@/lib/auth-client';

export function CmsAccessGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CmsSession | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => { cmsAuth.session().then(setSession).catch(() => setSession({ authenticated: false })); }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const data = new FormData(event.currentTarget);
    try { setSession(await cmsAuth.login(String(data.get('email')), String(data.get('password')))); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Connexion impossible'); }
  }

  if (!session) return <Centered>Vérification de la session…</Centered>;
  if (!session.authenticated || !session.user) return <Centered><div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm"><h1 className="mb-5 text-2xl font-bold">Connexion CMS</h1><form className="space-y-4" onSubmit={login}><label className="block text-sm">E-mail<input className="mt-1 w-full rounded-lg border px-3 py-2" name="email" type="email" required /></label><label className="block text-sm">Mot de passe<input className="mt-1 w-full rounded-lg border px-3 py-2" name="password" type="password" required /></label><button className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white">Se connecter</button></form>{message && <p className="mt-4 text-sm text-red-700">{message}</p>}</div></Centered>;
  if (!CMS_ALLOWED_ROLES.includes(session.user.role)) return <Centered><div className="text-center"><h1 className="text-2xl font-bold">Accès refusé au CMS</h1><p className="mt-2 text-zinc-600">Votre session est valide, mais le rôle « {session.user.role} » ne permet pas d’accéder au CMS.</p><button className="mt-5 rounded-lg border px-4 py-2" onClick={() => cmsAuth.logout().then(() => setSession({ authenticated: false }))}>Se déconnecter</button></div></Centered>;
  return <>{children}</>;
}

function Centered({ children }: { children: ReactNode }) { return <div className="flex min-h-screen items-center justify-center p-6">{children}</div>; }
