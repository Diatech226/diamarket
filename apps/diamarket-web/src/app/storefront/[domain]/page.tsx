import { getPublicStorefront } from '@/lib/api';
export default async function StorefrontDomainPage({ params }: { params: { domain: string } }) {
  const storefront = await getPublicStorefront(params.domain);
  const config = storefront.config ?? {};
  const blocks = storefront.homePage?.blocks ?? [];
  return <main className="min-h-screen bg-[#faf8f3] text-zinc-950"><section className="mx-auto max-w-6xl px-6 py-12"><div className="rounded-[2rem] bg-white p-8 shadow-sm"><p className="text-sm uppercase tracking-[0.35em] text-amber-700">{storefront.domain}</p><h1 className="mt-4 text-4xl font-semibold">{config.shopName ?? storefront.vendor?.shopName ?? 'Boutique'}</h1><p className="mt-3 max-w-2xl text-zinc-600">{config.slogan ?? 'Storefront dynamique White-Label Diamarket.'}</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{blocks.map((block: any) => <article key={block.id} className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-xs uppercase text-zinc-500">{block.type}</p><h2 className="mt-2 font-semibold">{block.title ?? block.id}</h2></article>)}</div></section></main>;
}
