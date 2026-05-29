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
  const estimate = async()=> { setOpts(await api.estimateShipping({country, city, itemCount: cart.length})); setStep(2); };
  const ship = opts.find(o=>o.id===selected);
  const buildOrderPayload = (paymentMode: 'cod' | 'diapay') => ({
    customer: process.env.NEXT_PUBLIC_DIAMARKET_WEB_USER_ID ?? '000000000000000000000001',
    vendor: cart[0]?.product.vendor.id ?? '000000000000000000000001',
    country,
    city,
    phone,
    currency: 'FCFA',
    totalAmount: totalFcfa + (ship?.priceFcfa ?? 0),
    items: cart.map((item) => ({
      product: item.product.id.match(/^[a-f\d]{24}$/i) ? item.product.id : '000000000000000000000001',
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.priceFcfa,
      totalPrice: item.product.priceFcfa * item.quantity,
    })),
    shippingOptionId:selected,
    paymentMode,
  });
  const createCod = async()=> { const order=await api.createOrder(buildOrderPayload('cod')); setOrderId(order.id); setPaymentStatus(order.paymentStatus ?? 'unpaid'); setStep(3); };
  const payWithDiapay = async()=> {
    setError('');
    try {
      const order = orderId ? { id: orderId } : await api.createOrder(buildOrderPayload('diapay'));
      setOrderId(order.id);
      const session = await api.createDiapayCheckoutSession(order.id);
      setCheckoutUrl(session.checkoutUrl);
      setPaymentStatus(session.paymentStatus);
      window.location.assign(session.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de démarrer le paiement Diapay');
    }
  };
  return <div className='grid gap-6 md:grid-cols-2'><div className='space-y-4 rounded-2xl bg-white p-4 shadow-sm'>
    <p className='text-sm font-semibold'>Checkout premium · Étape {step}/3</p>
    {step===1 && <><input className='w-full rounded-xl border p-3' placeholder='Téléphone' value={phone} onChange={e=>setPhone(e.target.value)}/><input className='w-full rounded-xl border p-3' value={country} onChange={e=>setCountry(e.target.value)}/><input className='w-full rounded-xl border p-3' value={city} onChange={e=>setCity(e.target.value)}/><button onClick={estimate} className='rounded-full border px-4 py-2'>Estimer la livraison</button></>}
    {step>=2 && <><ShippingOptions options={opts} selected={selected} onSelect={setSelected}/><div className='flex flex-wrap gap-3'><button disabled={!selected || cart.length === 0} onClick={payWithDiapay} className='rounded-full bg-[#556B2F] px-5 py-2 text-white disabled:opacity-50'>Payer avec Diapay</button><button disabled={!selected || cart.length === 0} onClick={createCod} className='rounded-full border px-5 py-2 disabled:opacity-50'>Paiement à la livraison</button></div></>}
    {orderId && <div className='rounded-xl bg-emerald-50 p-3 text-emerald-700'>Commande créée {orderId} · <StatusBadge status={paymentStatus} /> <Link className='underline' href={`/orders/${orderId}/payment`}>Suivre le paiement</Link></div>}
    {checkoutUrl && <div className='rounded-xl bg-blue-50 p-3 text-blue-700'>Redirection vers Diapay... <a className='underline' href={checkoutUrl}>continuer manuellement</a></div>}
    {error && <div className='rounded-xl bg-red-50 p-3 text-red-700'>{error}</div>}
  </div><CheckoutSummary shipping={ship?.priceFcfa ?? 0}/></div>;
}
