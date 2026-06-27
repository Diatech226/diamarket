import CataloguePage from '@/app/catalogue/page';
export default function CategorySlugPage({ params }: { params: { slug: string } }) { return <div><p className="mb-4 text-sm font-semibold text-emerald-800">Catégorie / {params.slug}</p><CataloguePage /></div>; }
