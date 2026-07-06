import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { 
  PaymentStatus, 
  CheckoutSessionStatus, 
  PaymentMethod, 
  MobileOperator,
  CheckoutSession,
  PaymentIntent,
  LedgerEntry,
  VendorWallet,
  Dispute,
  WebhookEndpoint,
  WebhookDeliveryLog,
  Refund,
  MonthlyStatement,
  SettlementBatch,
  ApiKeyPair
} from "./src/types";

// Setup express app
const app = express();
app.use(express.json());

const PORT = 3000;

// ==========================================
// IN-MEMORY DATABASE STATE (Seeded initially)
// ==========================================

let apiKeys = {
  publishableKey: "pk_test_diapay_51NuG4AF",
  secretKey: "sk_test_diapay_secure98427",
  lastRotated: "2026-01-15T10:00:00Z"
};

let apiKeyPairs: ApiKeyPair[] = [
  {
    id: "key_default_01",
    name: "Default Sandbox Credentials",
    publishableKey: "pk_test_diapay_51NuG4AF",
    secretKey: "sk_test_diapay_secure98427",
    status: "active",
    createdAt: "2026-01-15T10:00:00Z",
    lastRotated: "2026-01-15T10:00:00Z"
  }
];

let webhooks: WebhookEndpoint[] = [
  {
    id: "wh_01",
    url: "https://api.diamarket.sn/v1/diapay-webhooks",
    events: ["payment.succeeded", "refund.processed", "dispute.opened"],
    status: "active",
    signingSecret: "whsec_diamarket_xyz789",
    createdAt: "2026-03-12T08:30:00Z"
  }
];

let webhookLogs: WebhookDeliveryLog[] = [
  {
    id: "log_01",
    endpointId: "wh_01",
    url: "https://api.diamarket.sn/v1/diapay-webhooks",
    event: "payment.succeeded",
    payload: {
      id: "evt_908234",
      event: "payment.succeeded",
      timestamp: 1783088100,
      data: {
        id: "txn_01",
        amount: 450000,
        currency: "XOF",
        status: "paid",
        customer: "+221 77 452 89 12",
        method: "mobile_money",
        operator: "orange"
      }
    },
    headers: {
      "Content-Type": "application/json",
      "Diapay-Signature": "t=1783088100,v1=62ea9824c80cb5adfc7b8240ef82c0df61280ea3b06cf72a5a0ea138e05c24f1"
    },
    responseStatus: 200,
    responseBody: '{"received": true}',
    success: true,
    timestamp: "2026-07-03T14:15:30Z"
  }
];

let vendorWallets: VendorWallet[] = [
  { id: "v_01", name: "Diamarket Main Escrow", balance: 11400000, status: "verified" },
  { id: "v_02", name: "DiaExpress Logistics", balance: 2850000, status: "verified" },
  { id: "v_03", name: "Dakar Tech Marketplace", balance: 0, status: "pending_kyb" }
];

let settlementBatches: SettlementBatch[] = [
  {
    id: "batch_set_001",
    createdAt: "2026-06-28T10:00:00Z",
    vendorId: "v_01",
    vendorName: "Diamarket Main Escrow",
    payoutAmount: 5000000,
    reserveHold: 675000,
    currency: "XOF",
    status: "settled",
    bankName: "Société Générale Sénégal (SGS)",
    accountNumber: "SN012 03456 000987654321 09",
    reconciliationReference: "SET-REC-2806A"
  },
  {
    id: "batch_set_002",
    createdAt: "2026-07-02T16:45:00Z",
    vendorId: "v_02",
    vendorName: "DiaExpress Logistics",
    payoutAmount: 1200000,
    reserveHold: 162000,
    currency: "XOF",
    status: "exported",
    bankName: "Ecobank Sénégal",
    accountNumber: "SN080 09876 111222333444 88",
    reconciliationReference: "SET-REC-0207B"
  }
];

let ledger: LedgerEntry[] = [
  // Historical seed values to construct:
  // Platform Master Clearing (Asset) = 14,250,000 XOF
  // Escrow Reserve (Liability) = 1,520,000 XOF
  // Balance distributed to vendors or commission revenue
  { id: "led_01", date: "2026-06-25T00:00:00Z", reference: "SEED-BAL", account: "Platform Master Clearing", type: "Asset", debit: 14250000, credit: 0 },
  { id: "led_02", date: "2026-06-25T00:00:00Z", reference: "SEED-BAL", account: "Diamarket Main Escrow Payable", type: "Liability", debit: 0, credit: 11400000 },
  { id: "led_03", date: "2026-06-25T00:00:00Z", reference: "SEED-BAL", account: "DiaExpress Logistics Payable", type: "Liability", debit: 0, credit: 2850000 },
  { id: "led_04", date: "2026-06-25T00:00:00Z", reference: "SEED-BAL", account: "Escrow Reserve Liability", type: "Liability", debit: 0, credit: 1520000 },
];

