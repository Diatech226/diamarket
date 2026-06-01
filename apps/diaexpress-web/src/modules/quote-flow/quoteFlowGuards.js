import { QUOTE_FLOW_STEP_PATHS } from './quoteFlowSteps';
import { hasSuccessfulEstimate, hasValidCargo, hasValidRoute, hasValidTransport } from './quoteFlowSelectors';

export const getFirstInvalidStep = (draft) => {
  if (!hasValidRoute(draft)) return 'route';
  if (!hasValidTransport(draft)) return 'transport';
  if (!hasValidCargo(draft)) return 'cargo';
  if (!hasSuccessfulEstimate(draft)) return 'estimate';
  return null;
};

export const getGuardRedirectPath = (step, draft) => {
  if (step === 'start' || step === 'success') return null;
  const firstInvalidStep = getFirstInvalidStep(draft);

  if (!firstInvalidStep) return null;

  const restrictedSteps = {
    transport: ['route'],
    cargo: ['route', 'transport'],
    estimate: ['route', 'transport', 'cargo'],
    details: ['route', 'transport', 'cargo', 'estimate'],
    review: ['route', 'transport', 'cargo', 'estimate'],
  };

  if (restrictedSteps[step]?.includes(firstInvalidStep)) {
    return QUOTE_FLOW_STEP_PATHS[firstInvalidStep];
  }

  return null;
};
