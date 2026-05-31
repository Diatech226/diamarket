import { QUOTE_FLOW_DRAFT_VERSION, createInitialQuoteFlowDraft } from './quoteFlowReducer';

export const QUOTE_FLOW_STORAGE_KEY = 'diaexpress_quote_flow_draft_v1';

export const loadQuoteFlowDraft = () => {
  if (typeof window === 'undefined') return createInitialQuoteFlowDraft();

  try {
    const raw = window.localStorage.getItem(QUOTE_FLOW_STORAGE_KEY);
    if (!raw) return createInitialQuoteFlowDraft();

    const parsed = JSON.parse(raw);
    if (parsed?.version !== QUOTE_FLOW_DRAFT_VERSION) return createInitialQuoteFlowDraft();

    return {
      ...createInitialQuoteFlowDraft(),
      ...parsed,
    };
  } catch (error) {
    console.error('Unable to load quote flow draft', error);
    return createInitialQuoteFlowDraft();
  }
};

export const saveQuoteFlowDraft = (draft) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(QUOTE_FLOW_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Unable to save quote flow draft', error);
  }
};

export const clearQuoteFlowDraft = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(QUOTE_FLOW_STORAGE_KEY);
};
