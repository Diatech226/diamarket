import Head from 'next/head';

const DEFAULT_SITE_NAME = 'DiaExpress';
const DEFAULT_DESCRIPTION = 'DiaExpress propose des services logistiques premium avec devis rapide, suivi colis en temps réel et support 24/7.';
const DEFAULT_TITLE = 'DiaExpress | Logistique premium internationale';

const normalizeUrl = (value = '') => value.replace(/\/$/, '');

const getBaseUrl = () => {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.diaexpress.com';
  return normalizeUrl(candidate);
};

export const buildCanonicalUrl = (path = '/') => {
  const base = getBaseUrl();
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${safePath === '/' ? '' : safePath}`;
};

const SeoHead = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = '/images/hero-illustration.svg',
  imageAlt = 'Illustration des services logistiques DiaExpress',
  noIndex = false,
  type = 'website',
}) => {
  const canonicalUrl = buildCanonicalUrl(path);
  const imageUrl = image.startsWith('http') ? image : `${getBaseUrl()}${image}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={DEFAULT_SITE_NAME} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={imageAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@diaexpress" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
};

export default SeoHead;
