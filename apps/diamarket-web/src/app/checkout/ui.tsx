'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { CheckoutSummary, ShippingOptions } from '@/components/ui';
import { useStore } from '@/context/store';
import { ShippingOption } from '@/lib/types';

export default function CheckoutClient(){
  const { cart } = useStore();
  const [step, setStep] = useState(1);
  const [country,setCountry]=useState('Cameroun'); const [city,setCity]=useState('Douala'); const [phone,setPhone]=useState('');
  const [opts,setOpts]=useState<ShippingOption[]>([]); const [selected,setSelected]=useState<string>(); const [orderId,setOrderId]=useState('');
  const estimate = async()=> { setOpts(await api.estimateShipping({country, city, itemCount: cart.length})); setStep(2); };
  const ship = opts.find(o=>o.id===selected);
  const create = async()=> { const r=await api.createOrder({country,city,phone,items:cart,shippingOptionId:selected,paymentMode:'cod'}); setOrderId(r.id); setStep(3); };
  return <div className='grid gap-6 md:grid-cols-2'><div className='space-y-4 rounded-2xl bg-white p-4 shadow-sm'>
    <p className='text-sm font-semibold'>Checkout premium · Étape {step}/3</p>
    {step===1 && <><input className='w-full rounded-xl border p-3' placeholder='Téléphone' value={phone} onChange={e=>setPhone(e.target.value)}/><input className='w-full rounded-xl border p-3' value={country} onChange={e=>setCountry(e.target.value)}/><input className='w-full rounded-xl border p-3' value={city} onChange={e=>setCity(e.target.value)}/><button onClick={estimate} className='rounded-full border px-4 py-2'>Estimer la livraison</button></>}
    {step>=2 && <><ShippingOptions options={opts} selected={selected} onSelect={setSelected}/><button onClick={create} className='rounded-full bg-black px-5 py-2 text-white'>Paiement fluide (COD)</button></>}
    {orderId && <div className='rounded-xl bg-emerald-50 p-3 text-emerald-700'>Succès: commande créée {orderId}</div>}
  </div><CheckoutSummary shipping={ship?.priceFcfa ?? 0}/></div>;
}
