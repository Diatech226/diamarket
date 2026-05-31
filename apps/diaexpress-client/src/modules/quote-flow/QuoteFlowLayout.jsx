import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuoteFlow } from './QuoteFlowProvider';
import { getGuardRedirectPath } from './quoteFlowGuards';
import { QUOTE_FLOW_STEPS, QUOTE_FLOW_STEP_PATHS } from './quoteFlowSteps';

export const QuoteFlowLayout = ({ step, title, children }) => {
  const router = useRouter();
  const { draft, setStep, isHydrated } = useQuoteFlow();

  useEffect(() => {
    setStep(step);
  }, [setStep, step]);

  useEffect(() => {
    if (!router.isReady || !isHydrated) return;
    const redirectPath = getGuardRedirectPath(step, draft);
    if (!redirectPath) return;
    if (redirectPath === router.pathname || redirectPath === router.asPath) return;
    router.replace(redirectPath);
  }, [draft, isHydrated, router, step]);

  return (
    <main className="dx-premium-page dx-premium-quote">
      <section className="dx-section">
        <div className="dx-container">
          <div className="dx-page-hero-card dx-page-hero-card--quote">
            <span className="dx-kicker">demande de devis</span>
            <h1>{title}</h1>
            <div className="dx-chip-list" aria-label="Quote flow steps">
              {QUOTE_FLOW_STEPS.map((flowStep) => (
                <Link key={flowStep} href={QUOTE_FLOW_STEP_PATHS[flowStep]} className="dx-chip">{flowStep}</Link>
              ))}
            </div>
          </div>
          <div className="dx-card" style={{ marginTop: '1rem' }}>
            {children}
            <hr style={{ margin: '1rem 0' }} />
            <h3>Live summary</h3>
            <p>Route: {draft.route.origin || '—'} → {draft.route.destination || '—'}</p>
            <p>Transport: {draft.transport.transportType || '—'} / line: {draft.transport.transportLineId || '—'}</p>
            <p>Package: {draft.cargo.packageTypeId || '—'} | Weight: {draft.cargo.weight || '—'} kg</p>
            <p>Dimensions: {draft.cargo.length || '—'}×{draft.cargo.width || '—'}×{draft.cargo.height || '—'} cm</p>
            <p>Volume: {draft.cargo.volume || '—'} m³</p>
            <p>Estimate: {draft.estimate.status} {draft.estimate.estimatedPrice != null ? `| ${draft.estimate.estimatedPrice} ${draft.estimate.currency || ''}` : ''}</p>
            <p>Offer: {draft.selectedOffer.provider || '—'} {draft.selectedOffer.serviceLevel || ''}</p>
            {Array.isArray(draft.estimate.warnings) && draft.estimate.warnings.length > 0 ? <p>Warnings: {draft.estimate.warnings.join(' · ')}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
};
