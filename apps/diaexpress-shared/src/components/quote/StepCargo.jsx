import React, { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

const transportVisuals = {
  air: { icon: '✈️', label: 'Aérien' },
  road: { icon: '🚚', label: 'Routier' },
  sea: { icon: '🚢', label: 'Maritime' },
};

export function formatTransport(transportType) {
  if (!transportType) return '';
  const key = transportType.toLowerCase();
  return transportVisuals[key]?.label || transportType;
}

export function StepCargo({ transportTypes = [], packageTypes = [] }) {
  const { watch, setValue, register, formState: { errors, touchedFields } } = useFormContext();

  useEffect(() => {
    register('transportType');
    register('packageTypeId');
  }, [register]);

  const transportType = watch('transportType');
  const packageTypeId = watch('packageTypeId');
  const length = watch('length');
  const width = watch('width');
  const height = watch('height');

  const rulesByTransport = {
    air: { label: 'Air: type de colis ou poids ou dimensions.', highlight: 'Poids prioritaire' },
    sea: { label: 'Sea: type de colis ou volume ou dimensions.', highlight: 'CBM prioritaire' },
    road: { label: 'Road: type de colis ou poids ou volume.', highlight: 'Poids + volume équilibrés' },
  };

  const requiresDimensions = transportType === 'sea' && !packageTypeId;
  const derivedVolume = useMemo(() => {
    if (!(length && width && height)) return '';
    const volumeValue =
      (Number(String(length).replace(',', '.')) * Number(String(width).replace(',', '.')) * Number(String(height).replace(',', '.'))) / 1_000_000;
    if (!Number.isFinite(volumeValue)) return '';
    return volumeValue.toFixed(3);
  }, [length, width, height]);

  useEffect(() => {
    if (derivedVolume) {
      setValue('volume', derivedVolume, { shouldDirty: true });
    }
  }, [derivedVolume, setValue]);

  const handleTransportSelect = (type) => {
    setValue('transportType', type, { shouldDirty: true });
    if (type !== transportType) {
      setValue('packageTypeId', '', { shouldDirty: true });
      setValue('weight', '', { shouldDirty: true });
      setValue('volume', '', { shouldDirty: true });
      setValue('length', '', { shouldDirty: true });
      setValue('width', '', { shouldDirty: true });
      setValue('height', '', { shouldDirty: true });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurateur Cargo</CardTitle>
        <CardDescription>Sélectionnez le mode de transport puis complétez progressivement les données colis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Mode de transport *</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {transportTypes.map((type) => {
              const key = String(type).toLowerCase();
              const visual = transportVisuals[key] || { icon: '🚚', label: String(type) };
              const isActive = transportType === type;
              return (
                <button key={type} type="button" className={`group rounded-xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${isActive ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`} onClick={() => handleTransportSelect(String(type))}>
                  <span className="text-2xl" aria-hidden>{visual.icon}</span>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{visual.label}</p>
                </button>
              );
            })}
          </div>
        </section>

        {transportType && (
          <section className="space-y-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-sm text-amber-900 transition-all duration-300">
            <p>{rulesByTransport[transportType]?.label}</p>
            <p className="font-medium">{rulesByTransport[transportType]?.highlight}</p>
          </section>
        )}

        {transportType && (
          <section className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h3 className="text-sm font-semibold text-slate-700">Type de colis</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {packageTypes.map((pkg) => {
                const isActive = packageTypeId === pkg._id;
                return (
                  <button key={pkg._id} type="button" onClick={() => setValue('packageTypeId', pkg._id, { shouldDirty: true })} className={`rounded-xl border p-4 text-left transition-all ${isActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <p className="text-sm font-semibold text-slate-900">{pkg.name}</p>
                    {pkg.code && <p className="mt-1 text-xs text-slate-500">{pkg.code}</p>}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {transportType && !packageTypeId && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-500">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input id="weight" type="text" inputMode="decimal" placeholder="ex: 250" {...register('weight')} aria-invalid={Boolean(errors.weight)} />
                {errors.weight && touchedFields.weight && <p className="text-xs text-amber-700">{String(errors.weight.message)}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="volume">Volume (CBM / m³){requiresDimensions ? ' *' : ''}</Label>
                <Input id="volume" type="text" inputMode="decimal" placeholder="ex: 1.2" {...register('volume')} aria-invalid={Boolean(errors.volume)} />
                {errors.volume && touchedFields.volume && <p className="text-xs text-amber-700">{String(errors.volume.message)}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {['length', 'width', 'height'].map((field) => (
                <div key={field} className="flex flex-col gap-2">
                  <Label htmlFor={field}>{field === 'length' ? 'Longueur (cm)' : field === 'width' ? 'Largeur (cm)' : 'Hauteur (cm)'}</Label>
                  <Input id={field} type="text" inputMode="decimal" placeholder="ex: 120" {...register(field)} aria-invalid={Boolean(errors[field])} />
                  {errors[field] && touchedFields[field] && <p className="text-xs text-amber-700">{String(errors[field].message)}</p>}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900 transition-all duration-300">
              Volume calculé automatiquement: <span className="font-semibold">{derivedVolume || '—'} m³</span>
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
