'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { QuoteFilters } from './QuoteFilters';
import { QuoteFormDrawer } from './QuoteFormDrawer';
import { QuoteActionDrawer, type QuoteAction, type QuoteActionPayload } from './QuoteActionDrawer';
import { QuotesTable } from './QuotesTable';
import { useToast } from '@/components/ui/toast';
import { useQuotes } from '@/hooks/useQuotes';
import { ApiError, buildQueryString } from '@/lib/api/client';
import { confirmQuote, convertQuoteToShipment, rejectQuote, updateQuote } from '@/lib/api/quotes';
import { formatCurrency } from '@/src/lib/format';
import type { Quote } from '@/src/types/logistics';

export function QuotesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [status, setStatus] = useState(() => searchParams.get('status') ?? '');
  const [quickView, setQuickView] = useState(() => searchParams.get('view') ?? 'all');
  const [customer, setCustomer] = useState(() => searchParams.get('customer') ?? '');
  const [priority, setPriority] = useState(() => searchParams.get('priority') ?? '');
  const [dateFrom, setDateFrom] = useState(() => searchParams.get('from') ?? '');
  const [dateTo, setDateTo] = useState(() => searchParams.get('to') ?? '');
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [activeAction, setActiveAction] = useState<QuoteAction | null>(null);
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    setPage(Number(searchParams.get('page')) || 1);
    setSearch(searchParams.get('search') ?? '');
    setStatus(searchParams.get('status') ?? '');
    setQuickView(searchParams.get('view') ?? 'all');
    setCustomer(searchParams.get('customer') ?? '');
    setPriority(searchParams.get('priority') ?? '');
    setDateFrom(searchParams.get('from') ?? '');
    setDateTo(searchParams.get('to') ?? '');
    if (searchParams.get('create') === '1') {
      setShowCreate(true);
    }
  }, [searchParams]);

  const { items, total, totalPages, loading, error, refresh } = useQuotes({
    page,
    pageSize: 25,
    search,
    status,
    from: dateFrom,
    to: dateTo
  });

  const getPriority = (quote: Quote): 'low' | 'medium' | 'high' => {
    const amount = quote.finalPrice ?? quote.estimatedPrice ?? 0;
    if (amount >= 1500) return 'high';
    if (amount >= 500) return 'medium';
    return 'low';
  };

  const resolvedListError = useMemo(() => {
    if (!error) return null;
    if (error instanceof ApiError) {
      const requestId = error.requestId ? ` (Réf: ${error.requestId})` : '';
      return `${error.message}${requestId}`;
    }
    return error.message;
  }, [error]);

  const visibleItems = useMemo(() => {
    return items
      .filter((quote) => {
        if (!customer) return true;
        const haystack = [
          quote.userEmail,
          quote.recipientContactName,
          quote.recipientContactEmail,
          quote.requestedBy,
          quote.requestedByLabel,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(customer.toLowerCase());
      })
      .filter((quote) => (priority ? getPriority(quote) === priority : true))
      .filter((quote) => {
        if (quickView === 'all') return true;
        if (quickView === 'pending') return quote.status === 'pending';
        if (quickView === 'under_review') return quote.status === 'pending' && Boolean(quote.notes);
        if (quickView === 'approved') return quote.status === 'confirmed';
        if (quickView === 'rejected') return quote.status === 'rejected';
        return true;
      });
  }, [items, customer, priority, quickView]);

  const syncQueryParams = (nextValues: Partial<Record<string, unknown>>) => {
    const merged = {
      page,
      search,
      status,
      quickView,
      customer,
      priority,
      dateFrom,
      dateTo,
      ...nextValues
    };

    const query = buildQueryString({
      page: merged.page && Number(merged.page) > 1 ? merged.page : undefined,
      search: merged.search || undefined,
      status: merged.status || undefined,
      view: merged.quickView && merged.quickView !== 'all' ? merged.quickView : undefined,
      customer: merged.customer || undefined,
      priority: merged.priority || undefined,
      from: merged.dateFrom || undefined,
      to: merged.dateTo || undefined
    });

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const openAction = (action: QuoteAction, quote: Quote) => {
    setActiveAction(action);
    setActiveQuote(quote);
    setActionError(null);
  };

  const resetFeedback = () => {
    setMessage(null);
    setActionError(null);
  };

  const closeAction = () => {
    setActiveAction(null);
    setActiveQuote(null);
  };

  const canConvert = (quote: Quote) =>
    quote.status === 'confirmed' && (!quote.shipmentId || quote.shipmentId === '') && quote.paymentStatus === 'confirmed';

  const handleActionSubmit = async (payload: QuoteActionPayload) => {
    if (!activeAction || !activeQuote) return;

    try {
      setSubmittingAction(true);
      setActionError(null);

      if (activeAction === 'confirm') {
        const updated = await confirmQuote(activeQuote._id, { finalPrice: payload.finalPrice });
        const price = formatCurrency(updated.finalPrice ?? updated.estimatedPrice, updated.currency);
        setMessage(`Devis approuvé (${price}).`);
        notify({ title: 'Devis approuvé', message: price, type: 'success' });
      }

      if (activeAction === 'edit') {
        await updateQuote(activeQuote._id, {
          finalPrice: payload.finalPrice,
          notes: payload.notes,
        });
        setMessage('Devis mis à jour.');
        notify({ title: 'Devis mis à jour', type: 'success' });
      }

      if (activeAction === 'request_info') {
        await updateQuote(activeQuote._id, {
          notes: payload.notes || 'Informations complémentaires demandées au client.',
        });
        setMessage('Demande d\'information enregistrée.');
        notify({ title: 'Demande envoyée', type: 'info' });
      }

      if (activeAction === 'reject') {
        await rejectQuote(activeQuote._id, payload.reason);
        setMessage('Devis rejeté.');
        notify({ title: 'Devis rejeté', type: 'info' });
      }

      if (activeAction === 'convert') {
        if (!canConvert(activeQuote)) {
          throw new Error('Le devis doit être confirmé et payé avant conversion.');
        }
        const result = await convertQuoteToShipment(activeQuote._id);
        const trackingCode = result?.shipment?.trackingCode;
        setMessage(trackingCode ? `Shipment créé (${trackingCode}).` : 'Shipment créé depuis le devis.');
        notify({
          title: 'Shipment créé',
          message: trackingCode ? `Tracking ${trackingCode}` : undefined,
          type: 'success',
        });
      }

      refresh();
      closeAction();
    } catch (err) {
      const message = (err as Error).message || 'Action impossible sur ce devis.';
      setActionError(message);
      notify({ title: 'Action échouée', message, type: 'error' });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleQuoteCreated = () => {
    setShowCreate(false);
    if (searchParams.get('create')) {
      router.replace(pathname, { scroll: false });
    }
    refresh();
    notify({ title: 'Devis créé', type: 'success' });
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
    if (searchParams.get('create')) {
      router.replace(pathname, { scroll: false });
    }
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    syncQueryParams({ page: nextPage });
    resetFeedback();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Quotes"
        description="Workflow complet: création, validation, review, conversion shipment."
        breadcrumbs={[{ label: 'Ops', href: '/admin' }, { label: 'Quotes' }]}
        actions={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            Créer un devis
          </Button>
        }
      />

      <QuoteFilters
        status={status}
        quickView={quickView}
        search={search}
        customer={customer}
        priority={priority}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onStatusChange={(value) => {
          resetFeedback();
          setStatus(value);
          setPage(1);
          syncQueryParams({ status: value, page: 1 });
        }}
        onQuickViewChange={(value) => {
          resetFeedback();
          setQuickView(value);
          setPage(1);
          syncQueryParams({ quickView: value, page: 1 });
        }}
        onSearchChange={(value) => {
          resetFeedback();
          setSearch(value);
          setPage(1);
          syncQueryParams({ search: value, page: 1 });
        }}
        onCustomerChange={(value) => {
          resetFeedback();
          setCustomer(value);
          setPage(1);
          syncQueryParams({ customer: value, page: 1 });
        }}
        onPriorityChange={(value) => {
          resetFeedback();
          setPriority(value);
          setPage(1);
          syncQueryParams({ priority: value, page: 1 });
        }}
        onDateFromChange={(value) => {
          resetFeedback();
          setDateFrom(value);
          setPage(1);
          syncQueryParams({ dateFrom: value, page: 1 });
        }}
        onDateToChange={(value) => {
          resetFeedback();
          setDateTo(value);
          setPage(1);
          syncQueryParams({ dateTo: value, page: 1 });
        }}
        onRefresh={() => {
          resetFeedback();
          refresh();
        }}
        loading={loading}
      />

      <QuotesTable
        items={visibleItems}
        loading={loading}
        error={resolvedListError ? new Error(resolvedListError) : null}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={handlePageChange}
        onConfirm={(quote) => openAction('confirm', quote)}
        onReject={(quote) => openAction('reject', quote)}
        onEdit={(quote) => openAction('edit', quote)}
        onRequestInfo={(quote) => openAction('request_info', quote)}
        onConvert={(quote) => openAction('convert', quote)}
        onRequestNewQuote={() => setShowCreate(true)}
        message={message}
        actionError={actionError}
        getPriority={getPriority}
      />

      <QuoteFormDrawer open={showCreate} onClose={handleCloseCreate} onCreated={handleQuoteCreated} />
      <QuoteActionDrawer
        open={Boolean(activeAction && activeQuote)}
        action={activeAction}
        quote={activeQuote}
        submitting={submittingAction}
        onClose={closeAction}
        onSubmit={handleActionSubmit}
      />
    </div>
  );
}
