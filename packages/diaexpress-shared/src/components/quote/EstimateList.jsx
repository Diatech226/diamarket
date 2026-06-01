import React from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

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
        Lancez un calcul de devis pour afficher les offres disponibles.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">Offres disponibles</h4>
      </div>
      <RadioGroup>
      {quotes.map((quote, index) => {
        const priceLabel = formatPrice(quote.price, quote.currency);
        const isSelected = selectedIndex === index;
        const isRecommended = quote.provider === 'diaexpress' && quote.serviceLevel === 'standard';
        return (
          <RadioGroupItem
            key={`${quote.provider}-${quote.serviceLevel}-${index}`}
            value={String(index)}
            checked={isSelected}
            onChange={() => onChange(index)}
            className={`${isSelected ? 'border-sky-500 bg-sky-50/70' : ''} ${!quote.available ? 'opacity-70' : ''}`}
            disabled={!quote.available}
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-semibold text-slate-900">{quote.serviceLabel}</span>
                {isRecommended && <Badge variant="green">Recommandé</Badge>}
                {isSelected && <Badge variant="sky">Sélectionné</Badge>}
              </div>
              <span className="text-sm text-slate-500">{quote.providerLabel}</span>
              <span className="text-sm text-slate-700">
                {quote.available ? priceLabel : 'Bientôt disponible'}
              </span>
              {quote.calculationMethod && (
                <span className="text-xs text-slate-500">Méthode: {quote.calculationMethod}</span>
              )}
              <span className="text-xs text-slate-500">
                {quote.source === 'internal-pricing' ? 'Tarif DiaExpress' : 'Tarif provider externe'}
              </span>
              {Array.isArray(quote.warnings) &&
                quote.warnings.map((warning, warningIndex) => (
                  <span key={`${index}-warn-${warningIndex}`} className="text-xs text-amber-700">
                    {warning}
                  </span>
                ))}
            </div>
          </RadioGroupItem>
        );
      })}
    </RadioGroup>
    </div>
  );
}
