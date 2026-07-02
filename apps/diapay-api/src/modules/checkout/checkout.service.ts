import { createCheckoutSession, getCheckoutSession, listCheckoutSessions } from '../../services/checkout-store';
import { validateCheckoutCreate } from './checkout.validation';
export function createSession(payload: unknown, headers: Record<string, string | undefined>) { return createCheckoutSession(validateCheckoutCreate(payload), headers); }
export function getSession(id: string, merchant?: string) { return getCheckoutSession(id, merchant); }
export function listSessions(merchant?: string) { return listCheckoutSessions(merchant); }
