import checkoutSuccess from './checkout-success';
import checkoutFailed from './checkout-failed';
import paymentSuccess from './payment-success';
import paymentFailed from './payment-failed';
import paymentPending from './payment-pending';
import mobileMoneyOtp from './mobile-money-otp';
import mobileMoneyTimeout from './mobile-money-timeout';
import refundFull from './refund-full';
import refundPartial from './refund-partial';
import webhookSuccess from './webhook-success';
import webhookDuplicate from './webhook-duplicate';
import webhookFailedSignature from './webhook-failed-signature';
import ledgerImpact from './ledger-impact';
import marketplaceSplitPlaceholder from './marketplace-split-placeholder';
export * from './types';
export const scenarios = [checkoutSuccess, checkoutFailed, paymentSuccess, paymentFailed, paymentPending, mobileMoneyOtp, mobileMoneyTimeout, refundFull, refundPartial, webhookSuccess, webhookDuplicate, webhookFailedSignature, ledgerImpact, marketplaceSplitPlaceholder];
export function getScenario(id: string) { return scenarios.find((scenario) => scenario.id === id); }
