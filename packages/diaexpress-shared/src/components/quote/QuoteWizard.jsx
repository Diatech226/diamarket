import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useBackendAuth } from '../../auth/useBackendAuth';
import { createQuote, estimateQuote } from '../../api/logistics';
import { useQuoteMeta } from '../../hooks/useQuoteMeta';
import { parseNumericField } from '../../lib/validation/quoteSchemas';

const QUOTE_DRAFT_KEY = 'diaexpress_quote_draft_v1';
const defaultValues = { origin:'', destination:'', transportType:'', transportLineId:'', packageTypeId:'', weight:'', volume:'', length:'', width:'', height:'', productDescription:'', contactName:'', contactPhone:'', contactEmail:'' };
const transportLabel = { air: 'Air', sea: 'Sea', road: 'Road' };
const toNumberOrNull = (v) => parseNumericField(v);
const fmt = (v,c='EUR') => (v==null ? '—' : new Intl.NumberFormat('fr-FR',{style:'currency',currency:c,maximumFractionDigits:0}).format(v));

const transportMeta = {
  air: { title: 'Fast international shipping', hint: 'Best for urgent cargo & perishable goods', speed: '1-5 days', asset: '/images/logistics/transport-air.svg' },
  sea: { title: 'Large cargo & containers', hint: 'Best for high-volume cost-optimized routes', speed: '15-45 days', asset: '/images/logistics/transport-sea.svg' },
  road: { title: 'Regional ground delivery', hint: 'Best for regional flexibility & consolidations', speed: '1-7 days', asset: '/images/logistics/transport-road.svg' },
};

const useEstimateSignature = (values) => useMemo(() => JSON.stringify(values), [values]);

