import { api } from '@/lib/api';
import HomeClient from './pageClient';

export default async function HomePage() {
  const [slides, categories, products] = await Promise.all([api.getSlides(), api.getCategories(), api.getProducts()]);
  return <HomeClient slides={slides} categories={categories} products={products} />;
}
