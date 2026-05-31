import React from 'react';

export const LoadingState = ({ message = 'Chargement…' }) => (
  <div className="dx-empty dx-empty--loading" role="status" aria-live="polite">
    <p>{message}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="dx-empty dx-empty--error" role="alert">
    <p>{message || 'Une erreur est survenue.'}</p>
    {onRetry ? (
      <button type="button" className="dx-button dx-button--outline dx-button--sm" onClick={onRetry}>
        Réessayer
      </button>
    ) : null}
  </div>
);

export const EmptyState = ({ title, helper, cta }) => (
  <div className="dx-empty">
    <p>{title}</p>
    {helper ? <small>{helper}</small> : null}
    {cta ? <div className="dx-empty__actions">{cta}</div> : null}
  </div>
);

export const SuccessState = ({ message }) => (
  <div className="dx-empty dx-empty--success" role="status" aria-live="polite">
    <p>{message || 'Action réalisée avec succès.'}</p>
  </div>
);

export const InfoState = ({ message }) => (
  <div className="dx-empty dx-empty--info" role="status" aria-live="polite">
    <p>{message || 'Information disponible.'}</p>
  </div>
);

export const UnauthenticatedState = ({ onLogin }) => (
  <div className="dx-empty dx-empty--info" role="status" aria-live="polite">
    <p>Veuillez vous connecter pour accéder à cette section.</p>
    {onLogin ? (
      <button type="button" className="dx-button dx-button--primary dx-button--sm" onClick={onLogin}>
        Se connecter
      </button>
    ) : null}
  </div>
);
