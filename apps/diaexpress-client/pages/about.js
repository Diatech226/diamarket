import React from 'react';
import SeoHead from '../src/components/seo/SeoHead';
import { aboutContent, aboutSeo } from '../src/content/public/aboutContent';
import {
  PremiumCta,
  PublicBackgroundVisual,
  PublicPageHero,
  PublicSection,
  PublicTrustBanner,
  ValueCard,
  styles,
  useRevealOnScroll,
} from '../src/components/marketing/PublicPageSections';

const AboutPage = () => {
  useRevealOnScroll();
  return (
    <PublicBackgroundVisual>
      <SeoHead {...aboutSeo} />
      <PublicPageHero eyebrow="DiaExpress" title="À propos de DiaExpress" subtitle={aboutContent.heroSubtitle} pills={aboutContent.heroPills} visual={<div className={styles.heroVisual} aria-hidden><span>⚙️</span><span>🚚</span><span>📦</span><span>📍</span></div>} />

      <PublicSection title="Mission" description="Notre raison d’être opérationnelle."><article className={styles.card}><p>{aboutContent.mission}</p></article></PublicSection>
      <PublicSection title="Vision" description="Le cap que nous construisons avec nos clients."><article className={styles.card}><p>{aboutContent.vision}</p></article></PublicSection>
      <PublicSection title="Nos valeurs" description="Les standards qui guident notre exécution."><div className={styles.grid}>{aboutContent.values.map((value) => <ValueCard key={value.title} value={value} />)}</div></PublicSection>
      <PublicSection title="Notre promesse client" description="Un engagement concret, sans surpromesse."><article className={styles.card}><p>{aboutContent.promise}</p></article></PublicSection>
      <PublicSection title="Section confiance" description="Des repères qualitatifs plutôt que des chiffres non vérifiés."><div className={styles.grid}>{aboutContent.qualitativeTrust.map((item) => <article key={item.title} className={styles.card}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></PublicSection>
      <PublicSection title="Pourquoi DiaExpress" description="Ce que nos clients recherchent pour leurs flux critiques."><PublicTrustBanner items={aboutContent.trustHighlights} /></PublicSection>

      <PremiumCta title="Parlons de votre organisation logistique" text="Nos équipes vous accompagnent pour cadrer une solution adaptée à vos enjeux opérationnels." />
    </PublicBackgroundVisual>
  );
};

export default AboutPage;
