import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { createQuote, estimateQuote } from '@diaexpress/shared/api/logistics';
import { useBackendAuth } from '@diaexpress/shared/auth/useBackendAuth';
import { useQuoteFlow } from './QuoteFlowProvider';
import { useQuoteFlowMeta } from './quoteFlowMeta';
import { buildEstimateSignature } from './quoteFlowSelectors';

const num = (v) => Number.parseFloat(v || '0') || 0;
const dimsComplete = (c) => num(c.length) > 0 && num(c.width) > 0 && num(c.height) > 0;
const cleanString = (value) => {
  const next = typeof value === 'string' ? value.trim() : value;
  return next ? next : undefined;
};
const cleanNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const resetEstimate = { status: 'idle', estimateId: '', estimatedPrice: null, totalPrice: null, currency: '', provider: '', appliedRule: '', breakdown: null, warnings: [], explanation: '', quoteDraftPayload: null, signature: '', computedAt: null, error: null };
const resetCargo = { packageTypeId: '', weight: '', volume: '', length: '', width: '', height: '' };
const resetTransport = { transportType: '', transportLineId: '' };

const MetaState = ({ loading, error, refresh }) => {
  if (loading) return <p>Loading quote options…</p>;
  if (!error) return null;
  return <div><p>Options are currently unavailable. {error}</p><button className="dx-button" type="button" onClick={refresh}>Retry</button></div>;
};

const mapEstimateError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('validation')) return { code: 'VALIDATION_ERROR', message: 'Certaines informations sont invalides. Vérifiez route, transport et cargo.' };
  if (message.includes('not found') || message.includes('no pricing')) return { code: 'PRICING_NOT_FOUND', message: 'Aucun tarif trouvé pour cette configuration.' };
  if (message.includes('ambiguous')) return { code: 'PRICING_AMBIGUOUS', message: 'Plusieurs tarifications possibles ont été détectées. Merci de préciser la demande.' };
  if (message.includes('network') || message.includes('unavailable') || message.includes('timeout') || message.includes('fetch')) return { code: 'BACKEND_UNAVAILABLE', message: 'Le service de tarification est temporairement indisponible.' };
  return { code: 'UNKNOWN', message: 'Impossible de calculer une estimation pour le moment.' };
};

const normalizeEstimateResponse = (response) => {
  const containers = [
    response,
    response?.data,
    response?.quoteEstimate,
    Array.isArray(response?.quotes) ? response.quotes[0] : null,
    Array.isArray(response?.data?.quotes) ? response.data.quotes[0] : null,
  ].filter(Boolean);

  const nestedQuotes = containers.flatMap((item) => (Array.isArray(item?.quotes) ? item.quotes : []));
  const candidates = [...containers, ...nestedQuotes].filter(Boolean);
  const priced = candidates.find((item) => Number.isFinite(Number(item?.estimatedPrice ?? item?.totalPrice ?? item?.price)));
  const primary = priced || candidates[0] || {};
  const estimatedPrice = Number(primary?.estimatedPrice ?? primary?.totalPrice ?? primary?.price);
  const totalPrice = Number(primary?.totalPrice ?? primary?.estimatedPrice ?? primary?.price);

  return {
    primary,
    estimatedPrice: Number.isFinite(estimatedPrice) ? estimatedPrice : null,
    totalPrice: Number.isFinite(totalPrice) ? totalPrice : null,
    currency: primary?.currency || primary?.priceCurrency || response?.currency || response?.data?.currency || '',
    provider: primary?.provider || response?.provider || 'DiaExpress',
    appliedRule: primary?.appliedRule || response?.appliedRule || '',
    breakdown: primary?.breakdown || response?.breakdown || null,
    warnings: Array.isArray(primary?.warnings) ? primary.warnings : (Array.isArray(response?.warnings) ? response.warnings : []),
    explanation: primary?.explanation || response?.explanation || '',
    quoteDraftPayload: primary?.quoteDraftPayload || response?.quoteDraftPayload || response?.data?.quoteDraftPayload || primary,
  };
};

