import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createInitialQuoteFlowDraft, quoteFlowReducer } from './quoteFlowReducer';
import { loadQuoteFlowDraft, saveQuoteFlowDraft } from './quoteFlowStorage';

const QuoteFlowContext = createContext(null);

export const QuoteFlowProvider = ({ children }) => {
  const [draft, dispatch] = useReducer(quoteFlowReducer, undefined, createInitialQuoteFlowDraft);
  const hasHydratedRef = useRef(false);
  const lastPersistedRef = useRef('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const storedDraft = loadQuoteFlowDraft();
    if (storedDraft && typeof storedDraft === 'object') {
      dispatch({ type: 'PATCH_DRAFT', payload: storedDraft });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      const serialized = JSON.stringify(draft);
      if (serialized === lastPersistedRef.current) return;
      saveQuoteFlowDraft(draft);
      lastPersistedRef.current = serialized;
    } catch (error) {
      console.error('Unable to serialize quote flow draft', error);
    }
  }, [draft, isHydrated]);

  const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', payload: step }), []);
  const patchDraft = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') return;
    dispatch({ type: 'PATCH_DRAFT', payload });
  }, []);
  const resetDraft = useCallback(() => dispatch({ type: 'RESET_DRAFT' }), []);

  const value = useMemo(
    () => ({
      draft,
      isHydrated,
      setStep,
      patchDraft,
      resetDraft,
    }),
    [draft, isHydrated, patchDraft, resetDraft, setStep],
  );

  return <QuoteFlowContext.Provider value={value}>{children}</QuoteFlowContext.Provider>;
};

export const useQuoteFlow = () => {
  const context = useContext(QuoteFlowContext);
  if (!context) {
    throw new Error('useQuoteFlow must be used within QuoteFlowProvider');
  }
  return context;
};