let payments: PaymentIntent[] = [
  {
    id: "txn_01",
    sessionId: "sess_01",
    amount: 450000,
    currency: "XOF",
    status: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    customerIdentifier: "+221 77 452 89 12",
    createdAt: "2026-07-03T14:15:00Z",
    fees: 6750 // 1.5% Orange Money operator fee
  },
  {
    id: "txn_02",
    sessionId: "sess_02",
    amount: 850000,
    currency: "XOF",
    status: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    customerIdentifier: "+225 07 89 45 12 34",
    createdAt: "2026-07-03T12:44:00Z",
    fees: 12750
  },
  {
    id: "txn_03",
    sessionId: "sess_03",
    amount: 120000,
    currency: "XOF",
    status: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    customerIdentifier: "+228 90 12 34 56",
    createdAt: "2026-07-02T18:20:00Z",
    fees: 1800
  },
  {
    id: "txn_04",
    sessionId: "sess_04",
    amount: 450000,
    currency: "XOF",
    status: PaymentStatus.DISPUTED,
    paymentMethod: PaymentMethod.BANK_CARD,
    customerIdentifier: "+221 78 123 45 67",
    createdAt: "2026-07-02T11:10:00Z",
    fees: 15750 // 3.5% Card acquiring fee
  },
  {
    id: "txn_05",
    sessionId: "sess_05",
    amount: 60000,
    currency: "XOF",
    status: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    customerIdentifier: "+229 97 11 22 33",
    createdAt: "2026-07-01T09:30:00Z",
    fees: 900
  },
  {
    id: "txn_06",
    sessionId: "sess_06",
    amount: 150000,
    currency: "XOF",
    status: PaymentStatus.REFUNDED,
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    customerIdentifier: "+221 77 987 65 43",
    createdAt: "2026-06-30T15:00:00Z",
    fees: 2250
  }
];

let checkoutSessions: CheckoutSession[] = [
  {
    id: "sess_01",
    orderId: "ORD-9912",
    itemName: "Premium Marketplace Order #9912",
    amount: 450000,
    currency: "XOF",
    status: CheckoutSessionStatus.COMPLETED,
    successUrl: "https://diamarket.sn/checkout/success",
    cancelUrl: "https://diamarket.sn/checkout/cancel",
    customerPhone: "+221 77 452 89 12",
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    mobileOperator: MobileOperator.ORANGE,
    countryCode: "SN",
    createdAt: "2026-07-03T14:10:00Z",
    expiresAt: "2026-07-03T14:40:00Z"
  },
  {
    id: "sess_02",
    orderId: "ORD-9913",
    itemName: "Electronics Delivery Pack",
    amount: 850000,
    currency: "XOF",
    status: CheckoutSessionStatus.COMPLETED,
    successUrl: "https://diamarket.sn/checkout/success",
    cancelUrl: "https://diamarket.sn/checkout/cancel",
    customerPhone: "+225 07 89 45 12 34",
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    mobileOperator: MobileOperator.WAVE,
    countryCode: "CI",
    createdAt: "2026-07-03T12:35:00Z",
    expiresAt: "2026-07-03T13:05:00Z"
  },
  {
    id: "sess_03",
    orderId: "ORD-9914",
    itemName: "Logistic Hub Fee",
    amount: 120000,
    currency: "XOF",
    status: CheckoutSessionStatus.COMPLETED,
    successUrl: "https://diaexpress.sn/checkout/success",
    cancelUrl: "https://diaexpress.sn/checkout/cancel",
    customerPhone: "+228 90 12 34 56",
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    mobileOperator: MobileOperator.MOOV,
    countryCode: "TG",
    createdAt: "2026-07-02T18:15:00Z",
    expiresAt: "2026-07-02T18:45:00Z"
  },
  {
    id: "sess_04",
    orderId: "ORD-9915",
    itemName: "Apparel wholesale",
    amount: 450000,
    currency: "XOF",
    status: CheckoutSessionStatus.COMPLETED,
    successUrl: "https://diamarket.sn/checkout/success",
    cancelUrl: "https://diamarket.sn/checkout/cancel",
    customerPhone: "+221 78 123 45 67",
    paymentMethod: PaymentMethod.BANK_CARD,
    countryCode: "SN",
    createdAt: "2026-07-02T11:00:00Z",
    expiresAt: "2026-07-02T11:30:00Z"
  },
  {
    id: "sess_05",
    orderId: "ORD-9916",
    itemName: "Subscribed service",
    amount: 60000,
    currency: "XOF",
    status: CheckoutSessionStatus.COMPLETED,
    successUrl: "https://diamarket.sn/checkout/success",
    cancelUrl: "https://diamarket.sn/checkout/cancel",
    customerPhone: "+229 97 11 22 33",
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    mobileOperator: MobileOperator.MTN,
    countryCode: "BJ",
    createdAt: "2026-07-01T09:20:00Z",
    expiresAt: "2026-07-01T09:50:00Z"
  }
];

