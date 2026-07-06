'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { QUOTE_STATUS_OPTIONS, STATUS_LABELS } from '@/src/constants/logistics-status';

export type QuoteFiltersProps = {
  status: string;
  quickView: string;
  search: string;
  customer: string;
  priority: string;
  transportType: string;
  origin: string;
  destination: string;
  dateFrom: string;
  dateTo: string;
  onStatusChange: (value: string) => void;
  onQuickViewChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onTransportTypeChange: (value: string) => void;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onRefresh: () => void;
  loading?: boolean;
};

const STATUS_OPTIONS = QUOTE_STATUS_OPTIONS.filter((value) => value !== 'draft').map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

const PRIORITY_OPTIONS = [
  { value: '', label: 'Toutes priorités' },
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' }
];

const TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'En attente' },
  { key: 'under_review', label: 'En revue' },
  { key: 'approved', label: 'Approuvés' },
  { key: 'rejected', label: 'Refusés' },
];

export function QuoteFilters({
  status,
  quickView,
  search,
  customer,
  priority,
  transportType,
  origin,
  destination,
  dateFrom,
  dateTo,
  onStatusChange,
  onQuickViewChange,
  onSearchChange,
  onCustomerChange,
  onPriorityChange,
  onTransportTypeChange,
  onOriginChange,
  onDestinationChange,
  onDateFromChange,
  onDateToChange,
  onRefresh,
  loading,
}: QuoteFiltersProps) {
  return (
    <div className="panel">
      <div className="panel__header">
        <div>
          <div className="panel__title">Pipeline Devis</div>
          <p className="panel__muted">Filtrer, valider et convertir les devis depuis un seul écran opérationnel.</p>
        </div>
        <div className="panel__actions">
          <Button variant="ghost" onClick={onRefresh} disabled={loading}>
            Rafraîchir
          </Button>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Segments devis">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            className={`tab ${quickView === tab.key ? 'tab--active' : ''}`}
            onClick={() => onQuickViewChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <Input
          placeholder="Recherche globale (ID, route, tracking...)"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Input
          placeholder="Client (email ou nom)"
          value={customer}
          onChange={(event) => onCustomerChange(event.target.value)}
        />
        <Select value={transportType} onChange={(event) => onTransportTypeChange(event.target.value)}>
          <option value="">Tous transports</option>
          <option value="air">Air</option>
          <option value="sea">Mer</option>
          <option value="road">Route</option>
        </Select>
        <Input
          placeholder="Origine"
          value={origin}
          onChange={(event) => onOriginChange(event.target.value)}
        />
        <Input
          placeholder="Destination"
          value={destination}
          onChange={(event) => onDestinationChange(event.target.value)}
        />
        <Select value={priority} onChange={(event) => onPriorityChange(event.target.value)}>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          aria-label="Du"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
        />
        <Input
          type="date"
          aria-label="Au"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
        />
        <Select value={status} onChange={(event) => onStatusChange(event.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </form>
    </div>
  );
}
