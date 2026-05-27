'use client';
import Link from 'next/link';
import { useStore } from '@/context/store';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, totalFcfa } = useStore();
  if (!cart.length) return <div className='rounded-2xl bg-white p-8 text-center shadow-sm'><p className='font-semibold'>Panier vide</p><p className='mt-2 text-sm text-slate-500'>Ajoutez des produits tendances pour commencer.</p><Link href='/catalogue' className='mt-4 inline-block rounded-full bg-black px-4 py-2 text-white'>Explorer</Link></div>;
  return <div className='grid gap-6 md:grid-cols-[1fr_320px]'><div className='space-y-4'>{cart.map(i=><div key={i.product.id} className='flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm'><div><p className='font-medium'>{i.product.name}</p><p className='text-xs text-slate-500'>{i.product.priceFcfa} FCFA</p></div><input type='number' value={i.quantity} min={1} className='w-20 rounded-lg border px-2 py-1' onChange={e=>updateQty(i.product.id, Number(e.target.value))}/><button onClick={()=>removeFromCart(i.product.id)} className='text-sm text-red-600'>Supprimer</button></div>)}</div><div className='rounded-2xl bg-white p-4 shadow-sm'><p className='font-semibold'>Résumé dynamique</p><p className='mt-2'>Total: {totalFcfa} FCFA</p><p className='text-sm text-slate-500'>Livraison estimée en live au checkout.</p><Link href='/checkout' className='mt-4 inline-block rounded-full bg-black px-4 py-2 text-white'>Checkout premium</Link></div></div>;
}