let refunds: Refund[] = [
  {
    id: "ref_01",
    paymentId: "txn_06",
    amount: 150000,
    currency: "XOF",
    reason: "Client canceled subscription within grace period",
    status: "succeeded",
    createdAt: "2026-06-30T15:05:00Z"
  }
];

let disputes: Dispute[] = [
  {
    id: "disp_01",
    paymentId: "txn_04",
    customerIdentifier: "+221 78 123 45 67",
    amount: 450000,
    currency: "XOF",
    reason: "Unrecognized payment (Fraud suspected)",
    status: "needs_response",
    deadline: "2026-07-10T17:00:00Z",
    createdAt: "2026-07-02T11:10:00Z",
    evidenceFiles: [],
    timeline: [
      { date: "2026-07-02 11:10", title: "Dispute Opened", description: "Acquiring bank issued a chargeback alert for unrecognized card usage.", type: "alert" },
      { date: "2026-07-02 11:11", title: "Notification Sent", description: "Email alert 'Action Required' dispatched to merchant developer desk.", type: "neutral" }
    ]
  }
];

let supportLogs: { id: string; phone: string; subject: string; message: string; status: string; createdAt: string }[] = [
  {
    id: "sup_01",
    phone: "+221 77 452 89 12",
    subject: "OTP delay experienced during checkout",
    message: "I completed my payment of 450,000 XOF but the OTP took 2 minutes to arrive. The transaction went through safely. Just reporting the network latency.",
    status: "resolved",
    createdAt: "2026-07-03T14:20:00Z"
  }
];

// Helper to trigger webhooks
function triggerSimulatedWebhook(event: string, data: any) {
  webhooks.forEach((endpoint) => {
    if (endpoint.status === "active" && endpoint.events.includes(event)) {
      const timestamp = Math.floor(Date.now() / 1000);
      const payloadString = JSON.stringify({
        id: `evt_${crypto.randomBytes(4).toString("hex")}`,
        event,
        timestamp,
        data
      });
      
      const signature = crypto
        .createHmac("sha256", endpoint.signingSecret)
        .update(`${timestamp}.${payloadString}`)
        .digest("hex");

      const log: WebhookDeliveryLog = {
        id: `log_${crypto.randomBytes(4).toString("hex")}`,
        endpointId: endpoint.id,
        url: endpoint.url,
        event,
        payload: JSON.parse(payloadString),
        headers: {
          "Content-Type": "application/json",
          "Diapay-Signature": `t=${timestamp},v1=${signature}`
        },
        responseStatus: 200,
        responseBody: '{"received": true, "status": "ok"}',
        success: true,
        timestamp: new Date().toISOString()
      };

      webhookLogs.unshift(log);
    }
  });
}

// ==========================================
// CORE PLATFORM & API ENDPOINTS
// ==========================================

// Dashboard balances calculator (Sum of ledger entries)
app.get("/api/v1/balance", (req, res) => {
  let masterClearing = 0;
  let escrowReserve = 0;
  let inDispute = 0;

  ledger.forEach(entry => {
    if (entry.account === "Platform Master Clearing") {
      masterClearing += (entry.debit - entry.credit);
    } else if (entry.account === "Escrow Reserve Liability") {
      escrowReserve += (entry.credit - entry.debit);
    }
  });

  // Disputes are separate hold logic
  disputes.forEach(d => {
    if (d.status === "needs_response" || d.status === "under_review") {
      inDispute += d.amount;
    }
  });

  res.json({
    masterClearing,
    escrowReserve,
    inDispute,
    currency: "XOF"
  });
});

// List vendor wallets
app.get("/api/v1/wallets", (req, res) => {
  res.json(vendorWallets);
});

// List ledger entries
app.get("/api/v1/ledger", (req, res) => {
  res.json(ledger);
});

// List checkout sessions
app.get("/api/v1/checkout/sessions", (req, res) => {
  res.json(checkoutSessions);
});

// Get a specific checkout session
app.get("/api/v1/checkout/sessions/:id", (req, res) => {
  const session = checkoutSessions.find(s => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Checkout session not found" });
  }
  res.json(session);
});

// Create a new checkout session
app.post("/api/v1/checkout/sessions", (req, res) => {
  const { 
    orderId, 
    itemName, 
    amount, 
    currency, 
    successUrl, 
    cancelUrl, 
    vendorSplit,
    developerMerchantName,
    developerSupportEmail,
    developerSupportPhone,
    payerName,
    logoUrl,
    brandColor,
    metadata
  } = req.body;

  if (!orderId || !itemName || !amount) {
    return res.status(400).json({ error: "Missing required fields: orderId, itemName, amount" });
  }

  const newSession: CheckoutSession = {
    id: `sess_${crypto.randomBytes(4).toString("hex")}`,
    orderId,
    itemName,
    amount: Number(amount),
    currency: currency || "XOF",
    status: CheckoutSessionStatus.OPEN,
    successUrl: successUrl || "https://diamarket.sn/checkout/success",
    cancelUrl: cancelUrl || "https://diamarket.sn/checkout/cancel",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
    developerMerchantName,
    developerSupportEmail,
    developerSupportPhone,
    payerName,
    logoUrl,
    brandColor,
    metadata: { ...(metadata || {}), vendorSplit: vendorSplit || 0.8 } // Default 80% split
  };

  checkoutSessions.unshift(newSession);
  res.status(201).json(newSession);
});

