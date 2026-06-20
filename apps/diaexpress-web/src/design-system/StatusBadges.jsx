import React from 'react';
import { diaexpressTokens, getReadableTextColor } from './diaexpressTokens';
import { formatShipmentStatus, SHIPMENT_STATUS_MAP } from '../constants/shipmentStatus';

const quoteLabels = {
  submitted: 'Demande envoyée', under_review: 'En cours d’étude', info_requested: 'Informations demandées', priced: 'Prix proposé', approved: 'Devis approuvé', rejected: 'Devis refusé', expired: 'Devis expiré', converted_to_shipment: 'Expédition créée', cancelled: 'Devis annulé',
};
const transportLabels = { air: 'Aérien', sea: 'Maritime', road: 'Routier', local: 'Local' };

const badgeStyle = (color) => ({ backgroundColor: color, color: getReadableTextColor(color), borderColor: color });

export function StatusBadge({ type = 'shipment', status, label }) {
  const color = diaexpressTokens.statusColors[type]?.[status] || diaexpressTokens.colors.interfaceGray;
  const text = label || (type === 'quote' ? quoteLabels[status] : formatShipmentStatus(status)) || 'Statut inconnu';
  return <span className="dx-status-badge" style={badgeStyle(color)}>{text}</span>;
}

export function TransportBadge({ transport }) {
  const color = diaexpressTokens.transportColors[transport] || diaexpressTokens.colors.logisticNavy;
  return <span className="dx-status-badge" style={badgeStyle(color)}>{transportLabels[transport] || transport || 'Transport'}</span>;
}

export function TimelineStatus({ status, date, comment }) {
  return <li className="dx-timeline-status"><span className="dx-timeline-dot" aria-hidden="true" /><div><div className="dx-timeline-row"><StatusBadge status={status} /><time>{date || '—'}</time></div><p>{comment || SHIPMENT_STATUS_MAP[status]?.timelineLabel || 'Statut mis à jour.'}</p></div></li>;
}

export function ProgressStepper({ flow = [], currentIndex = -1 }) {
  return <ol className="dx-progress-stepper" aria-label="Progression de l’expédition">{flow.map((step, index) => <li key={step.value} className={index <= currentIndex && currentIndex !== -1 ? 'is-active' : ''}><span>{index + 1}</span><p>{step.label}</p></li>)}</ol>;
}
