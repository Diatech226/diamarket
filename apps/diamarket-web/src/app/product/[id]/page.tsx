'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/store';
import { ProductCard } from '@/components/ui';

export default function ProductDetailPage() {
  const params = useParams<{id: string}>();
  const [product, setProduct] = useState<Product|null>(null);
  const [sim, setSim] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [variant, setVariant] = useState('Standard');
  const { addToCart } = useStore();
  useEffect(()=>{ api.getProduct(params.id).then(setProduct).catch(()=>setProduct(null)); api.getProducts().then(ps=>setSim(ps.slice(0,4))).catch(()=>setSim([])); },[params.id]);
  if (!product) return <div className='animate-pulse rounded-2xl bg-white p-8'>Chargement produit...</div>;
  const lowStock = product.stock < 5;
  return <div className='space-y-8'>
    <div className='grid gap-6 md:grid-cols-2'>
      <div><img src={product.images[selectedImage] || '/placeholder.svg'} className='h-80 w-full rounded-2xl object-cover md:h-[440px]'/><div className='mt-3 flex gap-2'>{product.images.slice(0,4).map((img, i)=><button key={img+i} onClick={()=>setSelectedImage(i)} className={`overflow-hidden rounded-lg border ${selectedImage===i?'border-black':''}`}><img src={img} className='h-16 w-16 object-cover'/></button>)}</div></div>
      <div><h1 className='text-2xl font-bold'>{product.name}</h1><div className='mt-2 flex gap-2 text-xs'><span className='rounded-full bg-emerald-100 px-2 py-1 text-emerald-700'>Vendeur vérifié</span>{product.isPromo && <span className='rounded-full bg-rose-100 px-2 py-1 text-rose-700'>Promotion</span>}<span className={`rounded-full px-2 py-1 ${lowStock?'bg-amber-100 text-amber-700':'bg-slate-100'}`}>{lowStock?'Stock faible':'En stock'}</span></div><p className='mt-4 text-lg font-semibold'>{product.priceFcfa} FCFA / {(product.priceFcfa/600).toFixed(2)} USD</p><p className='mt-3 text-slate-700'>{product.description}</p><div className='mt-4'><p className='mb-1 text-sm font-medium'>Variante</p><div className='flex gap-2'>{['Standard','Premium','Gift'].map(v=><button key={v} onClick={()=>setVariant(v)} className={`rounded-full border px-3 py-1 text-sm ${variant===v?'border-black bg-slate-100':''}`}>{v}</button>)}</div></div><p className='mt-3 text-sm text-slate-600'>Livraison estimée: 2-5 jours selon pays.</p><p className='text-sm text-slate-600'>Poids: {product.weightKg}kg | Dimensions: {product.dimensions}</p><button disabled={product.stock <= 0} onClick={()=>addToCart(product)} className='mt-5 rounded-full bg-black px-5 py-2 text-white'>Ajouter au panier</button></div>
    </div>
    <div className='rounded-2xl bg-white p-5 ring-1 ring-slate-100'><h3 className='mb-3 text-xl font-bold'>Avis clients (bientôt)</h3><p className='text-sm text-slate-600'>Module futur-ready: notes, photos clients, filtrage des avis.</p></div>
    <div><h3 className='mb-3 text-xl font-bold'>Produits similaires</h3><div className='grid gap-4 grid-cols-2 md:grid-cols-4'>{sim.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></div>
  </div>;
}
