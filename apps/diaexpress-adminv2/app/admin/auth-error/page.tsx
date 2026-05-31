import type { Route } from 'next';
import Link from 'next/link';

const REASON_LABELS: Record<string, string> = {
  'backend-unauthorized': "Le backend a refusé le jeton d'authentification.",
  'session-invalid':
    'Votre session backend est expirée ou invalide. Veuillez vous reconnecter pour obtenir un nouveau jeton.',
  'token-template-missing':
    'Le template JWT Clerk demandé est introuvable. Vérifiez NEXT_PUBLIC_BACKEND_JWT_TEMPLATE (ou NEXT_PUBLIC_CLERK_JWT_TEMPLATE) et CLERK_JWT_TEMPLATE.',
  'sign-in-required': 'Aucune session serveur valide n’a été détectée. Veuillez vous connecter.',
  'role-forbidden': 'Votre compte est authentifié mais ne possède pas le rôle admin requis.',
};

export default async function AdminAuthErrorPage({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string; detail?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const reason = params?.reason || 'unknown';
  const detail = params?.detail;
  const referenceId = params?.ref;

  return (
    <div className="page-stack">
      <div className="card">
        <h1>Erreur de passerelle d’authentification</h1>
        <p>
          {REASON_LABELS[reason] ||
            'La session Clerk est active mais la passerelle de token vers le backend a échoué.'}
        </p>
        <p>
          Vérifiez la configuration Clerk (template JWT), les variables d’environnement backend/front et les logs
          d’authentification du backend.
        </p>
        {detail ? <p><strong>Détail:</strong> {detail}</p> : null}
        {referenceId ? <p><strong>Référence:</strong> {referenceId}</p> : null}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Link className="btn btn-primary" href="/admin">
            Réessayer /admin
          </Link>
          <Link className="btn" href={'/sign-in' as Route}>
            Changer de session
          </Link>
        </div>
      </div>
    </div>
  );
}
