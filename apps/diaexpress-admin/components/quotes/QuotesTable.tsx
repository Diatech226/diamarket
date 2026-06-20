'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import { QuoteActionMenu } from './QuoteActionMenu';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate, toTitle } from '@/src/lib/format';
import type { Quote } from '@/src/types/logistics';

type QuotesTableProps = {
  items: Quote[];
  loading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onConfirm: (quote: Quote) => void | Promise<void>;
  onReject: (quote: Quote) => void | Promise<void>;
  onEdit: (quote: Quote) => void | Promise<void>;
  onConvert: (quote: Quote) => void | Promise<void>;
  onRequestInfo: (quote: Quote) => void | Promise<void>;
  onRequestNewQuote?: () => void;
  message?: string | null;
  actionError?: string | null;
  getPriority: (quote: Quote) => 'low' | 'medium' | 'high';
};

export function QuotesTable({
  items,
  loading,
  error,
  page,
  totalPages,
  total,
  onPageChange,
  onConfirm,
  onReject,
  onEdit,
  onConvert,
  onRequestInfo,
  onRequestNewQuote,
  message,
  actionError,
}: QuotesTableProps) {
  return (
    <div className="panel">
      <div className="panel__header">
        <div>
          <div className="panel__title">Quotes opérationnels</div>
          <p className="panel__muted">Vue unifiée: listing, validation, demande d’information et conversion en shipment.</p>
        </div>
        <div className="panel__actions">
          {onRequestNewQuote ? <Button onClick={onRequestNewQuote}>Nouveau devis</Button> : null}
        </div>
      </div>

      {message ? <div className="alert alert--success">{message}</div> : null}
      {actionError ? <div className="alert alert--error">{actionError}</div> : null}
      {error ? <div className="alert alert--error">{error.message}</div> : null}

      <div className="table-wrapper">
        <Table>
          <TableHeader>
            <tr>
              <th>Référence</th>
              <th>Client</th>
              <th>Origine</th>
              <th>Destination</th>
              <th>Transport</th>
              <th>Poids</th>
              <th>Prix estimé</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {Array.from({ length: 10 }).map((_, cellIndex) => (
                    <td key={`skeleton-cell-${cellIndex}`}>
                      <div className="skeleton" style={{ width: `${60 + cellIndex * 3}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="empty-state">Aucun devis trouvé avec ces filtres.</div>
                </td>
              </tr>
            ) : (
              items.map((quote) => (
                <tr key={quote._id}>
                  <td className="mono">{quote._id}</td>
                  <td>
                    <div className="cell-stack">
                      <strong>{quote.recipientContactName || quote.userEmail || quote.requestedByLabel || quote.requestedBy || '—'}</strong>
                      <span className="muted">{quote.recipientContactEmail || quote.userEmail || 'Email non renseigné'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-stack">
                      <span>{quote.origin}</span>
                      <span className="muted">{quote.source || quote.provider || 'client'}</span>
                    </div>
                  </td>
                  <td>{quote.destination}</td>
                  <td>{toTitle(quote.transportType)}</td>
                  <td>
                    <div className="cell-stack">
                      <span>{quote.weight ?? quote.billableWeight ?? '—'} kg</span>
                      <span className="muted">{quote.length ?? '—'} × {quote.width ?? '—'} × {quote.height ?? '—'} cm</span>
                    </div>
                  </td>
                  <td>{formatCurrency(quote.estimatedPrice, quote.currency)}{quote.finalPrice != null ? <span className="muted"> / final {formatCurrency(quote.finalPrice, quote.currency)}</span> : null}</td>
                  <td>
                    <StatusBadge status={quote.status} />
                  </td>
                  <td>{formatDate(quote.updatedAt || quote.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <Link className="button button--ghost" href={`/admin/quotes/${quote._id}`}>
                        Voir détail
                      </Link>
                      <QuoteActionMenu quote={quote} onEdit={onEdit} onConfirm={onConfirm} onReject={onReject} onRequestInfo={onRequestInfo} onConvert={onConvert} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pagination">
        <span>
          Page {page} / {totalPages} – {total} éléments
        </span>
        <div className="pagination__actions">
          <Button type="button" variant="ghost" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
            Précédent
          </Button>
          <Button type="button" variant="ghost" disabled={page >= totalPages || loading} onClick={() => onPageChange(page + 1)}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
