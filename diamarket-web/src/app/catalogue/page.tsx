'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/ui';
import { useStore } from '@/context/store';

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]); const [q, setQ] = useState(''); const [sort, setSort] = useState('pop'); const [loading, setLoading]=useState(true);
  const { addToCart } = useStore();
  useEffect(()=>{ api.getProducts().then(setProducts).finally(()=>setLoading(false)); },[]);
  const filtered = useMemo(()=> products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=> sort==='price'?a.priceFcfa-b.priceFcfa:sort==='new'?Date.parse(b.createdAt)-Date.parse(a.createdAt):b.popularity-a.popularity), [products,q,sort]);
  if (loading) return <p>Chargement...</p>; if (!filtered.length) return <p>Aucun produit.</p>;
  return <div><div className='mb-4 flex flex-wrap gap-2'><input className='rounded border px-3 py-2' placeholder='Recherche' value={q} onChange={e=>setQ(e.target.value)}/><select className='rounded border px-3 py-2' value={sort} onChange={e=>setSort(e.target.value)}><option value='pop'>Popularité</option><option value='price'>Prix</option><option value='new'>Nouveautés</option></select></div><div className='grid gap-4 md:grid-cols-4'>{filtered.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></div>;
}