// Complete a checkout session (Simulation of payment confirmation)
app.post("/api/v1/checkout/sessions/:id/complete", (req, res) => {
  const sessionIndex = checkoutSessions.findIndex(s => s.id === req.params.id);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: "Checkout session not found" });
  }

  const session = checkoutSessions[sessionIndex];
  if (session.status !== CheckoutSessionStatus.OPEN) {
    return res.status(400).json({ error: `Session is already ${session.status}` });
  }

  const { customerPhone, customerEmail, paymentMethod, mobileOperator, countryCode } = req.body;

  if (!customerPhone) {
    return res.status(400).json({ error: "Customer phone number is required" });
  }

  // Update session
  session.status = CheckoutSessionStatus.COMPLETED;
  session.customerPhone = customerPhone;
  session.customerEmail = customerEmail || `${customerPhone.replace(/[^0-9]/g, "")}@diapay-payer.net`;
  session.paymentMethod = paymentMethod || PaymentMethod.MOBILE_MONEY;
  session.mobileOperator = mobileOperator || MobileOperator.ORANGE;
  session.countryCode = countryCode || "SN";

  // Create payment record
  const paymentId = `txn_${crypto.randomBytes(4).toString("hex")}`;
  const operatorFeeRate = paymentMethod === PaymentMethod.BANK_CARD ? 0.035 : 0.015; // 3.5% Card vs 1.5% Orange/Wave Money
  const calculatedFees = Math.round(session.amount * operatorFeeRate);

  const payment: PaymentIntent = {
    id: paymentId,
    sessionId: session.id,
    amount: session.amount,
    currency: session.currency,
    status: PaymentStatus.PAID,
    paymentMethod: session.paymentMethod,
    customerIdentifier: customerPhone,
    createdAt: new Date().toISOString(),
    fees: calculatedFees
  };

  payments.unshift(payment);

  // Apply Double Entry Ledger Architecture (DR/CR)
  // Split logic: Platform commission 5%, Operator Fee 1.5% or 3.5%, Escrow Reserve 13.5%
  const vendorSplitRate = session.metadata?.vendorSplit || 0.8;
  const vendorPayable = Math.round(session.amount * vendorSplitRate);
  
  const platformCommissionRate = 0.05;
  const commissionRevenue = Math.round(session.amount * platformCommissionRate);

  const reserveRate = 0.135;
  const escrowReserveCredit = Math.round(session.amount * reserveRate);

  // Total debits = total credits
  // Let's create balanced records in ledger
  const ref = `TRX-${paymentId.toUpperCase()}`;
  const dateStr = new Date().toISOString();

  // 1. Debit Platform Master Clearing (Asset)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: "Platform Master Clearing",
    type: "Asset",
    debit: session.amount,
    credit: 0
  });

  // 2. Credit Vendor Wallet Payable (Liability)
  let walletName = session.itemName.toLowerCase().includes("express") ? "DiaExpress Logistics" : "Diamarket Main Escrow";
  if (session.developerMerchantName) {
    walletName = session.developerMerchantName;
  }
  let vendorWallet = vendorWallets.find(w => w.name.toLowerCase() === walletName.toLowerCase());
  if (!vendorWallet) {
    const newWalletId = `v_${crypto.randomBytes(3).toString("hex")}`;
    vendorWallet = {
      id: newWalletId,
      name: walletName,
      balance: 0,
      status: "verified"
    };
    vendorWallets.push(vendorWallet);
  }
  vendorWallet.balance += vendorPayable;

  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: `${vendorWallet.name} Payable`,
    type: "Liability",
    debit: 0,
    credit: vendorPayable
  });

  // 3. Credit Escrow Reserve Liability (Liability)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: "Escrow Reserve Liability",
    type: "Liability",
    debit: 0,
    credit: escrowReserveCredit
  });

  // 4. Credit Commission Revenue (Revenue)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: "Platform Commission Revenue",
    type: "Revenue",
    debit: 0,
    credit: commissionRevenue
  });

  // 5. Credit Operator Fee Clearing (Expense/Intermediary)
  // Platform covers the operator cost, tracked as network expense
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: "Operator Network Expense",
    type: "Expense",
    debit: calculatedFees,
    credit: 0
  });

  // Also make sure to balance the remaining platform operating share (Asset adjustment)
  const remainderCredit = session.amount - vendorPayable - escrowReserveCredit - commissionRevenue;
  if (remainderCredit > 0) {
    ledger.push({
      id: `led_${crypto.randomBytes(4).toString("hex")}`,
      date: dateStr,
      reference: ref,
      account: "Platform Margin Account",
      type: "Liability",
      debit: 0,
      credit: remainderCredit
    });
  }

  // Trigger webhooks to developer callback
  triggerSimulatedWebhook("payment.succeeded", {
    id: paymentId,
    amount: session.amount,
    currency: session.currency,
    status: "paid",
    customer: customerPhone,
    method: payment.paymentMethod,
    operator: session.mobileOperator,
    orderId: session.orderId
  });

  res.json({
    status: "success",
    paymentId,
    session,
    ledgerRef: ref
  });
});

