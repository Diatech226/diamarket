import { sandboxState } from '../../services/checkout-store';
import type { CheckoutSession } from '../../models/CheckoutSession';
export interface CheckoutRepository { findById(id: string): CheckoutSession | undefined; create(session: CheckoutSession): CheckoutSession; list(merchant?: string): CheckoutSession[]; update(session: CheckoutSession): CheckoutSession; }
export const legacyCheckoutRepository: CheckoutRepository = {
  findById(id) { return sandboxState.sessions.get(id); },
  create(session) { sandboxState.sessions.set(session.id, session); return session; },
  list(merchant) { return Array.from(sandboxState.sessions.values()).filter((s) => !merchant || s.merchant === merchant); },
  update(session) { sandboxState.sessions.set(session.id, session); return session; },
};
