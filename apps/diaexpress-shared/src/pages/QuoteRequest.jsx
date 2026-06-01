import React, { useEffect, useMemo, useRef, useState } from 'react';
import { estimateQuote, fetchQuoteMeta } from '../api/logistics';

const ESTIMATE_DEBOUNCE_MS = 650;
const ERROR_MAP = {
  PRICING_NOT_FOUND: 'Aucun tarif disponible pour cette configuration.',
  PRICING_AMBIGUOUS: 'Plusieurs tarifs correspondent. Précisez le colis ou contactez le support.',
  VALIDATION_ERROR: 'Certaines informations sont incomplètes ou invalides.',
  BACKEND_UNAVAILABLE: 'Le service de tarification est temporairement indisponible.',
};
const n = (v) => { const p = Number.parseFloat(v); return Number.isFinite(p) && p > 0 ? p : 0; };
const hasDims = ({ length, width, height }) => [length, width, height].every((v) => n(v) > 0);

export default function QuoteRequest({ initialOrigins = [] }) {
  const [metaOrigins, setMetaOrigins] = useState(Array.isArray(initialOrigins) ? initialOrigins : []);
  const [origin, setOrigin] = useState(''); const [destination, setDestination] = useState(''); const [transportType, setTransportType] = useState('');
  const [packageTypeId, setPackageTypeId] = useState(''); const [weight, setWeight] = useState(''); const [volume, setVolume] = useState('');
  const [length, setLength] = useState(''); const [width, setWidth] = useState(''); const [height, setHeight] = useState('');
  const [estimateStatus, setEstimateStatus] = useState('idle'); const [estimateError, setEstimateError] = useState(''); const [estimateData, setEstimateData] = useState(null);
  const reqRef = useRef(0);

  useEffect(() => { fetchQuoteMeta().then((d) => setMetaOrigins(Array.isArray(d?.origins) ? d.origins : [])).catch(() => {}); }, []);

  const destinations = useMemo(() => metaOrigins.find((i) => i.origin === origin)?.destinations || [], [metaOrigins, origin]);
  const transports = useMemo(() => destinations.find((i) => i.destination === destination)?.transportTypes || [], [destinations, destination]);
  const routeReady = Boolean(origin && destination && transportType);
  const cargoReady = useMemo(() => {
    const p = Boolean(packageTypeId); const w = n(weight) > 0; const v = n(volume) > 0; const d = hasDims({ length, width, height });
    if (transportType === 'air') return p || w || d; if (transportType === 'sea') return p || v || d; if (transportType === 'road') return p || w || v || d; return false;
  }, [transportType, packageTypeId, weight, volume, length, width, height]);
  const ready = routeReady && cargoReady;

  const payload = useMemo(() => ({ origin, destination, transportType, packageTypeId: packageTypeId || undefined, weight: n(weight) || undefined, volume: n(volume) || undefined, dimensions: hasDims({ length, width, height }) ? { length: n(length), width: n(width), height: n(height) } : undefined }), [origin, destination, transportType, packageTypeId, weight, volume, length, width, height]);

  useEffect(() => {
    if (!ready) { setEstimateStatus('idle'); setEstimateData(null); return; }
    const id = ++reqRef.current; setEstimateStatus('loading'); setEstimateError('');
    const t = setTimeout(async () => {
      try { const data = await estimateQuote(payload); if (id !== reqRef.current) return; setEstimateData(data); setEstimateStatus('success'); }
      catch (e) { if (id !== reqRef.current) return; const code = e?.payload?.error?.code || e?.code || 'BACKEND_UNAVAILABLE'; setEstimateError(ERROR_MAP[code] || ERROR_MAP.BACKEND_UNAVAILABLE); setEstimateStatus('error'); }
    }, ESTIMATE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [ready, payload]);

  return <div>
    <h1>Quote Request</h1>
    <select value={origin} onChange={(e) => setOrigin(e.target.value)}><option value=''>Origin</option>{metaOrigins.map((o) => <option key={o.origin} value={o.origin}>{o.origin}</option>)}</select>
    <select value={destination} onChange={(e) => setDestination(e.target.value)}><option value=''>Destination</option>{destinations.map((d) => <option key={d.destination} value={d.destination}>{d.destination}</option>)}</select>
    {transports.map((t) => <button key={t} type='button' onClick={() => setTransportType(t)}>{t}</button>)}
    <input value={packageTypeId} onChange={(e) => setPackageTypeId(e.target.value)} placeholder='packageTypeId' />
    <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder='weight' />
    <input value={volume} onChange={(e) => setVolume(e.target.value)} placeholder='volume' />
    <input value={length} onChange={(e) => setLength(e.target.value)} placeholder='length' />
    <input value={width} onChange={(e) => setWidth(e.target.value)} placeholder='width' />
    <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder='height' />
    {!ready && <p>Complétez les informations du colis pour voir l’estimation.</p>}
    {estimateStatus === 'loading' && <p>Loading estimation...</p>}
    {estimateStatus === 'error' && <p>{estimateError}</p>}
    {estimateStatus === 'success' && estimateData && <div><h2>Offres disponibles</h2><p>DiaExpress Economic: Indisponible pour le moment</p><p>DiaExpress Standard: {estimateData.totalPrice} {estimateData.currency}</p><p>DiaExpress Express: Bientôt disponible</p><pre>{JSON.stringify(estimateData, null, 2)}</pre></div>}
  </div>;
}