const buildEstimatePayload = (draft) => {
  const complete = dimsComplete(draft.cargo);
  const computedVolume = complete ? (num(draft.cargo.length) * num(draft.cargo.width) * num(draft.cargo.height)) / 1000000 : cleanNumber(draft.cargo.volume);
  const basePayload = {
    origin: cleanString(draft.route.origin),
    destination: cleanString(draft.route.destination),
    originMarketPointId: cleanString(draft.route.originMarketPointId),
    destinationMarketPointId: cleanString(draft.route.destinationMarketPointId),
    transportType: cleanString(draft.transport.transportType),
    transportLineId: cleanString(draft.transport.transportLineId),
    packageTypeId: cleanString(draft.cargo.packageTypeId),
    weight: cleanNumber(draft.cargo.weight),
    volume: computedVolume,
    length: cleanNumber(draft.cargo.length),
    width: cleanNumber(draft.cargo.width),
    height: cleanNumber(draft.cargo.height),
  };
  const transportType = basePayload.transportType;
  if (transportType === 'air') {
    delete basePayload.volume;
  }
  if (transportType === 'sea' && !basePayload.volume && complete) {
    basePayload.volume = computedVolume;
  }
  return Object.fromEntries(Object.entries(basePayload).filter(([, value]) => value !== undefined));
};

export const QuoteRouteForm = () => { /* unchanged */
  const { draft, patchDraft } = useQuoteFlow();
  const { origins, destinations, marketPoints, loading, error, refresh } = useQuoteFlowMeta();
  const routeValid = Boolean(draft.route.origin && draft.route.destination);
  const destinationOptions = useMemo(() => destinations.filter((d) => String(d?.id) !== String(draft.route.origin)), [destinations, draft.route.origin]);
  const routeSummary = `${draft.route.origin || '—'} → ${draft.route.destination || '—'}`;
  const setOrigin = (origin) => patchDraft({ route: { origin, destination: '', originMarketPointId: '', destinationMarketPointId: '' }, transport: resetTransport, cargo: resetCargo, estimate: resetEstimate, selectedOffer: { provider: '', serviceLevel: '', price: null, currency: '' } });
  return <><MetaState loading={loading} error={error} refresh={refresh} /><label>Origin<select value={draft.route.origin} onChange={(e) => setOrigin(e.target.value)}><option value="">Select origin</option>{origins.map((o)=><option key={o.id||o.code||o.name} value={o.id||o.code||o.name}>{o.name||o.label||o.code}</option>)}</select></label><label>Destination<select value={draft.route.destination} onChange={(e)=>patchDraft({ route: { ...draft.route, destination: e.target.value }})}><option value="">Select destination</option>{destinationOptions.map((d)=><option key={d.id||d.code||d.name} value={d.id||d.code||d.name}>{d.name||d.label||d.code}</option>)}</select></label><label>Origin market point<select value={draft.route.originMarketPointId} onChange={(e)=>patchDraft({ route: { ...draft.route, originMarketPointId: e.target.value }})}><option value="">Optional</option>{marketPoints.map((m)=><option key={m.id||m.code||m.name} value={m.id||m.code||m.name}>{m.name||m.label||m.code}</option>)}</select></label><label>Destination market point<select value={draft.route.destinationMarketPointId} onChange={(e)=>patchDraft({ route: { ...draft.route, destinationMarketPointId: e.target.value }})}><option value="">Optional</option>{marketPoints.map((m)=><option key={m.id||m.code||m.name} value={m.id||m.code||m.name}>{m.name||m.label||m.code}</option>)}</select></label><p>Route summary: {routeSummary}</p><div className="dx-actions"><Link className="dx-button dx-button--outline" href="/quote-request/start">Back</Link><Link className={`dx-button ${!routeValid ? 'dx-button--disabled' : ''}`} aria-disabled={!routeValid} href={routeValid ? '/quote-request/transport' : '#'}>Next</Link></div></>;
};

