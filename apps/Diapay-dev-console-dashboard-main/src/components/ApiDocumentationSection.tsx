import React, { useState, useEffect } from "react";
import { ApiKeyPair } from "../types";
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Braces, 
  Eye, 
  EyeOff, 
  Sliders, 
  Database,
  Globe,
  Settings2,
  FileCode,
  Info,
  Server,
  CornerDownRight,
  HelpCircle,
  TrendingUp,
  CreditCard,
  CheckCircle2
} from "lucide-react";

interface ApiDocumentationSectionProps {
  apiKeys: { publishableKey: string; secretKey: string; lastRotated: string };
  apiKeyPairs: ApiKeyPair[];
  copiedKey: string | null;
  triggerCopy: (text: string, label: string) => void;
}

export default function ApiDocumentationSection({ 
  apiKeys, 
  apiKeyPairs, 
  copiedKey, 
  triggerCopy 
}: ApiDocumentationSectionProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<
    "create_session" | "retrieve_session" | "complete_session" | "refund_payment" | "create_settlement" | "create_webhook"
  >("create_session");
  const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "javascript" | "python">("curl");
  const [selectedKeyPairId, setSelectedKeyPairId] = useState<string>("default");

  // Dynamic parameter states
  // 1. Create session
  const [orderId, setOrderId] = useState("ORD-90212");
  const [itemName, setItemName] = useState("Premium Enterprise API Licensing");
  const [amount, setAmount] = useState(150000);
  const [currency, setCurrency] = useState("XOF");
  const [vendorSplit, setVendorSplit] = useState(0.85);
  const [payerName, setPayerName] = useState("Mamadou Ndiaye");
  const [payerEmail, setPayerEmail] = useState("mamadou@ndiaye.sn");

  // 2. Retrieve & Complete session
  const [sessionId, setSessionId] = useState("sess_a91bf32f");
  const [customerPhone, setCustomerPhone] = useState("+221 77 123 45 67");
  const [mobileOperator, setMobileOperator] = useState("orange");
  const [countryCode, setCountryCode] = useState("SN");

  // 3. Refund
  const [paymentId, setPaymentId] = useState("txn_01");
  const [refundAmount, setRefundAmount] = useState(150000);
  const [refundReason, setRefundReason] = useState("Client requested full refund via portal support desk");

  // 4. Settlement
  const [vendorId, setVendorId] = useState("v_01");
  const [payoutAmount, setPayoutAmount] = useState(5000000);
  const [bankName, setBankName] = useState("Société Générale Sénégal (SGS)");
  const [accountNumber, setAccountNumber] = useState("SN012 03456 000987654321 09");

  // 5. Webhook
  const [webhookUrl, setWebhookUrl] = useState("https://api.yourdomain.com/v1/diapay-callbacks");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "payment.succeeded",
    "refund.processed"
  ]);

  // Derived current credentials
  const selectedPair = apiKeyPairs.find(p => p.id === selectedKeyPairId) || apiKeyPairs[0];
  const activeSecretKey = selectedPair ? selectedPair.secretKey : (apiKeys.secretKey || "sk_test_diapay_secure98427");
  const activePublishableKey = selectedPair ? selectedPair.publishableKey : (apiKeys.publishableKey || "pk_test_diapay_51NuG4AF");

  const baseUrl = window.location.origin;

  // Sync refund amount to current amount for better UX
  useEffect(() => {
    if (selectedEndpoint === "create_session") {
      setRefundAmount(amount);
    }
  }, [amount, selectedEndpoint]);

  const endpoints = [
    {
      id: "create_session" as const,
      method: "POST",
      path: "/api/v1/checkout/sessions",
      label: "Create Checkout Session",
      desc: "Initializes a unified payment session and generates a secure redirection checkout portal URL."
    },
    {
      id: "retrieve_session" as const,
      method: "GET",
      path: "/api/v1/checkout/sessions/:id",
      label: "Retrieve Checkout Session",
      desc: "Fetch status, telemetry details, payer contact metadata, and current transaction state of a session."
    },
    {
      id: "complete_session" as const,
      method: "POST",
      path: "/api/v1/checkout/sessions/:id/complete",
      label: "Confirm Payment (Sim)",
      desc: "Confirms checkout session completion by simulating a mobile money or card network push debit."
    },
    {
      id: "refund_payment" as const,
      method: "POST",
      path: "/api/v1/payments/:id/refund",
      label: "Process Refund Reversal",
      desc: "Reverses previously paid funds, posts dual balancing accounting rows, and dispatches webhook notifications."
    },
    {
      id: "create_settlement" as const,
      method: "POST",
      path: "/api/v1/settlements",
      label: "Dispatch Payout Settlement",
      desc: "Dispatches escrow balances directly into vendor bank accounts or mobile wallets with reserve audits."
    },
    {
      id: "create_webhook" as const,
      method: "POST",
      path: "/api/v1/webhooks",
      label: "Register Webhook Endpoint",
      desc: "Configures secure HMAC SHA-256 signed event listeners for real-time payment orchestration notifications."
    }
  ];

  // Snippet generators
  const getCurlSnippet = () => {
    switch (selectedEndpoint) {
      case "create_session":
        return `curl -X POST "${baseUrl}/api/v1/checkout/sessions" \\
  -H "Authorization: Bearer ${activeSecretKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderId": "${orderId}",
    "itemName": "${itemName}",
    "amount": ${amount},
    "currency": "${currency}",
    "successUrl": "https://yourdomain.com/success",
    "cancelUrl": "https://yourdomain.com/cancel",
    "vendorSplit": ${vendorSplit},
    "payerName": "${payerName}",
    "customerEmail": "${payerEmail}"
  }'`;

      case "retrieve_session":
        return `curl -X GET "${baseUrl}/api/v1/checkout/sessions/${sessionId}" \\
  -H "Authorization: Bearer ${activeSecretKey}"`;

      case "complete_session":
        return `curl -X POST "${baseUrl}/api/v1/checkout/sessions/${sessionId}/complete" \\
  -H "Authorization: Bearer ${activeSecretKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerPhone": "${customerPhone}",
    "customerEmail": "${payerEmail}",
    "paymentMethod": "mobile_money",
    "mobileOperator": "${mobileOperator}",
    "countryCode": "${countryCode}"
  }'`;

      case "refund_payment":
        return `curl -X POST "${baseUrl}/api/v1/payments/${paymentId}/refund" \\
  -H "Authorization: Bearer ${activeSecretKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": ${refundAmount},
    "reason": "${refundReason}"
  }'`;

      case "create_settlement":
        return `curl -X POST "${baseUrl}/api/v1/settlements" \\
  -H "Authorization: Bearer ${activeSecretKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "vendorId": "${vendorId}",
    "payoutAmount": ${payoutAmount},
    "bankName": "${bankName}",
    "accountNumber": "${accountNumber}"
  }'`;

      case "create_webhook":
        return `curl -X POST "${baseUrl}/api/v1/webhooks" \\
  -H "Authorization: Bearer ${activeSecretKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "${webhookUrl}",
    "events": ${JSON.stringify(selectedEvents)}
  }'`;

      default:
        return "";
    }
  };

  const getJavascriptSnippet = () => {
    switch (selectedEndpoint) {
      case "create_session":
        return `// Initialize Checkout Session
const response = await fetch("${baseUrl}/api/v1/checkout/sessions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    orderId: "${orderId}",
    itemName: "${itemName}",
    amount: ${amount},
    currency: "${currency}",
    successUrl: "https://yourdomain.com/success",
    cancelUrl: "https://yourdomain.com/cancel",
    vendorSplit: ${vendorSplit},
    payerName: "${payerName}",
    customerEmail: "${payerEmail}"
  })
});

const session = await response.json();
console.log("Session URL:", \`\${window.location.origin}/checkout/\${session.id}\`);`;

      case "retrieve_session":
        return `// Retrieve Session Telemetry Status
const response = await fetch("${baseUrl}/api/v1/checkout/sessions/${sessionId}", {
  method: "GET",
  headers: {
    "Authorization": "Bearer ${activeSecretKey}"
  }
});

const session = await response.json();
console.log("Payment Status:", session.status);`;

      case "complete_session":
        return `// Simulate Payment Confirmation Completion
const response = await fetch("${baseUrl}/api/v1/checkout/sessions/${sessionId}/complete", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    customerPhone: "${customerPhone}",
    customerEmail: "${payerEmail}",
    paymentMethod: "mobile_money",
    mobileOperator: "${mobileOperator}",
    countryCode: "${countryCode}"
  })
});

const result = await response.json();
console.log("Settled Ref:", result.ledgerRef);`;

      case "refund_payment":
        return `// Trigger Refund Reversal
const response = await fetch("${baseUrl}/api/v1/payments/${paymentId}/refund", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    amount: ${refundAmount},
    reason: "${refundReason}"
  })
});

const refund = await response.json();
console.log("Refund Succeeded:", refund.refund.id);`;

      case "create_settlement":
        return `// Dispatch Escrow Payout to Vendor Bank Account
const response = await fetch("${baseUrl}/api/v1/settlements", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    vendorId: "${vendorId}",
    payoutAmount: ${payoutAmount},
    bankName: "${bankName}",
    accountNumber: "${accountNumber}"
  })
});

const batch = await response.json();
console.log("Settlement Batch Status:", batch.status);`;

      case "create_webhook":
        return `// Register Secure Callback Endpoint
const response = await fetch("${baseUrl}/api/v1/webhooks", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "${webhookUrl}",
    events: ${JSON.stringify(selectedEvents)}
  })
});

const endpoint = await response.json();
console.log("Signing Secret:", endpoint.signingSecret);`;

      default:
        return "";
    }
  };

  const getPythonSnippet = () => {
    switch (selectedEndpoint) {
      case "create_session":
        return `import requests

url = "${baseUrl}/api/v1/checkout/sessions"
headers = {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
}
payload = {
    "orderId": "${orderId}",
    "itemName": "${itemName}",
    "amount": ${amount},
    "currency": "${currency}",
    "successUrl": "https://yourdomain.com/success",
    "cancelUrl": "https://yourdomain.com/cancel",
    "vendorSplit": ${vendorSplit},
    "payerName": "${payerName}",
    "customerEmail": "${payerEmail}"
}

response = requests.post(url, json=payload, headers=headers)
session = response.get_json()
print(f"Checkout Link: {url}/{session['id']}")`;

      case "retrieve_session":
        return `import requests

url = "${baseUrl}/api/v1/checkout/sessions/${sessionId}"
headers = {
    "Authorization": "Bearer ${activeSecretKey}"
}

response = requests.get(url, headers=headers)
session = response.get_json()
print("Session State:", session["status"])`;

      case "complete_session":
        return `import requests

url = "${baseUrl}/api/v1/checkout/sessions/${sessionId}/complete"
headers = {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
}
payload = {
    "customerPhone": "${customerPhone}",
    "customerEmail": "${payerEmail}",
    "paymentMethod": "mobile_money",
    "mobileOperator": "${mobileOperator}",
    "countryCode": "${countryCode}"
}

response = requests.post(url, json=payload, headers=headers)
result = response.get_json()
print("Ledger Reference:", result["ledgerRef"])`;

      case "refund_payment":
        return `import requests

url = "${baseUrl}/api/v1/payments/${paymentId}/refund"
headers = {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
}
payload = {
    "amount": ${refundAmount},
    "reason": "${refundReason}"
}

response = requests.post(url, json=payload, headers=headers)
refund = response.get_json()
print("Refund ID created:", refund["refund"]["id"])`;

      case "create_settlement":
        return `import requests

url = "${baseUrl}/api/v1/settlements"
headers = {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
}
payload = {
    "vendorId": "${vendorId}",
    "payoutAmount": ${payoutAmount},
    "bankName": "${bankName}",
    "accountNumber": "${accountNumber}"
}

response = requests.post(url, json=payload, headers=headers)
batch = response.get_json()
print("Settlement Batch Status:", batch["status"])`;

      case "create_webhook":
        return `import requests

url = "${baseUrl}/api/v1/webhooks"
headers = {
    "Authorization": "Bearer ${activeSecretKey}",
    "Content-Type": "application/json"
}
payload = {
    "url": "${webhookUrl}",
    "events": ${JSON.stringify(selectedEvents)}
}

response = requests.post(url, json=payload, headers=headers)
endpoint = response.get_json()
print("Webhook Signing Secret:", endpoint["signingSecret"])`;

      default:
        return "";
    }
  };

  const getActiveSnippet = () => {
    switch (selectedLanguage) {
      case "javascript":
        return getJavascriptSnippet();
      case "python":
        return getPythonSnippet();
      case "curl":
      default:
        return getCurlSnippet();
    }
  };

  const getLanguageLabel = () => {
    switch (selectedLanguage) {
      case "javascript":
        return "NodeJS Fetch";
      case "python":
        return "Python Requests";
      case "curl":
      default:
        return "cURL / Bash";
    }
  };

  const getPayloadSchema = () => {
    switch (selectedEndpoint) {
      case "create_session":
        return [
          { name: "orderId", type: "string", required: true, desc: "Unique external order ID, typically from merchant cart DB." },
          { name: "itemName", type: "string", required: true, desc: "Brief description of physical basket or SKU item." },
          { name: "amount", type: "number", required: true, desc: "Raw transaction value amount based in the selected currency's decimal scale." },
          { name: "currency", type: "string", required: false, desc: "Standard ISO 4217 Currency (XOF, USD, EUR, GHS, KES, XAF). Defaults to XOF." },
          { name: "vendorSplit", type: "number", required: false, desc: "The ratio split from 0.0 to 1.0 sent to vendor settlement wallet (Defaults to 0.8)." },
          { name: "payerName", type: "string", required: false, desc: "Optional name of the buyer client to preload on checkout fields." }
        ];
      case "retrieve_session":
        return [
          { name: "id", type: "string", required: true, desc: "The unique session identifier path prefix parameter (sess_...)." }
        ];
      case "complete_session":
        return [
          { name: "customerPhone", type: "string", required: true, desc: "The mobile money wallet target or payer authorization phone number." },
          { name: "paymentMethod", type: "string", required: true, desc: "Must be 'mobile_money' or 'bank_card' (Defaults to mobile_money)." },
          { name: "mobileOperator", type: "string", required: false, desc: "MNO slug (orange, wave, mtn, moov, free) depending on country code." },
          { name: "countryCode", type: "string", required: false, desc: "Alpha-2 code representing selected country (SN, CI, GH, NG, CM, KE)." }
        ];
      case "refund_payment":
        return [
          { name: "amount", type: "number", required: false, desc: "Partial or full amount to refund. If omitted, triggers complete reversal." },
          { name: "reason", type: "string", required: false, desc: "Reason logs detailing the trigger cause of this transaction refund." }
        ];
      case "create_settlement":
        return [
          { name: "vendorId", type: "string", required: true, desc: "Target wallet reference (v_01, v_02) that holds sufficient balances." },
          { name: "payoutAmount", type: "number", required: true, desc: "Amount in XOF to dispatch into bank clearing networks." },
          { name: "bankName", type: "string", required: true, desc: "Settlement financial institution name (e.g., Société Générale)." },
          { name: "accountNumber", type: "string", required: true, desc: "Full bank routing account or mobile phone number." }
        ];
      case "create_webhook":
        return [
          { name: "url", type: "string", required: true, desc: "Target absolute HTTPS URL to handle raw POST JSON events." },
          { name: "events", type: "string[]", required: true, desc: "Listening array (payment.succeeded, refund.processed, dispute.opened)." }
        ];
    }
  };

  const getSuccessResponseSample = () => {
    switch (selectedEndpoint) {
      case "create_session":
        return {
          id: "sess_77a91bf32f",
          orderId: orderId,
          itemName: itemName,
          amount: amount,
          currency: currency,
          status: "open",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          developerMerchantName: "DiaExpress Solutions",
          metadata: {
            vendorSplit: vendorSplit
          }
        };
      case "retrieve_session":
        return {
          id: sessionId,
          orderId: orderId,
          itemName: itemName,
          amount: amount,
          currency: currency,
          status: "completed",
          customerPhone: customerPhone,
          paymentMethod: "mobile_money",
          mobileOperator: mobileOperator,
          countryCode: countryCode,
          createdAt: "2026-07-05T12:00:00Z",
          expiresAt: "2026-07-05T12:30:00Z"
        };
      case "complete_session":
        return {
          status: "success",
          paymentId: "txn_" + Math.random().toString(36).substring(2, 10),
          session: {
            id: sessionId,
            orderId: orderId,
            status: "completed",
            customerPhone: customerPhone
          },
          ledgerRef: "TRX-SESS-" + sessionId.toUpperCase().substring(5)
        };
      case "refund_payment":
        return {
          status: "success",
          refund: {
            id: "ref_" + Math.random().toString(36).substring(2, 10),
            paymentId: paymentId,
            amount: refundAmount,
            currency: "XOF",
            reason: refundReason,
            status: "succeeded",
            createdAt: new Date().toISOString()
          },
          payment: {
            id: paymentId,
            amount: amount,
            status: "refunded"
          }
        };
      case "create_settlement":
        return {
          id: "batch_set_" + Math.random().toString(36).substring(2, 10),
          createdAt: new Date().toISOString(),
          vendorId: vendorId,
          vendorName: "DiaExpress Logistics",
          payoutAmount: payoutAmount,
          reserveHold: Math.round(payoutAmount * 0.135),
          currency: "XOF",
          status: "pending",
          bankName: bankName,
          accountNumber: accountNumber,
          reconciliationReference: "SET-REC-" + Math.random().toString(36).substring(2, 8).toUpperCase()
        };
      case "create_webhook":
        return {
          id: "wh_" + Math.random().toString(36).substring(2, 10),
          url: webhookUrl,
          events: selectedEvents,
          status: "active",
          signingSecret: "whsec_" + Math.random().toString(36).substring(2, 14),
          createdAt: new Date().toISOString()
        };
    }
  };

  const toggleEvent = (evt: string) => {
    setSelectedEvents(prev => 
      prev.includes(evt) 
        ? prev.filter(e => e !== evt)
        : [...prev, evt]
    );
  };

  return (
    <div id="api-documentation-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Selector and Request Payload Customization */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Endpoint Selector Widget */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
            <Server size={16} className="text-indigo-600" />
            <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider">
              1. Select Orchestration Endpoint
            </h4>
          </div>
          
          <div className="space-y-2">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint === ep.id;
              const isPost = ep.method === "POST";
              return (
                <button
                  key={ep.id}
                  id={`endpoint-doc-${ep.id}`}
                  onClick={() => setSelectedEndpoint(ep.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected 
                      ? "bg-indigo-50/40 border-indigo-200 shadow-3xs" 
                      : "bg-white hover:bg-slate-50 border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                      isPost 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate">{ep.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                    {ep.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials and Environment Setup */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Settings2 size={16} className="text-indigo-600" />
            <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider">
              2. Environment & Secret Keys
            </h4>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1.5 uppercase font-mono">
              Active Key Pair Context
            </label>
            <select
              id="doc-key-selector"
              value={selectedKeyPairId}
              onChange={(e) => setSelectedKeyPairId(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="default">Default Active Dashboard Key</option>
              {apiKeyPairs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status === "active" ? "Active" : "Rotated/Grace"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 bg-slate-900 rounded-xl p-3 text-[10px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span className="text-indigo-400">Environment:</span>
              <span className="text-emerald-400 font-bold uppercase">Sandbox Test</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-400">Secret Key:</span>
              <span className="text-slate-200 truncate select-all">{activeSecretKey.substring(0, 15)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-400">Base URL:</span>
              <span className="text-slate-200 select-all">{baseUrl}</span>
            </div>
          </div>
        </div>

        {/* Live Code Parameters Customization Form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Sliders size={16} className="text-indigo-600" />
            <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider">
              3. Request Payload Parameters
            </h4>
          </div>

          {selectedEndpoint === "create_session" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Order ID</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Product description</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="XOF">XOF (Franc CFA)</option>
                    <option value="GHS">GHS (Cedi)</option>
                    <option value="NGN">NGN (Naira)</option>
                    <option value="XAF">XAF (BEAC Franc)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Vendor Split</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={vendorSplit}
                    onChange={(e) => setVendorSplit(Number(e.target.value))}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payer Name</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payer Email</label>
                  <input
                    type="email"
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {(selectedEndpoint === "retrieve_session" || selectedEndpoint === "complete_session") && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Session Reference ID (sess_...)</label>
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {selectedEndpoint === "complete_session" && (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payer Wallet phone</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Mobile Operator</label>
                      <select
                        value={mobileOperator}
                        onChange={(e) => setMobileOperator(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
                      >
                        <option value="orange">Orange Money</option>
                        <option value="wave">Wave</option>
                        <option value="mtn">MTN MoMo</option>
                        <option value="moov">Moov Money</option>
                        <option value="free">Free Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Country Corridor</label>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
                      >
                        <option value="SN">Senegal (SN)</option>
                        <option value="CI">Ivory Coast (CI)</option>
                        <option value="GH">Ghana (GH)</option>
                        <option value="NG">Nigeria (NG)</option>
                        <option value="CM">Cameroon (CM)</option>
                        <option value="KE">Kenya (KE)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedEndpoint === "refund_payment" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payment ID</label>
                  <input
                    type="text"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Refund Amount (XOF)</label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Refund Reversal Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={2}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {selectedEndpoint === "create_settlement" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Vendor Wallet ID</label>
                  <input
                    type="text"
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payout Amount (XOF)</label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Settlement Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Bank Clearing Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          {selectedEndpoint === "create_webhook" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Callback Destination URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1.5 uppercase font-mono">
                  Callback Event Subscriptions
                </label>
                <div className="space-y-1.5">
                  {[
                    "payment.succeeded",
                    "refund.processed",
                    "dispute.opened"
                  ].map(evt => {
                    const isChecked = selectedEvents.includes(evt);
                    return (
                      <label key={evt} className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEvent(evt)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="font-mono text-[10.5px]">{evt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Column: Code Snippets & Response Sample */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Code Snippet Preview Container */}
        <div className="border border-slate-100 bg-white rounded-2xl overflow-hidden shadow-xs flex flex-col">
          
          {/* Header language tabs */}
          <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-indigo-600" />
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Generated {getLanguageLabel()} Code Snippet
              </h4>
            </div>
            
            <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-xl shrink-0">
              {[
                { id: "curl" as const, label: "cURL" },
                { id: "javascript" as const, label: "Node.js" },
                { id: "python" as const, label: "Python" }
              ].map(lang => (
                <button
                  key={lang.id}
                  id={`lang-tab-${lang.id}`}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedLanguage === lang.id
                      ? "bg-white text-gray-900 shadow-2xs font-extrabold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Snippet box */}
          <div className="p-5 bg-slate-950 font-mono text-[11px] text-slate-200 overflow-x-auto relative group max-h-[350px]">
            <button
              id="copy-doc-snippet-btn"
              type="button"
              onClick={() => triggerCopy(getActiveSnippet(), "api_doc_snippet")}
              className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-900 border border-slate-800 p-2 rounded-xl transition"
              title="Copy Code Snippet"
            >
              {copiedKey === "api_doc_snippet" ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
            <pre className="pr-12 text-slate-300 leading-relaxed whitespace-pre">
              {getActiveSnippet()}
            </pre>
          </div>

          <div className="bg-slate-50 border-t border-gray-100 px-4 py-2.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Info size={11} className="text-indigo-500 shrink-0" />
              This endpoint requires your authorization key pair context to run in production.
            </span>
            <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
              {endpoints.find(e => e.id === selectedEndpoint)?.method}
            </span>
          </div>
        </div>

        {/* Payload Schema & Response Payload Sample */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Request Fields Schema */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-50 mb-3">
                <Database size={14} className="text-indigo-600" />
                <h5 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider">
                  Request Parameters
                </h5>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto scrolling-scrollbar text-[11px]">
                {getPayloadSchema()?.map(param => (
                  <div key={param.name} className="border-b border-slate-50 pb-2 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-900">{param.name}</span>
                      <span className="text-[9px] font-mono text-gray-400">{param.type}</span>
                      {param.required ? (
                        <span className="text-[8px] font-bold text-red-500 uppercase tracking-wide">Required</span>
                      ) : (
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-wide">Optional</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">{param.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[9.5px] text-slate-400 font-medium mt-3 pt-2.5 border-t border-slate-50/80 flex items-center gap-1">
              <span>💡</span>
              <span>Input variables left will update parameters live in snippet.</span>
            </div>
          </div>

          {/* Sample Response Payload JSON */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-50 mb-3">
              <Braces size={14} className="text-indigo-600 animate-pulse" />
              <h5 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider">
                Expected 200 OK Response
              </h5>
            </div>

            <div className="flex-1 bg-slate-900 rounded-xl p-3.5 font-mono text-[10px] text-indigo-300 overflow-x-auto max-h-[220px] scrolling-scrollbar relative">
              <button
                id="copy-sample-response-btn"
                type="button"
                onClick={() => triggerCopy(JSON.stringify(getSuccessResponseSample(), null, 2), "sample_response")}
                className="absolute top-2 right-2 text-slate-500 hover:text-white bg-slate-800 border border-slate-700 p-1 rounded-md transition"
                title="Copy Response Body"
              >
                {copiedKey === "sample_response" ? (
                  <CheckCircle2 size={11} className="text-green-400" />
                ) : (
                  <Copy size={11} />
                )}
              </button>
              <pre className="pr-5 text-indigo-200">
                {JSON.stringify(getSuccessResponseSample(), null, 2)}
              </pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