export function QuoteWizard({ initialOrigins=[] }) {
  const router = useRouter();
  const { isSignedIn, getToken } = useBackendAuth();
  const form = useForm({ defaultValues });
  const { control, setValue, getValues, handleSubmit } = form;
  const { origins, loading: loadingMeta, error: metaError } = useQuoteMeta(initialOrigins);
  const [estimateState, setEstimateState] = useState({ loading:false, error:'', result:null, selected:false, status:'route_incomplete', signature:'' });
  const [createState, setCreateState] = useState({ loading:false, error:'', success:null });
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const reqRef = useRef(0);

  const origin = useWatch({ control, name:'origin' }); const destination = useWatch({ control, name:'destination' }); const transportType = useWatch({ control, name:'transportType' }); const transportLineId = useWatch({ control, name:'transportLineId' }); const packageTypeId = useWatch({ control, name:'packageTypeId' }); const weight = useWatch({ control, name:'weight' }); const volume = useWatch({ control, name:'volume' }); const length = useWatch({ control, name:'length' }); const width = useWatch({ control, name:'width' }); const height = useWatch({ control, name:'height' });
  const productDescription = useWatch({ control, name:'productDescription' }); const contactName = useWatch({ control, name:'contactName' }); const contactPhone = useWatch({ control, name:'contactPhone' }); const contactEmail = useWatch({ control, name:'contactEmail' });

  const destinationOptions = useMemo(()=>origins.find(o=>o.origin===origin)?.destinations||[],[origins,origin]);
  const selectedDestination = useMemo(()=>destinationOptions.find(d=>d.destination===destination),[destinationOptions,destination]);
  const transportTypes = selectedDestination?.transportTypes || [];
  const transportLines = useMemo(()=>selectedDestination?.transportLines?.filter(l=>!transportType||l.transportType===transportType) || [], [selectedDestination, transportType]);
  const packageTypes = useMemo(()=> (selectedDestination?.packageTypes || []).filter(p=>!p.allowedTransportTypes || p.allowedTransportTypes.includes(transportType)), [selectedDestination, transportType]);
  const calcVolume = useMemo(()=>{ const l=Number(String(length).replace(',','.')); const w=Number(String(width).replace(',','.')); const h=Number(String(height).replace(',','.')); if(!l||!w||!h) return null; return (l*w*h)/1000000; },[length,width,height]);
  useEffect(()=>{ if(calcVolume && (!volume || transportType==='sea')) setValue('volume', calcVolume.toFixed(3), {shouldDirty:true}); },[calcVolume,volume,transportType,setValue]);

  const clearAfterRouteChange = useCallback(() => { setValue('transportType',''); setValue('transportLineId',''); setValue('packageTypeId',''); setValue('weight',''); setValue('volume',''); setValue('length',''); setValue('width',''); setValue('height',''); setEstimateState(s=>({...s,result:null,selected:false,status:'route_incomplete',signature:'',error:''})); }, [setValue]);
  useEffect(()=>{ setValue('destination',''); clearAfterRouteChange(); },[clearAfterRouteChange, origin, setValue]);
  useEffect(()=>{ clearAfterRouteChange(); },[clearAfterRouteChange, destination]);
  useEffect(()=>{ setValue('transportLineId',''); setValue('packageTypeId',''); setValue('weight',''); setValue('volume',''); setValue('length',''); setValue('width',''); setValue('height',''); setEstimateState(s=>({...s,result:null,selected:false,status:'cargo_incomplete',signature:'',error:''})); },[setValue, transportType]);

  const numericCargo = useMemo(() => ({ weight: toNumberOrNull(weight), volume: toNumberOrNull(volume), length: toNumberOrNull(length), width: toNumberOrNull(width), height: toNumberOrNull(height) }), [weight, volume, length, width, height]);
  const hasInvalidCargoInput = useMemo(() => [weight, volume, length, width, height].some((v) => String(v || '').trim() && toNumberOrNull(v) == null), [weight, volume, length, width, height]);
  const cargoSufficient = useMemo(()=>{ if(!transportType) return false; if(packageTypeId) return true; const hasWeight = !!numericCargo.weight; const hasVolume = !!numericCargo.volume; if(transportType==='air') return hasWeight; if(transportType==='sea') return hasVolume || (!!numericCargo.length&&!!numericCargo.width&&!!numericCargo.height); return hasWeight || hasVolume; },[transportType,packageTypeId,numericCargo]);

  const estimatePayload = useMemo(() => {
    const payload={ origin,destination,transportType };
    if(transportLineId) payload.transportLineId=transportLineId;
    if(packageTypeId) payload.packageTypeId=packageTypeId;
    if(numericCargo.weight!=null) payload.weight=numericCargo.weight;
    if(numericCargo.volume!=null) payload.volume=numericCargo.volume;
    if(numericCargo.length!=null && numericCargo.width!=null && numericCargo.height!=null){ payload.length=numericCargo.length; payload.width=numericCargo.width; payload.height=numericCargo.height; }
    return payload;
  }, [origin,destination,transportType,transportLineId,packageTypeId,numericCargo]);
  const estimateSignature = useEstimateSignature(estimatePayload);

  useEffect(()=>{
    if(!origin || !destination || !transportType){ setEstimateState(s=>({...s,status:'route_incomplete',result:null,selected:false,error:'',signature:''})); return; }
    if(hasInvalidCargoInput){ setEstimateState(s=>({...s,status:'invalid_cargo',result:null,selected:false,error:'Cargo values must be valid numbers.',signature:''})); return; }
    if(!cargoSufficient){ setEstimateState(s=>({...s,status:'cargo_incomplete',result:null,selected:false,error:'',signature:''})); return; }
    const id=++reqRef.current;
    const t=setTimeout(async ()=>{ try{ setEstimateState(s=>({...s,loading:true,error:'',status:'estimate_loading'})); const r=await estimateQuote(estimatePayload); if(id!==reqRef.current) return; const q=Array.isArray(r?.quotes)?r.quotes.find(x=>x?.estimatedPrice!=null):r; if(!q?.estimatedPrice){ setEstimateState({loading:false,error:'No pricing found for this configuration.',result:null,selected:false,status:'pricing_not_found',signature:''}); return; }
      setEstimateState({loading:false,error:'',selected:true,status:'estimate_success',signature:estimateSignature,result:{price:Number(q.estimatedPrice),currency:q.currency||r?.currency||'EUR',provider:'DiaExpress',serviceLevel:'Standard',rawEstimate:q}});}catch(e){ if(id!==reqRef.current) return; setEstimateState({loading:false,error:e?.message||'backend unavailable',result:null,selected:false,status:'backend_unavailable',signature:''}); } },650);
    return ()=>clearTimeout(t);
  },[origin,destination,transportType,cargoSufficient,estimatePayload,estimateSignature,hasInvalidCargoInput]);

  const isEstimateStale = !!estimateState.result && estimateState.signature && estimateState.signature !== estimateSignature;
  const onSubmit = async () => {
    if(!estimateState.result){ setCreateState(s=>({...s,error:'Estimate required before quote creation.'})); return; }
    if(isEstimateStale){ setCreateState({ loading:false, error:'Estimate is stale. Please re-run estimate with latest inputs.', success:null }); return; }
    const values=getValues();
    if(!isSignedIn){ if(typeof window!=='undefined'){ window.localStorage.setItem(QUOTE_DRAFT_KEY, JSON.stringify({route:values,estimate:estimateState.result,createdAt:Date.now()})); } setCreateState({loading:false,error:'Please sign in to create the quote.',success:null}); return; }
    const payload={ origin:values.origin,destination:values.destination,transportType:values.transportType,transportLineId:values.transportLineId||undefined,packageTypeId:values.packageTypeId||undefined,weight:toNumberOrNull(values.weight),volume:toNumberOrNull(values.volume),length:toNumberOrNull(values.length),width:toNumberOrNull(values.width),height:toNumberOrNull(values.height),estimatedPrice:estimateState.result.price,currency:estimateState.result.currency,quoteDraftPayload:estimateState.result.rawEstimate?.quoteDraftPayload };
    try{ setCreateState({loading:true,error:'',success:null}); const token=await getToken(); const res=await createQuote(payload,token); setCreateState({loading:false,error:'',success:{quoteId:res?.quote?._id||res?._id||res?.quoteId}});}catch(e){ setCreateState({loading:false,error:e?.message||'Quote creation error',success:null}); }
  };

  const summary = <div className="rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-sm p-4 shadow-lg"><h3 className="font-semibold text-neutral-900">Review before quote creation</h3><p className="text-sm text-neutral-600 mt-2">Route: {origin||'—'} → {destination||'—'}</p><p className="text-sm text-neutral-600">Transport: {transportLabel[transportType]||'—'}</p><p className="text-sm text-neutral-600">Cargo: {packageTypes.find((p)=>p._id===packageTypeId)?.name || 'Custom cargo'}</p><p className="text-sm text-neutral-600">Dimensions / volume: {length||'—'}×{width||'—'}×{height||'—'} cm · {calcVolume ? `${calcVolume.toFixed(3)} m³` : (volume ? `${volume} m³` : '—')}</p><p className="text-sm text-neutral-600">Offer: DiaExpress Standard</p><p className="text-sm font-semibold mt-2">Estimated price: {fmt(estimateState.result?.price, estimateState.result?.currency)}</p><p className="text-sm text-neutral-600 mt-2">Product/contact: {productDescription||'—'} · {contactName||'—'} · {contactPhone||'—'} · {contactEmail||'—'}</p></div>;

  return <FormProvider {...form}><div className="space-y-6 pb-32 md:pb-8"><div className="grid lg:grid-cols-[minmax(0,1.9fr)_minmax(340px,1fr)] gap-6"><div className="space-y-5 rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-800 p-5 md:p-6 text-white">
      <h2 className="text-xl font-semibold">1) Route</h2>{loadingMeta && <div className="animate-pulse motion-reduce:animate-none rounded-xl bg-white/10 p-3 text-sm text-yellow-200">Loading route metadata…</div>}{metaError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 text-sm">{metaError} <Link href="/contact" className="underline">Contact support</Link></div>}
      <div className="grid md:grid-cols-2 gap-3"><label className="sr-only" htmlFor="origin-select">Origin</label><select id="origin-select" aria-label="Origin" className="rounded-xl bg-white/95 text-black p-3 focus:outline-none focus:ring-2 focus:ring-yellow-300" value={origin} onChange={(e)=>setValue('origin',e.target.value,{shouldDirty:true})}><option value="">Origin</option>{origins.map((o)=><option key={o.origin} value={o.origin}>{o.origin}</option>)}</select><label className="sr-only" htmlFor="destination-select">Destination</label><select id="destination-select" aria-label="Destination" className="rounded-xl bg-white/95 text-black p-3 focus:outline-none focus:ring-2 focus:ring-yellow-300" value={destination} onChange={(e)=>setValue('destination',e.target.value,{shouldDirty:true})}><option value="">Destination</option>{destinationOptions.map((d)=><option key={d.destination} value={d.destination}>{d.destination}</option>)}</select></div>

      <h2 className="text-xl font-semibold pt-2">2) Transport and cargo</h2>
      <div className="grid md:grid-cols-3 gap-3" role="radiogroup" aria-label="Transport type">{['air','sea','road'].filter(t=>transportTypes.includes(t)).map((t)=><button key={t} aria-pressed={transportType===t} type="button" onClick={()=>setValue('transportType',t,{shouldDirty:true})} className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-300 motion-reduce:transition-none ${transportType===t?'border-yellow-300 bg-gradient-to-br from-yellow-200 to-amber-100 text-neutral-900 shadow-[0_0_0_1px_rgba(252,211,77,.8),0_12px_25px_rgba(0,0,0,.2)]':'border-white/30 bg-white/5 hover:bg-white/10'}`}><img src={transportMeta[t].asset} alt="" className="h-10 w-10 object-contain mb-2" /><p className="text-xs uppercase tracking-wide opacity-80">{transportLabel[t]}</p><p className="font-semibold">{transportMeta[t].title}</p><p className="text-xs mt-1 opacity-80">{transportMeta[t].hint}</p></button>)}</div>
      <div className="grid md:grid-cols-2 gap-3"><select aria-label="Package type" className="rounded-xl bg-white/95 text-black p-3 focus:outline-none focus:ring-2 focus:ring-yellow-300" value={packageTypeId} onChange={(e)=>setValue('packageTypeId',e.target.value,{shouldDirty:true})}><option value="">Package type</option>{packageTypes.map((p)=><option key={p._id} value={p._id}>{p.name}</option>)}</select><input aria-label="Weight in kilograms" className="rounded-xl bg-white/95 text-black p-3 focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="Weight (kg)" value={weight} onChange={(e)=>setValue('weight',e.target.value,{shouldDirty:true})} /></div>
      <div className="grid grid-cols-3 gap-2"><input aria-label="Length in centimeters" className="rounded-xl bg-white/95 text-black p-3" placeholder="L" value={length} onChange={(e)=>setValue('length',e.target.value,{shouldDirty:true})}/><input aria-label="Width in centimeters" className="rounded-xl bg-white/95 text-black p-3" placeholder="W" value={width} onChange={(e)=>setValue('width',e.target.value,{shouldDirty:true})}/><input aria-label="Height in centimeters" className="rounded-xl bg-white/95 text-black p-3" placeholder="H" value={height} onChange={(e)=>setValue('height',e.target.value,{shouldDirty:true})}/></div>

      <h2 className="text-xl font-semibold pt-2">3) Estimate first</h2>
      <div className="rounded-xl bg-white/10 p-3 text-sm min-h-11" aria-live="polite">{estimateState.status==='route_incomplete' && 'Complete route and transport to start estimate.'}{estimateState.status==='cargo_incomplete' && 'Add cargo details for pricing accuracy.'}{estimateState.status==='invalid_cargo' && 'Invalid cargo values. Use numeric inputs only.'}{estimateState.status==='estimate_loading' && <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-300 animate-ping motion-reduce:animate-none" />Calculating estimate…</span>}{estimateState.status==='estimate_success' && `Estimated price: ${fmt(estimateState.result?.price,estimateState.result?.currency)}`}{estimateState.status==='pricing_not_found' && 'Pricing not found for current inputs.'}{estimateState.status==='backend_unavailable' && 'Pricing engine temporarily unavailable.'}</div>
      {(estimateState.error || createState.error) && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 text-sm">{estimateState.error || createState.error}<div className="mt-2 flex flex-wrap gap-2"><button type="button" className="underline" onClick={()=>setValue('origin','',{shouldDirty:true})}>Modify route</button><button type="button" className="underline" onClick={()=>setValue('weight','',{shouldDirty:true})}>Modify cargo</button><button type="button" className="underline" onClick={()=>setValue('transportLineId',transportLineId,{shouldDirty:true})}>Retry estimate</button><Link href="/contact" className="underline">Contact support</Link>{!isSignedIn && <Link href={`/sign-in?returnUrl=${encodeURIComponent(router.asPath)}`} className="underline">Sign in</Link>}</div></div>}

      <h2 className="text-xl font-semibold pt-2">4) Final review and quote creation</h2>
      <p className="text-sm text-yellow-100">Estimation = indicative amount. Créer le devis = submit your request for operational validation and final confirmation.</p>
      <div className="grid md:grid-cols-2 gap-3"><input aria-label="Product description" value={productDescription} onChange={(e)=>setValue('productDescription',e.target.value,{shouldDirty:true})} className="rounded-xl bg-white/95 text-black p-3" placeholder="Product description" /><input aria-label="Contact name" value={contactName} onChange={(e)=>setValue('contactName',e.target.value,{shouldDirty:true})} className="rounded-xl bg-white/95 text-black p-3" placeholder="Contact name" /><input aria-label="Contact phone" value={contactPhone} onChange={(e)=>setValue('contactPhone',e.target.value,{shouldDirty:true})} className="rounded-xl bg-white/95 text-black p-3" placeholder="Contact phone" /><input aria-label="Contact email" value={contactEmail} onChange={(e)=>setValue('contactEmail',e.target.value,{shouldDirty:true})} className="rounded-xl bg-white/95 text-black p-3" placeholder="Contact email" /></div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 p-3 text-sm">Before creating the quote: verify route, cargo, and contact details. No payment is taken at this step.</div>
      <button type="button" disabled={!estimateState.result || createState.loading || isEstimateStale} onClick={handleSubmit(onSubmit)} className="w-full rounded-xl bg-yellow-300 text-black font-semibold px-4 py-3 transition hover:bg-yellow-200 disabled:opacity-60">{createState.loading?'Creating quote...':'Créer le devis'}</button>
    </div>
    <aside className="hidden lg:block lg:sticky lg:top-4 h-fit space-y-3">{summary}</aside></div>

    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-neutral-200 bg-white/95 backdrop-blur p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"><button type="button" aria-label="Toggle shipment summary" onClick={()=>setMobileSummaryOpen(v=>!v)} className="w-full rounded-xl bg-neutral-900 text-white p-3 shadow-xl">{mobileSummaryOpen?'Masquer le récapitulatif':'Voir le récapitulatif'} · {fmt(estimateState.result?.price, estimateState.result?.currency)}</button>{mobileSummaryOpen && <div className="mt-2 max-h-[48vh] overflow-auto">{summary}</div>}</div>
  </div></FormProvider>;
}

export default QuoteWizard;