export const QuoteTransportForm = () => { const { draft, patchDraft } = useQuoteFlow(); const { transportTypes, transportLines, loading, error, refresh } = useQuoteFlowMeta(); const availableLines = useMemo(() => transportLines.filter((l) => !draft.transport.transportType || (l.transportType || l.type) === draft.transport.transportType), [transportLines, draft.transport.transportType]); const lineRequired = availableLines.length > 1; const transportValid = Boolean(draft.transport.transportType && (!lineRequired || draft.transport.transportLineId)); return <><MetaState loading={loading} error={error} refresh={refresh} /><label>Transport type<select value={draft.transport.transportType} onChange={(e)=>patchDraft({ transport:{ transportType:e.target.value, transportLineId:''}, cargo: resetCargo, estimate: resetEstimate, selectedOffer:{ provider:'', serviceLevel:'', price:null, currency:'' } })}><option value="">Select transport</option>{(transportTypes.length?transportTypes:[{id:'air',name:'Air'},{id:'sea',name:'Sea'},{id:'road',name:'Road'}]).map((t)=><option key={t.id||t.code} value={String(t.id||t.code).toLowerCase()}>{t.name||t.label||t.code}</option>)}</select></label>{availableLines.length > 0 && <label>Transport line<select value={draft.transport.transportLineId} onChange={(e)=>patchDraft({ transport: { ...draft.transport, transportLineId: e.target.value }})}><option value="">Select line</option>{availableLines.map((l)=><option key={l.id||l.code||l.name} value={l.id||l.code||l.name}>{l.name||l.label||l.code}</option>)}</select></label>}<div className="dx-actions"><Link className="dx-button dx-button--outline" href="/quote-request/route">Back</Link><Link className={`dx-button ${!transportValid ? 'dx-button--disabled' : ''}`} aria-disabled={!transportValid} href={transportValid ? '/quote-request/cargo' : '#'}>Next</Link></div></>; };

export const QuoteCargoForm = () => { const { draft, patchDraft } = useQuoteFlow(); const { packageTypes, loading, error, refresh } = useQuoteFlowMeta(); const c = draft.cargo; const complete = dimsComplete(c); const liveVolume = complete ? ((num(c.length) * num(c.width) * num(c.height)) / 1000000).toFixed(3) : c.volume; const t = draft.transport.transportType; const sufficient = t === 'air' ? Boolean(c.packageTypeId || num(c.weight) > 0 || complete) : t === 'sea' ? Boolean(c.packageTypeId || num(c.volume || liveVolume) > 0 || complete) : Boolean(c.packageTypeId || num(c.weight) > 0 || num(c.volume || liveVolume) > 0 || complete); const patchCargo = (next) => patchDraft({ cargo: { ...c, ...next }, estimate: { ...resetEstimate, status: 'stale' }, selectedOffer: { provider: '', serviceLevel: '', price: null, currency: '' } }); return <><MetaState loading={loading} error={error} refresh={refresh} /><label>Package type<select value={c.packageTypeId} onChange={(e)=>patchCargo({ packageTypeId: e.target.value })}><option value="">Optional</option>{packageTypes.map((p)=><option key={p.id||p.code||p.name} value={p.id||p.code||p.name}>{p.name||p.label||p.code}</option>)}</select></label><label>Weight (kg)<input type="number" min="0" value={c.weight} onChange={(e)=>patchCargo({ weight: e.target.value })} /></label><label>Length (cm)<input type="number" min="0" value={c.length} onChange={(e)=>patchCargo({ length: e.target.value, volume: complete ? liveVolume : c.volume })} /></label><label>Width (cm)<input type="number" min="0" value={c.width} onChange={(e)=>patchCargo({ width: e.target.value, volume: complete ? liveVolume : c.volume })} /></label><label>Height (cm)<input type="number" min="0" value={c.height} onChange={(e)=>patchCargo({ height: e.target.value, volume: complete ? liveVolume : c.volume })} /></label><label>Volume (m³ / CBM)<input type="number" min="0" value={complete ? liveVolume : c.volume} onChange={(e)=>patchCargo({ volume: e.target.value })} /></label><p>{complete ? `Auto-calculated volume: ${liveVolume} m³` : 'Provide full dimensions to auto-calculate volume.'}</p><div className="dx-actions"><Link className="dx-button dx-button--outline" href="/quote-request/transport">Back</Link><Link className={`dx-button ${!sufficient ? 'dx-button--disabled' : ''}`} aria-disabled={!sufficient} href={sufficient ? '/quote-request/estimate' : '#'}>Next</Link></div></>; };

