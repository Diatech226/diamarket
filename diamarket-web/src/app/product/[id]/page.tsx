'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/store';
import { ProductCard } from '@/components/ui';

export default function ProductDetailPage() {
  const params = useParams<{id: string}>(); const [product, setProduct] = useState<Product|null>(null); const [sim, setSim] = useState<Product[]>([]); const { addToCart } = useStore();
  useEffect(()=>{ api.getProduct(params.id).then(setProduct); api.getProducts().then(ps=>setSim(ps.slice(0,4))); },[params.id]);
  if (!product) return <p>Chargement...</p>;
  return <div className='grid gap-6 md:grid-cols-2'><img src={product.images[0]} className='w-full rounded-xl'/><div><h1 className='text-2xl font-bold'>{product.name}</h1><p className='text-lg'>{product.priceFcfa} FCFA / {(product.priceFcfa/600).toFixed(2)} USD</p><p>{product.description}</p><p>Stock: {product.stock}</p><p>Vendeur: {product.vendor.name}</p><p>Poids: {product.weightKg}kg | Dimensions: {product.dimensions}</p><button onClick={()=>addToCart(product)} className='mt-4 rounded bg-black px-4 py-2 text-white'>Ajouter au panier</button></div><div className='md:col-span-2'><h3 className='mb-3 text-xl font-bold'>Produits similaires</h3><div className='grid gap-4 md:grid-cols-4'>{sim.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></div></div>;
}
