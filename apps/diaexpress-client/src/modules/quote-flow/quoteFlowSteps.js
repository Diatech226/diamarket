export const QUOTE_FLOW_STEPS = [
  'start',
  'route',
  'transport',
  'cargo',
  'estimate',
  'details',
  'review',
  'success',
];

export const QUOTE_FLOW_STEP_PATHS = QUOTE_FLOW_STEPS.reduce((acc, step) => {
  acc[step] = `/quote-request/${step}`;
  return acc;
}, {});
