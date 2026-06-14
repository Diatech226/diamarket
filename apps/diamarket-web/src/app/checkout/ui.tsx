'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckoutSummary, ShippingOptions, StatusBadge } from '@/components/ui';
import { useStore } from '@/context/store';
import { ShippingOption } from '@/lib/types';

export default function CheckoutClient(){
  const { cart, totalFcfa } = useStore();
  const [step, setStep] = useState(1);
  const [country,setCountry]=useState('Cameroun'); const [city,setCity]=useState('Douala'); const [phone,setPhone]=useState('');
  const [opts,setOpts]=useState<ShippingOption[]>([]); const [selected,setSelected]=useState<string>(); const [orderId,setOrderId]=useState('');
  const [paymentStatus,setPaymentStatus]=useState('unpaid'); const [checkoutUrl,setCheckoutUrl]=useState(''); const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const estimate = async()=> { setBusy(true);setError('');try{setOpts(await api.estimateShipping({country, city, itemCount: cart.length}));setStep(2);}catch(err){setError(err instanceof Error?err.message:'Impossible d’estimer la livraison');}finally{setBusy(false);} };
  const ship = opts.find(o=>o.id===selected);
  const buildOrderPayload = (paymentMethod: 'cash_on_delivery' | 'diapay') => ({
    items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    address: { country, city, phone },
    shippingOptionId: selected,
    paymentMethod,
  });
  const createCod = async()=> { setBusy(true);setError('');try{const order=await api.createOrder(buildOrderPayload('cash_on_delivery')); setOrderId(order.id); setPaymentStatus(order.paymentStatus ?? 'unpaid'); setStep(3);}catch(err){setError(err instanceof Error?err.message:'Impossible de créer la commande');}finally{setBusy(false);} };
  const payWithDiapay = async()=> {
    setError('');
    setBusy(true); try {
      const order = orderId ? { id: orderId } : await api.createOrder(buildOrderPayload('diapay'));
      setOrderId(order.id);
      const session = await api.createDiapayCheckoutSession(order.id);
      setCheckoutUrl(session.checkoutUrl);
      setPaymentStatus('pending');
      window.location.assign(session.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de démarrer le paiement Diapay');
    } finally { setBusy(false); }
  };
  return <div><div className='mb-6'><p className='text-sm font-semibold text-emerald-800'>Paiement sécurisé</p><h1 className='text-3xl font-bold'>Finaliser votre commande</h1></div><div className='grid gap-6 lg:grid-cols-[1fr_380px]'><div className='surface space-y-5 p-4 sm:p-6'>
    <div><p className='text-sm font-semibold'>Étape {step} sur 3</p><div className='mt-2 h-2 overflow-hidden rounded-full bg-slate-100'><div className='h-full bg-emerald-700 transition-all' style={{width:`${step/3*100}%`}}/></div></div>
    {step===1 && <fieldset className='space-y-4'><legend className='text-lg font-bold'>Adresse de livraison</legend><label className='block'><span className='mb-1 block text-sm font-medium'>Téléphone</span><input className='field' type='tel' autoComplete='tel' required value={phone} onChange={e=>setPhone(e.target.value)}/></label><label className='block'><span className='mb-1 block text-sm font-medium'>Pays</span><input className='field' autoComplete='country-name' value={country} onChange={e=>setCountry(e.target.value)}/></label><label className='block'><span className='mb-1 block text-sm font-medium'>Ville</span><input className='field' autoComplete='address-level2' value={city} onChange={e=>setCity(e.target.value)}/></label><button disabled={busy||!phone.trim()} onClick={estimate} className='btn-primary w-full sm:w-auto'>{busy?'Estimation en cours…':'Continuer vers la livraison'}</button></fieldset>}
    {step>=2 && <><h2 className='text-lg font-bold'>Mode de livraison</h2>{opts.length?<ShippingOptions options={opts} selected={selected} onSelect={setSelected}/>:<p className='rounded-xl bg-amber-50 p-3 text-sm text-amber-900'>Aucune option disponible. Contactez le support pour être accompagné.</p>}<div className='grid gap-3 sm:grid-cols-2'><button disabled={busy||!selected || cart.length === 0} onClick={payWithDiapay} className='btn-primary'>{busy?'Traitement…':'Payer avec Diapay'}</button><button disabled={busy||!selected || cart.length === 0} onClick={createCod} className='btn-secondary'>Paiement à la livraison</button></div></>}
    {orderId && <div className='rounded-xl bg-emerald-50 p-3 text-emerald-700'>Commande créée {orderId} · <StatusBadge status={paymentStatus} /> <Link className='underline' href={`/orders/${orderId}/payment`}>Suivre le paiement</Link></div>}
    {checkoutUrl && <div className='rounded-xl bg-blue-50 p-3 text-blue-700'>Redirection vers Diapay... <a className='underline' href={checkoutUrl}>continuer manuellement</a></div>}
    {error && <div role='alert' className='rounded-xl bg-red-50 p-3 text-red-700'>{error}</div>}
    <p className='border-t pt-4 text-sm text-slate-500'>Un problème ? Notre support peut vous accompagner avant de confirmer votre commande.</p>
  </div><CheckoutSummary shipping={ship?.priceFcfa ?? 0}/></div></div>;
}