// Cancel a checkout session
app.post("/api/v1/checkout/sessions/:id/cancel", (req, res) => {
  const session = checkoutSessions.find(s => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Checkout session not found" });
  }
  session.status = CheckoutSessionStatus.CANCELLED;
  res.json({ status: "cancelled", session });
});

// List all payments
app.get("/api/v1/payments", (req, res) => {
  res.json(payments);
});

// Refund a payment
app.post("/api/v1/payments/:id/refund", (req, res) => {
  const paymentIndex = payments.findIndex(p => p.id === req.params.id);
  if (paymentIndex === -1) {
    return res.status(404).json({ error: "Payment not found" });
  }

  const payment = payments[paymentIndex];
  if (payment.status === PaymentStatus.REFUNDED) {
    return res.status(400).json({ error: "Payment is already fully refunded" });
  }

  const { reason, amount } = req.body;
  const refundAmount = Number(amount) || payment.amount;

  if (refundAmount > payment.amount) {
    return res.status(400).json({ error: "Refund amount exceeds original payment amount" });
  }

  payment.status = PaymentStatus.REFUNDED;

  const refundId = `ref_${crypto.randomBytes(4).toString("hex")}`;
  const newRefund: Refund = {
    id: refundId,
    paymentId: payment.id,
    amount: refundAmount,
    currency: payment.currency,
    reason: reason || "Developer initiated portal refund",
    status: "succeeded",
    createdAt: new Date().toISOString()
  };

  refunds.unshift(newRefund);

  // Add ledger reversal entries (Dr/Cr Flip)
  const ref = `REF-${refundId.toUpperCase()}`;
  const dateStr = new Date().toISOString();

  // Deduct vendor balance if possible
  const vendorWallet = vendorWallets[0]; // diamarket main
  vendorWallet.balance = Math.max(0, vendorWallet.balance - Math.round(refundAmount * 0.8));

  // Ledger entries reversing previous gains:
  // 1. Credit Platform Master Clearing (Asset reduction)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: "Platform Master Clearing",
    type: "Asset",
    debit: 0,
    credit: refundAmount
  });

  // 2. Debit Vendor Payable (Liability reduction)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: `${vendorWallet.name} Payable`,
    type: "Liability",
    debit: Math.round(refundAmount * 0.8),
    credit: 0
  });

  // 3. Debit Escrow Reserve (Liability reduction)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: "Escrow Reserve Liability",
    type: "Liability",
    debit: Math.round(refundAmount * 0.135),
    credit: 0
  });

  // 4. Debit Platform Commission (Revenue reversal)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: "Platform Commission Revenue",
    type: "Revenue",
    debit: Math.round(refundAmount * 0.05),
    credit: 0
  });

  // Trigger webhooks to developer callback
  triggerSimulatedWebhook("refund.processed", {
    id: refundId,
    paymentId: payment.id,
    amount: refundAmount,
    currency: payment.currency,
    status: "succeeded",
    reason: newRefund.reason
  });

  res.json({
    status: "success",
    refund: newRefund,
    payment
  });
});

// List disputes
app.get("/api/v1/disputes", (req, res) => {
  res.json(disputes);
});

// Submit dispute evidence
app.post("/api/v1/disputes/:id/evidence", (req, res) => {
  const dispute = disputes.find(d => d.id === req.params.id);
  if (!dispute) {
    return res.status(404).json({ error: "Dispute not found" });
  }

  const { files } = req.body;
  if (files && Array.isArray(files)) {
    dispute.evidenceFiles.push(...files);
  } else {
    dispute.evidenceFiles.push("signed_delivery_note_dakar_hub.pdf");
  }

  dispute.status = "under_review";
  dispute.timeline.push({
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    title: "Evidence Submitted",
    description: `Merchant uploaded proof documents: ${dispute.evidenceFiles.join(", ")}. Submitted to chargeback desk.`,
    type: "neutral"
  });

  res.json({ status: "success", dispute });
});

