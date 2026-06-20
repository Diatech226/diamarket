'use client';

import { formatDate } from '@/src/lib/format';
import type { Quote } from '@/src/types/logistics';

const LABELS: Record<string, string> = {
  created: 'Créé',
  submitted: 'Soumis',
  review_started: 'Revu',
  info_requested: 'Info demandée',
  price_overridden: 'Prix proposé',
  priced: 'Prix proposé',
  approved: 'Approuvé',
  rejected: 'Refusé',
  quote_converted_to_shipment: 'Converti',
  converted_to_shipment: 'Converti',
};

export function QuoteTimeline({ quote }: { quote: Quote }) {
  const history = quote.audit?.history || [];
  const auditLogs = quote.auditLogs || [];
  type TimelineEvent = { label: string; date?: string; user?: string | null; comment?: string | null };
  const rawEvents: Array<TimelineEvent | null> = [
    quote.createdAt ? { label: 'Créé', date: quote.createdAt, user: quote.requestedByLabel || quote.userEmail, comment: 'Demande créée' } : null,
    ...history.map((item) => ({
      label: LABELS[item.action || item.toStatus || ''] || item.action || item.toStatus || 'Événement',
      date: item.at,
      user: item.actorLabel,
      comment: item.note,
    })),
    ...auditLogs.map((item) => ({
      label: LABELS[item.action] || item.action,
      date: item.createdAt,
      user: item.userLabel || item.role,
      comment: item.comment,
    })),
  ];
  const events = rawEvents
    .filter((event): event is TimelineEvent => event !== null)
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

  return (
    <div className="stack gap-3">
      {events.length ? events.map((event, index) => (
        <div key={`${event.label}-${event.date || index}`} className="border p-3 rounded">
          <strong>{event.label}</strong>
          <p className="muted">{formatDate(event.date)}{event.user ? ` · ${event.user}` : ''}</p>
          {event.comment ? <p>{event.comment}</p> : null}
        </div>
      )) : <div className="empty-state">Aucun événement de timeline.</div>}
    </div>
  );
}
