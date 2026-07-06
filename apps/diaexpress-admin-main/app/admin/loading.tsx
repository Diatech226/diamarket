export default function AdminLoading() {
  return (
    <div className="panel" aria-live="polite">
      <p className="eyebrow">Session admin</p>
      <h1 className="panel__title">Vérification de la session…</h1>
      <p className="panel__muted">Nous validons votre session, votre rôle admin et la disponibilité de l’API DiaExpress.</p>
    </div>
  );
}
