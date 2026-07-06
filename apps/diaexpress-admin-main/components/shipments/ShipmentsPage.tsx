'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { ShipmentDetailsDrawer } from './ShipmentDetailsDrawer';
import { useToast } from '@/components/ui/toast';
import { useShipments } from '@/hooks/useShipments';
import { ApiError } from '@/lib/api/client';
import { fetchEmbarkments } from '@/src/services/api/logisticsAdmin';
import { assignShipmentEmbarkment, updateShipmentStatus } from '@/src/services/api/logisticsShipments';
import { resolveStatusClass, resolveStatusLabel, shipmentStatusConfig } from '@/lib/status';
import { formatDate } from '@/src/lib/format';
import { getShipmentSource } from '@/src/lib/operations';
import type { Embarkment, Shipment } from '@/src/types/logistics';
import { SHIPMENT_STATUS_OPTIONS } from '@/src/constants/logistics-status';

export function ShipmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [route, setRoute] = useState('');
  const [transport, setTransport] = useState('');
  const [customer, setCustomer] = useState('');
  const [hub, setHub] = useState('');
  const [operator, setOperator] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [embarkments, setEmbarkments] = useState<Embarkment[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const { notify } = useToast();

  const { items, total, totalPages, loading, error, refresh } = useShipments({
    page,
    pageSize: 20,
    search,
    status: status || undefined,
  });

  useEffect(() => {
    let mounted = true;
    const loadEmbarkments = async () => {
      try {
        const data = await fetchEmbarkments({ page: 1, pageSize: 200, active: true });
        if (!mounted) return;
        setEmbarkments(data.items || []);
      } catch (err) {
        if (!mounted) return;
        const message = (err as Error).message || 'Impossible de charger les embarquements';
        setActionError(message);
        notify({ title: 'Chargement embarquements', message, type: 'error' });
      }
    };

    void loadEmbarkments();
    return () => {
      mounted = false;
    };
  }, [notify]);

  const filteredItems = useMemo(() => {
    return items.filter((shipment) => {
      const routeText = `${shipment.origin || shipment.meta?.quote?.origin || ''} ${shipment.destination || shipment.meta?.quote?.destination || ''}`.toLowerCase();
      const transportText = String(shipment.carrier || shipment.provider || shipment.meta?.quote?.transportType || '').toLowerCase();
      const customerText = String(shipment.meta?.customerEmail || shipment.meta?.customerName || shipment.meta?.quoteId || '').toLowerCase();
      const hubText = String(shipment.meta?.hubId || shipment.currentLocation || shipment.origin || shipment.destination || '').toLowerCase();
      const operatorText = String(shipment.meta?.operatorId || '').toLowerCase();
      const updated = shipment.updatedAt ? new Date(shipment.updatedAt).getTime() : 0;
      const afterFrom = dateFrom ? updated >= new Date(dateFrom).getTime() : true;
      const beforeTo = dateTo ? updated <= new Date(`${dateTo}T23:59:59`).getTime() : true;

      return (!route || routeText.includes(route.toLowerCase()))
        && (!transport || transportText.includes(transport.toLowerCase()))
        && (!customer || customerText.includes(customer.toLowerCase()))
        && (!hub || hubText.includes(hub.toLowerCase()))
        && (!operator || operatorText.includes(operator.toLowerCase()))
        && afterFrom
        && beforeTo;
    });
  }, [items, route, transport, customer, hub, operator, dateFrom, dateTo]);

  const resolvedListError = useMemo(() => {
    if (!error) return null;
    if (error instanceof ApiError) {
      const requestId = error.requestId ? ` (Réf: ${error.requestId})` : '';
      return `${error.message}${requestId}`;
    }
    return error.message;
  }, [error]);

  const resetFeedback = () => {
    setActionMessage(null);
    setActionError(null);
  };

  const handleStatusUpdate = async (payload: { status?: Shipment['status']; location?: string; note?: string }) => {
    if (!selected) return;
    try {
      setDrawerLoading(true);
      await updateShipmentStatus(selected._id, payload);
      setActionMessage('Shipment mis à jour.');
      notify({ title: 'Shipment mis à jour', type: 'success' });
      refresh();
    } catch (err) {
      const message = (err as Error).message || 'Impossible de mettre à jour le shipment.';
      setActionError(message);
      notify({ title: 'Mise à jour échouée', message, type: 'error' });
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleAssign = async (embarkmentId: string) => {
    if (!selected) return;
    try {
      setDrawerLoading(true);
      await assignShipmentEmbarkment(selected._id, embarkmentId);
      setActionMessage('Shipment assigné à l’embarquement.');
      notify({ title: 'Shipment assigné', type: 'success' });
      refresh();
    } catch (err) {
      const message = (err as Error).message || 'Impossible d’assigner le shipment.';
      setActionError(message);
      notify({ title: 'Assignation échouée', message, type: 'error' });
    } finally {
      setDrawerLoading(false);
    }
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    resetFeedback();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Shipments"
        description="Pilotage opérationnel: statut, tracking events, planification et assignation."
        breadcrumbs={[{ label: 'Ops', href: '/admin' }, { label: 'Shipments' }]}
      />

      <div className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">Filtres</div>
            <p className="panel__muted">Status, route, client et date pour piloter les flux en cours.</p>
          </div>
          <div className="panel__actions">
            <Button variant="ghost" onClick={refresh} disabled={loading}>Rafraîchir</Button>
          </div>
        </div>
        <form className="filters" onSubmit={(event) => event.preventDefault()}>
          <Input placeholder="Tracking / quote" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          <Input placeholder="Route (origin/destination)" value={route} onChange={(event) => setRoute(event.target.value)} />
          <Select value={transport} onChange={(event) => setTransport(event.target.value)}>
            <option value="">Tous transports</option>
            <option value="air">Air</option>
            <option value="sea">Mer</option>
            <option value="road">Route</option>
            <option value="internal">Internal</option>
          </Select>
          <Input placeholder="Client" value={customer} onChange={(event) => setCustomer(event.target.value)} />
          <Input placeholder="Hub" value={hub} onChange={(event) => setHub(event.target.value)} />
          <Input placeholder="Opérateur" value={operator} onChange={(event) => setOperator(event.target.value)} />
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">Tous les statuts</option>
            {SHIPMENT_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>{resolveStatusLabel(value, shipmentStatusConfig)}</option>
            ))}
          </Select>
        </form>
      </div>

      {actionMessage ? <div className="alert alert--success">{actionMessage}</div> : null}

      <div className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">Shipment timeline</div>
            <p className="panel__muted">In transit (blue), Delivered (green), Delayed (orange).</p>
          </div>
        </div>
        <div className="shipment-timeline">
          {(filteredItems.length ? filteredItems : items).slice(0, 5).map((shipment) => (
            <div className="shipment-timeline__item" key={`timeline-${shipment._id}`}>
              <span className={`shipment-timeline__dot shipment-timeline__dot--${shipment.status}`} />
              <div className="shipment-timeline__content">
                <strong>{shipment.trackingCode}</strong>
                <p>{shipment.origin || shipment.meta?.quote?.origin || '—'} → {shipment.destination || shipment.meta?.quote?.destination || '—'}</p>
              </div>
              <Badge className={resolveStatusClass(shipment.status, shipmentStatusConfig)}>
                {resolveStatusLabel(shipment.status, shipmentStatusConfig)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      {actionError ? <div className="alert alert--error">{actionError}</div> : null}
      {resolvedListError ? <div className="alert alert--error">{resolvedListError}</div> : null}

      <div className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">Suivi des shipments</div>
            <p className="panel__muted">{total} shipment(s) référencés.</p>
          </div>
        </div>
        <div className="table-wrapper">
          <Table>
            <TableHeader>
              <tr>
                <th>Code</th>
                <th>Origin/Destination</th>
                <th>Statut</th>
                <th>Client / transport</th>
                <th>Quote source</th>
                <th>Source</th>
                <th>Dernière MAJ</th>
                <th>Actions</th>
              </tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <td key={`skeleton-cell-${cellIndex}`}><div className="skeleton" style={{ width: `${60 + cellIndex * 4}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state">Aucun shipment avec ces filtres.</div></td></tr>
              ) : (
                filteredItems.map((shipment) => (
                  <tr key={shipment._id}>
                    <td className="mono">{shipment.trackingCode}</td>
                    <td>{shipment.origin || shipment.meta?.quote?.origin || '—'} → {shipment.destination || shipment.meta?.quote?.destination || '—'}</td>
                    <td><Badge className={resolveStatusClass(shipment.status, shipmentStatusConfig)}>{resolveStatusLabel(shipment.status, shipmentStatusConfig)}</Badge></td>
                    <td><div className="cell-stack"><strong>{shipment.meta?.customerName || shipment.meta?.customerEmail || '—'}</strong><span className="muted">{shipment.carrier || shipment.provider || shipment.meta?.quote?.transportType || '—'}</span></div></td>
                    <td className="mono">{typeof shipment.quoteId === 'string' ? shipment.quoteId : shipment.quoteId?._id || String(shipment.meta?.quoteId || '—')}</td>
                    <td>{getShipmentSource(shipment)}</td>
                    <td>{formatDate(shipment.updatedAt)}</td>
                    <td>
                      <div className="table-actions">
                        <Button type="button" variant="ghost" onClick={() => setSelected(shipment)}>Update status</Button>
                        <Button type="button" variant="ghost" onClick={() => setSelected(shipment)}>Add tracking</Button>
                        <Button type="button" variant="secondary" onClick={() => setSelected(shipment)}>Assign / schedule</Button>
                        <Link href={`/admin/shipments/${shipment._id}`} className="button button--ghost">Détail</Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="pagination">
          <span>Page {page} / {totalPages} – {total} éléments</span>
          <div className="pagination__actions">
            <Button type="button" variant="ghost" disabled={page <= 1 || loading} onClick={() => handlePageChange(page - 1)}>Précédent</Button>
            <Button type="button" variant="ghost" disabled={page >= totalPages || loading} onClick={() => handlePageChange(page + 1)}>Suivant</Button>
          </div>
        </div>
      </div>

      <ShipmentDetailsDrawer
        open={Boolean(selected)}
        shipment={selected}
        embarkments={embarkments}
        loading={drawerLoading}
        onClose={() => setSelected(null)}
        onSaveStatus={handleStatusUpdate}
        onAssignEmbarkment={handleAssign}
      />
    </div>
  );
}
