'use client';
import Link from 'next/link';
import { CategoryCard, HeroSlider, ProductCard, SearchBar } from '@/components/ui';
import { useStore } from '@/context/store';
import { Category, Product, Slide } from '@/lib/types';

export default function HomeClient({ slides, categories, products }: { slides: Slide[]; categories: Category[]; products: Product[] }) {
  const { addToCart } = useStore();
  const sponsored = products.slice(0, 4);
  return <div className='space-y-8 md:space-y-10'>
    <HeroSlider slides={slides}/>
    <SearchBar products={products} />
    <section>
      <div className='mb-3 flex items-center justify-between'><h3 className='text-xl font-bold'>Catégories visuelles</h3><Link href='/catalogue' className='text-sm text-emerald-700'>Tout voir</Link></div>
      <div className='grid gap-4 grid-cols-2 md:grid-cols-4'>{categories.map(c=><CategoryCard key={c.id} category={c}/>)}</div>
    </section>
    <section><h3 className='mb-3 text-xl font-bold'>Produits tendances</h3><div className='grid gap-4 grid-cols-2 md:grid-cols-4'>{products.slice(0,8).map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></section>
    <section><h3 className='mb-3 text-xl font-bold'>Produits sponsorisés</h3><div className='grid gap-4 grid-cols-2 md:grid-cols-4'>{sponsored.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></section>
    <section><h3 className='mb-3 text-xl font-bold'>Promotions du moment</h3><div className='grid gap-4 grid-cols-2 md:grid-cols-4'>{products.filter(p=>p.isPromo).map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></section>
    <section className='grid gap-4 md:grid-cols-3'>
      {['Vendeurs vérifiés', 'Livraison internationale', 'Paiements sécurisés'].map(item => <div key={item} className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'><h4 className='font-semibold'>{item}</h4><p className='text-sm text-slate-600'>Une expérience premium, rapide et fiable pour une clientèle internationale.</p></div>)}
    </section>
    <section className='grid gap-4 md:grid-cols-2'>
      <Link href='/vendor-apply' className='rounded-2xl bg-slate-900 p-6 text-white'><h3 className='text-xl font-bold'>Devenir vendeur premium</h3><p className='mt-2 text-slate-200'>Rejoignez une marketplace panafricaine de confiance.</p></Link>
      <Link href='/checkout' className='rounded-2xl bg-emerald-900 p-6 text-white'><h3 className='text-xl font-bold'>Livraison internationale</h3><p className='mt-2 text-emerald-100'>Estimation rapide multi-pays et suivi transparent.</p></Link>
    </section>
  </div>;
}