export const QuoteEstimateForm = () => {
  const { draft, patchDraft } = useQuoteFlow();
  const [inFlightSig, setInFlightSig] = useState('');
  const signature = buildEstimateSignature(draft);
  const stale = draft.estimate.signature && draft.estimate.signature !== signature;

  useEffect(() => {
    if (stale && draft.estimate.status === 'success') {
      patchDraft({ estimate: { ...draft.estimate, status: 'stale' }, selectedOffer: { provider: '', serviceLevel: '', price: null, currency: '' } });
    }
  }, [stale, draft.estimate, patchDraft]);

  const runEstimate = useCallback(async () => {
    const nextSig = buildEstimateSignature(draft);
    setInFlightSig(nextSig);
    patchDraft({ estimate: { ...resetEstimate, status: 'loading', signature: nextSig } });
    try {
      const response = await estimateQuote(buildEstimatePayload(draft));
      const normalized = normalizeEstimateResponse(response);
      const primary = normalized.primary;
      const price = Number(normalized.estimatedPrice);
      if (!Number.isFinite(price)) throw new Error('pricing_not_found');
      const currency = normalized.currency || 'USD';
      patchDraft({
        estimate: {
          ...resetEstimate,
          status: 'success',
          estimateId: String(primary?.id || primary?.estimateId || ''),
          estimatedPrice: price,
          totalPrice: Number.isFinite(Number(normalized.totalPrice)) ? Number(normalized.totalPrice) : price,
          currency,
          provider: normalized.provider,
          appliedRule: normalized.appliedRule,
          breakdown: normalized.breakdown,
          warnings: normalized.warnings,
          explanation: normalized.explanation,
          quoteDraftPayload: normalized.quoteDraftPayload,
          signature: nextSig,
          computedAt: Date.now(),
        },
        selectedOffer: { provider: 'DiaExpress', serviceLevel: 'Standard', price, currency },
      });
    } catch (error) {
      patchDraft({ estimate: { ...resetEstimate, status: 'error', signature: nextSig, error: mapEstimateError(error) }, selectedOffer: { provider: '', serviceLevel: '', price: null, currency: '' } });
    }
  }, [draft, patchDraft]);

  useEffect(() => {
    if ((draft.estimate.status === 'idle' || draft.estimate.status === 'stale' || draft.estimate.status === 'error') && inFlightSig !== signature) runEstimate();
  }, [draft.estimate.status, inFlightSig, runEstimate, signature]);

  const canGoNext = draft.estimate.status === 'success' && !stale && Number.isFinite(Number(draft.estimate.estimatedPrice)) && Boolean(draft.estimate.quoteDraftPayload);
  return <>
    <h3>Offres disponibles</h3>
    {draft.estimate.status === 'loading' && <p>Calcul en cours…</p>}
    {draft.estimate.status === 'error' && <div><p>{draft.estimate.error?.message || 'Erreur estimation.'}</p><button type="button" className="dx-button" onClick={runEstimate}>Retry</button></div>}
    {stale && <div><p>Estimation périmée. Recalculez pour continuer.</p><button type="button" className="dx-button" onClick={runEstimate}>Recalculer</button></div>}
    <div className="dx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem' }}>
      <article className="dx-card"><h4>Economic</h4><p>Indisponible</p></article>
      <article className="dx-card"><h4>Standard • Recommandé</h4><p>{Number.isFinite(Number(draft.estimate.estimatedPrice)) ? `${draft.estimate.estimatedPrice} ${draft.estimate.currency}` : '—'}</p><p>DiaExpress</p></article>
      <article className="dx-card"><h4>Express</h4><p>Indisponible</p></article>
    </div>
    <h3>Détails estimation</h3>
    <p>Route: {draft.route.origin} → {draft.route.destination}</p>
    <p>Transport: {draft.transport.transportType} / {draft.transport.transportLineId || '—'}</p>
    <p>Cargo: package {draft.cargo.packageTypeId || '—'}, volume {draft.cargo.volume || '—'} m³</p>
    <p>Prix: {Number.isFinite(Number(draft.estimate.estimatedPrice)) ? draft.estimate.estimatedPrice : '—'} {draft.estimate.currency || ''}</p>
    <p>Applied rule: {draft.estimate.appliedRule || '—'}</p>
    <p>Explanation: {draft.estimate.explanation || '—'}</p>
    <div className="dx-actions"><Link className="dx-button dx-button--outline" href="/quote-request/cargo">Back</Link><Link className={`dx-button ${!canGoNext ? 'dx-button--disabled' : ''}`} aria-disabled={!canGoNext} href={canGoNext ? '/quote-request/details' : '#'}>Next</Link></div>
  </>;
};