// Accept a dispute (Triggers automated refund and chargeback fee)
app.post("/api/v1/disputes/:id/accept", (req, res) => {
  const dispute = disputes.find(d => d.id === req.params.id);
  if (!dispute) {
    return res.status(404).json({ error: "Dispute not found" });
  }

  dispute.status = "resolved";
  dispute.timeline.push({
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    title: "Dispute Accepted",
    description: "Merchant conceded the claim. Refund and network chargeback fees settled.",
    type: "neutral"
  });

  // Re-trigger refund automatically on that payment
  const payment = payments.find(p => p.id === dispute.paymentId);
  if (payment && payment.status !== PaymentStatus.REFUNDED) {
    payment.status = PaymentStatus.REFUNDED;
    
    // Add Ledger Reversal entries + Chargeback Fee (Expense of 15,000 XOF)
    const ref = `CHG-${dispute.id.toUpperCase()}`;
    const dateStr = new Date().toISOString();

    ledger.push({
      id: `led_${crypto.randomBytes(4).toString("hex")}`,
      date: dateStr,
      reference: ref,
      account: "Platform Master Clearing",
      type: "Asset",
      debit: 0,
      credit: dispute.amount
    });

    ledger.push({
      id: `led_${crypto.randomBytes(4).toString("hex")}`,
      date: dateStr,
      reference: ref,
      account: "Diamarket Main Escrow Payable",
      type: "Liability",
      debit: dispute.amount,
      credit: 0
    });

    // Network fine (Card Scheme penalty chargeback fee: 15,000 XOF)
    ledger.push({
      id: `led_${crypto.randomBytes(4).toString("hex")}`,
      date: dateStr,
      reference: ref,
      account: "Card Network Chargeback Expense",
      type: "Expense",
      debit: 15000,
      credit: 0
    });
  }

  res.json({ status: "success", dispute });
});

// Configure developer webhook endpoints
app.post("/api/v1/webhooks", (req, res) => {
  const { url, events } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Webhook url is required" });
  }

  const newEndpoint: WebhookEndpoint = {
    id: `wh_${crypto.randomBytes(4).toString("hex")}`,
    url,
    events: events || ["payment.succeeded"],
    status: "active",
    signingSecret: `whsec_${crypto.randomBytes(6).toString("hex")}`,
    createdAt: new Date().toISOString()
  };

  webhooks.push(newEndpoint);
  res.status(201).json(newEndpoint);
});

// Get webhook endpoint configurations
app.get("/api/v1/webhooks", (req, res) => {
  res.json(webhooks);
});

// Get webhook delivery logs
app.get("/api/v1/webhook-events", (req, res) => {
  res.json(webhookLogs);
});

// Simulate manual webhook trigger
app.post("/api/v1/webhook-events/simulate", async (req, res) => {
  const { endpointId, event, payload } = req.body;
  
  const endpoint = webhooks.find(w => w.id === endpointId);
  if (!endpoint) {
    return res.status(404).json({ error: "Webhook endpoint not found" });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  
  const signature = crypto
    .createHmac("sha256", endpoint.signingSecret)
    .update(`${timestamp}.${payloadString}`)
    .digest("hex");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Diapay-Webhook-Agent/1.0",
    "Diapay-Signature": `t=${timestamp},v1=${signature}`
  };

  let responseStatus = 200;
  let responseBody = '{"received": true, "status": "ok"}';
  let success = true;

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const fetchRes = await fetch(endpoint.url, {
      method: "POST",
      headers,
      body: payloadString,
      signal: controller.signal
    });
    clearTimeout(id);

    responseStatus = fetchRes.status;
    responseBody = await fetchRes.text();
    if (responseBody.length > 1000) {
      responseBody = responseBody.substring(0, 1000) + "... (truncated)";
    }
    success = fetchRes.ok;
  } catch (err: any) {
    success = false;
    responseStatus = 0;
    responseBody = err.message || "Failed to connect to destination URL";
  }

  const log: WebhookDeliveryLog = {
    id: `log_${crypto.randomBytes(4).toString("hex")}`,
    endpointId: endpoint.id,
    url: endpoint.url,
    event,
    payload,
    headers,
    responseStatus,
    responseBody,
    success,
    timestamp: new Date().toISOString()
  };

  webhookLogs.unshift(log);
  res.status(201).json(log);
});

// Helper to refresh and check for deprecation expiration
function checkExpiredKeys() {
  const now = new Date();
  apiKeyPairs.forEach(pair => {
    if (pair.status === "deprecated" && pair.expiresAt) {
      if (new Date(pair.expiresAt) <= now) {
        pair.status = "expired";
      }
    }
  });
}

// Get active API keys and pairs (safe client lookup for simulator display)
app.get("/api/v1/api-keys", (req, res) => {
  checkExpiredKeys();
  res.json({
    apiKeys,
    pairs: apiKeyPairs
  });
});

