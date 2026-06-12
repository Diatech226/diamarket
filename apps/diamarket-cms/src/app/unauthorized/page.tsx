'use client';

import { useState } from 'react';
import { cmsAuth } from '@/lib/auth-client';

export default function Unauthorized() {
  const [loading, setLoading] = useState(false);
  const logout = async () => {
    setLoading(true);
    await cmsAuth.logout().catch(() => undefined);
    window.location.replace('/login');
  };
  return <div className="flex min-h-screen items-center justify-center p-6"><div className="text-center"><h1 className="text-2xl font-bold">Accès admin requis</h1><p className="mt-2 text-zinc-600">Votre compte est connecté, mais il n’est pas administrateur.</p><button className="mt-5 rounded-lg border px-4 py-2 disabled:opacity-60" disabled={loading} onClick={logout}>{loading ? 'Déconnexion…' : 'Se déconnecter'}</button></div></div>;
}