export const QuoteDetailsForm = () => {
  const { draft, patchDraft } = useQuoteFlow();
  const details = draft.details || {};
  const setDetail = (key, value) => patchDraft({ details: { ...details, [key]: value } });
  const isValid = Boolean((details.contactName || '').trim() && (details.contactEmail || '').trim());
  return <>
    <h3>Informations produit</h3>
    <label>Description produit<textarea value={details.productDescription || ''} onChange={(e)=>setDetail('productDescription', e.target.value)} /></label>
    <label>Type produit<input value={details.productType || ''} onChange={(e)=>setDetail('productType', e.target.value)} /></label>
    <label>Localisation produit<input value={details.productLocation || ''} onChange={(e)=>setDetail('productLocation', e.target.value)} /></label>
    <h3>Contact</h3>
    <label>Nom<input value={details.contactName || ''} onChange={(e)=>setDetail('contactName', e.target.value)} /></label>
    <label>Téléphone<input value={details.contactPhone || ''} onChange={(e)=>setDetail('contactPhone', e.target.value)} /></label>
    <label>Email<input type="email" value={details.contactEmail || ''} onChange={(e)=>setDetail('contactEmail', e.target.value)} /></label>
    <h3>Options logistiques</h3>
    <label>Pickup option<input value={details.pickupOption || ''} onChange={(e)=>setDetail('pickupOption', e.target.value)} /></label>
    <h3>Notes additionnelles</h3>
    <label>Notes<textarea value={details.notes || ''} onChange={(e)=>setDetail('notes', e.target.value)} /></label>
    <p>{isValid ? 'Autosave actif' : 'Nom et email requis pour continuer.'}</p>
    <div className="dx-actions"><Link className="dx-button dx-button--outline" href="/quote-request/estimate">Back</Link><Link className={`dx-button ${!isValid ? 'dx-button--disabled' : ''}`} aria-disabled={!isValid} href={isValid ? '/quote-request/review' : '#'}>Next</Link></div>
  </>;
};

const mapCreateError = (error) => { const msg = String(error?.message || '').toLowerCase(); if (msg.includes('401') || msg.includes('unauthorized')) return { code: 'UNAUTHORIZED', message: 'Connexion requise.' }; if (msg.includes('validation')) return { code: 'VALIDATION_ERROR', message: 'Validation impossible.' }; if (msg.includes('network') || msg.includes('timeout') || msg.includes('unavailable') || msg.includes('fetch')) return { code: 'BACKEND_UNAVAILABLE', message: 'Backend indisponible.' }; if (msg.includes('quote')) return { code: 'QUOTE_CREATE_FAILED', message: 'Création du devis échouée.' }; return { code: 'UNKNOWN', message: 'Erreur inconnue.' }; };

const buildCreatePayload = (draft) => Object.fromEntries(
  Object.entries({
    ...buildEstimatePayload(draft),
    estimatedPrice: cleanNumber(draft.estimate.estimatedPrice),
    currency: cleanString(draft.estimate.currency),
    quoteDraftPayload: draft.estimate.quoteDraftPayload || undefined,
    provider: cleanString(draft.estimate.provider),
    appliedRule: cleanString(draft.estimate.appliedRule),
    breakdown: draft.estimate.breakdown || undefined,
    warnings: Array.isArray(draft.estimate.warnings) && draft.estimate.warnings.length ? draft.estimate.warnings : undefined,
    explanation: cleanString(draft.estimate.explanation),
    productDescription: cleanString(draft.details.productDescription),
    productType: cleanString(draft.details.productType),
    productLocation: cleanString(draft.details.productLocation),
    contactName: cleanString(draft.details.contactName),
    contactPhone: cleanString(draft.details.contactPhone),
    contactEmail: cleanString(draft.details.contactEmail),
    pickupOption: cleanString(draft.details.pickupOption) || 'pickup',
    notes: cleanString(draft.details.notes),
  }).filter(([, value]) => value !== undefined),
);

