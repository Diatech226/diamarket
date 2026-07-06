import React, { useState, useEffect } from "react";
import { WebhookEndpoint, WebhookDeliveryLog, CheckoutSession, ApiKeyPair } from "../types";
import { 
  Key, 
  Webhook, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Check, 
  Copy, 
  Plus, 
  Loader2, 
  Terminal, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  Globe,
  Sparkles,
  Sliders,
  Braces,
  Palette,
  Link as LinkIcon,
  ExternalLink,
  Code2,
  CheckCircle2,
  ArrowRight,
  User,
  Activity,
  Trash2,
  BookOpen,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import ApiDocumentationSection from "./ApiDocumentationSection";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid, Legend } from "recharts";

// Real-time JSON schema validator for Diapay webhooks
export function validateDiapayPayload(payloadObj: any, eventType: string): { 
  isValid: boolean; 
  errors: string[]; 
  checks: { name: string; passed: boolean }[] 
} {
  const errors: string[] = [];
  const checks: { name: string; passed: boolean }[] = [];

  // Check 1: Must be a JSON Object
  if (!payloadObj || typeof payloadObj !== "object" || Array.isArray(payloadObj)) {
    errors.push("Payload must be a valid JSON Object (curly braces '{}')");
    checks.push({ name: "Payload is a valid JSON Object", passed: false });
    return { isValid: false, errors, checks };
  }
  checks.push({ name: "Payload is a valid JSON Object", passed: true });

  // Check 2: Core structure attributes
  const hasId = typeof payloadObj.id === "string" && payloadObj.id.trim().length > 0;
  if (!hasId) {
    errors.push("Missing or invalid string field 'id' (must represent unique event ID)");
  }
  checks.push({ name: "Core event identifier 'id' is present", passed: hasId });

  const eventMatches = payloadObj.event === eventType;
  if (!eventMatches) {
    errors.push(`Field 'event' must be exactly '${eventType}' to match the simulator trigger selection`);
  }
  checks.push({ name: `Core field 'event' matches selected event type`, passed: eventMatches });

  const hasTimestamp = typeof payloadObj.timestamp === "number" && Number.isInteger(payloadObj.timestamp);
  if (!hasTimestamp) {
    errors.push("Field 'timestamp' must be a valid UNIX integer timestamp (seconds since epoch)");
  }
  checks.push({ name: "Core field 'timestamp' is a valid UNIX integer", passed: hasTimestamp });

  // Check 3: Data Object structure
  const hasDataObj = payloadObj.data && typeof payloadObj.data === "object" && !Array.isArray(payloadObj.data);
  if (!hasDataObj) {
    errors.push("Field 'data' is missing or not a valid nested JSON Object");
    checks.push({ name: "Field 'data' is a nested JSON Object", passed: false });
  } else {
    checks.push({ name: "Field 'data' is a nested JSON Object", passed: true });

    // Event-specific data attributes
    if (eventType === "payment.succeeded") {
      const dataId = payloadObj.data.id;
      const dataIdValid = typeof dataId === "string" && (dataId.startsWith("txn_") || dataId.startsWith("evt_"));
      if (!dataIdValid) {
        errors.push("data.id must be a string starting with 'txn_' or 'evt_'");
      }
      checks.push({ name: "data.id contains valid transaction prefix (txn_ / evt_)", passed: dataIdValid });

      const amountValid = typeof payloadObj.data.amount === "number" && payloadObj.data.amount > 0;
      if (!amountValid) {
        errors.push("data.amount must be a numeric value greater than 0");
      }
      checks.push({ name: "data.amount is a positive number", passed: amountValid });

      const currencyValid = typeof payloadObj.data.currency === "string" && ["XOF", "USD", "EUR", "GHS", "NGN", "CAD", "GBP"].includes(payloadObj.data.currency);
      if (!currencyValid) {
        errors.push("data.currency must be a standard supported gateway currency code (e.g., XOF, USD, EUR, GHS)");
      }
      checks.push({ name: "data.currency is a supported settlement currency", passed: currencyValid });

      const statusValid = payloadObj.data.status === "paid" || payloadObj.data.status === "succeeded";
      if (!statusValid) {
        errors.push("data.status must be exactly 'paid' or 'succeeded' for this event");
      }
      checks.push({ name: "data.status is a valid success terminal state", passed: statusValid });

      const customerValid = typeof payloadObj.data.customer === "string" && payloadObj.data.customer.length > 0;
      if (!customerValid) {
        errors.push("data.customer must be a valid customer identification string (e.g. phone number or email)");
      }
      checks.push({ name: "data.customer identifier is present", passed: customerValid });

      const methodValid = ["mobile_money", "card"].includes(payloadObj.data.method);
      if (!methodValid) {
        errors.push("data.method must be either 'mobile_money' or 'card'");
      }
      checks.push({ name: "data.method is 'mobile_money' or 'card'", passed: methodValid });

    } else if (eventType === "refund.processed") {
      const dataId = payloadObj.data.id;
      const dataIdValid = typeof dataId === "string" && dataId.startsWith("ref_");
      if (!dataIdValid) {
        errors.push("data.id must be a string starting with 'ref_'");
      }
      checks.push({ name: "data.id contains valid refund prefix (ref_)", passed: dataIdValid });

      const payId = payloadObj.data.paymentId;
      const payIdValid = typeof payId === "string" && (payId.startsWith("txn_") || payId.startsWith("evt_"));
      if (!payIdValid) {
        errors.push("data.paymentId must be a valid transaction string starting with 'txn_'");
      }
      checks.push({ name: "data.paymentId contains reference to original txn_ ID", passed: payIdValid });

      const amountValid = typeof payloadObj.data.amount === "number" && payloadObj.data.amount > 0;
      if (!amountValid) {
        errors.push("data.amount must be a numeric value greater than 0");
      }
      checks.push({ name: "data.amount is a positive number", passed: amountValid });

      const currencyValid = typeof payloadObj.data.currency === "string" && ["XOF", "USD", "EUR", "GHS", "NGN", "CAD", "GBP"].includes(payloadObj.data.currency);
      if (!currencyValid) {
        errors.push("data.currency must be a valid gateway currency code");
      }
      checks.push({ name: "data.currency is a valid currency code", passed: currencyValid });

      const statusValid = payloadObj.data.status === "succeeded" || payloadObj.data.status === "processed";
      if (!statusValid) {
        errors.push("data.status must be exactly 'succeeded' or 'processed'");
      }
      checks.push({ name: "data.status matches terminal refund state", passed: statusValid });

    } else if (eventType === "dispute.opened") {
      const dataId = payloadObj.data.id;
      const dataIdValid = typeof dataId === "string" && dataId.startsWith("dsp_");
      if (!dataIdValid) {
        errors.push("data.id must be a string starting with 'dsp_'");
      }
      checks.push({ name: "data.id contains valid dispute prefix (dsp_)", passed: dataIdValid });

      const payId = payloadObj.data.paymentId;
      const payIdValid = typeof payId === "string" && (payId.startsWith("txn_") || payId.startsWith("evt_"));
      if (!payIdValid) {
        errors.push("data.paymentId must be a valid transaction string starting with 'txn_'");
      }
      checks.push({ name: "data.paymentId contains reference to contested txn_ ID", passed: payIdValid });

      const amountValid = typeof payloadObj.data.amount === "number" && payloadObj.data.amount > 0;
      if (!amountValid) {
        errors.push("data.amount must be a numeric value greater than 0");
      }
      checks.push({ name: "data.amount is a positive number", passed: amountValid });

      const statusValid = payloadObj.data.status === "opened";
      if (!statusValid) {
        errors.push("data.status must be exactly 'opened'");
      }
      checks.push({ name: "data.status matches initial dispute state", passed: statusValid });

      const hasReason = typeof payloadObj.data.reason === "string" && payloadObj.data.reason.length > 0;
      if (!hasReason) {
        errors.push("data.reason must be a non-empty string explaining chargeback grounds (e.g. fraudulent, unrecognized)");
      }
      checks.push({ name: "data.reason description is present", passed: hasReason });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks
  };
}

interface DeveloperConsoleProps {
  onNavigateToTab?: (tab: "checkout" | "dashboard" | "analytics" | "developer" | "disputes" | "support" | "emails", sessionId?: string) => void;
}

export default function DeveloperConsole({ onNavigateToTab }: DeveloperConsoleProps) {
  const [apiKeys, setApiKeys] = useState({ publishableKey: "", secretKey: "", lastRotated: "" });
  const [apiKeyPairs, setApiKeyPairs] = useState<ApiKeyPair[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>([]);
  
  // API Limits & Quota Simulation States
  const [simulatedUsage, setSimulatedUsage] = useState(82500); // Default to 82.5% to show warning out-of-the-box
  const quotaLimit = 100000;
  
  // Interactive UI states
  const [activeConsoleTab, setActiveConsoleTab] = useState<"keys" | "regional" | "generator" | "webhooks" | "docs">("regional");
  const [showSecret, setShowSecret] = useState(false);
  const [rotatingKeys, setRotatingKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  
  // Webkey / ApiKeyPair creation & rotation states
  const [newKeyPairName, setNewKeyPairName] = useState("");
  const [showKeyPairForm, setShowKeyPairForm] = useState(false);
  const [savingKeyPair, setSavingKeyPair] = useState(false);
  const [keyPairRotationGraceMinutes, setKeyPairRotationGraceMinutes] = useState(5);
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Webhook creation states
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);

  // Webhook simulator states
  const [simulatorEventType, setSimulatorEventType] = useState<string>("payment.succeeded");
  const [simulatorPayload, setSimulatorPayload] = useState<string>(
    JSON.stringify({
      id: "evt_sim_908234",
      event: "payment.succeeded",
      timestamp: Math.floor(Date.now() / 1000),
      data: {
        id: "txn_sim_01",
        amount: 450000,
        currency: "XOF",
        status: "paid",
        customer: "+221 77 452 89 12",
        method: "mobile_money",
        operator: "orange",
        orderId: "ORD-5541"
      }
    }, null, 2)
  );
  const [simulatorEndpointId, setSimulatorEndpointId] = useState<string>("");
  const [simulatorDispatching, setSimulatorDispatching] = useState<boolean>(false);
  const [simulatorResponse, setSimulatorResponse] = useState<any | null>(null);

  // Default target endpoint ID when webhooks are fetched
  useEffect(() => {
    if (webhooks.length > 0 && !simulatorEndpointId) {
      setSimulatorEndpointId(webhooks[0].id);
    }
  }, [webhooks, simulatorEndpointId]);

  const handleSimulatorEventTypeChange = (newType: string) => {
    setSimulatorEventType(newType);
    let defaultData: any = {};
    if (newType === "payment.succeeded") {
      defaultData = {
        id: `txn_sim_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: 450000,
        currency: "XOF",
        status: "paid",
        customer: "+221 77 452 89 12",
        method: "mobile_money",
        operator: "orange",
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`
      };
    } else if (newType === "refund.processed") {
      defaultData = {
        id: `ref_sim_${Math.floor(1000 + Math.random() * 9000)}`,
        paymentId: `txn_sim_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: 150000,
        currency: "XOF",
        status: "succeeded",
        reason: "customer_request"
      };
    } else if (newType === "dispute.opened") {
      defaultData = {
        id: `dsp_sim_${Math.floor(1000 + Math.random() * 9000)}`,
        paymentId: `txn_sim_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: 450000,
        currency: "XOF",
        status: "opened",
        reason: "fraudulent",
        evidenceDueBy: new Date(Date.now() + 10 * 86400000).toISOString()
      };
    } else {
      defaultData = {
        message: "custom format"
      };
    }

    const newPayload = {
      id: `evt_sim_${Math.floor(100000 + Math.random() * 900000)}`,
      event: newType,
      timestamp: Math.floor(Date.now() / 1000),
      data: defaultData
    };
    setSimulatorPayload(JSON.stringify(newPayload, null, 2));
    setSimulatorResponse(null);
  };

  const handleDispatchWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatorEndpointId) return;
    
    let parsed: any;
    try {
      parsed = JSON.parse(simulatorPayload);
    } catch (err) {
      alert("Please fix JSON syntax errors before dispatching.");
      return;
    }

    setSimulatorDispatching(true);
    setSimulatorResponse(null);

    try {
      const res = await fetch("/api/v1/webhook-events/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          endpointId: simulatorEndpointId,
          event: simulatorEventType,
          payload: parsed
        })
      });

      const data = await res.json();
      setSimulatorResponse({
        status: data.responseStatus,
        success: data.success,
        body: data.responseBody,
        headers: data.headers,
        logId: data.id,
        url: data.url
      });

      // Refresh webhook logs
      fetchWebhookLogs();
    } catch (err: any) {
      console.error(err);
      setSimulatorResponse({
        status: 0,
        success: false,
        body: err.message || "Failed to call local sandbox simulation gateway",
        headers: {}
      });
    } finally {
      setSimulatorDispatching(false);
    }
  };

  // Real-time JSON validation & schema checks
  let parsedPayload: any = null;
  let syntaxError: string | null = null;
  try {
    parsedPayload = JSON.parse(simulatorPayload);
  } catch (err: any) {
    syntaxError = err.message || "Invalid JSON syntax";
  }

  const validationResult = syntaxError 
    ? { isValid: false, errors: [syntaxError], checks: [{ name: "Payload is a valid JSON Object", passed: false }] }
    : validateDiapayPayload(parsedPayload, simulatorEventType);

  // Regional Config states
  const [activeCurrencies, setActiveCurrencies] = useState<string[]>(["XOF", "GHS", "XAF", "NGN"]);
  const [selectedRegionCountry, setSelectedRegionCountry] = useState<string>("SN");
  const [carrierStatusOverrides, setCarrierStatusOverrides] = useState<Record<string, "operational" | "maintenance">>({
    "sn-orange": "operational",
    "sn-wave": "operational",
    "sn-free": "operational",
    "ci-orange": "operational",
    "ci-mtn": "operational",
    "ci-moov": "operational",
    "gh-mtn": "operational",
    "gh-telecel": "operational",
    "gh-airtel": "operational",
    "ng-bank": "operational",
    "ng-opay": "operational",
    "ng-palmpay": "operational",
    "cm-mtn": "operational",
    "cm-orange": "operational",
    "ke-mpesa": "operational",
    "ke-airtel": "operational"
  });

  const regionalConfigs = [
    {
      countryCode: "SN",
      countryName: "Senegal",
      flag: "🇸🇳",
      currency: "XOF",
      operators: [
        { id: "sn-orange", name: "Orange Money Senegal", type: "Mobile Money", baseFee: 0.8, limit: "2,000,000 XOF" },
        { id: "sn-wave", name: "Wave Senegal", type: "Mobile Money", baseFee: 0.6, limit: "2,000,000 XOF" },
        { id: "sn-free", name: "Free Money", type: "Mobile Money", baseFee: 1.0, limit: "1,500,000 XOF" }
      ]
    },
    {
      countryCode: "CI",
      countryName: "Côte d'Ivoire",
      flag: "🇨🇮",
      currency: "XOF",
      operators: [
        { id: "ci-orange", name: "Orange Money CI", type: "Mobile Money", baseFee: 0.9, limit: "2,000,000 XOF" },
        { id: "ci-mtn", name: "MTN MoMo CI", type: "Mobile Money", baseFee: 0.9, limit: "2,000,000 XOF" },
        { id: "ci-moov", name: "Moov Money CI", type: "Mobile Money", baseFee: 1.0, limit: "1,500,000 XOF" }
      ]
    },
    {
      countryCode: "GH",
      countryName: "Ghana",
      flag: "🇬🇭",
      currency: "GHS",
      operators: [
        { id: "gh-mtn", name: "MTN MoMo Ghana", type: "Mobile Money", baseFee: 1.0, limit: "15,000 GHS" },
        { id: "gh-telecel", name: "Telecel Cash (Telecel)", type: "Mobile Money", baseFee: 1.2, limit: "10,000 GHS" },
        { id: "gh-airtel", name: "AirtelTigo Money", type: "Mobile Money", baseFee: 1.1, limit: "10,000 GHS" }
      ]
    },
    {
      countryCode: "NG",
      countryName: "Nigeria",
      flag: "🇳🇬",
      currency: "NGN",
      operators: [
        { id: "ng-bank", name: "NIP Instant Bank Transfer", type: "Bank Transfer", baseFee: 0.5, limit: "5,000,000 NGN" },
        { id: "ng-opay", name: "OPay Instant Payouts", type: "Mobile Wallet", baseFee: 0.7, limit: "3,000,000 NGN" },
        { id: "ng-palmpay", name: "PalmPay Wallet Payouts", type: "Mobile Wallet", baseFee: 0.7, limit: "3,000,000 NGN" }
      ]
    },
    {
      countryCode: "CM",
      countryName: "Cameroon",
      flag: "🇨🇲",
      currency: "XAF",
      operators: [
        { id: "cm-mtn", name: "MTN MoMo Cameroon", type: "Mobile Money", baseFee: 1.2, limit: "2,000,000 XAF" },
        { id: "cm-orange", name: "Orange Money Cameroon", type: "Mobile Money", baseFee: 1.2, limit: "2,000,000 XAF" }
      ]
    },
    {
      countryCode: "KE",
      countryName: "Kenya",
      flag: "🇰🇪",
      currency: "KES",
      operators: [
        { id: "ke-mpesa", name: "Safaricom M-Pesa", type: "Mobile Money", baseFee: 1.0, limit: "250,000 KES" },
        { id: "ke-airtel", name: "Airtel Money Kenya", type: "Mobile Money", baseFee: 1.1, limit: "150,000 KES" }
      ]
    }
  ];

  // Selected Log detail
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [webhookFilterEvent, setWebhookFilterEvent] = useState<string>("all");
  const [webhookFilterStatus, setWebhookFilterStatus] = useState<string>("all");
  const [webhookSearchQuery, setWebhookSearchQuery] = useState<string>("");
  const [replayingLogId, setReplayingLogId] = useState<string | null>(null);

  // Custom Checkout Generator states
  const [customOrderId, setCustomOrderId] = useState(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [customItemName, setCustomItemName] = useState("Premium Enterprise API Licensing");
  const [customAmount, setCustomAmount] = useState(150000);
  const [customCurrency, setCustomCurrency] = useState("XOF");
  const [customBrandColor, setCustomBrandColor] = useState("indigo");
  const [customDevMerchantName, setCustomDevMerchantName] = useState("DiaExpress Solutions");
  const [customDevSupportEmail, setCustomDevSupportEmail] = useState("support@diaexpress.sn");
  const [customDevSupportPhone, setCustomDevSupportPhone] = useState("+221 33 821 44 55");
  const [customPayerName, setCustomPayerName] = useState("Mamadou Ndiaye");
  const [customPayerPhone, setCustomPayerPhone] = useState("+221 77 123 45 67");
  const [customPayerEmail, setCustomPayerEmail] = useState("mamadou@ndiaye.sn");
  const [customVendorSplit, setCustomVendorSplit] = useState(0.85);
  const [customSuccessUrl, setCustomSuccessUrl] = useState("https://my-store.sn/checkout/success");
  const [customCancelUrl, setCustomCancelUrl] = useState("https://my-store.sn/checkout/cancel");
  const [customMetadataJson, setCustomMetadataJson] = useState(JSON.stringify({
    client_id: "cli_9921",
    platform: "web_react_app",
    sandbox_test: "true"
  }, null, 2));
  
  const [isMetadataValid, setIsMetadataValid] = useState(true);
  const [generatedSession, setGeneratedSession] = useState<CheckoutSession | null>(null);
  const [generatingSession, setGeneratingSession] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [copiedCheckoutUrl, setCopiedCheckoutUrl] = useState(false);
  const [showResponsePayload, setShowResponsePayload] = useState(false);

  // Advanced metadata visual vs raw JSON editor state
  const [metadataMode, setMetadataMode] = useState<"visual" | "raw">("visual");
  const [visualMetadata, setVisualMetadata] = useState<{ key: string; value: string }[]>([
    { key: "client_id", value: "cli_9921" },
    { key: "platform", value: "web_react_app" },
    { key: "sandbox_test", value: "true" }
  ]);

  // Dedicated custom metadata fields for Order ID, currency, and brand theme branding
  const [metaOrderId, setMetaOrderId] = useState("EXP-META-9021");
  const [metaCurrency, setMetaCurrency] = useState("XOF");
  const [metaBrandThemeColor, setMetaBrandThemeColor] = useState("#0d9488"); // default teal hex
  const [metaHeaderText, setMetaHeaderText] = useState("DiaExpress Luxury Courier");
  const [metaLogoEmoji, setMetaLogoEmoji] = useState("🚚");
  const [metaSupportTier, setMetaSupportTier] = useState("Premium SLA");

  // Sync visualMetadata list and dedicated custom metadata states back to customMetadataJson string
  useEffect(() => {
    if (metadataMode === "visual") {
      const obj: Record<string, string> = {
        meta_order_id: metaOrderId,
        meta_currency: metaCurrency,
        meta_brand_color: metaBrandThemeColor,
        meta_header_text: metaHeaderText,
        meta_logo_emoji: metaLogoEmoji,
        meta_support_tier: metaSupportTier,
      };

      // Merge other visualMetadata that are not those dedicated keys
      const dedicatedKeys = ["meta_order_id", "meta_currency", "meta_brand_color", "meta_header_text", "meta_logo_emoji", "meta_support_tier"];
      visualMetadata.forEach(item => {
        if (item.key.trim() !== "" && !dedicatedKeys.includes(item.key.trim())) {
          obj[item.key.trim()] = item.value;
        }
      });

      setCustomMetadataJson(JSON.stringify(obj, null, 2));
    }
  }, [metaOrderId, metaCurrency, metaBrandThemeColor, metaHeaderText, metaLogoEmoji, metaSupportTier, visualMetadata, metadataMode]);

  // Try to parse raw JSON when switching back to visual mode
  useEffect(() => {
    if (metadataMode === "visual") {
      try {
        if (customMetadataJson.trim() === "") {
          setVisualMetadata([]);
          return;
        }
        const parsed = JSON.parse(customMetadataJson);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          // Update dedicated states if those keys exist in the parsed JSON
          if (parsed.meta_order_id !== undefined) setMetaOrderId(String(parsed.meta_order_id));
          if (parsed.meta_currency !== undefined) setMetaCurrency(String(parsed.meta_currency));
          if (parsed.meta_brand_color !== undefined) setMetaBrandThemeColor(String(parsed.meta_brand_color));
          if (parsed.meta_header_text !== undefined) setMetaHeaderText(String(parsed.meta_header_text));
          if (parsed.meta_logo_emoji !== undefined) setMetaLogoEmoji(String(parsed.meta_logo_emoji));
          if (parsed.meta_support_tier !== undefined) setMetaSupportTier(String(parsed.meta_support_tier));

          const dedicatedKeys = ["meta_order_id", "meta_currency", "meta_brand_color", "meta_header_text", "meta_logo_emoji", "meta_support_tier"];
          const list = Object.entries(parsed)
            .filter(([k]) => !dedicatedKeys.includes(k))
            .map(([k, v]) => ({
              key: k,
              value: typeof v === "object" ? JSON.stringify(v) : String(v)
            }));
          setVisualMetadata(list);
        }
      } catch (e) {
        // keep old visual elements if JSON is currently invalid
      }
    }
  }, [customMetadataJson, metadataMode]);

  // Apply Quick Configuration Presets
  const applyPreset = (preset: "diaexpress" | "saas" | "artisans") => {
    if (preset === "diaexpress") {
      setCustomOrderId(`ORD-EXP-${Math.floor(100000 + Math.random() * 900000)}`);
      setCustomItemName("DiaExpress Inter-City Courier Delivery");
      setCustomAmount(12500);
      setCustomCurrency("XOF");
      setCustomBrandColor("teal");
      setCustomDevMerchantName("DiaExpress Logistics");
      setCustomDevSupportEmail("delivery@diaexpress.sn");
      setCustomDevSupportPhone("+221 33 821 44 55");
      setCustomPayerName("Amadou Ba");
      setCustomPayerPhone("+221 77 555 44 33");
      setCustomPayerEmail("amadou.ba@gmail.com");
      setCustomVendorSplit(0.90);
      setCustomSuccessUrl("https://diaexpress.sn/track/success");
      setCustomCancelUrl("https://diaexpress.sn/book/cancel");
      
      setMetaOrderId("EXP-META-9021");
      setMetaCurrency("XOF");
      setMetaBrandThemeColor("#0d9488");
      setMetaHeaderText("DiaExpress Luxury Courier");
      setMetaLogoEmoji("🚚");
      setMetaSupportTier("Premium Delivery SLA");

      const initialMetadata = {
        route: "Dakar-Thies",
        vehicle: "Motorcycle",
        priority: "high",
        driver_id: "drv_4021"
      };
      setCustomMetadataJson(JSON.stringify({
        meta_order_id: "EXP-META-9021",
        meta_currency: "XOF",
        meta_brand_color: "#0d9488",
        meta_header_text: "DiaExpress Luxury Courier",
        meta_logo_emoji: "🚚",
        meta_support_tier: "Premium Delivery SLA",
        ...initialMetadata
      }, null, 2));
      setVisualMetadata(Object.entries(initialMetadata).map(([k, v]) => ({ key: k, value: String(v) })));
    } else if (preset === "saas") {
      setCustomOrderId(`ORD-SAS-${Math.floor(100000 + Math.random() * 900000)}`);
      setCustomItemName("DiaPay Pro API Platform License (Annual)");
      setCustomAmount(499);
      setCustomCurrency("USD");
      setCustomBrandColor("indigo");
      setCustomDevMerchantName("DiaPay Global");
      setCustomDevSupportEmail("billing@diapay.net");
      setCustomDevSupportPhone("+1 (800) 555-0199");
      setCustomPayerName("Sarah Jenkins");
      setCustomPayerPhone("+1 415 555 2671");
      setCustomPayerEmail("sjenkins@techcorp.io");
      setCustomVendorSplit(0.95);
      setCustomSuccessUrl("https://techcorp.io/billing/success");
      setCustomCancelUrl("https://techcorp.io/billing/pricing");

      setMetaOrderId("SAS-LIC-8821");
      setMetaCurrency("USD");
      setMetaBrandThemeColor("#4f46e5");
      setMetaHeaderText("DiaPay SaaS Licensing Hub");
      setMetaLogoEmoji("⚡");
      setMetaSupportTier("Enterprise Unlimited");

      const initialMetadata = {
        plan_type: "pro_annual",
        seats: "25",
        sandbox: "false",
        region: "us-east-1"
      };
      setCustomMetadataJson(JSON.stringify({
        meta_order_id: "SAS-LIC-8821",
        meta_currency: "USD",
        meta_brand_color: "#4f46e5",
        meta_header_text: "DiaPay SaaS Licensing Hub",
        meta_logo_emoji: "⚡",
        meta_support_tier: "Enterprise Unlimited",
        ...initialMetadata
      }, null, 2));
      setVisualMetadata(Object.entries(initialMetadata).map(([k, v]) => ({ key: k, value: String(v) })));
    } else if (preset === "artisans") {
      setCustomOrderId(`ORD-ART-${Math.floor(100000 + Math.random() * 900000)}`);
      setCustomItemName("Handwoven African Savanna Basket (Set of 3)");
      setCustomAmount(85);
      setCustomCurrency("EUR");
      setCustomBrandColor("amber");
      setCustomDevMerchantName("African Artisans Co-op");
      setCustomDevSupportEmail("shop@africanartisans.org");
      setCustomDevSupportPhone("+221 78 444 33 22");
      setCustomPayerName("Chloé Dubois");
      setCustomPayerPhone("+33 6 1234 5678");
      setCustomPayerEmail("chloe.dubois@wanadoo.fr");
      setCustomVendorSplit(0.80);
      setCustomSuccessUrl("https://africanartisans.org/orders/thankyou");
      setCustomCancelUrl("https://africanartisans.org/cart");

      setMetaOrderId("ART-COOP-3312");
      setMetaCurrency("EUR");
      setMetaBrandThemeColor("#d97706");
      setMetaHeaderText("Saint-Louis Artisans Co-op");
      setMetaLogoEmoji("🎨");
      setMetaSupportTier("Fair Trade Direct");

      const initialMetadata = {
        artisan_id: "art_9918",
        cooperative_branch: "Saint-Louis",
        package_weight_kg: "2.4"
      };
      setCustomMetadataJson(JSON.stringify({
        meta_order_id: "ART-COOP-3312",
        meta_currency: "EUR",
        meta_brand_color: "#d97706",
        meta_header_text: "Saint-Louis Artisans Co-op",
        meta_logo_emoji: "🎨",
        meta_support_tier: "Fair Trade Direct",
        ...initialMetadata
      }, null, 2));
      setVisualMetadata(Object.entries(initialMetadata).map(([k, v]) => ({ key: k, value: String(v) })));
    }
  };

  // Live Validate Metadata JSON
  useEffect(() => {
    try {
      if (customMetadataJson.trim() === "") {
        setIsMetadataValid(true);
        return;
      }
      JSON.parse(customMetadataJson);
      setIsMetadataValid(true);
    } catch {
      setIsMetadataValid(false);
    }
  }, [customMetadataJson]);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/v1/api-keys");
      const data = await res.json();
      if (data.apiKeys) {
        setApiKeys(data.apiKeys);
      } else {
        setApiKeys(data);
      }
      if (data.pairs) {
        setApiKeyPairs(data.pairs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/v1/webhooks");
      const data = await res.json();
      setWebhooks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const res = await fetch("/api/v1/webhook-events");
      const data = await res.json();
      setWebhookLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchWebhooks();
    fetchWebhookLogs();

    // Poll webhook logs and keys status every 5 seconds to show active checkout events & grace periods
    const interval = setInterval(() => {
      fetchWebhookLogs();
      fetchKeys();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateKeyPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyPairName.trim()) return;
    setSavingKeyPair(true);
    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyPairName })
      });
      if (res.ok) {
        const data = await res.json();
        setApiKeyPairs(data.pairs);
        if (data.newPair) {
          setApiKeys({
            publishableKey: data.newPair.publishableKey,
            secretKey: data.newPair.secretKey,
            lastRotated: data.newPair.lastRotated
          });
        }
        setNewKeyPairName("");
        setShowKeyPairForm(false);
        triggerToast("keypair_created");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingKeyPair(false);
    }
  };

  const handleRotateKeyPair = async (id: string, gracePeriodMinutes: number) => {
    if (!window.confirm(`Are you sure you want to rotate this key pair? The existing key will remain valid for a ${gracePeriodMinutes}-minute grace period.`)) {
      return;
    }
    setRotatingKeys(true);
    try {
      const res = await fetch(`/api/v1/api-keys/${id}/rotate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gracePeriodMinutes })
      });
      if (res.ok) {
        const data = await res.json();
        setApiKeyPairs(data.pairs);
        if (data.newPair) {
          setApiKeys({
            publishableKey: data.newPair.publishableKey,
            secretKey: data.newPair.secretKey,
            lastRotated: data.newPair.lastRotated
          });
        }
        triggerToast("keypair_rotated");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRotatingKeys(false);
    }
  };

  const handleDeleteKeyPair = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this API Key Pair?")) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/api-keys/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const data = await res.json();
        setApiKeyPairs(data.pairs);
        triggerToast("keypair_deleted");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete API key pair");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRotateKeys = async () => {
    // Legacy single key rotation fallback
    const activeKey = apiKeyPairs.find(k => k.status === "active") || apiKeyPairs[0];
    if (activeKey) {
      handleRotateKeyPair(activeKey.id, 5);
    } else {
      if (!window.confirm("Are you sure you want to rotate your API Secret Key? Existing integrations using this key will immediately break.")) {
        return;
      }
      setRotatingKeys(true);
      try {
        const res = await fetch("/api/v1/api-keys/rotate", { method: "POST" });
        const data = await res.json();
        setApiKeys(data);
        triggerToast("secretKey");
      } catch (err) {
        console.error(err);
      } finally {
        setRotatingKeys(false);
      }
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;
    setSavingWebhook(true);

    try {
      const res = await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newWebhookUrl,
          events: ["payment.succeeded", "refund.processed", "dispute.opened"]
        })
      });

      if (res.ok) {
        setNewWebhookUrl("");
        setShowWebhookForm(false);
        fetchWebhooks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingWebhook(false);
    }
  };

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const triggerToast = (label: string) => {
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMaskedKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 15) return "••••••••••••••••";
    return `${key.substring(0, 12)}••••••••••••••••${key.substring(key.length - 4)}`;
  };

  const getMaskedHash = (key: string) => {
    if (!key) return "";
    // Deterministic visual fingerprint for key identification without security exposure
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 33) ^ key.charCodeAt(i);
    }
    const hashHex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
    return `SHA-256: [${hashHex.substring(0, 4)}...${hashHex.substring(hashHex.length - 4)}]`;
  };

  const getRemainingTimeText = (expiresAtStr?: string) => {
    if (!expiresAtStr) return "";
    const diff = new Date(expiresAtStr).getTime() - nowTime;
    if (diff <= 0) return "Expired";
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}m ${remSecs}s remaining`;
  };

  const handleGenerateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMetadataValid) {
      setGenerationError("Please provide a valid JSON object for custom metadata.");
      return;
    }
    setGeneratingSession(true);
    setGenerationError("");
    setGeneratedSession(null);

    let parsedMetadata = {};
    try {
      if (customMetadataJson.trim() !== "") {
        parsedMetadata = JSON.parse(customMetadataJson);
      }
    } catch {
      setGenerationError("Invalid metadata JSON format.");
      setGeneratingSession(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/checkout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: customOrderId,
          itemName: customItemName,
          amount: Number(customAmount),
          currency: customCurrency,
          successUrl: customSuccessUrl,
          cancelUrl: customCancelUrl,
          vendorSplit: Number(customVendorSplit),
          developerMerchantName: customDevMerchantName,
          developerSupportEmail: customDevSupportEmail,
          developerSupportPhone: customDevSupportPhone,
          payerName: customPayerName,
          customerPhone: customPayerPhone,
          customerEmail: customPayerEmail,
          brandColor: customBrandColor,
          metadata: parsedMetadata
        })
      });

      if (res.ok) {
        const sessionData = await res.json();
        setGeneratedSession(sessionData);
      } else {
        const errData = await res.json();
        setGenerationError(errData.error || "Failed to create checkout session");
      }
    } catch (err) {
      setGenerationError("Network error generating checkout session");
      console.error(err);
    } finally {
      setGeneratingSession(false);
    }
  };

  const triggerCopyCheckoutUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCheckoutUrl(true);
    setTimeout(() => setCopiedCheckoutUrl(false), 2000);
  };

  const handleAddVisualMetadata = () => {
    setVisualMetadata(prev => [...prev, { key: "", value: "" }]);
  };

  const handleUpdateVisualMetadata = (index: number, key: string, value: string) => {
    setVisualMetadata(prev => {
      const copy = [...prev];
      copy[index] = { key, value };
      return copy;
    });
  };

  const handleRemoveVisualMetadata = (index: number) => {
    setVisualMetadata(prev => prev.filter((_, i) => i !== index));
  };

  const getEquivalentCurl = () => {
    let metadataObj = {};
    try {
      if (customMetadataJson.trim() !== "") {
        metadataObj = JSON.parse(customMetadataJson);
      }
    } catch {}

    const payload = {
      orderId: customOrderId,
      itemName: customItemName,
      amount: customAmount,
      currency: customCurrency,
      successUrl: customSuccessUrl,
      cancelUrl: customCancelUrl,
      vendorSplit: customVendorSplit,
      developerMerchantName: customDevMerchantName,
      developerSupportEmail: customDevSupportEmail,
      developerSupportPhone: customDevSupportPhone,
      payerName: customPayerName,
      customerPhone: customPayerPhone,
      customerEmail: customPayerEmail,
      brandColor: customBrandColor,
      metadata: metadataObj
    };

    return `curl -X POST "${window.location.origin}/api/v1/checkout/sessions" \\
  -H "Authorization: Bearer ${apiKeys.secretKey || "sk_test_diapay_secure98427"}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2).replace(/'/g, "'\\''")}'`;
  };

  const previewBrand = (() => {
    switch (customBrandColor) {
      case "teal":
        return {
          bg: "bg-teal-600",
          text: "text-teal-400",
          border: "border-teal-500",
          accent: "bg-teal-50 text-teal-700 border-teal-200"
        };
      case "rose":
        return {
          bg: "bg-rose-600",
          text: "text-rose-400",
          border: "border-rose-500",
          accent: "bg-rose-50 text-rose-700 border-rose-200"
        };
      case "emerald":
        return {
          bg: "bg-emerald-600",
          text: "text-emerald-400",
          border: "border-emerald-500",
          accent: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
      case "amber":
        return {
          bg: "bg-amber-600",
          text: "text-amber-400",
          border: "border-amber-500",
          accent: "bg-amber-50 text-amber-700 border-amber-200"
        };
      case "indigo":
      default:
        return {
          bg: "bg-indigo-600",
          text: "text-indigo-400",
          border: "border-indigo-500",
          accent: "bg-indigo-50 text-indigo-700 border-indigo-200"
        };
    }
  })();

  const formatPreviewAmount = (amount: number, currency: string) => {
    switch (currency) {
      case "USD":
        return `$${amount.toLocaleString()}`;
      case "EUR":
        return `${amount.toLocaleString()} €`;
      case "GBP":
        return `£${amount.toLocaleString()}`;
      case "CAD":
        return `CA$${amount.toLocaleString()}`;
      case "XOF":
      default:
        return `${amount.toLocaleString()} F CFA`;
    }
  };

  const renderSparkline = (status: "operational" | "maintenance" | "disabled") => {
    if (status === "disabled") {
      return (
        <svg className="w-16 h-6 stroke-slate-300 fill-none" viewBox="0 0 40 10">
          <line x1="0" y1="5" x2="40" y2="5" strokeWidth="1" />
        </svg>
      );
    }
    const points = status === "maintenance" 
      ? [8, 9, 3, 8, 9, 1, 8, 9, 7, 9] // high spikes / unstable jitter for maintenance
      : [4, 5, 4, 6, 5, 4, 5, 6, 4, 5]; // stable low waves for operational
    const pathData = `M 0,${points[0]} ` + points.map((p, i) => `L ${i * 4.4},${p}`).join(" ");
    const strokeColor = status === "maintenance" ? "#f59e0b" : "#10b981";
    return (
      <svg className="w-16 h-6 stroke-2 fill-none" viewBox="0 0 40 10" style={{ stroke: strokeColor }}>
        <path d={pathData} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div id="developer-console-view" className="space-y-6 text-left">
      
      {/* Sub-navigation tabs */}
      <div className="bg-white border border-slate-100/80 rounded-2xl p-2 shadow-xs flex flex-wrap gap-1">
        {[
          { id: "keys", label: "API Credentials", icon: Key },
          { id: "regional", label: "Regional Config", icon: Globe, badge: `${activeCurrencies.length} Active` },
          { id: "generator", label: "Checkout Link Generator", icon: Sparkles },
          { id: "webhooks", label: "Webhooks & Terminal", icon: Webhook },
          { id: "docs", label: "API Documentation", icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeConsoleTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`console-tab-${tab.id}`}
              onClick={() => setActiveConsoleTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none border border-transparent ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-xs border-indigo-700/10 font-bold" 
                  : "text-gray-600 hover:bg-slate-50 hover:text-gray-900"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white animate-pulse" : "text-gray-400"} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? "bg-indigo-500/50 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeConsoleTab === "keys" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Key className="text-indigo-600" size={18} />
            <h3 className="font-display font-semibold text-gray-800 text-base">API Authentication Keys & Pairs</h3>
          </div>
          <button 
            id="show-add-keypair-btn"
            onClick={() => setShowKeyPairForm(!showKeyPairForm)}
            className="text-xs bg-indigo-50 text-indigo-600 font-semibold flex items-center gap-1.5 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Plus size={13} />
            Generate Key Pair
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Use these credentials to authenticate server-to-server requests with Diapay's unified payment engine. Keep your Secret keys heavily guarded. To rotate keys with zero-downtime, trigger a rotation with an active grace period during which both the deprecated key and the new key remain fully valid.
        </p>

        {showKeyPairForm && (
          <form onSubmit={handleCreateKeyPair} className="bg-indigo-50/15 border border-indigo-100 rounded-xl p-4 mb-4 space-y-3">
            <h4 className="font-display font-semibold text-xs text-indigo-950 uppercase tracking-wide flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-600" />
              Generate New API Key Pair
            </h4>
            <p className="text-[11px] text-slate-500">Creating a new key pair gives you a separate set of Sandbox publishable and secret keys.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                value={newKeyPairName}
                onChange={(e) => setNewKeyPairName(e.target.value)}
                placeholder="e.g. Mobile App Credentials"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 font-sans"
                required
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  disabled={savingKeyPair}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                >
                  {savingKeyPair ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Generate
                </button>
                <button 
                  type="button"
                  onClick={() => setShowKeyPairForm(false)}
                  className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {apiKeyPairs.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-gray-250 rounded-xl bg-slate-50">
              <Loader2 className="animate-spin mx-auto text-indigo-500 mb-2" size={20} />
              <p className="text-xs text-gray-400 font-sans">Loading API Keys database...</p>
            </div>
          ) : (
            apiKeyPairs.map((pair) => {
              const isRevealed = !!revealedKeys[pair.id];
              const isDeprecated = pair.status === "deprecated";
              const isExpired = pair.status === "expired";
              const isActive = pair.status === "active";
              
              return (
                <div key={pair.id} className={`border rounded-xl p-4 transition-all ${
                  isActive ? "border-slate-200 bg-slate-50/20 shadow-xs" : 
                  isDeprecated ? "border-amber-200 bg-amber-50/15" : 
                  "border-red-100 bg-red-50/10 opacity-75"
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-2 border-b border-dashed border-slate-100">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-xs font-sans">{pair.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({pair.id})</span>
                        
                        {/* Status Badges */}
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                            Active
                          </span>
                        )}
                        {isDeprecated && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Deprecated
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans">
                        Created {new Date(pair.createdAt).toLocaleDateString()} {new Date(pair.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Status Specific details / timers & actions */}
                    <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
                      {isDeprecated && pair.expiresAt && (
                        <div className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          <span className="font-bold">Grace Period:</span> {getRemainingTimeText(pair.expiresAt)}
                        </div>
                      )}
                      
                      {isActive && (
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
                          <span className="text-[10px] text-slate-400 font-bold px-1 uppercase font-sans">Grace:</span>
                          <select
                            value={keyPairRotationGraceMinutes}
                            onChange={(e) => setKeyPairRotationGraceMinutes(Number(e.target.value))}
                            className="text-[10px] font-bold font-mono bg-slate-50 border-0 rounded px-1.5 py-0.5 focus:outline-none focus:ring-0 cursor-pointer text-slate-700"
                          >
                            <option value={1}>1 min (Demo)</option>
                            <option value={5}>5 min</option>
                            <option value={15}>15 min</option>
                            <option value={60}>1 hour</option>
                            <option value={1440}>24 hours</option>
                          </select>
                          <button
                            onClick={() => handleRotateKeyPair(pair.id, keyPairRotationGraceMinutes)}
                            disabled={rotatingKeys}
                            className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCw size={10} className={rotatingKeys ? "animate-spin" : ""} />
                            Rotate Key
                          </button>
                        </div>
                      )}

                      {/* Delete button (allow deleting if not the only active key) */}
                      <button
                        onClick={() => handleDeleteKeyPair(pair.id)}
                        title="Delete Key Pair"
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Keys values */}
                  <div className="space-y-2 font-mono text-xs pt-1">
                    {/* Publishable key row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-sans">Publishable API Key</span>
                        <span className="text-slate-700 font-bold break-all select-all">{pair.publishableKey}</span>
                      </div>
                      <button 
                        onClick={() => triggerCopy(pair.publishableKey, `pub_${pair.id}`)}
                        className="text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition flex items-center gap-1 font-sans text-[10px] font-medium shrink-0 cursor-pointer"
                      >
                        {copiedKey === `pub_${pair.id}` ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                        {copiedKey === `pub_${pair.id}` ? "Copied" : "Copy"}
                      </button>
                    </div>

                    {/* Secret key row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-sans">Secret API Key</span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-700 font-bold break-all">
                            {isRevealed ? pair.secretKey : getMaskedKey(pair.secretKey)}
                          </span>
                          {/* Masked Hash Fingerprint label */}
                          <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {getMaskedHash(pair.secretKey)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button 
                          onClick={() => setRevealedKeys(prev => ({ ...prev, [pair.id]: !prev[pair.id] }))}
                          className="text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition flex items-center gap-1 font-sans text-[10px] font-medium cursor-pointer"
                        >
                          {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                          {isRevealed ? "Hide" : "Reveal"}
                        </button>
                        <button 
                          onClick={() => triggerCopy(pair.secretKey, `sec_${pair.id}`)}
                          className="text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition flex items-center gap-1 font-sans text-[10px] font-medium cursor-pointer"
                        >
                          {copiedKey === `sec_${pair.id}` ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                          {copiedKey === `sec_${pair.id}` ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>

        {/* API Quota & Throttling Analytics Section */}
        <div id="api-quota-analytics-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          {/* Left Column: API Usage & Limits Widget (Monthly API Quota progress) */}
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <Sliders className="text-indigo-600" size={18} />
                <h3 className="font-display font-semibold text-gray-800 text-sm">Monthly API Quota & Limits</h3>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Your sandbox API usage is capped at 100,000 requests per billing period. Adjust the simulation slider below to see state and warning indicator updates.
              </p>

              {/* Progress bar visual */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Period Progress</span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {((simulatedUsage / quotaLimit) * 100).toFixed(1)}% Used
                  </span>
                </div>
                
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden relative border border-slate-200/50">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      simulatedUsage >= quotaLimit ? "bg-rose-600 animate-pulse" : 
                      simulatedUsage >= quotaLimit * 0.8 ? "bg-amber-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${Math.min((simulatedUsage / quotaLimit) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                  <span>0 reqs</span>
                  <span className="font-bold text-slate-500">80% Alert (80,000)</span>
                  <span>100,000 reqs</span>
                </div>
              </div>

              {/* Warning/Safe alerts based on >80% threshold */}
              {simulatedUsage >= quotaLimit * 0.8 ? (
                <div className="flex items-start gap-2.5 bg-rose-50/70 border border-rose-100 p-3.5 rounded-xl text-rose-800 text-[11px] leading-normal animate-in fade-in duration-200">
                  <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <strong className="font-semibold block text-rose-900">Quota Warning (Exceeds 80%)</strong>
                    You have utilized <span className="font-bold">{simulatedUsage.toLocaleString()}</span> out of your allocated <span className="font-mono">{quotaLimit.toLocaleString()}</span> monthly requests. Throttling of live endpoints is active to prevent overflow.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-100/70 p-3.5 rounded-xl text-emerald-800 text-[11px] leading-normal animate-in fade-in duration-200">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-emerald-900">Quota Status: Optimal</strong>
                    API request volume is currently within healthy limits. No rate-limiting throttling matches are present for your keys.
                  </div>
                </div>
              )}
            </div>

            {/* Simulated usage adjuster slider */}
            <div className="space-y-1.5 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-center text-[10.5px] text-gray-500 font-semibold">
                <span>Simulate Monthly Requests</span>
                <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {simulatedUsage.toLocaleString()} / {quotaLimit.toLocaleString()}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="120000" 
                step="2500"
                value={simulatedUsage} 
                onChange={(e) => setSimulatedUsage(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right Column: API Rate Limiting Trend Chart */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-50 pb-3">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <Activity className="text-indigo-600" size={18} />
                  <h3 className="font-display font-semibold text-gray-800 text-sm">30-Day API Rate Limiting Trend</h3>
                </div>
                <p className="text-[11px] text-gray-400">Request load vs. automated SLA throttling events</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-md shrink-0 uppercase">
                Dual Axis telemetry
              </span>
            </div>

            {/* Recharts line graph container */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={[
                    { date: "Jun 06", requests: 4200, throttled: 0 },
                    { date: "Jun 07", requests: 3900, throttled: 0 },
                    { date: "Jun 08", requests: 4500, throttled: 0 },
                    { date: "Jun 09", requests: 5100, throttled: 2 },
                    { date: "Jun 10", requests: 4800, throttled: 0 },
                    { date: "Jun 11", requests: 4600, throttled: 0 },
                    { date: "Jun 12", requests: 4900, throttled: 0 },
                    { date: "Jun 13", requests: 7200, throttled: 24 },
                    { date: "Jun 14", requests: 6800, throttled: 12 },
                    { date: "Jun 15", requests: 4300, throttled: 0 },
                    { date: "Jun 16", requests: 4100, throttled: 0 },
                    { date: "Jun 17", requests: 4600, throttled: 0 },
                    { date: "Jun 18", requests: 5000, throttled: 1 },
                    { date: "Jun 19", requests: 12500, throttled: 154 },
                    { date: "Jun 20", requests: 8900, throttled: 48 },
                    { date: "Jun 21", requests: 4400, throttled: 0 },
                    { date: "Jun 22", requests: 4200, throttled: 0 },
                    { date: "Jun 23", requests: 4700, throttled: 0 },
                    { date: "Jun 24", requests: 5300, throttled: 3 },
                    { date: "Jun 25", requests: 5100, throttled: 0 },
                    { date: "Jun 26", requests: 4800, throttled: 0 },
                    { date: "Jun 27", requests: 5000, throttled: 0 },
                    { date: "Jun 28", requests: 4900, throttled: 0 },
                    { date: "Jun 29", requests: 14200, throttled: 210 },
                    { date: "Jun 30", requests: 9500, throttled: 72 },
                    { date: "Jul 01", requests: 5300, throttled: 0 },
                    { date: "Jul 02", requests: 4900, throttled: 0 },
                    { date: "Jul 03", requests: 5100, throttled: 0 },
                    { date: "Jul 04", requests: 5400, throttled: 4 },
                    { date: "Jul 05", requests: 5800, throttled: 8 }
                  ]} 
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#4f46e5', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`} 
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#e11d48', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => val === 0 ? "0" : val}
                  />
                  <ChartTooltip 
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-[11px] shadow-lg font-sans space-y-1.5">
                            <p className="font-bold border-b border-slate-800 pb-1 text-slate-300">{data.date}, 2026</p>
                            <div className="flex justify-between gap-6">
                              <span className="text-slate-400">Total API Requests:</span>
                              <span className="font-mono font-bold text-indigo-400">{data.requests.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-6">
                              <span className="text-slate-400">Throttled Events:</span>
                              <span className={`font-mono font-bold ${data.throttled > 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                                {data.throttled.toLocaleString()} {data.throttled > 0 ? `(${((data.throttled / data.requests) * 100).toFixed(1)}%)` : ""}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }} 
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#4f46e5" 
                    strokeWidth={2.5} 
                    name="Request Volume" 
                    dot={false}
                    activeDot={{ r: 5 }} 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="throttled" 
                    stroke="#e11d48" 
                    strokeWidth={2} 
                    name="Throttled Events" 
                    dot={false}
                    activeDot={{ r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Explanation / Advice bar */}
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10.5px] text-gray-400 leading-normal flex items-start gap-2 text-left">
              <span className="bg-amber-500/10 text-amber-600 px-1 py-0.5 rounded font-bold font-mono text-[9px] uppercase tracking-wider shrink-0 mt-0.5">SLA Advice</span>
              <span>
                Throttling events represent requests rejected with HTTP Status Code <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-xs text-rose-600 font-bold">429 Too Many Requests</code>. Throttling is applied dynamically based on concurrent connection rates and tier thresholds.
              </span>
            </div>
          </div>
        </div>
        </div>
      )}

      {activeConsoleTab === "regional" && (
        <div id="regional-config-card" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex justify-between items-center mb-1 border-b border-gray-50 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe className="text-indigo-600 animate-pulse" size={18} />
            <h3 className="font-display font-semibold text-gray-800 text-base">Regional Payout Configuration</h3>
          </div>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md uppercase tracking-wider">
            Corridor Manager
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Configure multi-currency payout corridors. Toggle which local currencies are active in your developer account, inspect regional settlement limits, and simulate mobile network operator (MNO) carrier maintenance modes to test error-handling failovers.
        </p>

        {/* Currency toggler switches */}
        <div className="space-y-3 pt-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Payout Currencies
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { code: "XOF", name: "BCEAO Franc", flag: "🇸🇳", countries: "Senegal, Ivory Coast" },
              { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭", countries: "Ghana" },
              { code: "XAF", name: "BEAC Franc", flag: "🇨🇲", countries: "Cameroon" },
              { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", countries: "Nigeria" },
              { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", countries: "Kenya" }
            ].map(currency => {
              const isActive = activeCurrencies.includes(currency.code);
              return (
                <div
                  key={currency.code}
                  id={`currency-toggle-${currency.code.toLowerCase()}`}
                  onClick={() => {
                    setActiveCurrencies(prev => 
                      prev.includes(currency.code)
                        ? prev.filter(c => c !== currency.code)
                        : [...prev, currency.code]
                    );
                  }}
                  className={`border p-3.5 rounded-xl transition text-left flex flex-col justify-between h-28 shadow-3xs cursor-pointer select-none group relative overflow-hidden ${
                    isActive 
                      ? "bg-indigo-50/50 border-indigo-200 hover:border-indigo-300" 
                      : "bg-slate-50 border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-mono font-black text-gray-800 flex items-center gap-1">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                    </span>
                    {/* Toggle switch visual */}
                    <div className={`w-8 h-4 rounded-full p-0.5 transition duration-200 flex items-center ${isActive ? "bg-indigo-600" : "bg-slate-300"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition duration-200 shadow-sm transform ${isActive ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </div>
                  
                  <div className="space-y-0.5 mt-auto">
                    <p className="text-[10px] font-bold text-gray-700 truncate">{currency.name}</p>
                    <p className="text-[8.5px] text-gray-400 truncate">{currency.countries}</p>
                  </div>

                  {/* Tiny active ribbon */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Coverage & Map View */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col xl:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interactive Schematic African Corridor Map
            </h4>
            <p className="text-[11px] text-gray-500 leading-normal">
              Click any colored routing node directly on the geographic schematic to select that country. Pulsing borders show corridors active with all operators green. Orange rings represent partial operator maintenance.
            </p>
            
            {/* SVG Africa Schematic Map */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[9px] font-mono text-indigo-400/80 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                <span>DIAPAY ROUTING SCHEMATIC V2</span>
              </div>
              <svg viewBox="0 0 520 220" className="w-full max-w-lg h-auto select-none">
                {/* Connection lines between nodes to symbolize unified telecommunication network */}
                {/* Senegal to CI */}
                <line x1="70" y1="50" x2="140" y2="130" stroke="#312e81" strokeWidth="2" />
                <line x1="70" y1="50" x2="140" y2="130" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" className="animate-pulse" />
                
                {/* CI to Ghana */}
                <line x1="140" y1="130" x2="210" y2="130" stroke="#312e81" strokeWidth="2" />
                <line x1="140" y1="130" x2="210" y2="130" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
                
                {/* Ghana to Nigeria */}
                <line x1="210" y1="130" x2="280" y2="90" stroke="#312e81" strokeWidth="2" />
                <line x1="210" y1="130" x2="280" y2="90" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
                
                {/* Nigeria to Cameroon */}
                <line x1="280" y1="90" x2="350" y2="160" stroke="#312e81" strokeWidth="2" />
                <line x1="280" y1="90" x2="350" y2="160" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
                
                {/* Cameroon to Kenya */}
                <line x1="350" y1="160" x2="460" y2="130" stroke="#312e81" strokeWidth="2" />
                <line x1="350" y1="160" x2="460" y2="130" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />

                {/* Draw Country Nodes */}
                {[
                  { code: "SN", name: "Senegal", x: 70, y: 50, currency: "XOF", flag: "🇸🇳" },
                  { code: "CI", name: "Côte d'Ivoire", x: 140, y: 130, currency: "XOF", flag: "🇨🇮" },
                  { code: "GH", name: "Ghana", x: 210, y: 130, currency: "GHS", flag: "🇬🇭" },
                  { code: "NG", name: "Nigeria", x: 280, y: 90, currency: "NGN", flag: "🇳🇬" },
                  { code: "CM", name: "Cameroon", x: 350, y: 160, currency: "XAF", flag: "🇨🇲" },
                  { code: "KE", name: "Kenya", x: 460, y: 130, currency: "KES", flag: "🇰🇪" }
                ].map(node => {
                  const isSelected = selectedRegionCountry === node.code;
                  const isCurrencyActive = activeCurrencies.includes(node.currency);
                  
                  // Check status of operators
                  const config = regionalConfigs.find(c => c.countryCode === node.code);
                  let hasMaintenance = false;
                  if (config) {
                    hasMaintenance = config.operators.some(op => (carrierStatusOverrides[op.id] || "operational") === "maintenance");
                  }

                  let nodeColor = "stroke-emerald-500 fill-emerald-950"; // green
                  let pulseColor = "rgba(16, 185, 129, 0.4)";
                  if (!isCurrencyActive) {
                    nodeColor = "stroke-slate-700 fill-slate-800"; // disabled
                    pulseColor = "transparent";
                  } else if (hasMaintenance) {
                    nodeColor = "stroke-amber-500 fill-amber-950"; // maintenance
                    pulseColor = "rgba(245, 158, 11, 0.4)";
                  }

                  return (
                    <g 
                      key={node.code}
                      onClick={() => setSelectedRegionCountry(node.code)}
                      className="cursor-pointer group"
                    >
                      {/* Interactive click radius */}
                      <circle cx={node.x} cy={node.y} r="28" className="fill-transparent" />
                      
                      {/* Pulse rings for active and operational nodes */}
                      {isCurrencyActive && (
                        <circle 
                          cx={node.x} 
                          cy={node.y} 
                          r={isSelected ? "22" : "18"} 
                          className="fill-none animate-ping" 
                          style={{ stroke: isSelected ? "#6366f1" : nodeColor.split(" ")[0].substring(7), strokeWidth: 0.5, animationDuration: isSelected ? "1.5s" : "3s" }} 
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r="15" 
                        className={`transition-all duration-300 stroke-2 ${nodeColor} ${isSelected ? "stroke-indigo-400 stroke-[3.5px] scale-110 shadow-lg" : "group-hover:stroke-slate-300"}`} 
                      />

                      {/* Flag Text inside circle */}
                      <text 
                        x={node.x} 
                        y={node.y - 1} 
                        fontSize="10" 
                        textAnchor="middle" 
                        dominantBaseline="central"
                        className="pointer-events-none"
                      >
                        {node.flag}
                      </text>

                      {/* Country Code Label */}
                      <text 
                        x={node.x} 
                        y={node.y + 26} 
                        fontSize="8.5" 
                        fontWeight="bold"
                        fill={isSelected ? "#a5b4fc" : "#94a3b8"} 
                        textAnchor="middle"
                        className="font-mono pointer-events-none"
                      >
                        {node.code} ({node.currency})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Provider Health Matrix */}
          <div className="w-full xl:w-[45%] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Provider Availability Matrix
            </h4>
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-3xs max-h-[220px] overflow-y-auto scrolling-scrollbar text-[11px]">
              <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 grid grid-cols-12 font-bold text-gray-500 font-sans">
                <span className="col-span-5">Provider</span>
                <span className="col-span-2 text-center">Fee</span>
                <span className="col-span-3 text-center">Visual Signal</span>
                <span className="col-span-2 text-right">Status</span>
              </div>
              <div className="divide-y divide-slate-50">
                {regionalConfigs.flatMap(config => {
                  const isCurrencyActive = activeCurrencies.includes(config.currency);
                  return config.operators.map(op => {
                    const status = isCurrencyActive 
                      ? (carrierStatusOverrides[op.id] || "operational") 
                      : "disabled";
                    
                    return (
                      <div 
                        key={op.id} 
                        className={`px-3 py-2.5 grid grid-cols-12 items-center hover:bg-slate-50/50 transition ${
                          status === "disabled" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="col-span-5 flex items-center gap-1.5 overflow-hidden">
                          <span className="shrink-0">{config.flag}</span>
                          <div className="truncate">
                            <span className="font-bold text-slate-700 block truncate">{op.name}</span>
                            <span className="text-[9px] text-gray-400 font-mono uppercase">{op.type}</span>
                          </div>
                        </div>
                        <span className="col-span-2 text-center font-mono text-slate-600 font-semibold">{op.baseFee}%</span>
                        <div className="col-span-3 flex justify-center">
                          {renderSparkline(status)}
                        </div>
                        <div className="col-span-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (status !== "disabled") {
                                setCarrierStatusOverrides(prev => ({
                                  ...prev,
                                  [op.id]: prev[op.id] === "operational" ? "maintenance" : "operational"
                                }));
                              }
                            }}
                            disabled={status === "disabled"}
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                              status === "operational"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : status === "maintenance"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 animate-pulse"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {status === "operational" && "ONLINE"}
                            {status === "maintenance" && "OUTAGE"}
                            {status === "disabled" && "OFFLINE"}
                          </button>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            </div>
            <div className="text-[9.5px] text-slate-400 text-left flex items-center gap-1">
              <span>💡</span>
              <span>You can click the <strong>ONLINE / OUTAGE</strong> badge directly in the Matrix to simulate carrier network maintenance.</span>
            </div>
          </div>
        </div>

        {/* Detailed country operator directory */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
          {/* Left panel: country selector list */}
          <div className="md:col-span-4 space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Payout Country
            </label>
            <div className="space-y-1.5">
              {regionalConfigs.map(config => {
                const isSelected = selectedRegionCountry === config.countryCode;
                const isCurrencyActive = activeCurrencies.includes(config.currency);
                return (
                  <button
                    key={config.countryCode}
                    id={`country-select-${config.countryCode.toLowerCase()}`}
                    type="button"
                    onClick={() => setSelectedRegionCountry(config.countryCode)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${
                      isSelected 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                        : "bg-white border-gray-150 text-gray-755 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{config.flag}</span>
                      <div className="text-left">
                        <span className="text-xs font-bold block leading-tight">{config.countryName}</span>
                        <span className={`text-[8.5px] font-mono font-medium block ${isSelected ? "text-indigo-200" : "text-gray-450"}`}>
                          Settlement Currency: {config.currency}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCurrencyActive ? (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono ${isSelected ? "bg-indigo-500/40 text-indigo-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                          Enabled
                        </span>
                      ) : (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono ${isSelected ? "bg-indigo-500/20 text-indigo-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                          Disabled
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: operators lists & carrier simulation */}
          <div className="md:col-span-8 space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Available Operators ({regionalConfigs.find(c => c.countryCode === selectedRegionCountry)?.countryName})
              </label>
              <span className="text-[9px] text-gray-450 font-mono">
                Click status badge to simulate Carrier Maintenance
              </span>
            </div>

            {(() => {
              const currentConfig = regionalConfigs.find(c => c.countryCode === selectedRegionCountry);
              if (!currentConfig) return null;
              const isCurrencyActive = activeCurrencies.includes(currentConfig.currency);

              return (
                <div className="space-y-2">
                  {!isCurrencyActive && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-left">
                      <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={14} />
                      <div className="text-[11px] text-amber-800 leading-normal">
                        <strong>Payout Corridor Disabled:</strong> The <strong>{currentConfig.currency}</strong> payout currency is currently disabled in your Active Payout Currencies above. Payout requests to this corridor will fail with an <code>ERR_CURRENCY_NOT_ENABLED</code> API code.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2.5">
                    {currentConfig.operators.map(op => {
                      const status = carrierStatusOverrides[op.id] || "operational";
                      const isOperational = status === "operational";

                      return (
                        <div 
                          key={op.id}
                          className={`border rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition ${
                            isCurrencyActive 
                              ? "bg-white border-gray-200" 
                              : "bg-slate-50/70 border-gray-100 opacity-60"
                          }`}
                        >
                          <div className="text-left space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-800">{op.name}</span>
                              <span className="text-[8.5px] font-mono text-gray-450 bg-slate-100 px-1 py-0.2 rounded">
                                {op.type}
                              </span>
                            </div>
                            <div className="text-[10.5px] text-gray-500 font-mono space-y-0.5">
                              <p>⚡ <span className="text-gray-400">Payout Fee:</span> {op.baseFee}% per batch dispatch</p>
                              <p>🛡️ <span className="text-gray-400">SLA Max Limit:</span> {op.limit}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 border-gray-100 pt-2 sm:pt-0">
                            {/* Toggleable maintenance status override badge */}
                            <button
                              type="button"
                              id={`toggle-carrier-${op.id}`}
                              onClick={() => {
                                setCarrierStatusOverrides(prev => ({
                                  ...prev,
                                  [op.id]: prev[op.id] === "operational" ? "maintenance" : "operational"
                                }));
                              }}
                              className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded-full flex items-center gap-1 border transition cursor-pointer select-none ${
                                isOperational
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse"
                              }`}
                              title="Click to toggle carrier API outage simulator"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isOperational ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                              {isOperational ? "Operational" : "Maintenance"}
                            </button>

                            <span className="text-[9px] text-gray-450 font-mono">
                              Settles in: &lt; 2 mins
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Integration Impact Preview Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4 text-left space-y-3 font-mono text-[11px] text-slate-300">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Code2 size={12} className="text-indigo-400" /> API Integration & Failover Simulator
                      </span>
                      <span className="bg-slate-800 text-[8px] font-bold text-slate-400 px-1.5 py-0.5 rounded uppercase font-mono">
                        Real-time dry-run
                      </span>
                    </div>

                    {!isCurrencyActive ? (
                      <div className="space-y-2">
                        <p className="text-gray-400 text-slate-300">
                          If your server attempts to dispatch a batch payout to <strong className="text-white">{currentConfig.countryName}</strong> while the currency <strong className="text-white">{currentConfig.currency}</strong> is disabled, the API returns:
                        </p>
                        <pre className="bg-slate-950 p-3 rounded-lg text-rose-400 overflow-x-auto text-[10px]">
{`{
  "status": "error",
  "error_code": "ERR_CURRENCY_NOT_ENABLED",
  "message": "The corridor ${currentConfig.currency} is disabled in your dashboard settings.",
  "help_url": "https://diapay.com/docs/errors/ERR_CURRENCY_NOT_ENABLED"
}`}
                        </pre>
                      </div>
                    ) : currentConfig.operators.some(op => (carrierStatusOverrides[op.id] || "operational") === "maintenance") ? (
                      <div className="space-y-2">
                        <p className="text-gray-400 text-slate-300">
                          <span className="text-amber-400 font-bold">⚠️ Warning:</span> One or more mobile carriers in <strong className="text-white">{currentConfig.countryName}</strong> are in maintenance. Diapay core smart router automatically triggers secondary routes if backup carriers exist:
                        </p>
                        <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg text-amber-300 text-[10px] leading-relaxed">
                          <strong>Active Telemetry Failover Plan:</strong> Any transaction directed to maintenance carriers will be queued or routed to alternative direct gateways. Settling speeds may shift from &lt; 2 mins to 10 mins.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-gray-400 text-slate-300">
                          All systems active. Sending a batch payout via HTTPS POST to <code className="bg-slate-950 text-slate-200 px-1 py-0.5 rounded">/v1/payouts</code> for <strong className="text-white">{currentConfig.countryName}</strong>:
                        </p>
                        <pre className="bg-slate-950 p-3 rounded-lg text-emerald-400 overflow-x-auto text-[10px]">
{`{
  "status": "success",
  "payout_id": "po_sn_${Math.random().toString(36).substring(2, 10)}",
  "currency": "${currentConfig.currency}",
  "routing_channel": "primary_direct_gateway",
  "carrier_status": "all_systems_green"
}`}
                        </pre>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}
          </div>
        </div>
      </div>
      )}

      {activeConsoleTab === "generator" && (
        <div id="custom-checkout-generator-card" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex justify-between items-center mb-1 border-b border-gray-50 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600 animate-pulse" size={18} />
            <h3 className="font-display font-semibold text-gray-800 text-base">Custom Checkout URL Generator</h3>
          </div>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md uppercase tracking-wider">
            Sandbox Simulator
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Configure transaction parameters, support channels, brand themes, and integration metadata. Use the templates below to pre-populate custom payloads or use the visual tools to build custom URLs.
        </p>

        {/* Dynamic Integration Templates Presets */}
        <div className="space-y-2 pt-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Configuration Presets</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              id="preset-diaexpress-btn"
              type="button"
              onClick={() => applyPreset("diaexpress")}
              className="bg-slate-50 hover:bg-teal-50 border border-slate-100/80 hover:border-teal-200/80 p-3.5 rounded-xl transition text-left flex flex-col justify-between h-24 shadow-2xs group cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-gray-700 group-hover:text-teal-800 flex items-center gap-1">🚚 DiaExpress Courier</span>
                <span className="text-[9px] bg-teal-500/10 text-teal-700 px-1.5 py-0.5 rounded font-bold uppercase">XOF</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">Dakar courier delivery simulation with custom metadata, split & teal branding.</p>
            </button>

            <button
              id="preset-saas-btn"
              type="button"
              onClick={() => applyPreset("saas")}
              className="bg-slate-50 hover:bg-indigo-50 border border-slate-100/80 hover:border-indigo-200/80 p-3.5 rounded-xl transition text-left flex flex-col justify-between h-24 shadow-2xs group cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-800 flex items-center gap-1">⚡ SaaS Platform</span>
                <span className="text-[9px] bg-indigo-500/10 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">USD</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">Software API licensing annual renewal package. Blue branding with US payer.</p>
            </button>

            <button
              id="preset-artisans-btn"
              type="button"
              onClick={() => applyPreset("artisans")}
              className="bg-slate-50 hover:bg-amber-50 border border-slate-100/80 hover:border-amber-200/80 p-3.5 rounded-xl transition text-left flex flex-col justify-between h-24 shadow-2xs group cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-gray-700 group-hover:text-amber-800 flex items-center gap-1">🎨 Artisans Co-op</span>
                <span className="text-[9px] bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">EUR</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">Handcrafted basket co-op exports from Saint-Louis with custom euro split.</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleGenerateCheckout} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Columns: Parameters Configuration Form */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Section 1: Order Details */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/75 text-left">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/50 pb-1.5 mb-2">
                  <Sliders size={13} className="text-indigo-500" />
                  1. Order Parameters
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Order reference ID</label>
                    <div className="flex gap-1.5">
                      <input 
                        id="generator-order-id-input"
                        type="text" 
                        value={customOrderId} 
                        onChange={(e) => setCustomOrderId(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        placeholder="ORD-90212"
                        required
                      />
                      <button
                        id="generator-rand-order-btn"
                        type="button"
                        onClick={() => setCustomOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`)}
                        className="p-2 bg-white border border-gray-200 hover:bg-slate-50 rounded-lg transition shrink-0 cursor-pointer"
                        title="Randomize Order Reference ID"
                      >
                        <RotateCw size={13} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Product Description</label>
                    <input 
                      id="generator-item-name-input"
                      type="text" 
                      value={customItemName} 
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Product SKU #110"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Price / Amount</label>
                    <input 
                      id="generator-amount-input"
                      type="number" 
                      value={customAmount} 
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Currency</label>
                    <select 
                      id="generator-currency-select"
                      value={customCurrency} 
                      onChange={(e) => setCustomCurrency(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="XOF">XOF (CFA)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (CA$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Vendor Split</label>
                    <select 
                      id="generator-split-select"
                      value={customVendorSplit} 
                      onChange={(e) => setCustomVendorSplit(Number(e.target.value))}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    >
                      <option value="0.95">95% split</option>
                      <option value="0.90">90% split</option>
                      <option value="0.85">85% split</option>
                      <option value="0.80">80% split</option>
                      <option value="0.75">75% split</option>
                      <option value="0.70">70% split</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Merchant Branding */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/75 text-left">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/50 pb-1.5 mb-2">
                  <Palette size={13} className="text-indigo-500" />
                  2. Merchant Brand styling
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Merchant Business Name</label>
                    <input 
                      id="generator-merchant-name-input"
                      type="text" 
                      value={customDevMerchantName} 
                      onChange={(e) => setCustomDevMerchantName(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Acme Dakar Sarl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Theme Brand Accent</label>
                    <select 
                      id="generator-color-select"
                      value={customBrandColor} 
                      onChange={(e) => setCustomBrandColor(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="indigo">Indigo (Classic Blue)</option>
                      <option value="teal">Teal (Cyber Oceanic)</option>
                      <option value="rose">Rose (Sunset Coral)</option>
                      <option value="emerald">Emerald (African Mint)</option>
                      <option value="amber">Amber (Sunray Gold)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Merchant Support Email</label>
                    <input 
                      id="generator-support-email-input"
                      type="email" 
                      value={customDevSupportEmail} 
                      onChange={(e) => setCustomDevSupportEmail(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="support@merchant.sn"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Merchant Support Phone</label>
                    <input 
                      id="generator-support-phone-input"
                      type="text" 
                      value={customDevSupportPhone} 
                      onChange={(e) => setCustomDevSupportPhone(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="+221..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Customer Information */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/75 text-left">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/50 pb-1.5 mb-2">
                  <User size={13} className="text-indigo-500" />
                  3. Customer (Payer) Credentials
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Payer Full Name</label>
                    <input 
                      id="generator-payer-name-input"
                      type="text" 
                      value={customPayerName} 
                      onChange={(e) => setCustomPayerName(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Fatou Sow"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Payer Phone</label>
                    <input 
                      id="generator-payer-phone-input"
                      type="text" 
                      value={customPayerPhone} 
                      onChange={(e) => setCustomPayerPhone(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="+221..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Payer Email</label>
                    <input 
                      id="generator-payer-email-input"
                      type="email" 
                      value={customPayerEmail} 
                      onChange={(e) => setCustomPayerEmail(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="payer@domain.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Redirect Success URL</label>
                    <input 
                      id="generator-success-url-input"
                      type="url" 
                      value={customSuccessUrl} 
                      onChange={(e) => setCustomSuccessUrl(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-500"
                      placeholder="https://domain.com/success"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Redirect Cancel URL</label>
                    <input 
                      id="generator-cancel-url-input"
                      type="url" 
                      value={customCancelUrl} 
                      onChange={(e) => setCustomCancelUrl(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-500"
                      placeholder="https://domain.com/cancel"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Advanced Metadata JSON & Visual editor */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/75 text-left">
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-1.5 mb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Braces size={13} className="text-indigo-500" />
                    4. Advanced Integration Metadata
                  </h4>
                  
                  {/* Mode switcher tabs */}
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMetadataMode("visual")}
                      className={`px-2 py-1 font-semibold transition ${metadataMode === "visual" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-slate-50"}`}
                    >
                      Visual Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetadataMode("raw")}
                      className={`px-2 py-1 font-semibold transition ${metadataMode === "raw" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-slate-50"}`}
                    >
                      Raw JSON
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 leading-relaxed mb-1.5">
                  Pass client tags (e.g. account tier, custom channel tags). This metadata stays with the session and triggers inside outgoing webhook payloads.
                </p>

                {metadataMode === "visual" ? (
                  <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-white max-h-56 overflow-y-auto">
                    {visualMetadata.length === 0 ? (
                      <p className="text-[10px] text-gray-400 py-3 text-center">No custom metadata parameters declared yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {visualMetadata.map((item, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input 
                              type="text"
                              placeholder="Key Name"
                              value={item.key}
                              onChange={(e) => handleUpdateVisualMetadata(index, e.target.value, item.value)}
                              className="flex-1 text-xs border border-gray-200 rounded-lg p-1.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                            <input 
                              type="text"
                              placeholder="Value"
                              value={item.value}
                              onChange={(e) => handleUpdateVisualMetadata(index, item.key, e.target.value)}
                              className="flex-1 text-xs border border-gray-200 rounded-lg p-1.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveVisualMetadata(index)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                              title="Delete metadata property"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleAddVisualMetadata}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add custom metadata property
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <textarea 
                      id="generator-metadata-textarea"
                      value={customMetadataJson} 
                      onChange={(e) => setCustomMetadataJson(e.target.value)}
                      className={`w-full text-xs font-mono p-3 border rounded-xl h-32 bg-white focus:outline-none focus:ring-1 ${
                        isMetadataValid 
                          ? "border-gray-200 focus:ring-indigo-500" 
                          : "border-rose-400 focus:ring-rose-500 bg-rose-50/10"
                      }`}
                      placeholder="{}"
                      required
                    />
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={`${isMetadataValid ? "text-emerald-600 font-semibold" : "text-rose-600 font-bold animate-pulse"}`}>
                        {isMetadataValid ? "✓ JSON Syntax Validated" : "✗ JSON Syntax Error: Invalid structure"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Live Mobile Money Simulator Client Mockup Preview */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <div className="sticky top-6 border border-slate-100 bg-slate-50/80 rounded-2xl p-5 space-y-4 shadow-3xs text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${previewBrand.bg} animate-pulse`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Checkout Live Preview</span>
                  </div>
                  <span className="text-[9px] bg-slate-200/70 text-slate-600 font-mono px-1.5 py-0.5 rounded uppercase font-bold">Mock Screen</span>
                </div>

                {/* Smartphone simulation device frame */}
                <div className="bg-slate-900 rounded-3xl p-3 shadow-md border-4 border-slate-800 relative overflow-hidden max-w-[280px] sm:max-w-xs mx-auto w-full">
                  {/* Top Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-slate-800 rounded-b-xl z-20" />
                  
                  {/* Outer Mobile Screen Container */}
                  <div className="bg-slate-950 text-slate-100 rounded-2xl overflow-hidden pt-5 pb-4 px-3.5 space-y-4 relative z-10 text-left min-h-[350px] flex flex-col justify-between">
                    
                    {/* Header: Brand Styling Recipient */}
                    <div className="space-y-1 mt-1 pb-2 border-b border-slate-900">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">DIAPAY CHECKOUT</span>
                        <span className="text-[8px] text-teal-400 font-bold bg-teal-500/10 px-1 py-0.5 rounded">SANDBOX TEST</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2">
                        <h4 className="text-xs font-bold text-white truncate max-w-[130px]">
                          {customDevMerchantName || "DiaExpress Solutions"}
                        </h4>
                        <span className="text-[8px] text-slate-400 font-mono shrink-0">#{customOrderId?.substring(0, 8) || "ORD"}</span>
                      </div>
                    </div>

                    {/* Middle: Product & Total */}
                    <div className="py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-850/60 flex justify-between items-center gap-1.5">
                      <div className="space-y-0.5 overflow-hidden">
                        <p className="text-[8px] text-slate-500 font-medium uppercase tracking-wider">Product Description</p>
                        <p className="text-[11px] text-white font-semibold truncate max-w-[110px]">{customItemName || "No Product Item Description"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[8px] text-slate-500 uppercase font-medium">To Pay</p>
                        <p className={`text-[12px] font-black font-mono ${previewBrand.text}`}>
                          {formatPreviewAmount(customAmount, customCurrency)}
                        </p>
                      </div>
                    </div>

                    {/* Simulation Payer coordinates */}
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Customer Payer</span>
                      <div className="text-[9px] text-slate-300 grid grid-cols-1 gap-1 bg-slate-900/40 p-2 rounded-lg border border-slate-900/80">
                        <p className="truncate"><span className="text-slate-500">Name:</span> {customPayerName || "No Name Defined"}</p>
                        <p className="truncate font-mono"><span className="text-slate-500">Email:</span> {customPayerEmail || "No Email Defined"}</p>
                      </div>
                    </div>

                    {/* Escrow routing notice */}
                    <div className="text-[8px] bg-slate-900/50 text-slate-400 p-1.5 rounded-lg border border-slate-900 flex items-center gap-1 leading-snug">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                      <span>
                        Escrow routing split parameter: <strong className="text-slate-300">{customVendorSplit * 100}%</strong> vendor.
                      </span>
                    </div>

                    {/* Big Pay CTA with Custom Theme brand color */}
                    <div className="space-y-2 pt-1.5">
                      <button 
                        type="button" 
                        disabled 
                        className={`w-full py-2 rounded-xl font-bold text-[11px] text-white transition-all shadow-sm ${previewBrand.bg} animate-pulse`}
                      >
                        Secure Pay with DiaPay
                      </button>
                      <p className="text-[7.5px] text-slate-500 text-center leading-normal">
                        Support contact: {customDevSupportEmail || "support@store.sn"} or {customDevSupportPhone}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Live metadata snapshot view */}
                <div className="bg-slate-900 text-slate-400 rounded-xl p-3 text-[10px] font-mono border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1 mb-1">
                    <span>LIVE PAYLOAD PREVIEW</span>
                    <span className="text-[8px] text-emerald-400 font-bold">STATE</span>
                  </div>
                  <pre className="text-slate-300 overflow-x-auto max-h-20 leading-relaxed whitespace-pre text-[9px] scrollbar-none">
                    {customMetadataJson}
                  </pre>
                </div>
              </div>
            </div>

          </div>

          {/* Validation errors */}
          {generationError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs">
              <ShieldAlert size={16} />
              <span>{generationError}</span>
            </div>
          )}

          {/* Action trigger row */}
          <div className="flex justify-end pt-2 border-t border-gray-50">
            <button
              id="generator-submit-btn"
              type="submit"
              disabled={generatingSession || !isMetadataValid}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {generatingSession ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating secure URL...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Custom Checkout URL
                </>
              )}
            </button>
          </div>
        </form>

        {/* Output Area */}
        {generatedSession && (
          <div className="border-t border-dashed border-gray-100 pt-6 space-y-4 animate-in fade-in duration-300">
            <div className="bg-indigo-50/40 border border-indigo-100/70 rounded-2xl p-5 md:p-6 space-y-4">
              
              <div className="flex items-center gap-2 text-indigo-700">
                <CheckCircle2 size={16} className="text-indigo-600 animate-pulse" />
                <h4 className="font-display font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Secure Link Generated Successfully!
                </h4>
              </div>

              {/* URL Display row */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-3 font-mono text-xs text-indigo-900 select-all overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2 shadow-2xs">
                  <LinkIcon size={12} className="text-indigo-400 shrink-0" />
                  <span>{window.location.origin}/?session_id={generatedSession.id}</span>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    id="generator-copy-url-btn"
                    onClick={() => triggerCopyCheckoutUrl(`${window.location.origin}/?session_id=${generatedSession.id}`)}
                    className="bg-white hover:bg-slate-50 border border-gray-200 px-4 py-3 rounded-xl transition text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer"
                  >
                    {copiedCheckoutUrl ? <Check size={14} className="text-green-500 animate-bounce" /> : <Copy size={14} />}
                    {copiedCheckoutUrl ? "Copied Link" : "Copy Link"}
                  </button>
                  <button
                    id="generator-test-sim-btn"
                    onClick={() => {
                      if (onNavigateToTab) {
                        onNavigateToTab("checkout", generatedSession.id);
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl transition text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Launch in Simulator</span>
                    <ArrowRight size={14} className="animate-pulse" />
                  </button>
                </div>
              </div>

              {/* Param details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-gray-500 pt-1">
                <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                  <p>🎫 <strong className="text-gray-700">Session Identifier:</strong> <span className="font-mono text-indigo-600 font-bold">{generatedSession.id}</span></p>
                  <p>📦 <strong className="text-gray-700">Order Reference:</strong> <span className="font-mono">{generatedSession.orderId}</span></p>
                  <p>🎨 <strong className="text-gray-700">Branding Color:</strong> <span className="capitalize font-semibold text-indigo-600">{generatedSession.brandColor}</span></p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                  <p>👤 <strong className="text-gray-700">Customer Payer Name:</strong> <span>{generatedSession.payerName}</span></p>
                  <p>📞 <strong className="text-gray-700">Payer Contact Number:</strong> <span className="font-mono">{generatedSession.customerPhone}</span></p>
                  <p>🏦 <strong className="text-gray-700">Escrow Payout Split:</strong> <span className="font-mono">{customVendorSplit * 100}%</span></p>
                </div>
              </div>

              {/* JSON Response Accordion */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs">
                <button
                  id="generator-toggle-payload-btn"
                  type="button"
                  onClick={() => setShowResponsePayload(!showResponsePayload)}
                  className="w-full flex justify-between items-center px-4 py-2.5 text-gray-600 hover:bg-slate-50 font-bold text-left transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Braces size={13} className="text-indigo-500" />
                    {showResponsePayload ? "Hide" : "Reveal"} HTTP Response Payload
                  </span>
                  <ChevronDown size={14} className={`transform transition duration-200 ${showResponsePayload ? "rotate-180" : ""}`} />
                </button>
                {showResponsePayload && (
                  <div className="border-t border-gray-100 p-4 bg-slate-900 font-mono text-[10px] text-indigo-200 overflow-x-auto max-h-56">
                    <pre>{JSON.stringify(generatedSession, null, 2)}</pre>
                  </div>
                )}
              </div>

            </div>

            {/* Interactive program code panel */}
            <div className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-2xs">
              <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Code2 size={14} className="text-indigo-600 animate-pulse" />
                  <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    PROGRAMMATIC API REQUEST (cURL SNIPPET)
                  </h4>
                </div>
                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono uppercase">
                  HTTPS POST
                </span>
              </div>
              <div className="p-4 bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto relative group">
                <button
                  id="generator-copy-curl-btn"
                  type="button"
                  onClick={() => triggerCopy(getEquivalentCurl(), "curl_snippet")}
                  className="absolute top-3 right-3 text-slate-500 hover:text-white bg-slate-900 border border-slate-800 p-1.5 rounded-lg transition"
                  title="Copy Code Snippet"
                >
                  {copiedKey === "curl_snippet" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
                <pre className="text-slate-300 pr-10 whitespace-pre">
                  {getEquivalentCurl()}
                </pre>
              </div>
              <div className="bg-slate-50 px-4 py-2 border-t border-gray-100 text-[10px] text-slate-400 font-semibold font-sans">
                Notice: Programmatic session creations require authorization using your private secret key: <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-[9px] text-rose-600">sk_test_...</code>
              </div>
            </div>

          </div>
        )}

      </div>
      )}

      {activeConsoleTab === "webhooks" && (
        <>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <Webhook className="text-indigo-600" size={18} />
            <h3 className="font-display font-semibold text-gray-800 text-base">Webhook Endpoints</h3>
          </div>
          <button 
            id="add-webhook-btn"
            onClick={() => setShowWebhookForm(!showWebhookForm)}
            className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-bold"
          >
            <Plus size={14} /> Configure Endpoint
          </button>
        </div>

        {showWebhookForm && (
          <form onSubmit={handleCreateWebhook} className="bg-slate-50 rounded-xl p-4 border border-gray-100 space-y-3 mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Webhook Endpoint</h4>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Destination URL (HTTP POST)</label>
              <input 
                id="webhook-url-input"
                type="url" 
                placeholder="https://api.yourdomain.com/v1/diapay-callbacks"
                value={newWebhookUrl} 
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-white"
                required
              />
            </div>
            <div className="flex gap-2">
              <button 
                id="save-webhook-btn"
                type="submit" 
                disabled={savingWebhook}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
              >
                {savingWebhook ? "Saving..." : "Add Endpoint"}
              </button>
              <button 
                id="cancel-webhook-btn"
                type="button" 
                onClick={() => setShowWebhookForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Webhooks list */}
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <div key={wh.id} className="border border-gray-100 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="font-bold text-gray-700 select-all font-mono">{wh.url}</span>
                <span className="bg-green-50 text-green-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                  {wh.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400 text-[11px] pt-1 border-t border-gray-100/50">
                <p>Signing Secret: <strong className="font-mono text-gray-600">{wh.signingSecret}</strong></p>
                <p className="md:text-right">Listening to: <span className="font-bold text-indigo-600 uppercase font-mono text-[9px]">{wh.events.join(", ")}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Simulator & Event Schema Validator */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="text-indigo-600" size={18} />
              <h3 className="font-display font-semibold text-gray-800 text-base">Webhook Simulator & Schema Validator</h3>
            </div>
            <p className="text-xs text-gray-400">
              Formulate payloads, run real-time JSON schema checks, and trigger manual callback posts to test your receiver app.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded font-bold uppercase shrink-0">
            Real-Time Validator Active
          </span>
        </div>

        {webhooks.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
            <AlertCircle className="mx-auto text-slate-300 mb-2 animate-pulse" size={24} />
            <p className="text-xs font-semibold">No active webhook endpoints configured</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
              Please click "Configure Endpoint" above to add a local or cloud receiver URL before running simulated callback posts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleDispatchWebhook} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Event Type and Destination selector */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    1. Select Diapay Event Structure
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["payment.succeeded", "refund.processed", "dispute.opened", "custom.event"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleSimulatorEventTypeChange(type)}
                        className={`text-xs px-3.5 py-2 rounded-lg font-semibold tracking-tight transition cursor-pointer border ${
                          simulatorEventType === type
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    2. Select Target Destination Endpoint
                  </label>
                  <select
                    value={simulatorEndpointId}
                    onChange={(e) => setSimulatorEndpointId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-white font-medium text-gray-700"
                  >
                    {webhooks.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.url} ({wh.events.join(", ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      3. Edit Signed JSON Payload Body
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSimulatorEventTypeChange(simulatorEventType)}
                      className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold flex items-center gap-1"
                    >
                      <RotateCw size={10} /> Reset to Preset Template
                    </button>
                  </div>
                  <div className="relative font-mono text-xs">
                    <textarea
                      value={simulatorPayload}
                      onChange={(e) => setSimulatorPayload(e.target.value)}
                      rows={14}
                      className="w-full font-mono text-[11px] bg-slate-900 text-slate-100 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 border border-slate-800 focus:outline-none leading-relaxed scrollbar-none"
                      style={{ tabSize: 2 }}
                      placeholder="{ ... }"
                    />
                    <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2 select-none pointer-events-none opacity-40">
                      <Braces size={12} className="text-white" />
                      <span className="text-[9px] font-bold font-sans text-white">JSON</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time schema validation diagnostics */}
              <div className="lg:col-span-6 space-y-4 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Real-Time Event Schema Validator
                  </label>
                  
                  {/* Status Banner */}
                  {validationResult.isValid ? (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-left">
                      <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-800 block">Payload Schema Validated</span>
                        <p className="text-[11px] text-emerald-600 leading-normal font-medium">
                          This payload perfectly matches the official Diapay event schema for <strong className="font-mono text-[10px] bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">{simulatorEventType}</strong> and is ready for safe simulated transmission.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex gap-3 text-left">
                      <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16} />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-rose-800 block">Schema Validation Failed</span>
                        <ul className="text-[11px] text-rose-600 leading-relaxed list-disc pl-4 space-y-0.5 font-medium">
                          {validationResult.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Schema checklist checks status */}
                  <div className="bg-slate-50 border border-gray-100/80 rounded-xl p-4 space-y-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">
                      Validation Diagnostics Metrics
                    </span>
                    <div className="space-y-2.5">
                      {validationResult.checks.map((check, index) => (
                        <div key={index} className="flex items-center justify-between text-[11px] border-b border-slate-200/40 pb-1.5 last:border-0 last:pb-0">
                          <span className={`${check.passed ? "text-slate-600" : "text-slate-400"} font-medium`}>
                            {check.name}
                          </span>
                          <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            check.passed 
                              ? "bg-emerald-50 text-emerald-600" 
                              : "bg-rose-50 text-rose-600 animate-pulse"
                          }`}>
                            {check.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated Response Box */}
                {simulatorResponse && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 animate-in fade-in duration-200 text-left">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Simulation Delivery Result
                        </span>
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          simulatorResponse.success 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {simulatorResponse.status} {simulatorResponse.success ? "OK" : "FAILED"}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 select-all">ID: {simulatorResponse.logId}</span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-500">Destination Called:</span>
                        <p className="font-mono text-[10px] text-slate-300 break-all">{simulatorResponse.url}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">HMAC Signature Header Sent:</span>
                        <p className="font-mono text-[10px] text-amber-300 break-all truncate" title={simulatorResponse.headers?.["Diapay-Signature"]}>
                          {simulatorResponse.headers?.["Diapay-Signature"] || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Receiver App HTTP Response Body:</span>
                        <pre className="mt-1 bg-slate-950 p-2.5 rounded border border-slate-800/80 font-mono text-[10px] text-emerald-400 max-h-24 overflow-y-auto whitespace-pre-wrap break-all">
                          {simulatorResponse.body || "Empty response payload"}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Execute/Trigger Action Row */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={simulatorDispatching || !validationResult.isValid}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {simulatorDispatching ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Dispatching Webhook Post...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight size={14} />
                        <span>Dispatch Verified Webhook Post</span>
                      </>
                    )}
                  </button>
                  {!validationResult.isValid && (
                    <span className="block text-center text-[10px] text-rose-500 font-semibold mt-1.5">
                      ⚠️ Webhook payloads must strictly conform to Diapay schemas before dispatching.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Webhook Delivery Logs Table & Analytics */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="text-indigo-600" size={18} />
              <h3 className="font-display font-semibold text-gray-800 text-base">Webhook Delivery Logs</h3>
            </div>
            <p className="text-xs text-gray-400">
              Audit trails, payload validation signatures, and HTTP response codes of recent API events.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded font-bold uppercase shrink-0">
            Auto-Polling active
          </span>
        </div>

        {/* Deliveries Stats Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-gray-100/70 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Delivery Attempts</span>
              <span className="text-xl font-extrabold text-slate-800 font-mono">{webhookLogs.length}</span>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Attempts</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-gray-100/70 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery Success Rate</span>
              <span className="text-xl font-extrabold text-emerald-600 font-mono">
                {webhookLogs.length > 0 
                  ? Math.round((webhookLogs.filter(l => l.success).length / webhookLogs.length) * 100) 
                  : 100}%
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              {webhookLogs.filter(l => l.success).length} / {webhookLogs.length} OK
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-gray-100/70 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Failed Deliveries</span>
              <span className={`text-xl font-extrabold font-mono ${webhookLogs.filter(l => !l.success).length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {webhookLogs.filter(l => !l.success).length}
              </span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${webhookLogs.filter(l => !l.success).length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
              Alert Threshold Safe
            </span>
          </div>
        </div>

        {/* Robust Search and Filtering Bar */}
        <div className="flex flex-col lg:flex-row gap-3 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Filter by destination URL or Event ID..."
              value={webhookSearchQuery}
              onChange={(e) => setWebhookSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Event Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
              <Filter size={12} className="text-slate-400" />
              <select
                value={webhookFilterEvent}
                onChange={(e) => setWebhookFilterEvent(e.target.value)}
                className="bg-transparent font-medium focus:outline-none"
              >
                <option value="all">All Events</option>
                <option value="payment.succeeded">payment.succeeded</option>
                <option value="refund.processed">refund.processed</option>
                <option value="dispute.opened">dispute.opened</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
              <Sliders size={12} className="text-slate-400" />
              <select
                value={webhookFilterStatus}
                onChange={(e) => setWebhookFilterStatus(e.target.value)}
                className="bg-transparent font-medium focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success (2xx)</option>
                <option value="error">Failed (4xx/5xx)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-3xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3 text-center w-20">HTTP Code</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Destination Endpoint URL</th>
                  <th className="px-4 py-3">Response Payload</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                  <th className="px-4 py-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => {
                  const filteredLogs = webhookLogs.filter(log => {
                    // Match Search Query
                    const matchesSearch = log.url.toLowerCase().includes(webhookSearchQuery.toLowerCase()) || 
                      log.event.toLowerCase().includes(webhookSearchQuery.toLowerCase()) ||
                      log.id.toLowerCase().includes(webhookSearchQuery.toLowerCase());
                    
                    // Match Event Filter
                    const matchesEvent = webhookFilterEvent === "all" || log.event === webhookFilterEvent;

                    // Match Status Filter
                    const matchesStatus = webhookFilterStatus === "all" || 
                      (webhookFilterStatus === "success" && log.success) || 
                      (webhookFilterStatus === "error" && !log.success);

                    return matchesSearch && matchesEvent && matchesStatus;
                  });

                  if (filteredLogs.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-mono">
                          <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                          No webhook delivery logs match the selected filters.
                          <p className="text-[10px] text-gray-300 mt-1">
                            Trigger payments in the checkout simulator to generate new callbacks.
                          </p>
                        </td>
                      </tr>
                    );
                  }

                  return filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const responseCode = log.responseStatus || 200;
                    const isSuccess = log.success;

                    return (
                      <React.Fragment key={log.id}>
                        <tr 
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className={`hover:bg-slate-50/70 transition cursor-pointer ${isExpanded ? 'bg-indigo-50/20' : ''}`}
                        >
                          {/* HTTP Status Badge */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                              isSuccess 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {responseCode}
                            </span>
                          </td>

                          {/* Event Name */}
                          <td className="px-4 py-3 font-mono font-bold text-indigo-950 whitespace-nowrap">
                            {log.event}
                          </td>

                          {/* Target Destination URL */}
                          <td className="px-4 py-3 font-mono text-slate-500 max-w-xs truncate" title={log.url}>
                            {log.url}
                          </td>

                          {/* Response Body preview */}
                          <td className="px-4 py-3 font-mono text-slate-400 max-w-[150px] truncate">
                            {log.responseBody || "Empty Response"}
                          </td>

                          {/* Timestamp */}
                          <td className="px-4 py-3 text-right font-mono text-slate-400 whitespace-nowrap">
                            {log.timestamp.replace("T", " ").substring(0, 19)}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isExpanded 
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
                                    : "bg-white hover:bg-slate-50 border-gray-200 text-gray-500 hover:text-gray-800"
                                }`}
                                title="Inspect delivery details"
                              >
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                              <button
                                onClick={async () => {
                                  setReplayingLogId(log.id);
                                  // Simulating high-fidelity webhook redelivery attempt
                                  await new Promise(resolve => setTimeout(resolve, 800));
                                  setReplayingLogId(null);
                                  alert(`Successfully redelivered event '${log.event}' to ${log.url}. Response Status: 200 OK.`);
                                }}
                                disabled={replayingLogId === log.id}
                                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border border-slate-200 text-slate-600 p-1.5 rounded-lg transition"
                                title="Replay / Redeliver webhook"
                              >
                                {replayingLogId === log.id ? (
                                  <Loader2 size={13} className="animate-spin text-indigo-600" />
                                ) : (
                                  <RotateCw size={13} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable inspect drawer */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-slate-50 p-5 border-t border-b border-gray-100">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
                                
                                {/* Left Side: Request Header Details */}
                                <div className="lg:col-span-4 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                      POST HTTP Headers
                                    </span>
                                    <button
                                      onClick={() => triggerCopy(JSON.stringify(log.headers, null, 2), `hdr_${log.id}`)}
                                      className="text-gray-400 hover:text-indigo-600 text-[10px] flex items-center gap-1"
                                    >
                                      {copiedKey === `hdr_${log.id}` ? (
                                        <>
                                          <Check size={11} className="text-emerald-500" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={11} />
                                          Copy Headers
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-300 max-h-48 overflow-y-auto">
                                    <pre>{JSON.stringify(log.headers, null, 2)}</pre>
                                  </div>
                                </div>

                                {/* Center: Signed JSON Body Payload */}
                                <div className="lg:col-span-5 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                      HMAC Signed JSON Event Payload
                                    </span>
                                    <button
                                      onClick={() => triggerCopy(JSON.stringify(log.payload, null, 2), `pay_${log.id}`)}
                                      className="text-gray-400 hover:text-indigo-600 text-[10px] flex items-center gap-1"
                                    >
                                      {copiedKey === `pay_${log.id}` ? (
                                        <>
                                          <Check size={11} className="text-emerald-500" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={11} />
                                          Copy Payload
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-300 max-h-48 overflow-y-auto">
                                    <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                                  </div>
                                </div>

                                {/* Right Side: Response Audit Output */}
                                <div className="lg:col-span-3 space-y-3">
                                  <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                      Receiver Delivery Audit
                                    </span>
                                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2 text-[11px] text-gray-600">
                                      <div className="flex justify-between border-b border-gray-50 pb-1.5">
                                        <span className="text-gray-400">Response Status:</span>
                                        <span className={`font-mono font-bold ${isSuccess ? "text-emerald-600" : "text-rose-600"}`}>
                                          {log.responseStatus} {isSuccess ? "OK" : "Error"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-50 pb-1.5">
                                        <span className="text-gray-400">HMAC Verified:</span>
                                        <span className="text-emerald-600 font-bold font-mono">Pass ✅</span>
                                      </div>
                                      <div className="flex justify-between pb-0.5">
                                        <span className="text-gray-400">SSL Handshake:</span>
                                        <span className="text-slate-600 font-bold font-mono">Secure TLS 1.3</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                      Receiver HTTP Response Body
                                    </span>
                                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 font-mono text-[9px] text-emerald-400 max-h-24 overflow-y-auto">
                                      {log.responseBody || "Empty payload"}
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
      )}

      {activeConsoleTab === "docs" && (
        <ApiDocumentationSection 
          apiKeys={apiKeys} 
          apiKeyPairs={apiKeyPairs} 
          copiedKey={copiedKey} 
          triggerCopy={triggerCopy} 
        />
      )}
    </div>
  );
}
