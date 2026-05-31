type AuthUnavailableProps = {
  missingKeys?: string[];
  detail?: string;
};

export function AuthUnavailable({ missingKeys = [], detail }: AuthUnavailableProps) {
  return (
    <div className="page-stack">
      <div className="card">
        <h1>Authentification Clerk indisponible</h1>
        <p>
          La configuration d’authentification admin est incomplète. L’application reste stable et n’essaie pas de
          lancer Clerk en mode keyless.
        </p>
        {missingKeys.length ? (
          <p>
            Variables manquantes: <strong>{missingKeys.join(', ')}</strong>
          </p>
        ) : null}
        {detail ? <p>Détail: {detail}</p> : null}
        <p>
          Renseignez les variables Clerk requises puis redémarrez l’application. Consultez le README pour la section
          de dépannage auth.
        </p>
      </div>
    </div>
  );
}
