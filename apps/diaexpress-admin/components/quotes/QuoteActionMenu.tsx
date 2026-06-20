'use client';

import type { Quote } from '@/src/types/logistics';

type Props = {
  quote: Quote;
  onConfirm: (quote: Quote) => void | Promise<void>;
  onReject: (quote: Quote) => void | Promise<void>;
  onEdit: (quote: Quote) => void | Promise<void>;
  onConvert: (quote: Quote) => void | Promise<void>;
  onRequestInfo: (quote: Quote) => void | Promise<void>;
};

export function QuoteActionMenu({ quote, onConfirm, onReject, onEdit, onConvert, onRequestInfo }: Props) {
  const canConfirm = ['submitted', 'under_review', 'info_requested', 'priced'].includes(quote.status);
  const canConvert = quote.status === 'approved' && !quote.shipmentId;
  const canReject = !['rejected', 'converted_to_shipment', 'cancelled'].includes(quote.status);
  const canEdit = !['converted_to_shipment', 'cancelled'].includes(quote.status);

  return (
    <details className="actions-menu">
      <summary className="actions-menu__trigger" aria-label={`Actions quote ${quote._id}`}>⋮</summary>
      <div className="actions-menu__panel">
        {canEdit ? <button type="button" onClick={() => onEdit(quote)}>Tarifer / notes</button> : null}
        {canConfirm ? <button type="button" onClick={() => onConfirm(quote)}>Approve quote</button> : null}
        {canReject ? <button type="button" onClick={() => onReject(quote)}>Reject quote</button> : null}
        {canEdit ? <button type="button" onClick={() => onRequestInfo(quote)}>Request information</button> : null}
        {canConvert ? <button type="button" onClick={() => onConvert(quote)}>Convert to shipment</button> : null}
      </div>
    </details>
  );
}