// Create new API Key Pair
app.post("/api/v1/api-keys", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Key pair name is required" });
  }

  const id = `key_${crypto.randomBytes(4).toString("hex")}`;
  const publishableKey = `pk_test_diapay_${crypto.randomBytes(8).toString("hex")}`;
  const secretKey = `sk_test_diapay_${crypto.randomBytes(16).toString("hex")}`;
  
  const newPair: ApiKeyPair = {
    id,
    name,
    publishableKey,
    secretKey,
    status: "active",
    createdAt: new Date().toISOString(),
    lastRotated: new Date().toISOString()
  };

  apiKeyPairs.push(newPair);

  // Sync to primary active fallback apiKeys
  apiKeys.publishableKey = publishableKey;
  apiKeys.secretKey = secretKey;
  apiKeys.lastRotated = newPair.lastRotated;

  res.status(201).json({ pairs: apiKeyPairs, newPair });
});

// Rotate API credentials with grace period
app.post("/api/v1/api-keys/:id/rotate", (req, res) => {
  const { gracePeriodMinutes } = req.body;
  checkExpiredKeys();

  const oldPairIndex = apiKeyPairs.findIndex(k => k.id === req.params.id);
  if (oldPairIndex === -1) {
    return res.status(404).json({ error: "API key pair not found" });
  }

  const oldPair = apiKeyPairs[oldPairIndex];
  if (oldPair.status !== "active") {
    return res.status(400).json({ error: "Only active key pairs can be rotated" });
  }

  const minutes = Number(gracePeriodMinutes) || 5; // default 5 minutes grace period
  const now = new Date();
  const expiresAt = new Date(now.getTime() + minutes * 60 * 1000).toISOString();

  // Deprecate the old one
  oldPair.status = "deprecated";
  oldPair.deprecatedAt = now.toISOString();
  oldPair.deprecationGracePeriodMinutes = minutes;
  oldPair.expiresAt = expiresAt;

  // Generate the new one
  const id = `key_${crypto.randomBytes(4).toString("hex")}`;
  const publishableKey = `pk_test_diapay_${crypto.randomBytes(8).toString("hex")}`;
  const secretKey = `sk_test_diapay_${crypto.randomBytes(16).toString("hex")}`;

  const newPair: ApiKeyPair = {
    id,
    name: oldPair.name.endsWith(" (Rotated)") ? oldPair.name : `${oldPair.name} (Rotated)`,
    publishableKey,
    secretKey,
    status: "active",
    createdAt: now.toISOString(),
    lastRotated: now.toISOString()
  };

  apiKeyPairs.push(newPair);

  // Sync main apiKeys object to latest active key for backward compatibility
  apiKeys.publishableKey = publishableKey;
  apiKeys.secretKey = secretKey;
  apiKeys.lastRotated = newPair.lastRotated;

  res.json({ pairs: apiKeyPairs, newPair });
});

// Delete an API Key Pair
app.delete("/api/v1/api-keys/:id", (req, res) => {
  const pairIndex = apiKeyPairs.findIndex(k => k.id === req.params.id);
  if (pairIndex === -1) {
    return res.status(404).json({ error: "API key pair not found" });
  }
  
  const pair = apiKeyPairs[pairIndex];
  const activeCount = apiKeyPairs.filter(k => k.status === "active").length;
  if (pair.status === "active" && activeCount <= 1) {
    return res.status(400).json({ error: "Cannot delete the only active API key. Please generate a new key pair first." });
  }

  apiKeyPairs.splice(pairIndex, 1);

  // If we deleted the key that corresponds to apiKeys, sync with another active key
  const remainingActive = apiKeyPairs.find(k => k.status === "active");
  if (remainingActive) {
    apiKeys.publishableKey = remainingActive.publishableKey;
    apiKeys.secretKey = remainingActive.secretKey;
    apiKeys.lastRotated = remainingActive.lastRotated;
  }

  res.json({ pairs: apiKeyPairs });
});

// Payer Lookup Support Engine
app.post("/api/v1/support/lookup", (req, res) => {
  const { search } = req.body; // could be phone number or paymentId/orderId
  if (!search) {
    return res.status(400).json({ error: "Search queries must contain phone or txn/order reference ID." });
  }

  const cleanSearch = search.trim().toLowerCase();

  // Search in payments or checkoutSessions
  const matchingPayment = payments.find(p => 
    p.id.toLowerCase() === cleanSearch || 
    p.customerIdentifier.replace(/[^0-9]/g, "").includes(cleanSearch.replace(/[^0-9]/g, ""))
  );

  const matchingSession = checkoutSessions.find(s => 
    s.id.toLowerCase() === cleanSearch || 
    s.orderId.toLowerCase() === cleanSearch ||
    (s.customerPhone && s.customerPhone.replace(/[^0-9]/g, "").includes(cleanSearch.replace(/[^0-9]/g, "")))
  );

  if (!matchingPayment && !matchingSession) {
    return res.status(404).json({ error: "No matching transactions found for that search query." });
  }

  res.json({
    payment: matchingPayment,
    session: matchingSession
  });
});

