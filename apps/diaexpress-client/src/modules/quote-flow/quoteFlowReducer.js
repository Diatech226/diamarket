export const QUOTE_FLOW_DRAFT_VERSION = 1;

export const createInitialQuoteFlowDraft = () => ({
  version: QUOTE_FLOW_DRAFT_VERSION,
  step: 'start',
  route: {
    origin: '',
    destination: '',
    originMarketPointId: '',
    destinationMarketPointId: '',
  },
  transport: {
    transportType: '',
    transportLineId: '',
  },
  cargo: {
    packageTypeId: '',
    weight: '',
    volume: '',
    length: '',
    width: '',
    height: '',
  },
  estimate: {
    status: 'idle',
    estimateId: '',
    estimatedPrice: null,
    totalPrice: null,
    currency: '',
    provider: '',
    appliedRule: '',
    breakdown: null,
    warnings: [],
    explanation: '',
    quoteDraftPayload: null,
    signature: '',
    computedAt: null,
    error: null,
  },
  details: {
    productDescription: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    productLocation: '',
    pickupOption: '',
    productType: '',
    notes: '',
  },
  selectedOffer: {
    provider: '',
    serviceLevel: '',
    price: null,
    currency: '',
  },
  submission: {
    status: 'idle',
    quoteId: null,
    error: null,
  },
});

export const quoteFlowReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEP':
      if (state.step === action.payload) return state;
      return { ...state, step: action.payload };
    case 'PATCH_DRAFT': {
      if (!action.payload || typeof action.payload !== 'object') return state;
      const nextState = { ...state, ...action.payload };
      const hasChanged = Object.keys(action.payload).some((key) => state[key] !== nextState[key]);
      return hasChanged ? nextState : state;
    }
    case 'RESET_DRAFT':
      return createInitialQuoteFlowDraft();
    default:
      return state;
  }
};
