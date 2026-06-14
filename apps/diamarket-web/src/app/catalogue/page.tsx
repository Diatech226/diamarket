'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { EmptyState, ErrorState, LoadingGrid, ProductCard } from '@/components/ui';
import { useStore } from '@/context/store';

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]); const [q, setQ] = useState(''); const [sort, setSort] = useState('pop'); const [loading, setLoading]=useState(true); const [error,setError]=useState('');
  const { addToCart } = useStore();
  const load=()=>{setLoading(true);setError('');api.getProducts().then(setProducts).catch(e=>setError(e instanceof Error?e.message:'Catalogue indisponible')).finally(()=>setLoading(false));}; useEffect(load,[]);
  const filtered = useMemo(()=> products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=> sort==='price'?a.priceFcfa-b.priceFcfa:sort==='new'?Date.parse(b.createdAt)-Date.parse(a.createdAt):b.popularity-a.popularity), [products,q,sort]);
  return <div><div className='mb-6'><p className='text-sm font-semibold text-emerald-800'>Catalogue</p><h1 className='text-3xl font-bold tracking-tight'>Trouvez le produit qui vous convient</h1><p className='mt-2 text-slate-600'>Des produits sélectionnés auprès de vendeurs de confiance.</p></div><div className='surface mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_220px]'><label><span className='mb-1 block text-sm font-medium'>Rechercher</span><input className='field' placeholder='Produit, marque ou catégorie' value={q} onChange={e=>setQ(e.target.value)}/></label><label><span className='mb-1 block text-sm font-medium'>Trier par</span><select className='field' value={sort} onChange={e=>setSort(e.target.value)}><option value='pop'>Popularité</option><option value='price'>Prix croissant</option><option value='new'>Nouveautés</option></select></label></div>{loading?<LoadingGrid/>:error?<ErrorState message={error} onRetry={load}/>:!filtered.length?<EmptyState title='Aucun produit trouvé' description='Modifiez votre recherche ou découvrez l’ensemble du catalogue.'/ >:<><p className='mb-3 text-sm text-slate-500'>{filtered.length} produit{filtered.length>1?'s':''}</p><div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>{filtered.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></>}</div>;
}
