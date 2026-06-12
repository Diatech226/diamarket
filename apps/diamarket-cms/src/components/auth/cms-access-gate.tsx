'use client';

import { ReactNode, useEffect, useState } from 'react';
import { CmsSession, cmsAuth } from '@/lib/auth-client';

export function CmsAccessGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CmsSession | null>(null);

  useEffect(() => {
    cmsAuth.me().then((current) => {
      if (current.user?.role !== 'admin') {
        window.location.replace('/unauthorized');
        return;
      }
      setSession(current);
    }).catch(() => window.location.replace('/login'));
  }, []);

  if (!session?.authenticated || session.user?.role !== 'admin') return <Centered>Vérification de l’accès administrateur…</Centered>;
  return <>{children}</>;
}

function Centered({ children }: { children: ReactNode }) { return <div className="flex min-h-screen items-center justify-center p-6">{children}</div>; }
