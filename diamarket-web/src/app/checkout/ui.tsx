'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { CheckoutSummary, ShippingOptions } from '@/components/ui';
import { useStore } from '@/context/store';
import { ShippingOption } from '@/lib/types';

export default function CheckoutClient(){
  const { cart } = useStore(); const [country,setCountry]=useState('Cameroun'); const [city,setCity]=useState('Douala'); const [phone,setPhone]=useState(''); const [opts,setOpts]=useState<ShippingOption[]>([]); const [selected,setSelected]=useState<string>(); const [orderId,setOrderId]=useState('');
  const estimate = async()=> setOpts(await api.estimateShipping({country, city, itemCount: cart.length}));
  const ship = opts.find(o=>o.id===selected);
  const create = async()=> { const r=await api.createOrder({country,city,phone,items:cart,shippingOptionId:selected,paymentMode:'cod'}); setOrderId(r.id); };
  return <div className='grid gap-6 md:grid-cols-2'><div className='space-y-2'><input className='w-full rounded border p-2' placeholder='Téléphone' value={phone} onChange={e=>setPhone(e.target.value)}/><input className='w-full rounded border p-2' value={country} onChange={e=>setCountry(e.target.value)}/><input className='w-full rounded border p-2' value={city} onChange={e=>setCity(e.target.value)}/><button onClick={estimate} className='rounded border px-3 py-2'>Estimer livraison</button><ShippingOptions options={opts} selected={selected} onSelect={setSelected}/><button onClick={create} className='rounded bg-black px-4 py-2 text-white'>Créer la commande</button>{orderId && <p>Commande créée: {orderId}</p>}</div><CheckoutSummary shipping={ship?.priceFcfa ?? 0}/></div>;
}