// Submit a general support message/ticket
app.post("/api/v1/support/report", (req, res) => {
  const { phone, subject, message } = req.body;
  if (!phone || !subject || !message) {
    return res.status(400).json({ error: "Missing required details: phone, subject, message" });
  }

  const newLog = {
    id: `sup_${crypto.randomBytes(4).toString("hex")}`,
    phone,
    subject,
    message,
    status: "open",
    createdAt: new Date().toISOString()
  };

  supportLogs.unshift(newLog);
  res.status(201).json(newLog);
});

// Get general support logs
app.get("/api/v1/support/logs", (req, res) => {
  res.json(supportLogs);
});

// ==========================================
// SETTLEMENT BATCHES & RECONCILIATION API
// ==========================================

// Get all settlement batches
app.get("/api/v1/settlements", (req, res) => {
  res.json(settlementBatches);
});

// Create a new settlement batch (generate pending payout)
app.post("/api/v1/settlements", (req, res) => {
  const { vendorId, payoutAmount, bankName, accountNumber } = req.body;

  if (!vendorId || !payoutAmount || !bankName || !accountNumber) {
    return res.status(400).json({ error: "Missing required fields: vendorId, payoutAmount, bankName, accountNumber" });
  }

  const vendorWallet = vendorWallets.find(w => w.id === vendorId);
  if (!vendorWallet) {
    return res.status(404).json({ error: "Vendor wallet not found" });
  }

  const parsedAmount = Number(payoutAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Payout amount must be a positive number" });
  }

  if (vendorWallet.balance < parsedAmount) {
    return res.status(400).json({ error: `Insufficient balance. Maximum payable is ${vendorWallet.balance.toLocaleString()} XOF` });
  }

  const id = `batch_set_${crypto.randomBytes(3).toString("hex")}`;
  const reconciliationReference = `SET-REC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  
  const newBatch: SettlementBatch = {
    id,
    createdAt: new Date().toISOString(),
    vendorId,
    vendorName: vendorWallet.name,
    payoutAmount: parsedAmount,
    reserveHold: Math.round(parsedAmount * 0.135),
    currency: "XOF",
    status: "pending",
    bankName,
    accountNumber,
    reconciliationReference
  };

  settlementBatches.unshift(newBatch);
  res.status(201).json(newBatch);
});

// Download settlement batch as CSV (automatically advances pending -> exported)
app.get("/api/v1/settlements/:id/csv", (req, res) => {
  const batch = settlementBatches.find(b => b.id === req.params.id);
  if (!batch) {
    return res.status(404).json({ error: "Settlement batch not found" });
  }

  if (batch.status === "pending") {
    batch.status = "exported";
  }

  const csvRows = [
    [
      "Batch ID", 
      "Created At", 
      "Vendor ID", 
      "Vendor Name", 
      "Payout Amount (XOF)", 
      "Audit Reserve Hold (XOF)", 
      "Currency", 
      "Status", 
      "Bank Name", 
      "Account Number", 
      "Reconciliation Reference"
    ],
    [
      batch.id, 
      batch.createdAt, 
      batch.vendorId, 
      batch.vendorName, 
      batch.payoutAmount, 
      batch.reserveHold, 
      batch.currency, 
      batch.status, 
      batch.bankName, 
      batch.accountNumber, 
      batch.reconciliationReference
    ]
  ];

  const csvContent = csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=reconciliation_report_${batch.id}.csv`);
  res.send(csvContent);
});

// Manually trigger settlement execution (posts balancing ledger entries and reduces vendor balance)
app.post("/api/v1/settlements/:id/settle", (req, res) => {
  const batch = settlementBatches.find(b => b.id === req.params.id);
  if (!batch) {
    return res.status(404).json({ error: "Settlement batch not found" });
  }

  if (batch.status === "settled") {
    return res.status(400).json({ error: "Settlement batch is already settled" });
  }

  const vendorWallet = vendorWallets.find(w => w.id === batch.vendorId);
  if (!vendorWallet) {
    return res.status(404).json({ error: "Vendor wallet not found" });
  }

  if (vendorWallet.balance < batch.payoutAmount) {
    return res.status(400).json({ error: "Insufficient vendor wallet balance for settlement" });
  }

  // Deduct balance
  vendorWallet.balance -= batch.payoutAmount;
  batch.status = "settled";

  // Post double-entry accounting ledger entries
  const ref = batch.reconciliationReference;
  const dateStr = new Date().toISOString();

  // Debit: Vendor Payable Liability (reduces what platform owes the merchant)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: `${vendorWallet.name} Payable`,
    type: "Liability",
    debit: batch.payoutAmount,
    credit: 0
  });

  // Credit: Platform Master Clearing (reduces the funds physically sitting in master bank account)
  ledger.push({
    id: `led_${crypto.randomBytes(4).toString("hex")}`,
    date: dateStr,
    reference: ref,
    account: "Platform Master Clearing",
    type: "Asset",
    debit: 0,
    credit: batch.payoutAmount
  });

  res.json({ status: "success", batch, walletBalance: vendorWallet.balance });
});



// ==========================================
// VITE OR STATIC HOSTING CONFIGURATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