export const QuoteReviewForm = () => {
  const { draft, patchDraft, resetDraft } = useQuoteFlow();
  const router = useRouter();
  const { isSignedIn, getToken } = useBackendAuth();
  const canCreateQuote = draft.estimate.status === 'success' && Boolean(draft.estimate.quoteDraftPayload) && Number.isFinite(Number(draft.estimate.estimatedPrice));
  const onSubmit = async () => {
    if (!canCreateQuote) return;
    if (!isSignedIn) { router.push(`/sign-in?returnUrl=${encodeURIComponent('/quote-request/review')}`); return; }
    patchDraft({ submission: { status: 'loading', quoteId: null, error: null } });
    try {
      const token = await getToken();
      const res = await createQuote(buildCreatePayload(draft), token);
      const quoteId = res?.quote?._id || res?._id || res?.quoteId || null;
      patchDraft({ submission: { status: 'success', quoteId, error: null } });
      resetDraft();
      router.push(quoteId ? `/quote-request/success?quoteId=${encodeURIComponent(quoteId)}` : '/quote-request/success');
    } catch (error) { patchDraft({ submission: { status: 'error', quoteId: null, error: mapCreateError(error) } }); }
  };

  return <>
    <h3>Résumé consolidé</h3>
    <p>Route: {draft.route.origin} → {draft.route.destination}</p><p>Points marché: {draft.route.originMarketPointId || '—'} / {draft.route.destinationMarketPointId || '—'}</p>
    <p>Transport: {draft.transport.transportType} / {draft.transport.transportLineId || '—'}</p>
    <p>Cargo: package {draft.cargo.packageTypeId || '—'}, poids {draft.cargo.weight || '—'}, volume {draft.cargo.volume || '—'}, dimensions {draft.cargo.length || '—'}x{draft.cargo.width || '—'}x{draft.cargo.height || '—'}</p>
    <p>Estimate: {draft.estimate.provider || 'DiaExpress'} / {draft.selectedOffer.serviceLevel || 'Standard'} / {draft.estimate.estimatedPrice} {draft.estimate.currency}</p>
    <p>Rule: {draft.estimate.appliedRule || '—'} | warnings: {(draft.estimate.warnings || []).join(' · ') || '—'}</p>
    <p>Contact: {draft.details.contactName || '—'} / {draft.details.contactEmail || '—'} / {draft.details.contactPhone || '—'}</p>
    <p>Produit: {draft.details.productType || '—'} | {draft.details.productDescription || '—'} | pickup: {draft.details.pickupOption || '—'}</p>
    {!isSignedIn ? <div className="dx-card"><p>Connexion requise pour créer le devis.</p></div> : null}
    {draft.submission.status === 'error' ? <div className="dx-card"><p>{draft.submission.error?.code}: {draft.submission.error?.message}</p><button type="button" className="dx-button" onClick={onSubmit}>Retry</button></div> : null}
    {!canCreateQuote ? <div className="dx-card"><p>Une estimation valide est requise avant de créer le devis.</p></div> : null}
    <div className="dx-actions"><Link className="dx-button dx-button--outline" href="/quote-request/details">Back</Link><button className="dx-button" type="button" disabled={draft.submission.status === 'loading' || !canCreateQuote} onClick={onSubmit}>{draft.submission.status === 'loading' ? 'Création en cours…' : 'Créer mon devis'}</button></div>
  </>;
};

export const QuoteSuccessView = () => { const router = useRouter(); const quoteId = router.query?.quoteId; return <>
  <h3>Devis créé</h3><p>Merci, votre demande est confirmée.</p><p>{quoteId ? `Quote ID: ${quoteId}` : 'Quote ID indisponible.'}</p>
  <div className="dx-actions"><Link className="dx-button" href="/quotes">Dashboard devis</Link><Link className="dx-button dx-button--outline" href="/track-shipment">Tracking</Link><Link className="dx-button dx-button--outline" href="/">Accueil</Link></div>
</>; };
