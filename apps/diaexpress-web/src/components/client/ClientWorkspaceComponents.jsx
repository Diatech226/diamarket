import React from 'react';
import Link from 'next/link';
import { PublicReveal, PublicSection } from '../../marketing/PublicPageSections';

export const ClientAppShell = ({ eyebrow, title, subtitle, actions, children }) => (
  <div className="dx-dashboard-shell">
    <div className="dx-dashboard">
      <PublicReveal>
        <header className="dx-dashboard__header">
          <span className="dx-dashboard__eyebrow">{eyebrow}</span>
          <h1 className="dx-dashboard__title">{title}</h1>
          <p className="dx-dashboard__subtitle">{subtitle}</p>
          <div className="dx-dashboard__actions">{actions}</div>
        </header>
      </PublicReveal>
      {children}
    </div>
  </div>
);

export const ClientPageHeader = ({ title, description }) => (
  <div className="dx-section__header"><h2 className="dx-section__title">{title}</h2><p className="dx-section__subtitle">{description}</p></div>
);

export const DashboardKpiCard = ({ label, value, hint }) => <article className="dx-card"><p className="dx-card__subtitle">{label}</p><strong className="dx-card__value">{value}</strong>{hint ? <small className="dx-card__hint">{hint}</small> : null}</article>;

export const ClientEmptyState = ({ title, helper, ctaHref, ctaLabel }) => <div className="dx-empty"><p>{title}</p>{helper ? <small>{helper}</small> : null}{ctaHref ? <Link href={ctaHref} className="dx-button dx-button--primary dx-button--sm">{ctaLabel}</Link> : null}</div>;
export const ClientErrorState = ({ message, onRetry }) => <div className="dx-empty dx-empty--error"><p>{message}</p>{onRetry ? <button className="dx-button dx-button--outline dx-button--sm" onClick={onRetry} type="button">Réessayer</button> : null}</div>;

export const StatusBadge = ({ status }) => <span className="dx-status dx-status--info">{status || 'Inconnu'}</span>;
export const ShipmentCard = ({ shipment }) => { const id = shipment._id || shipment.id; const code = shipment.trackingCode || shipment.trackingNumber || id?.slice(-8) || '—'; return <article className="dx-card"><div className="dx-quote-card__head"><strong>{code}</strong><StatusBadge status={shipment.status} /></div><p className="dx-card__subtitle">{shipment.origin || shipment.quoteId?.origin || 'Origine non renseignée'} → {shipment.destination || shipment.quoteId?.destination || 'Destination non renseignée'}</p><p className="dx-card__subtitle">{shipment.transportType || shipment.serviceType || shipment.quoteId?.transportType || 'Transport non précisé'}</p><div className="dx-actions">{id ? <Link href={`/account/shipments/${id}`} className="dx-button dx-button--primary dx-button--sm">Détail</Link> : null}<Link href={`/track-shipment${shipment.trackingCode ? `?code=${encodeURIComponent(shipment.trackingCode)}` : ''}`} className="dx-button dx-button--outline dx-button--sm">Suivre</Link></div></article>; };
export const QuoteCard = ({ quote }) => <article className="dx-card"><div className="dx-quote-card__head"><strong>{quote.reference || quote._id?.slice(-8) || '—'}</strong><StatusBadge status={quote.status} /></div><p className="dx-card__subtitle">{quote.origin || 'Origine'} → {quote.destination || 'Destination'}</p><p className="dx-card__subtitle">{quote.transportType || quote.transportMode || 'Mode non précisé'}</p></article>;
export const PaymentCard = ({ payment }) => <article className="dx-card"><div className="dx-quote-card__head"><strong>{payment.amount || payment.total || '-'} {payment.currency || ''}</strong><StatusBadge status={payment.status || payment.state} /></div><p className="dx-card__subtitle">Réf: {payment.transactionReference || payment.reference || payment._id || '—'}</p></article>;
export const AddressCard = ({ address, onEdit, onDelete }) => <article className="dx-card"><h3 className="dx-card__title">{address.label || 'Sans libellé'}</h3><p className="dx-card__subtitle">{address.line1}</p><p className="dx-card__subtitle">{address.postalCode} {address.city} · {address.country}</p><div className="dx-actions"><button type="button" className="dx-button dx-button--outline dx-button--sm" onClick={onEdit}>Modifier</button><button type="button" className="dx-button dx-button--danger dx-button--sm" onClick={onDelete}>Supprimer</button></div></article>;

export const ClientSection = ({ title, description, children }) => <PublicSection title={title} description={description}>{children}</PublicSection>;
