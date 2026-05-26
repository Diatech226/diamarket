'use client';
import { CategoryCard, HeroSlider, ProductCard } from '@/components/ui';
import { useStore } from '@/context/store';
import { Category, Product, Slide } from '@/lib/types';

export default function HomeClient({ slides, categories, products }: { slides: Slide[]; categories: Category[]; products: Product[] }) {
  const { addToCart } = useStore();
  return <div className='space-y-8'><HeroSlider slides={slides}/><section><h3 className='mb-3 text-xl font-bold'>Catégories populaires</h3><div className='grid gap-4 md:grid-cols-4'>{categories.map(c=><CategoryCard key={c.id} category={c}/>)}</div></section><section><h3 className='mb-3 text-xl font-bold'>Produits populaires</h3><div className='grid gap-4 md:grid-cols-4'>{products.slice(0,8).map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></section><section><h3 className='mb-3 text-xl font-bold'>En promotion</h3><div className='grid gap-4 md:grid-cols-4'>{products.filter(p=>p.isPromo).map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div></section><section className='rounded-xl bg-white p-6 shadow'><h3 className='text-xl font-bold'>Pourquoi Diamarket ?</h3><p>Qualité premium, livraison transparente, support multi-pays, paiement à la livraison.</p></section></div>;
}
