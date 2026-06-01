import React from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

function formatProvider(quote) {
  if (!quote) return '';
  const ruleLabel = quote.appliedRule ? ` · ${quote.appliedRule}` : '';
  return `Tarif DiaExpress${ruleLabel}`;
}

function formatPrice(price, currency) {
  if (price === undefined || price === null) {
    return '—';
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function EstimateList({ quotes = [], selectedIndex, onChange, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!quotes.length) {
    return (
      <p className="text-sm text-slate-500">
        Lancez un calcul de devis pour afficher les offres DiaExpress.
      </p>
    );
  }

  const standardQuote = quotes[0];

  return (
    <RadioGroup>
      {[
        { key: 'economic', title: 'Economic', available: false },
        { key: 'standard', title: 'Standard', available: Boolean(standardQuote) },
        { key: 'express', title: 'Express', available: false },
      ].map((offer, index) => {
        const quote = offer.key === 'standard' ? standardQuote : null;
        const providerLabel = formatProvider(quote);
        const priceLabel = quote ? formatPrice(quote.estimatedPrice, quote.currency) : "—";
        const isSelected = selectedIndex === 0 && offer.key === 'standard';
        return (
          <RadioGroupItem
            key={offer.key}
            value={String(index)}
            checked={isSelected}
            onChange={() => {
              if (offer.key === 'standard') onChange(0);
            }}
            disabled={!offer.available}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-slate-900">
                  {offer.available ? priceLabel : 'Bientôt disponible'}
                </span>
                {offer.key === 'standard' && <Badge variant="green">Recommandé</Badge>}
              </div>
              <span className="text-sm text-slate-500">
                {offer.title} · {offer.available ? providerLabel : 'DiaExpress'}
              </span>
            </div>
          </RadioGroupItem>
        );
      })}
    </RadioGroup>
  );
}
