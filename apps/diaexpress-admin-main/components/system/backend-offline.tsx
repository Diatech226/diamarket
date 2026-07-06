type BackendOfflineProps = {
  message?: string;
};

export function BackendOffline({ message }: BackendOfflineProps) {
  return (
    <div className="alert alert--error">
      <strong>Backend offline</strong>
      <p>{message || 'Le backend logistique est indisponible. Vérifiez le service sur http://localhost:5000.'}</p>
    </div>
  );
}
