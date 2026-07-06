import React, { useState } from "react";
import { Search, Loader2, FileText, CheckCircle, Info, Sparkles, AlertCircle } from "lucide-react";

export default function SupportPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState("");

  // Ticket submission states
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("OTP delay experienced during checkout");
  const [message, setMessage] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const res = await fetch("/api/v1/support/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: searchQuery })
      });

      const data = await res.json();
      if (res.ok) {
        setSearchResult(data);
      } else {
        setSearchError(data.error || "No matching transactions found.");
      }
    } catch (err) {
      setSearchError("Network failure searching for records.");
    } finally {
      setSearching(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    setTicketSuccess(false);

    try {
      const res = await fetch("/api/v1/support/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, subject, message })
      });

      if (res.ok) {
        setTicketSuccess(true);
        setPhone("");
        setMessage("");
        setTimeout(() => setTicketSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div id="support-portal-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* Search Left Panel */}
      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 shadow-xs">
        <h3 className="font-display font-semibold text-gray-800 text-lg mb-1">Payer Receipt & Status Search</h3>
        <p className="text-xs text-gray-400 mb-5">Payers can locate receipts instantly using their cellular phone number or Order Reference ID.</p>

        <form onSubmit={handleSearch} className="flex gap-2.5 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
            <input 
              type="text" 
              id="support-search-input"
              placeholder="Enter Payer Phone (e.g. +221 77 452 89 12) or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <button 
            id="support-search-submit-btn"
            type="submit"
            disabled={searching}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 rounded-xl transition flex items-center gap-1.5"
          >
            {searching ? <Loader2 size={13} className="animate-spin" /> : null}
            Search
          </button>
        </form>

        {/* Display results */}
        {searchResult && (
          <div id="receipt-result-panel" className="bg-slate-950 text-white rounded-2xl p-6 shadow-inner font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <span className="text-[10px] text-indigo-400 font-bold">DIAPAY OFFICIAL LEDGER RECEIPT</span>
              <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-1.5 py-0.5 rounded">SETTLED</span>
            </div>

            <div className="space-y-2 border-b border-slate-900 pb-3.5">
              <p className="text-slate-400">Order ID: <strong className="text-white font-sans">{searchResult.session?.orderId || "ORD-MOCK"}</strong></p>
              <p className="text-slate-400">Description: <strong className="text-white font-sans">{searchResult.session?.itemName || "Acme Merchant Settlement"}</strong></p>
              <p className="text-slate-400">Payer Phone: <strong className="text-white">{searchResult.session?.customerPhone || searchQuery}</strong></p>
              <p className="text-slate-400">Channel: <strong className="text-white uppercase font-sans">{searchResult.session?.paymentMethod === "mobile_money" ? `${searchResult.session?.mobileOperator} Mobile Money` : "Card Payment"}</strong></p>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-slate-400">Paid Amount:</span>
              <strong className="text-xl text-teal-400 font-display">{(searchResult.session?.amount || searchResult.payment?.amount || 0).toLocaleString()} XOF</strong>
            </div>

            <div className="pt-2">
              <button 
                id="download-receipt-pdf-btn"
                onClick={() => alert("Consolidated Receipt PDF generated and dispatched.")}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-sans font-medium text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-800"
              >
                <FileText size={13} />
                Download Receipt PDF
              </button>
            </div>
          </div>
        )}

        {searchError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl p-4 flex items-center gap-2.5 text-xs">
            <AlertCircle size={16} className="flex-shrink-0" />
            <p>{searchError}</p>
          </div>
        )}

        {!searchResult && !searchError && (
          <div className="bg-slate-50 border border-slate-100/80 p-6 rounded-2xl text-center text-xs text-gray-500 space-y-2">
            <Sparkles className="mx-auto text-slate-400" size={20} />
            <h4 className="font-semibold text-gray-700">Receipt Lookup Database</h4>
            <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
              Test queries by inputting the phone numbers used in your checkout sessions (e.g. <strong>+221 77 452 89 12</strong>).
            </p>
          </div>
        )}
      </div>

      {/* Ticket Right Panel */}
      <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-8 shadow-xs">
        <h3 className="font-display font-semibold text-gray-800 text-lg mb-1">Operator Latency Complaint</h3>
        <p className="text-xs text-gray-400 mb-5">Are you experiencing delays in operator OTPs or cellular network push alerts? Report them instantly to our compliance desk.</p>

        {ticketSuccess ? (
          <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-2xl text-center space-y-2">
            <CheckCircle className="mx-auto text-green-600" size={24} />
            <h4 className="font-semibold text-green-800">Latency Report Logged</h4>
            <p className="text-xs text-green-700/80 leading-relaxed">
              Our automated telecom gateway tracking monitors routing speeds based on your input. Settlement details reconciled.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Payer Contact Phone</label>
              <input 
                type="text" 
                id="ticket-phone-input"
                placeholder="+221 77 452 89 12"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Complaint Category</label>
              <select 
                id="ticket-subject-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
              >
                <option>OTP delay experienced during checkout</option>
                <option>USSD push alert never popped up</option>
                <option>Double operator debited (ledger reconciliation)</option>
                <option>Fraud report / unauthorized payment suspect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Description details</label>
              <textarea 
                id="ticket-message-textarea"
                rows={4}
                placeholder="Please describe exactly what happened..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                required
              />
            </div>

            <button 
              id="submit-ticket-btn"
              type="submit"
              disabled={submittingTicket}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold p-3.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submittingTicket ? <Loader2 size={13} className="animate-spin" /> : null}
              Submit Routing Report
            </button>
          </form>
        )}

        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2">
          <Info size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Diapay interfaces directly with cellular telecommunication carriers via SMS API routers. If latency spikes above 5 seconds, route optimization rules rotate carrier nodes automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
