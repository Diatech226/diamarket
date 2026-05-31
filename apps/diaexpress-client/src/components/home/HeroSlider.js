import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HomePage.module.css';
import { ANALYTICS_EVENTS, trackEvent } from '../../lib/analytics/trackEvent';
import TrustStatsRow from './TrustStatsRow';

const SLIDES = [
  { src: '/images/home/hero-air.svg', alt: 'Avion cargo pour expédition internationale' },
  { src: '/images/home/hero-sea.svg', alt: 'Transport maritime de conteneurs' },
  { src: '/images/home/hero-road.svg', alt: 'Camion de livraison sur route' },
];

const INTERVAL_MS = 5600;
const HERO_KPI_ITEMS = ['⏱️ Réponse devis < 10 min', '🌍 Réseau multi-pays sécurisé', '🤝 Assistance 24/7'];

const HeroSlider = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof document === 'undefined') {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const goNext = React.useCallback(() => {
    setActiveIndex((current) => (current + 1) % SLIDES.length);
  }, []);

  const goPrev = React.useCallback(() => {
    setActiveIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  return (
    <section className={styles.hero} id="accueil">
      <div className={styles.heroTrack}>
        {SLIDES.map((slide, index) => (
          <figure
            className={`${styles.heroSlide} ${index === activeIndex ? styles.heroSlideActive : ''}`}
            key={slide.src}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </figure>
        ))}
      </div>

      <div className={styles.heroOverlay} />

      <button type="button" className={`${styles.heroControl} ${styles.heroControlPrev}`} onClick={goPrev} aria-label="Slide précédent">
        ‹
      </button>
      <button type="button" className={`${styles.heroControl} ${styles.heroControlNext}`} onClick={goNext} aria-label="Slide suivant">
        ›
      </button>

      <div className={styles.heroInner}>
        <div className={styles.heroPanel}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>DiaExpress Logistics</span>
            <h1 className={styles.heroTitle}>Expédiez vos colis partout dans le monde</h1>
            <p className={styles.heroSubtitle}>Un parcours premium, piloté pour la fiabilité opérationnelle de vos envois.</p>
            <div className={styles.heroActions}>
              <Link href="/quote-request" className={styles.btnPrimary} onClick={() => trackEvent(ANALYTICS_EVENTS.SEND_PACKAGE_CLICK, { location: 'home_hero' })}>Demander un devis</Link>
              <Link href="/track-shipment" className={styles.btnSecondary} onClick={() => trackEvent(ANALYTICS_EVENTS.TRACK_PACKAGE_CLICK, { location: 'home_hero' })}>Suivre un colis</Link>
            </div>
            <p className={styles.heroMeta}>Sans engagement · Estimation en 4 étapes · Support expert</p>
          </div>
          <TrustStatsRow items={HERO_KPI_ITEMS} compact />
        </div>
      </div>

      <div className={styles.heroDots} aria-label="Navigation des slides">
        {SLIDES.map((slide, index) => (
          <button
            type="button"
            key={slide.src}
            className={`${styles.heroDot} ${index === activeIndex ? styles.heroDotActive : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Aller au slide ${index + 1}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>
    </section>
  );
};

export default React.memo(HeroSlider);
