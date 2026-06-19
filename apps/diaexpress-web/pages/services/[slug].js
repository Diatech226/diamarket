import Link from 'next/link';
import SeoHead from '../../src/components/seo/SeoHead';
import { servicePages } from '../../src/content/public/marketingPages';

export default function ServiceLanding({ page }) {
  return <main className="dx-public-page"><SeoHead title={`${page.title} | DiaExpress`} description={`${page.title}: avantages, délais, FAQ et devis rapide DiaExpress.`} path={`/services/${page.slug}`} /><section className="dx-hero"><p className="dx-eyebrow">Service premium</p><h1>{page.title}</h1><p>Une solution {page.transport.toLowerCase()} fiable pour vos expéditions commerciales et personnelles.</p><div className="dx-actions"><Link href="/quote-request" className="dx-btn dx-btn-primary">Demander un devis</Link><Link href="/contact" className="dx-btn dx-btn-secondary">Contacter un conseiller</Link></div></section><section className="dx-grid"><article className="dx-card"><h2>Avantages</h2><ul>{page.benefits.map((b) => <li key={b}>{b}</li>)}</ul></article><article className="dx-card"><h2>Délais</h2><p>{page.delay}</p><p>Les délais finaux sont confirmés après analyse du colis, de la route et des formalités.</p></article><article className="dx-card"><h2>FAQ</h2>{page.faq.map((q) => <details key={q}><summary>{q}</summary><p>Un conseiller DiaExpress confirme les conditions selon votre origine, destination et marchandise.</p></details>)}</article></section></main>;
}
export function getStaticPaths(){return {paths:Object.keys(servicePages).map((slug)=>({params:{slug}})),fallback:false};}
export function getStaticProps({params}){return {props:{page:{...servicePages[params.slug],slug:params.slug}}};}
