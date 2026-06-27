import { getPublicStorefront } from '@/lib/api';
import { PublicStorefrontRenderer } from '@/components/storefront';
export default async function StorefrontDomainPage({ params }: { params: { domain: string } }) {
  try { const storefront = await getPublicStorefront(params.domain); return <PublicStorefrontRenderer storefront={storefront} />; }
  catch { return <PublicStorefrontRenderer storefront={null} />; }
}
