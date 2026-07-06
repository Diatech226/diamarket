'use client';

import type { Quote } from '@/src/types/logistics';

export function QuoteNotes({ quote }: { quote: Quote }) {
  const notes = [
    quote.adminNotes ? { label: 'Note interne', value: quote.adminNotes } : null,
    quote.notes ? { label: 'Note opérationnelle', value: quote.notes } : null,
    quote.reviewNotes ? { label: 'Message client / revue', value: quote.reviewNotes } : null,
    quote.pricingNote ? { label: 'Note pricing', value: quote.pricingNote } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return notes.length ? (
    <div className="stack gap-3">
      {notes.map((note) => (
        <div key={note.label} className="border p-3 rounded">
          <strong>{note.label}</strong>
          <p>{note.value}</p>
        </div>
      ))}
    </div>
  ) : <div className="empty-state">Aucune note interne.</div>;
}
