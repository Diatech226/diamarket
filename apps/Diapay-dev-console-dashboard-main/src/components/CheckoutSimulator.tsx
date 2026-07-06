import React, { useState, useEffect } from "react";
import { 
  CheckoutSession, 
  PaymentMethod, 
  MobileOperator, 
  CheckoutSessionStatus, 
  PaymentStatus 
} from "../types";
import { 
  Smartphone, 
  CreditCard, 
  Coins, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  PlusCircle, 
  ArrowLeft,
  XCircle,
  HelpCircle
} from "lucide-react";

interface CheckoutSimulatorProps {
  onPaymentSuccess: () => void;
  initialSessionId?: string | null;
  onClearInitialSessionId?: () => void;
}

export default function CheckoutSimulator({ 
  onPaymentSuccess,
  initialSessionId = null,
  onClearInitialSessionId
}: CheckoutSimulatorProps) {
  // Session management
  const [sessions, setSessions] = useState<CheckoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<CheckoutSession | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Form states
  const [selectedCountry, setSelectedCountry] = useState("SN");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.MOBILE_MONEY);
  const [selectedOperator, setSelectedOperator] = useState<MobileOperator>(MobileOperator.ORANGE);
  const [phoneNumber, setPhoneNumber] = useState("+221 77 452 89 12");
  const [emailAddress, setEmailAddress] = useState("payer@diamarket.sn");
  
  // Custom Session Creator states
  const [showCreator, setShowCreator] = useState(false);
  const [customItem, setCustomItem] = useState("Marketplace Seller Split Payout #998");
  const [customAmount, setCustomAmount] = useState("250000");
  const [customSplit, setCustomSplit] = useState("0.85"); // 85% to vendor, 15% platform

  // Custom Developer Merchant / Brand info
  const [devMerchantName, setDevMerchantName] = useState("Dakar Fashion Store");
  const [devSupportEmail, setDevSupportEmail] = useState("billing@dakarfashion.sn");
  const [devSupportPhone, setDevSupportPhone] = useState("+221 77 123 45 67");
  const [devBrandColor, setDevBrandColor] = useState("indigo"); // "indigo" | "teal" | "rose" | "emerald" | "amber"
  
  // Custom Payer info
  const [customPayerName, setCustomPayerName] = useState("Aminata Diallo");
  const [customPayerPhone, setCustomPayerPhone] = useState("+221 77 452 89 12");
  const [customPayerEmail, setCustomPayerEmail] = useState("aminata@gmail.com");

  // Transaction execution states
  const [paymentStep, setPaymentStep] = useState<"form" | "otp_wait" | "ussd_wait" | "card_3ds" | "success" | "error">("form");
  const [otpCode, setOtpCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [executingPayment, setExecutingPayment] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any>(null);

  // Fetch active checkout sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/v1/checkout/sessions");
      const data = await res.json();
      setSessions(data);
      // Select the first open session or create one
      const open = data.find((s: CheckoutSession) => s.status === CheckoutSessionStatus.OPEN);
      if (open) {
        setActiveSession(open);
      } else if (data.length > 0) {
        setActiveSession(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Handle deep-linked initial session selection
  useEffect(() => {
    if (initialSessionId) {
      const found = sessions.find(s => s.id === initialSessionId);
      if (found) {
        setActiveSession(found);
        setPaymentStep("form");
        if (onClearInitialSessionId) onClearInitialSessionId();
      } else if (sessions.length > 0) {
        // fetch it specifically
        fetch(`/api/v1/checkout/sessions/${initialSessionId}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error("Session not found");
          })
          .then(data => {
            setSessions(prev => {
              if (prev.some(s => s.id === data.id)) return prev;
              return [data, ...prev];
            });
            setActiveSession(data);
            setPaymentStep("form");
            if (onClearInitialSessionId) onClearInitialSessionId();
          })
          .catch(err => console.error(err));
      }
    }
  }, [initialSessionId, sessions]);

  // Update default phone/operator when country changes, EXCEPT when activeSession has payer coordinates
  useEffect(() => {
    if (activeSession && activeSession.customerPhone) {
      setPhoneNumber(activeSession.customerPhone);
      if (activeSession.customerEmail) {
        setEmailAddress(activeSession.customerEmail);
      }
      return;
    }

    if (selectedCountry === "SN") {
      setPhoneNumber("+221 77 452 89 12");
      setSelectedOperator(MobileOperator.ORANGE);
    } else if (selectedCountry === "CI") {
      setPhoneNumber("+225 07 89 45 12");
      setSelectedOperator(MobileOperator.WAVE);
    } else if (selectedCountry === "TG") {
      setPhoneNumber("+228 90 12 34 56");
      setSelectedOperator(MobileOperator.MOOV);
    } else if (selectedCountry === "BJ") {
      setPhoneNumber("+229 97 11 22 33");
      setSelectedOperator(MobileOperator.MTN);
    }
  }, [selectedCountry, activeSession]);

  // Synchronize custom client details when active session changes
  useEffect(() => {
    if (activeSession) {
      if (activeSession.payerName) {
        setCustomPayerName(activeSession.payerName);
      }
      if (activeSession.customerPhone) {
        setPhoneNumber(activeSession.customerPhone);
      }
      if (activeSession.customerEmail) {
        setEmailAddress(activeSession.customerEmail);
      }
      if (activeSession.countryCode) {
        setSelectedCountry(activeSession.countryCode);
      }
    }
  }, [activeSession]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/checkout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          itemName: customItem,
          amount: Number(customAmount),
          currency: "XOF",
          vendorSplit: Number(customSplit),
          developerMerchantName: devMerchantName,
          developerSupportEmail: devSupportEmail,
          developerSupportPhone: devSupportPhone,
          payerName: customPayerName,
          customerPhone: customPayerPhone,
          customerEmail: customPayerEmail,
          brandColor: devBrandColor
        })
      });
      if (res.ok) {
        const newSess = await res.json();
        setActiveSession(newSess);
        setShowCreator(false);
        setPaymentStep("form");
        // Refetch list
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    if (selectedMethod === PaymentMethod.MOBILE_MONEY) {
      if (selectedOperator === MobileOperator.ORANGE) {
        // Orange Money Senegal / Ivory Coast requires OTP flow
        setPaymentStep("otp_wait");
      } else {
        // Wave/MTN/Moov trigger direct USSD Push notifications
        setPaymentStep("ussd_wait");
      }
    } else if (selectedMethod === PaymentMethod.BANK_CARD) {
      setPaymentStep("card_3ds");
    } else {
      // Crypto / stablecoin direct completion for simulation
      submitCompletedPayment();
    }
  };

  const submitCompletedPayment = async () => {
    if (!activeSession) return;
    setExecutingPayment(true);
    setVerificationError("");

    try {
      const res = await fetch(`/api/v1/checkout/sessions/${activeSession.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: phoneNumber,
          customerEmail: emailAddress,
          paymentMethod: selectedMethod,
          mobileOperator: selectedOperator,
          countryCode: selectedCountry
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessDetails(data);
        setPaymentStep("success");
        onPaymentSuccess();
        fetchSessions();
      } else {
        setVerificationError(data.error || "Payment failed to settle");
        setPaymentStep("error");
      }
    } catch (err) {
      setVerificationError("Network error settling transaction");
      setPaymentStep("error");
    } finally {
      setExecutingPayment(false);
    }
  };

  const countries = [
    { code: "SN", name: "Senegal (XOF)", operators: [MobileOperator.ORANGE, MobileOperator.WAVE] },
    { code: "CI", name: "Ivory Coast (XOF)", operators: [MobileOperator.ORANGE, MobileOperator.WAVE, MobileOperator.MTN, MobileOperator.MOOV] },
    { code: "TG", name: "Togo (XOF)", operators: [MobileOperator.MOOV, MobileOperator.MTN] },
    { code: "BJ", name: "Benin (XOF)", operators: [MobileOperator.MTN, MobileOperator.MOOV] }
  ];

  const getBrandColors = () => {
    const color = activeSession?.metadata?.meta_brand_color || activeSession?.brandColor || "indigo";
    if (color.startsWith("#")) {
      return {
        text: "text-white",
        bg: "hover:brightness-110",
        bgStyle: { backgroundColor: color },
        border: "border-slate-700",
        glow: "bg-slate-500/10",
        badge: "bg-slate-800 text-slate-300",
        ring: "focus:ring-slate-500",
        accent: "text-slate-300 border-slate-700 bg-slate-800",
        buttonBg: "hover:brightness-110",
        customStyle: true,
        primaryColor: color
      };
    }
    switch (color) {
      case "teal":
        return {
          text: "text-teal-400",
          bg: "bg-teal-600 hover:bg-teal-500",
          border: "border-teal-500",
          glow: "bg-teal-500/10",
          badge: "bg-teal-500/20 text-teal-400",
          ring: "focus:ring-teal-500",
          accent: "text-teal-400 border-teal-500 bg-teal-500/10",
          buttonBg: "bg-teal-600 hover:bg-teal-500"
        };
      case "rose":
        return {
          text: "text-rose-400",
          bg: "bg-rose-600 hover:bg-rose-500",
          border: "border-rose-500",
          glow: "bg-rose-500/10",
          badge: "bg-rose-500/20 text-rose-400",
          ring: "focus:ring-rose-500",
          accent: "text-rose-400 border-rose-500 bg-rose-500/10",
          buttonBg: "bg-rose-600 hover:bg-rose-500"
        };
      case "emerald":
        return {
          text: "text-emerald-400",
          bg: "bg-emerald-600 hover:bg-emerald-500",
          border: "border-emerald-500",
          glow: "bg-emerald-500/10",
          badge: "bg-emerald-500/20 text-emerald-400",
          ring: "focus:ring-emerald-500",
          accent: "text-emerald-400 border-emerald-500 bg-emerald-500/10",
          buttonBg: "bg-emerald-600 hover:bg-emerald-500"
        };
      case "amber":
        return {
          text: "text-amber-400",
          bg: "bg-amber-600 hover:bg-amber-500",
          border: "border-amber-500",
          glow: "bg-amber-500/10",
          badge: "bg-amber-500/20 text-amber-400",
          ring: "focus:ring-amber-500",
          accent: "text-amber-400 border-amber-500 bg-amber-500/10",
          buttonBg: "bg-amber-600 hover:bg-amber-500"
        };
      case "indigo":
      default:
        return {
          text: "text-indigo-400",
          bg: "bg-indigo-600 hover:bg-indigo-500",
          border: "border-indigo-500",
          glow: "bg-indigo-600/10",
          badge: "bg-indigo-500/20 text-indigo-400",
          ring: "focus:ring-indigo-500",
          accent: "text-indigo-400 border-indigo-500 bg-indigo-500/10",
          buttonBg: "bg-indigo-600 hover:bg-indigo-500"
        };
    }
  };

  const brand = getBrandColors();

  return (
    <div id="checkout-simulator-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      {/* Session selector left sidebar */}
      <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-gray-800 text-lg">Checkout Sessions</h3>
          <button 
            id="toggle-creator-btn"
            onClick={() => setShowCreator(!showCreator)} 
            className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition px-2 py-1.5 rounded-lg flex items-center gap-1 font-medium"
          >
            <PlusCircle size={14} />
            New Session
          </button>
        </div>

        {showCreator ? (
          <form onSubmit={handleCreateSession} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 max-h-[500px] overflow-y-auto scrolling-scrollbar text-left">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-1.5 mb-1">
              Create Custom Checkout
            </h4>
            
            {/* 1. Transaction Info */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-indigo-600 uppercase block tracking-wider">1. Order Details</span>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Product / Item Description</label>
                <input 
                  id="custom-item-input"
                  type="text" 
                  value={customItem} 
                  onChange={(e) => setCustomItem(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Amount (XOF)</label>
                  <input 
                    id="custom-amount-input"
                    type="number" 
                    value={customAmount} 
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Vendor Split</label>
                  <select 
                    id="custom-split-select"
                    value={customSplit} 
                    onChange={(e) => setCustomSplit(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="0.9">90% Vendor</option>
                    <option value="0.85">85% Vendor</option>
                    <option value="0.8">80% Vendor</option>
                    <option value="0.7">70% Vendor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Developer Branding Details */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[9px] font-bold text-indigo-600 uppercase block tracking-wider">2. Merchant Branding</span>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Business / Merchant Name</label>
                <input 
                  id="custom-dev-merchant-name"
                  type="text" 
                  value={devMerchantName} 
                  onChange={(e) => setDevMerchantName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. Dakar Tech Shop"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Support Email</label>
                  <input 
                    id="custom-dev-support-email"
                    type="email" 
                    value={devSupportEmail} 
                    onChange={(e) => setDevSupportEmail(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                    placeholder="support@merchant.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Support Phone</label>
                  <input 
                    id="custom-dev-support-phone"
                    type="text" 
                    value={devSupportPhone} 
                    onChange={(e) => setDevSupportPhone(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                    placeholder="+221 77..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Theme Brand Color</label>
                <select 
                  id="custom-dev-brand-color"
                  value={devBrandColor} 
                  onChange={(e) => setDevBrandColor(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="indigo">Indigo (Default)</option>
                  <option value="teal">Teal (Modern Tech)</option>
                  <option value="rose">Rose (Elegant Coral)</option>
                  <option value="emerald">Emerald (Organic Mint)</option>
                  <option value="amber">Amber (Sunset Gold)</option>
                </select>
              </div>
            </div>

            {/* 3. Payer / Client Details */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[9px] font-bold text-indigo-600 uppercase block tracking-wider">3. Client (Payer) Details</span>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Client Full Name</label>
                <input 
                  id="custom-payer-name"
                  type="text" 
                  value={customPayerName} 
                  onChange={(e) => setCustomPayerName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                  placeholder="Aminata Diallo"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Client Phone</label>
                  <input 
                    id="custom-payer-phone"
                    type="text" 
                    value={customPayerPhone} 
                    onChange={(e) => setCustomPayerPhone(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white font-mono"
                    placeholder="+221..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Client Email</label>
                  <input 
                    id="custom-payer-email"
                    type="email" 
                    value={customPayerEmail} 
                    onChange={(e) => setCustomPayerEmail(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 bg-white"
                    placeholder="payer@email.sn"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button 
                id="save-session-btn"
                type="submit" 
                className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition cursor-pointer"
              >
                Launch Checkout
              </button>
              <button 
                id="cancel-session-btn"
                type="button" 
                onClick={() => setShowCreator(false)} 
                className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold py-2 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto scrolling-scrollbar">
            {loadingSessions ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-300" /></div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No sessions found. Create one above!</p>
            ) : (
              sessions.map((sess) => (
                <div 
                  key={sess.id}
                  id={`session-item-${sess.id}`}
                  onClick={() => {
                    setActiveSession(sess);
                    setPaymentStep("form");
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    activeSession?.id === sess.id 
                      ? "border-indigo-600 bg-indigo-50/40 shadow-xs" 
                      : "border-gray-100 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-gray-400 font-bold">{sess.orderId}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium uppercase ${
                      sess.status === CheckoutSessionStatus.COMPLETED 
                        ? "bg-green-50 text-green-600" 
                        : sess.status === CheckoutSessionStatus.OPEN
                        ? "bg-amber-50 text-amber-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {sess.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-gray-700 truncate">{sess.itemName}</h4>
                  <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-gray-100/50">
                    <span className="text-[10px] text-gray-500">Amount:</span>
                    <span className="text-xs font-bold text-gray-800">
                      {sess.amount.toLocaleString()} {sess.currency}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-left">
          <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
            <Info size={12} className="text-slate-500" />
            African Payments Realities
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Standard global checkout forms require billing addresses and emails. In Francophone Africa, 
            <strong> Phone + Country + Mobile Operator</strong> act as the primary, high-frictionless merchant coordinates.
          </p>
        </div>
      </div>

      {/* Main interactive terminal area */}
      <div className="lg:col-span-8 bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-800 min-h-[520px]">
        
        {/* Background glow effects */}
        <div className={`absolute top-0 right-0 w-80 h-80 ${brand.glow} rounded-full blur-3xl pointer-events-none`}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {activeSession ? (
          <>
            {/* Header section */}
            <div className="relative z-10 border-b border-slate-800 pb-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold tracking-widest ${brand.text} flex items-center gap-1.5`}>
                  {activeSession.metadata?.meta_logo_emoji && <span>{activeSession.metadata.meta_logo_emoji}</span>}
                  <span>
                    {activeSession.metadata?.meta_header_text 
                      ? activeSession.metadata.meta_header_text.toUpperCase() 
                      : (activeSession.developerMerchantName ? `${activeSession.developerMerchantName.toUpperCase()} CHECKOUT` : "DIAPAY UNIFIED CHECKOUT")}
                  </span>
                </span>
                <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono">
                  {activeSession.metadata?.meta_order_id || activeSession.orderId}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-display font-semibold tracking-tight text-white mb-1">
                  {activeSession.itemName}
                </h2>
                {activeSession.metadata?.meta_support_tier && (
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-lg shrink-0">
                    {activeSession.metadata.meta_support_tier}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-baseline mt-4">
                <span className="text-slate-400 text-xs">Total Amount due:</span>
                <span className="text-3xl font-display font-bold text-white tracking-tight">
                  {activeSession.amount.toLocaleString()}{" "}
                  <span 
                    className={`text-lg ${brand.text}`}
                    style={activeSession.metadata?.meta_brand_color ? { color: activeSession.metadata.meta_brand_color } : undefined}
                  >
                    {activeSession.metadata?.meta_currency || activeSession.currency}
                  </span>
                </span>
              </div>
            </div>

            {/* Core container for steps */}
            <div className="relative z-10 my-6 flex-1 flex flex-col justify-center">

              {/* STEP 1: PAYMENT FORM */}
              {paymentStep === "form" && (
                <form onSubmit={handleStartPayment} className="space-y-4 text-left">
                  {/* Select Country */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                      1. Payment Country
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          id={`country-tab-${c.code}`}
                          type="button"
                          onClick={() => setSelectedCountry(c.code)}
                          className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                            selectedCountry === c.code
                              ? `${brand.glow} ${brand.border} text-white`
                              : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Method */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                      2. Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        id="method-tab-momo"
                        onClick={() => setSelectedMethod(PaymentMethod.MOBILE_MONEY)}
                        className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                          selectedMethod === PaymentMethod.MOBILE_MONEY
                            ? `${brand.glow} ${brand.border} text-white`
                            : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <Smartphone size={18} />
                        <span className="text-[11px] font-medium">Mobile Money</span>
                      </button>

                      <button
                        type="button"
                        id="method-tab-card"
                        onClick={() => setSelectedMethod(PaymentMethod.BANK_CARD)}
                        className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                          selectedMethod === PaymentMethod.BANK_CARD
                            ? `${brand.glow} ${brand.border} text-white`
                            : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <CreditCard size={18} />
                        <span className="text-[11px] font-medium">Bank Card</span>
                      </button>

                      <button
                        type="button"
                        id="method-tab-crypto"
                        onClick={() => setSelectedMethod(PaymentMethod.CRYPTO)}
                        className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                          selectedMethod === PaymentMethod.CRYPTO
                            ? `${brand.glow} ${brand.border} text-white`
                            : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <Coins size={18} />
                        <span className="text-[11px] font-medium">Stablecoin USDT</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic payment options */}
                  {selectedMethod === PaymentMethod.MOBILE_MONEY && (
                    <div className="space-y-3.5 p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                      <div>
                        <label className="block text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Choose Operator
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {countries
                            .find((c) => c.code === selectedCountry)
                            ?.operators.map((op) => (
                              <button
                                key={op}
                                type="button"
                                id={`operator-tab-${op}`}
                                onClick={() => setSelectedOperator(op)}
                                className={`py-2 rounded-lg text-[11px] font-bold text-center transition border uppercase ${
                                  selectedOperator === op
                                    ? "bg-teal-500/20 border-teal-500 text-teal-400"
                                    : "bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600"
                                }`}
                              >
                                {op === "orange" ? "Orange Money" : op === "moov" ? "Moov Money" : op === "mtn" ? "MTN MoMo" : "Wave"}
                              </button>
                            ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Payer Phone Number</label>
                          <input
                            type="text"
                            id="checkout-phone-input"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 focus:ring-1 ${brand.ring} focus:outline-none text-white font-mono`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Payer Email (Optional)</label>
                          <input
                            type="email"
                            id="checkout-email-input"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            placeholder="payer@email.com"
                            className={`w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 focus:ring-1 ${brand.ring} focus:outline-none text-slate-300 font-mono`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMethod === PaymentMethod.BANK_CARD && (
                    <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3.5 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Payer Name</label>
                          <input
                            type="text"
                            defaultValue={activeSession.payerName || "Aminata Diallo"}
                            placeholder="Moussa Diop"
                            className={`w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 focus:ring-1 ${brand.ring} focus:outline-none text-white`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Email Address</label>
                          <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className={`w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 focus:ring-1 ${brand.ring} focus:outline-none text-white`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="4000 1234 5678 9010"
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 focus:outline-none text-white font-mono"
                          />
                          <span className="absolute right-3 top-3.5 text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded">VISA / MC</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 focus:outline-none text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">CVC Security</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 focus:outline-none text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMethod === PaymentMethod.CRYPTO && (
                    <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl text-left space-y-3.5">
                      <div className={`flex items-center gap-3 ${brand.glow} p-3 rounded-xl border ${brand.border}/20`}>
                        <Coins className={brand.text} />
                        <div>
                          <h4 className="text-xs font-bold text-white">MultiversX / Ethereum / Tron Stablecoin Gateway</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                            Diapay auto-liquidity converts USDT directly into West African CFA franc (XOF) using legal local crypto liquidity pairs.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">USDT Receiving Address</label>
                          <input
                            type="text"
                            readOnly
                            value="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                            className={`w-full text-[10px] bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none ${brand.text} font-mono`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Network Protocol</label>
                          <select className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-300 font-mono">
                            <option>Ethereum ERC-20</option>
                            <option>Tron TRC-20 (Lowest Fee)</option>
                            <option>Polygon POS</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  {activeSession.status === CheckoutSessionStatus.OPEN ? (
                    <button
                      type="submit"
                      id="submit-payment-btn"
                      style={activeSession.metadata?.meta_brand_color ? { backgroundColor: activeSession.metadata.meta_brand_color } : undefined}
                      className={`w-full ${activeSession.metadata?.meta_brand_color ? "hover:brightness-115" : brand.bg} text-white text-sm font-semibold p-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2`}
                    >
                      <span>Pay {activeSession.amount.toLocaleString()} {activeSession.metadata?.meta_currency || activeSession.currency}</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-3 text-center text-xs">
                      This checkout session has already been processed or expired. Please select or create an OPEN session in the sidebar.
                    </div>
                  )}
                </form>
              )}

              {/* STEP 2: ORANGE MONEY OTP DIALOG */}
              {paymentStep === "otp_wait" && (
                <div className="max-w-md mx-auto w-full p-6 bg-slate-800/50 border border-slate-800 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold font-mono">
                    #
                  </div>
                  <h3 className="text-lg font-display font-bold">Orange Money OTP Verification</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To authorize the transaction, please dial <strong>#144#391#</strong> on your Orange terminal to retrieve your temporary payment code, then enter the 4-digit code below:
                  </p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="0 0 0 0"
                      value={otpCode}
                      id="otp-code-input"
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-40 text-center tracking-widest text-2xl font-bold bg-slate-900 border border-slate-700 rounded-xl p-3 focus:border-orange-500 focus:outline-none text-white font-mono"
                    />

                    {verificationError && (
                      <p className="text-xs text-rose-400 flex items-center justify-center gap-1.5">
                        <AlertCircle size={14} /> {verificationError}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        id="cancel-otp-btn"
                        onClick={() => setPaymentStep("form")}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        id="verify-otp-btn"
                        onClick={() => {
                          if (otpCode.length < 4) {
                            setVerificationError("Please enter the 4-digit OTP code");
                          } else {
                            submitCompletedPayment();
                          }
                        }}
                        disabled={executingPayment}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {executingPayment ? <Loader2 size={14} className="animate-spin" /> : null}
                        Authorize
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: USSD PROMPT SIMULATOR */}
              {paymentStep === "ussd_wait" && (
                <div className="max-w-md mx-auto w-full p-6 bg-slate-800/50 border border-slate-800 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mx-auto">
                    <Smartphone className="animate-bounce" />
                  </div>
                  <h3 className="text-lg font-display font-bold uppercase tracking-tight text-teal-400">
                    USSD Push Alert Sent
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed text-center">
                    A secure authentication prompt has been dispatched to <strong>{phoneNumber}</strong> via the cellular provider network.
                  </p>
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left font-mono space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-teal-500 font-bold border-b border-slate-900 pb-1.5">
                      <span>USSD SIMULATION PORTAL</span>
                      <span className="animate-pulse">● WAITING FOR PAYER</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Operator: <span className="text-white font-bold uppercase">{selectedOperator}</span>
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Message: <span className="text-white">Pay {activeSession.amount.toLocaleString()} XOF to {activeSession.developerMerchantName || "Acme Corp"}? Enter PIN to approve.</span>
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      id="cancel-ussd-btn"
                      onClick={() => setPaymentStep("form")}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id="simulate-approve-btn"
                      onClick={submitCompletedPayment}
                      disabled={executingPayment}
                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {executingPayment ? <Loader2 size={14} className="animate-spin text-slate-950" /> : null}
                      Approve on Phone
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CARD 3D-SECURE SECURE REDIRECT POPUP FRAME */}
              {paymentStep === "card_3ds" && (
                <div className="max-w-md mx-auto w-full p-6 bg-slate-800/50 border border-slate-800 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">3D-Secure 2.0 Redirection</h3>
                  <p className="text-xs text-slate-400 leading-relaxed text-center">
                    Connecting to your acquiring financial institution to authenticate card credentials securely.
                  </p>

                  <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 text-left space-y-3 shadow-inner">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold text-slate-500">SECURE BANK PORTAL</span>
                      <span className={`text-[10px] font-mono ${brand.text} font-bold`}>Verified by Visa / MC</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-500">Merchant: <strong className="text-slate-800">{activeSession.developerMerchantName || "Acme Corp / Diapay"}</strong></p>
                      <p className="text-[10px] text-slate-500">Amount: <strong className="text-slate-800">{activeSession.amount.toLocaleString()} XOF</strong></p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Enter SMS Security Code</label>
                      <input 
                        type="text" 
                        id="card-secure-code-input"
                        placeholder="Verified Bank SMS Code"
                        className={`w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 ${brand.ring} font-mono`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      id="cancel-3ds-btn"
                      onClick={() => setPaymentStep("form")}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id="submit-3ds-btn"
                      onClick={submitCompletedPayment}
                      disabled={executingPayment}
                      className={`flex-1 ${brand.bg} text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer`}
                    >
                      {executingPayment ? <Loader2 size={14} className="animate-spin" /> : null}
                      Submit Authenticated
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: SUCCESS RECEIPT */}
              {paymentStep === "success" && successDetails && (
                <div className="max-w-md mx-auto w-full bg-slate-950 p-6 rounded-2xl border border-teal-500/30 text-center space-y-4 relative">
                  <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-display font-semibold text-white">Payment Confirmed</h3>
                    <p className="text-xs text-teal-400 mt-1 font-mono">
                      Ref: {successDetails.ledgerRef}
                    </p>
                  </div>

                  <div className="divide-y divide-slate-900 border-y border-slate-900 py-3 text-left space-y-2">
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-400">Merchant</span>
                      <span className="text-white font-medium">{activeSession.developerMerchantName || "Acme Senegal S.A.R.L."}</span>
                    </div>
                    {activeSession.payerName && (
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-slate-400">Payer Client</span>
                        <span className="text-white font-medium">{activeSession.payerName}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-400">Customer Identifier</span>
                      <span className="text-white font-mono">{phoneNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-400">Payment Channel</span>
                      <span className="text-white font-mono uppercase">{selectedMethod === "mobile_money" ? `${selectedOperator} MM` : selectedMethod}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-400">Settled Amount</span>
                      <span className="text-teal-400 font-bold">{activeSession.amount.toLocaleString()} XOF</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 text-left text-[11px] text-slate-400 space-y-1">
                    <div className="font-bold text-slate-300 font-mono text-[10px] mb-1">AUTOMATED WEBHOOK LOGGED</div>
                    <p>Triggered callback <strong>payment.succeeded</strong> with HMAC signature.</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      id="back-to-checkout-btn"
                      onClick={() => setPaymentStep("form")}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Make Another Payment
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: ERROR SUMMARY */}
              {paymentStep === "error" && (
                <div className="max-w-md mx-auto w-full p-6 bg-slate-800/50 border border-slate-800 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                    <XCircle size={24} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-rose-400">Transaction Failed</h3>
                  <p className="text-xs text-slate-300 leading-relaxed text-center">
                    {verificationError || "The local operator network rejected the transaction authentication request."}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      id="retry-checkout-btn"
                      onClick={() => setPaymentStep("form")}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Modify Parameters
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer indicators */}
            <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                PCI-DSS Compliance Hardened Gateway
              </span>
              {activeSession.developerSupportEmail && (
                <span className="text-center">
                  Support: <strong className="text-slate-400">{activeSession.developerSupportEmail}</strong> • {activeSession.developerSupportPhone}
                </span>
              )}
              <span>
                Secured by Diapay Unified African API Engine
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-gray-400 mb-2" />
            <p className="text-xs text-slate-400">Awaiting Checkout Sessions...</p>
          </div>
        )}
      </div>
    </div>
  );
}
