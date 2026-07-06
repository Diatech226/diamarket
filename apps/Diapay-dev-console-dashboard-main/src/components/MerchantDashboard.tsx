import React, { useState, useEffect } from "react";
import { 
  PaymentIntent, 
  PaymentStatus, 
  LedgerEntry,
  SettlementBatch,
  VendorWallet
} from "../types";
import { 
  DollarSign, 
  ShieldAlert, 
  Calendar, 
  Search, 
  SlidersHorizontal, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCcw, 
  CornerDownRight, 
  Check, 
  Loader2,
  FileText,
  Download,
  Plus,
  RefreshCw,
  AlertCircle,
  Building,
  CheckCircle
} from "lucide-react";

interface MerchantDashboardProps {
  balanceData: { masterClearing: number; escrowReserve: number; inDispute: number };
  onRefreshBalance: () => void;
}

export default function MerchantDashboard({ balanceData, onRefreshBalance }: MerchantDashboardProps) {
  const [payments, setPayments] = useState<PaymentIntent[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentIntent | null>(null);
  const [refundReason, setRefundReason] = useState("Customer requested cancellation");
  const [refundAmount, setRefundAmount] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Settlement batches & vendor wallets states
  const [settlementBatches, setSettlementBatches] = useState<SettlementBatch[]>([]);
  const [vendorWallets, setVendorWallets] = useState<VendorWallet[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [showNewBatchForm, setShowNewBatchForm] = useState(false);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [batchSuccess, setBatchSuccess] = useState(false);

  // New batch form inputs
  const [newBatchVendorId, setNewBatchVendorId] = useState("");
  const [newBatchAmount, setNewBatchAmount] = useState("");
  const [newBatchBankName, setNewBatchBankName] = useState("Société Générale Sénégal (SGS)");
  const [newBatchAccountNumber, setNewBatchAccountNumber] = useState("SN012 03456 000987654321 09");


  // Fetch payments and ledger
  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await fetch("/api/v1/payments");
      const pData = await pRes.json();
      setPayments(pData);

      const lRes = await fetch("/api/v1/ledger");
      const lData = await lRes.json();
      setLedgerEntries(lData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlementData = async () => {
    setLoadingSettlements(true);
    try {
      const sRes = await fetch("/api/v1/settlements");
      if (sRes.ok) {
        const sData = await sRes.json();
        setSettlementBatches(sData);
      }
      const wRes = await fetch("/api/v1/wallets");
      if (wRes.ok) {
        const wData = await wRes.json();
        setVendorWallets(wData);
      }
    } catch (e) {
      console.error("Failed to fetch settlement data", e);
    } finally {
      setLoadingSettlements(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettlementData();
  }, [balanceData]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBatch(true);
    setBatchError("");
    setBatchSuccess(false);

    try {
      const res = await fetch("/api/v1/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: newBatchVendorId,
          payoutAmount: Number(newBatchAmount),
          bankName: newBatchBankName,
          accountNumber: newBatchAccountNumber
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBatchSuccess(true);
        setNewBatchAmount("");
        setShowNewBatchForm(false);
        // Refresh master balance, ledger list, and settlements list
        onRefreshBalance();
        fetchSettlementData();
        fetchData();
        setTimeout(() => setBatchSuccess(false), 3000);
      } else {
        setBatchError(data.error || "Failed to create settlement batch.");
      }
    } catch (err) {
      setBatchError("Network error generating settlement batch.");
    } finally {
      setSubmittingBatch(false);
    }
  };

  const handleExecuteSettle = async (batchId: string) => {
    try {
      const res = await fetch(`/api/v1/settlements/${batchId}/settle`, {
        method: "POST"
      });
      if (res.ok) {
        onRefreshBalance();
        fetchSettlementData();
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to execute settlement.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = (batchId: string) => {
    // Point window location to the dedicated attachment route for CSV
    window.location.href = `/api/v1/settlements/${batchId}/csv`;
    // Briefly delay UI refresh to reflect "exported" status change
    setTimeout(() => {
      fetchSettlementData();
    }, 1000);
  };


  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setProcessingRefund(true);
    setRefundSuccess(false);

    try {
      const res = await fetch(`/api/v1/payments/${selectedPayment.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: refundReason,
          amount: refundAmount ? Number(refundAmount) : selectedPayment.amount
        })
      });

      if (res.ok) {
        setRefundSuccess(true);
        setTimeout(() => {
          setSelectedPayment(null);
          setRefundSuccess(false);
          setRefundAmount("");
        }, 1500);
        // Refresh master state
        onRefreshBalance();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingRefund(false);
    }
  };

  // Filter logic
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.customerIdentifier.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Find ledger entries associated with selected transaction
  const getTransactionLedger = (paymentId: string) => {
    const refPrefix = `TRX-${paymentId.toUpperCase()}`;
    const refRefund = `REF-`; // matching refund
    const refDispute = `CHG-`; // matching chargebacks

    return ledgerEntries.filter(entry => 
      entry.reference.includes(paymentId.toUpperCase()) ||
      (selectedPayment && entry.reference.includes(selectedPayment.id.toUpperCase()))
    );
  };

  // Calculate pending payouts summary statistics
  const pendingPayoutBatches = settlementBatches.filter(b => b.status === "pending" || b.status === "exported");
  const totalPendingVolume = pendingPayoutBatches.reduce((sum, b) => sum + b.payoutAmount, 0);
  const totalPendingReserveHold = pendingPayoutBatches.reduce((sum, b) => sum + b.reserveHold, 0);
  const pendingCount = pendingPayoutBatches.length;

  // Export a consolidated CSV report for auditing
  const handleExportConsolidatedCsv = () => {
    if (pendingPayoutBatches.length === 0) {
      alert("No pending payouts available to reconcile in this export.");
      return;
    }

    const headers = [
      "Batch ID",
      "Reconciliation Reference",
      "Created At",
      "Merchant Name",
      "Destination Bank",
      "RIB Account Number",
      "Payout Net Amount (XOF)",
      "Compliance Reserve Hold (13.5%)",
      "SLA Status"
    ];

    const rows = pendingPayoutBatches.map(b => [
      b.id,
      b.reconciliationReference,
      b.createdAt.replace("T", " ").substring(0, 16),
      b.vendorName,
      b.bankName,
      b.accountNumber,
      b.payoutAmount,
      b.reserveHold,
      b.status.toUpperCase()
    ]);

    // Use BOM \uFEFF to support Microsoft Excel UTF-8 display correctly
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `diapay_pending_payouts_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="merchant-dashboard-view" className="space-y-6">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main balance card */}
        <div id="master-balance-card" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Unified Account Balance</span>
            <span className="bg-green-50 text-green-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">LIVE</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
              {balanceData.masterClearing.toLocaleString()} <span className="text-sm font-semibold text-gray-500">XOF</span>
            </h2>
            <p className="text-[10px] text-gray-400">Platform Master Clearing (Real-time dynamic ledger settlement)</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100/60 flex justify-between text-[11px] text-gray-500">
            <span>Daily Volume:</span>
            <span className="font-bold text-gray-800">450,000 XOF</span>
          </div>
        </div>

        {/* Escrow/Reserve card */}
        <div id="escrow-reserve-card" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Active Escrow Reserves</span>
            <span className="bg-amber-50 text-amber-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">13.5% Holdback</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
              {balanceData.escrowReserve.toLocaleString()} <span className="text-sm font-semibold text-gray-500">XOF</span>
            </h2>
            <p className="text-[10px] text-gray-400">Guarantees compliance risk and dispute coverage reserve</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100/60 flex justify-between text-[11px] text-gray-500">
            <span>Escrow status:</span>
            <span className="font-semibold text-green-600">FULLY FUNDED</span>
          </div>
        </div>

        {/* Dispute hold card */}
        <div id="dispute-hold-card" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Active Disputes Hold</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              balanceData.inDispute > 0 ? "bg-red-50 text-red-700 animate-pulse" : "bg-gray-50 text-gray-400"
            }`}>
              {balanceData.inDispute > 0 ? "ACTION REQUIRED" : "STABLE"}
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
              {balanceData.inDispute.toLocaleString()} <span className="text-sm font-semibold text-gray-500">XOF</span>
            </h2>
            <p className="text-[10px] text-gray-400">Escrow funds locked under compliance review status</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100/60 flex justify-between text-[11px] text-gray-500">
            <span>Pending reviews:</span>
            <span className="font-bold text-red-600">{balanceData.inDispute > 0 ? "1 dispute active" : "0 disputes pending"}</span>
          </div>
        </div>
      </div>

      {/* Settlement Batch Export & Reconciliation Desk */}
      <div id="settlement-reconciliation-desk" className="bg-slate-50 border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200/60 pb-4 gap-4">
          <div>
            <h3 className="font-display font-semibold text-gray-800 text-lg flex items-center gap-2">
              <Building className="text-indigo-600" size={20} />
              Settlement Batch Export & Reconciliation Desk
            </h3>
            <p className="text-xs text-gray-500">Generate, export and reconcile pending merchant payouts with double-entry general ledger logs.</p>
          </div>
          <button 
            id="open-batch-form-btn"
            onClick={() => {
              if (vendorWallets.length > 0) {
                setNewBatchVendorId(vendorWallets[0].id);
              }
              setShowNewBatchForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 self-stretch md:self-auto justify-center shadow-xs"
          >
            <Plus size={15} />
            Generate Settlement Batch
          </button>
        </div>

        {/* Settlement Batch Export Summary & Compliance Report Generator */}
        <div id="settlement-batch-export-section" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Settlement Batch Export & Audit Hub
              </h4>
              <p className="text-xs text-gray-500 font-sans">Reconcile pending payouts, inspect active hold reserves, and generate standard compliance spreadsheets.</p>
            </div>
            
            <button
              id="export-consolidated-csv-btn"
              onClick={handleExportConsolidatedCsv}
              disabled={pendingCount === 0}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                pendingCount > 0 
                  ? "bg-slate-900 hover:bg-slate-800 text-white" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-250"
              }`}
              title="Generate and Download consolidated CSV report of pending settlements"
            >
              <Download size={14} />
              Generate & Download CSV Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Stat 1: Pending Payout Volume */}
            <div className="bg-slate-50/50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Total Pending Volume
              </span>
              <div>
                <strong className="text-xl font-mono font-black text-indigo-900 block">
                  {totalPendingVolume.toLocaleString()} <span className="text-xs font-sans font-semibold text-slate-500">XOF</span>
                </strong>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Awaiting clearing-house dispatch
                </span>
              </div>
            </div>

            {/* Stat 2: Pending Batches Count */}
            <div className="bg-slate-50/50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Pending Payout Batches
              </span>
              <div>
                <strong className="text-xl font-mono font-black text-slate-800 block">
                  {pendingCount} {pendingCount === 1 ? 'batch' : 'batches'}
                </strong>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Currently queued for banking tunnels
                </span>
              </div>
            </div>

            {/* Stat 3: Audit Reserve Holdback */}
            <div className="bg-slate-50/50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Audit Reserve Holdback
              </span>
              <div>
                <strong className="text-xl font-mono font-black text-amber-600 block">
                  {totalPendingReserveHold.toLocaleString()} <span className="text-xs font-sans font-semibold text-slate-500">XOF</span>
                </strong>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Hold reserve liability (13.5% SLA rate)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Batch Form Panel */}
        {showNewBatchForm && (
          <div id="new-batch-form-container" className="bg-white border border-indigo-100 rounded-xl p-5 shadow-xs transition duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h4 className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus size={14} /> New Settlement Payout Batch
              </h4>
              <button 
                id="close-batch-form-btn"
                onClick={() => setShowNewBatchForm(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition"
              >
                <X size={14} />
              </button>
            </div>

            {batchError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{batchError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1 font-medium">Merchant Wallet</label>
                  <select 
                    id="new-batch-vendor-select"
                    value={newBatchVendorId}
                    onChange={(e) => {
                      setNewBatchVendorId(e.target.value);
                      const wallet = vendorWallets.find(w => w.id === e.target.value);
                      if (wallet) {
                        setNewBatchAmount(wallet.balance.toString());
                      }
                    }}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    <option value="" disabled>Select Merchant...</option>
                    {vendorWallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.balance.toLocaleString()} XOF Available)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1 font-medium font-sans">Payout Amount (XOF)</label>
                  <input 
                    type="number" 
                    id="new-batch-amount-input"
                    placeholder="Enter amount in XOF"
                    value={newBatchAmount}
                    onChange={(e) => setNewBatchAmount(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1 font-medium">Destination Bank</label>
                  <input 
                    type="text" 
                    id="new-batch-bank-input"
                    value={newBatchBankName}
                    onChange={(e) => setNewBatchBankName(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1 font-medium">Account Number (RIB)</label>
                  <input 
                    type="text" 
                    id="new-batch-account-input"
                    value={newBatchAccountNumber}
                    onChange={(e) => setNewBatchAccountNumber(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowNewBatchForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  id="submit-batch-btn"
                  type="submit" 
                  disabled={submittingBatch}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  {submittingBatch ? <Loader2 size={13} className="animate-spin" /> : null}
                  Generate Batch
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cleared Merchant Balances */}
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Cleared Vendor Balances</h4>
              <p className="text-[10px] text-gray-400 font-sans">Merchant holdings eligible for settlement bank disbursement.</p>
            </div>

            <div className="space-y-3">
              {vendorWallets.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">No vendor wallets registered.</div>
              ) : (
                vendorWallets.map(wallet => (
                  <div key={wallet.id} className="border border-gray-50 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-800">{wallet.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                          wallet.status === "verified" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {wallet.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-lg font-mono font-bold text-gray-900">
                        {wallet.balance.toLocaleString()} <span className="text-xs font-sans text-gray-500 font-semibold">XOF</span>
                      </span>
                    </div>

                    {wallet.balance > 0 && wallet.status === "verified" && (
                      <button 
                        id={`initiate-payout-btn-${wallet.id}`}
                        onClick={() => {
                          setNewBatchVendorId(wallet.id);
                          setNewBatchAmount(wallet.balance.toString());
                          setShowNewBatchForm(true);
                        }}
                        className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-bold py-1.5 px-3 rounded-lg transition text-center w-full shadow-2xs cursor-pointer"
                      >
                        Initiate Payout
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending / Active Settlement Batches */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Payout Batches & Reconciliation Reports</h4>
                <p className="text-[10px] text-gray-400">Reconcile pending settlements via CSV download, then trigger bank dispatch clearings.</p>
              </div>
              <button 
                onClick={fetchSettlementData}
                disabled={loadingSettlements}
                className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-800 cursor-pointer"
                title="Refresh settlements"
              >
                <RefreshCw size={13} className={loadingSettlements ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 font-mono text-[9px] uppercase font-semibold">
                    <th className="px-4 py-3">Batch ID / Ref</th>
                    <th className="px-4 py-3">Created At</th>
                    <th className="px-4 py-3">Merchant Name</th>
                    <th className="px-4 py-3 text-right">Net Payout</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Reconcile / Clear</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingSettlements && settlementBatches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        <Loader2 className="animate-spin inline mr-1.5" size={14} /> Loading settlement ledger...
                      </td>
                    </tr>
                  ) : settlementBatches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        No payout batches generated yet. Click "Generate Settlement Batch" to create one.
                      </td>
                    </tr>
                  ) : (
                    settlementBatches.map(batch => (
                      <tr key={batch.id} id={`batch-row-${batch.id}`} className="hover:bg-slate-50/30 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-mono font-bold text-gray-700">{batch.id}</div>
                          <div className="text-[9px] font-mono text-gray-400">{batch.reconciliationReference}</div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-[11px]">
                          {batch.createdAt.replace("T", " ").substring(0, 16)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-gray-800">{batch.vendorName}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[150px] font-mono">{batch.accountNumber}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-gray-900 font-mono">
                          {batch.payoutAmount.toLocaleString()} XOF
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                            batch.status === "pending" 
                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                              : batch.status === "exported"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                          <button 
                            id={`export-csv-btn-${batch.id}`}
                            onClick={() => handleExportCsv(batch.id)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-1.5 rounded-lg border border-slate-200 transition inline-flex items-center gap-1 text-[10px] font-medium cursor-pointer"
                            title="Download Reconciliation Report (CSV)"
                          >
                            <Download size={11} />
                            CSV
                          </button>
                          
                          {batch.status !== "settled" ? (
                            <button 
                              id={`clear-batch-btn-${batch.id}`}
                              onClick={() => {
                                if (confirm(`Authorize final fund disbursement of ${batch.payoutAmount.toLocaleString()} XOF to ${batch.vendorName}? This will write auditable, non-reversible ledger rows.`)) {
                                  handleExecuteSettle(batch.id);
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                              title="Post payouts as Cleared/Settled"
                            >
                              Settle
                            </button>
                          ) : (
                            <span className="text-green-600 inline-flex items-center gap-1 text-[10px] font-mono font-bold py-1 px-1.5 bg-green-50 rounded-lg">
                              <CheckCircle size={11} />
                              CLEARED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Management Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
        {/* Controls Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-display font-semibold text-gray-800 text-lg">Transaction Register</h3>
            <p className="text-xs text-gray-400">Unified list of mobile money, cards, and crypto payments</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={15} />
              <input 
                type="text" 
                id="tx-search-input"
                placeholder="Search phone or Transaction ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["all", "paid", "disputed", "refunded"].map((status) => (
                <button
                  key={status}
                  id={`filter-btn-${status}`}
                  onClick={() => setStatusFilter(status)}
                  className={`text-xs px-3 py-2.5 rounded-xl font-medium transition whitespace-nowrap capitalize ${
                    statusFilter === status 
                      ? "bg-slate-900 text-white" 
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 font-mono text-[10px] uppercase font-semibold">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Payer Phone</th>
                <th className="px-6 py-4">Payment Channel</th>
                <th className="px-6 py-4">Gross Amount</th>
                <th className="px-6 py-4">Net Operator Fee</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ledger Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2 text-gray-400">
                      <Loader2 className="animate-spin" />
                      <span>Loading ledger data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 font-medium">
                    No transactions matched your filtering criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr 
                    key={p.id} 
                    id={`transaction-row-${p.id}`}
                    className="hover:bg-slate-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-700">{p.id}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {p.createdAt.replace("T", " ").substring(0, 16)}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{p.customerIdentifier}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-medium uppercase font-mono">
                        {p.paymentMethod === "mobile_money" ? "M-Money" : p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {p.amount.toLocaleString()} XOF
                    </td>
                    <td className="px-6 py-4 text-rose-600 font-mono">
                      -{p.fees.toLocaleString()} XOF
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                        p.status === PaymentStatus.PAID 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : p.status === PaymentStatus.DISPUTED
                          ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                          : p.status === PaymentStatus.REFUNDED
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-gray-50 text-gray-500"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        id={`view-ledger-btn-${p.id}`}
                        onClick={() => setSelectedPayment(p)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 transition px-2.5 py-1.5 rounded-lg"
                      >
                        <FileText size={13} />
                        View Journal
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Ledger & Refund Drawer */}
      {selectedPayment && (
        <div id="ledger-drawer" className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex justify-end z-50 transition duration-300">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-8 overflow-y-auto flex flex-col justify-between border-l border-gray-100">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-gray-800">Double-Entry Journal Logs</h3>
                  <p className="text-xs text-gray-400">Transaction ID: <span className="font-mono font-bold text-gray-700">{selectedPayment.id}</span></p>
                </div>
                <button 
                  id="close-drawer-btn"
                  onClick={() => setSelectedPayment(null)} 
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Ledger Summary */}
              <div className="space-y-4 mb-8">
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono uppercase font-bold">Gross Volume</span>
                    <strong className="text-sm text-gray-800">{selectedPayment.amount.toLocaleString()} XOF</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono uppercase font-bold">Operator Fee</span>
                    <strong className="text-sm text-rose-600">-{selectedPayment.fees.toLocaleString()} XOF</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono uppercase font-bold">Escrow Hold</span>
                    <strong className="text-sm text-indigo-600">{(selectedPayment.amount * 0.135).toLocaleString()} XOF</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono uppercase font-bold">Status</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 block mt-0.5">{selectedPayment.status.toUpperCase()}</span>
                  </div>
                </div>

                {/* Ledger Journal balancing verification */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-2.5">Unified General Ledger Ledger Posting</h4>
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-900 text-white font-mono text-[9px] uppercase">
                          <th className="px-4 py-2.5">Account Label</th>
                          <th className="px-4 py-2.5">Type</th>
                          <th className="px-4 py-2.5 text-right">Debit (DR)</th>
                          <th className="px-4 py-2.5 text-right">Credit (CR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                        {getTransactionLedger(selectedPayment.id).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-gray-400">No journal postings found.</td>
                          </tr>
                        ) : (
                          getTransactionLedger(selectedPayment.id).map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 text-gray-700 font-sans">{entry.account}</td>
                              <td className="px-4 py-2.5 text-gray-400 text-[10px]">{entry.type}</td>
                              <td className="px-4 py-2.5 text-right text-green-600 font-bold">
                                {entry.debit > 0 ? `${entry.debit.toLocaleString()}` : "—"}
                              </td>
                              <td className="px-4 py-2.5 text-right text-indigo-600 font-bold">
                                {entry.credit > 0 ? `${entry.credit.toLocaleString()}` : "—"}
                              </td>
                            </tr>
                          ))
                        )}
                        <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                          <td colSpan={2} className="px-4 py-2.5 text-slate-800">Balanced Total Check</td>
                          <td className="px-4 py-2.5 text-right text-green-700">
                            {getTransactionLedger(selectedPayment.id).reduce((sum, e) => sum + e.debit, 0).toLocaleString()} XOF
                          </td>
                          <td className="px-4 py-2.5 text-right text-indigo-700 font-mono">
                            {getTransactionLedger(selectedPayment.id).reduce((sum, e) => sum + e.credit, 0).toLocaleString()} XOF
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                    Double-entry bookkeeping mandates that <strong>Total Debits === Total Credits</strong>. Diapay enforces mathematical balance across vendor liabilities, commissions, reserve holds, and processing expenditures.
                  </p>
                </div>
              </div>

              {/* Refund Controls (only if PAID) */}
              {selectedPayment.status === PaymentStatus.PAID && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 text-left">
                  <h4 className="text-xs font-mono font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <RotateCcw size={14} /> Settlement Refund Portal
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                    Initiating a refund reverses accounting journal rows: credits Platform Master Clearing, debits the Vendor's account, and returns hold reserve liabilities automatically.
                  </p>

                  {refundSuccess ? (
                    <div className="bg-green-100 text-green-700 border border-green-200 rounded-xl p-3 text-center text-xs font-medium flex items-center justify-center gap-2">
                      <Check size={16} /> Refund Processed. Reversals Posted!
                    </div>
                  ) : (
                    <form onSubmit={handleRefund} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Refund Amount (XOF)</label>
                          <input 
                            type="number" 
                            id="refund-amount-input"
                            placeholder={`Full: ${selectedPayment.amount}`}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Reason for Refund</label>
                          <input 
                            type="text" 
                            id="refund-reason-input"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            required
                          />
                        </div>
                      </div>

                      <button 
                        id="execute-refund-btn"
                        type="submit"
                        disabled={processingRefund}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold p-3 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        {processingRefund ? <Loader2 size={14} className="animate-spin" /> : null}
                        Approve Settlement Reversal
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5 mt-6 text-center">
              <span className="text-[10px] text-gray-400 font-mono">Diapay Auditable Immutable Ledger Registry</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
