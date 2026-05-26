'use client';
import Link from 'next/link';
import { useStore } from '@/context/store';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, totalFcfa } = useStore();
  if (!cart.length) return <p>Panier vide.</p>;
  return <div className='space-y-4'>{cart.map(i=><div key={i.product.id} className='flex items-center justify-between rounded bg-white p-3 shadow'><div>{i.product.name}</div><input type='number' value={i.quantity} min={1} className='w-20 rounded border px-2' onChange={e=>updateQty(i.product.id, Number(e.target.value))}/><button onClick={()=>removeFromCart(i.product.id)} className='text-red-600'>Supprimer</button></div>)}<p className='text-xl font-bold'>Total: {totalFcfa} FCFA</p><p className='text-sm text-slate-500'>Estimation livraison au checkout.</p><Link href='/checkout' className='inline-block rounded bg-black px-4 py-2 text-white'>Passer au checkout</Link></div>;
}
