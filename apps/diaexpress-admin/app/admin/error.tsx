'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[adminv2/error-boundary] admin route crashed', {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      });
    }
  }, [error]);

  return (
    <div className="panel" role="alert">
      <p className="eyebrow">Erreur dashboard</p>
      <h1 className="panel__title">Impossible de charger le tableau de bord</h1>
      <p className="panel__muted">
        Une erreur inattendue a interrompu l’interface admin. L’erreur est journalisée en développement sans masquer la cause.
      </p>
      {process.env.NODE_ENV !== 'production' ? (
        <pre className="code-block" style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      ) : null}
      <div style={{ marginTop: '1rem' }}>
        <Button type="button" onClick={reset}>Réessayer</Button>
      </div>
    </div>
  );
}
