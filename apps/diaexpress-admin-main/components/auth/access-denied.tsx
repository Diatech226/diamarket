import type { Route } from 'next';
import Link from 'next/link';

export function AccessDenied() {
  return (
    <div className="page-stack">
      <section className="panel panel--danger">
        <h1 className="panel__title">Accès refusé</h1>
        <p className="panel__muted">
          Votre compte est authentifié mais ne dispose pas des permissions administrateur requises.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <Link className="button" href="/admin">
            Retour au dashboard
          </Link>
          <Link className="button button--secondary" href={'/sign-in' as Route}>
            Changer de compte
          </Link>
        </div>
      </section>
    </div>
  );
}
