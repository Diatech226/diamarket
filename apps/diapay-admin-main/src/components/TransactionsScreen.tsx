import React, { useState } from 'react';
import { Transaction, PaymentRail } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Download,
  Terminal,
  Cpu,
  FileCode,
  X,
  Copy,
  Check,
  Activity,
  Layers
} from 'lucide-react';

interface TransactionsScreenProps {
  transactions: Transaction[];
  rails: PaymentRail[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransaction: (txId: string, updatedFields: Partial<Transaction>) => void;
  onAddSystemLog: (category: 'rail' | 'merchant' | 'settlement' | 'routing', type: 'info' | 'warning' | 'error' | 'success', message: string) => void;
  onSimulateRandomTransaction: () => void;
  autoplayEnabled: boolean;
  setAutoplayEnabled: (enabled: boolean) => void;
}

export default function TransactionsScreen({
  transactions,
  rails,
  onAddTransaction,
  onUpdateTransaction,
  onAddSystemLog,
  onSimulateRandomTransaction,
  autoplayEnabled,
  setAutoplayEnabled
}: TransactionsScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [inspectedTxId, setInspectedTxId] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState<boolean>(false);

  // Filter transactions
  const filteredTx = transactions.filter(tx => {
    const matchesStatus = selectedStatus === 'All' || tx.status === selectedStatus;
    const matchesMethod = selectedMethod === 'All' || tx.paymentMethod === selectedMethod;
    const matchesSearch = tx.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.customerPhoneOrAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesMethod && matchesSearch;
  });

  // Calculate stats for the currently viewed transaction list
  const viewedCount = filteredTx.length;
  const viewedSuccessfulTx = filteredTx.filter(t => t.status === 'success');
  const viewedSuccessfulVolumeUSD = viewedSuccessfulTx.reduce((acc, curr) => acc + curr.amountUSD, 0);
  const viewedAttemptedVolumeUSD = filteredTx.reduce((acc, curr) => acc + curr.amountUSD, 0);
  const viewedSuccessRate = viewedCount > 0
    ? (viewedSuccessfulTx.length / viewedCount) * 100
    : 0;

  const viewedFailedCount = filteredTx.filter(t => t.status === 'failed').length;
  const viewedPendingCount = filteredTx.filter(t => t.status === 'pending').length;
  const viewedReversedCount = filteredTx.filter(t => t.status === 'reversed').length;

  const isFilterActive = selectedStatus !== 'All' || selectedMethod !== 'All' || searchQuery !== '';

  const handleRefund = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    onUpdateTransaction(txId, { status: 'reversed' });
    onAddSystemLog(
      'settlement',
      'warning',
      `DISBURSEMENT REVERSAL: Initiated instant refund of ${tx.currency} ${tx.amount.toLocaleString()} to ${tx.customerName} on behalf of ${tx.merchantName}.`
    );
    setSelectedTxId(null);
  };

  const handleExportCSV = (exportScope: 'filtered' | 'full' = 'filtered') => {
    const listToExport = exportScope === 'filtered' ? filteredTx : transactions;
    const headers = [
      'Transaction ID',
      'Merchant ID',
      'Merchant Name',
      'Amount',
      'Currency',
      'Amount (USD)',
      'Payment Method',
      'Rail ID',
      'Status',
      'Timestamp',
      'Customer Name',
      'Customer Account',
      'Failure Reason'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      str = str.replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str}"`;
      }
      return str;
    };

    const rows = listToExport.map(tx => [
      tx.id,
      tx.merchantId,
      tx.merchantName,
      tx.amount,
      tx.currency,
      tx.amountUSD,
      tx.paymentMethod,
      tx.railId,
      tx.status,
      tx.timestamp,
      tx.customerName,
      tx.customerPhoneOrAccount,
      tx.failureReason || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bantu_pay_${exportScope}_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onAddSystemLog(
      'settlement',
      'success',
      `EXPORT EXCEL/CSV: Generated and downloaded ${exportScope} ledger report containing ${listToExport.length} transactions.`
    );
    setExportDropdownOpen(false);
  };

  const getStatusIconAndStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-4 w-4 text-rose-500" />,
          badge: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4 text-amber-500 animate-spin" />,
          badge: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'reversed':
        return {
          icon: <RotateCcw className="h-4 w-4 text-slate-500" />,
          badge: 'bg-slate-100 text-slate-700 border-slate-300'
        };
    }
  };

  const getMethodBadge = (method: Transaction['paymentMethod']) => {
    switch (method) {
      case 'mobile_money':
        return <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase">Mobile Money</span>;
      case 'bank_transfer':
        return <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold uppercase">Bank Transfer</span>;
      case 'card':
        return <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold uppercase">Card</span>;
      case 'ussd':
        return <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded font-bold uppercase font-mono">USSD Code</span>;
    }
  };

  const getDetailedMetadata = (tx: Transaction, rail?: PaymentRail) => {
    const totalLatency = (rail?.latencyMs || 180) + (parseInt(tx.id.replace(/\D/g, ''), 10) % 40 - 20);
    
    const dnsAndGateway = Math.floor(totalLatency * 0.08);
    const tlsAndHandshake = Math.floor(totalLatency * 0.12);
    const providerApi = Math.floor(totalLatency * 0.65);
    const ledgerWrite = totalLatency - dnsAndGateway - tlsAndHandshake - providerApi;

    let errorCode = 'BANTUPAY-200-OK';
    let httpStatus = 200;
    let statusDescription = 'Transaction completed and funds settled successfully in local rail pool.';

    if (tx.status === 'failed') {
      if (tx.failureReason?.includes('balance')) {
        errorCode = 'BANTUPAY-402-NSF';
        httpStatus = 402;
        statusDescription = 'The payer account has insufficient local balance to process the requested transfer.';
      } else if (tx.failureReason?.includes('timeout') || tx.failureReason?.includes('Carrier network')) {
        errorCode = 'BANTUPAY-504-GATEWAY-TIMEOUT';
        httpStatus = 504;
        statusDescription = 'The local telecommunication network or bank gateway failed to respond within the SLA window.';
      } else if (tx.failureReason?.includes('canceled') || tx.failureReason?.includes('cancel')) {
        errorCode = 'BANTUPAY-499-CLIENT-CANCEL';
        httpStatus = 499;
        statusDescription = 'The end-user explicitly aborted the session or canceled the PIN/OTP authentication screen.';
      } else if (tx.failureReason?.includes('OTP') || tx.failureReason?.includes('verification')) {
        errorCode = 'BANTUPAY-401-AUTH-FAILED';
        httpStatus = 401;
        statusDescription = 'The OTP input verification code did not match carrier-expected validation checksum.';
      } else {
        errorCode = 'BANTUPAY-500-GATEWAY-REJECTED';
        httpStatus = 500;
        statusDescription = tx.failureReason || 'An unexpected failure or channel drop was reported by the regional aggregator.';
      }
    } else if (tx.status === 'reversed') {
      errorCode = 'BANTUPAY-204-REVERSED';
      httpStatus = 204;
      statusDescription = 'The transaction was successfully reversed. Settlement funds have been swept back to the client pool.';
    } else if (tx.status === 'pending') {
      errorCode = 'BANTUPAY-202-ACCEPTED';
      httpStatus = 202;
      statusDescription = 'The transaction has been accepted and is waiting for asynchronous callback confirmation.';
    }

    const estimatedFeeUSD = parseFloat((tx.amountUSD * (rail?.type === 'mobile_money' ? 0.015 : 0.029)).toFixed(2));

    const jsonPayload = {
      transaction_id: tx.id,
      api_version: "2026-04-10",
      environment: "production-live",
      merchant: {
        id: tx.merchantId,
        name: tx.merchantName
      },
      payment_node: {
        rail_id: tx.railId,
        name: rail?.name || "BantuPay Direct Node",
        provider: rail?.provider || "Direct Aggregator",
        channel: tx.paymentMethod
      },
      financials: {
        amount_local: tx.amount,
        currency_local: tx.currency,
        exchange_rate_usd: parseFloat((tx.amountUSD / tx.amount).toFixed(6)),
        amount_usd: tx.amountUSD,
        estimated_fee_usd: estimatedFeeUSD
      },
      telemetry: {
        total_latency_ms: totalLatency,
        client_ip: `102.${100 + (parseInt(tx.id.replace(/\D/g, ''), 10) % 150)}.${10 + (parseInt(tx.id.replace(/\D/g, ''), 10) % 80)}.${2 + (parseInt(tx.id.replace(/\D/g, ''), 10) % 250)}`,
        routing_path: `eu-west-2 -> bntp-router-af -> ${tx.railId}-v2-auth`
      },
      status_details: {
        current_state: tx.status,
        system_code: errorCode,
        http_status: httpStatus,
        carrier_reference: `REF-${tx.id.split('-')[1] || tx.id}-${100000 + (parseInt(tx.id.replace(/\D/g, ''), 10) % 900000)}`,
        failure_reason: tx.failureReason
      }
    };

    return {
      totalLatency,
      dnsAndGateway,
      tlsAndHandshake,
      providerApi,
      ledgerWrite,
      errorCode,
      httpStatus,
      statusDescription,
      jsonString: JSON.stringify(jsonPayload, null, 2)
    };
  };

  const inspectedTx = transactions.find(t => t.id === inspectedTxId);
  const inspectedRail = inspectedTx ? rails.find(r => r.id === inspectedTx.railId) : undefined;
  const diag = inspectedTx ? getDetailedMetadata(inspectedTx, inspectedRail) : null;

  const copyToClipboard = () => {
    if (!diag) return;
    navigator.clipboard.writeText(diag.jsonString);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="transactions-screen">
      {/* Header and Live Simulator Control Dashboard */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
              LIVE SIMULATOR
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">Pan-African Gateway Live Ledger</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            This dashboard simulates an active high-throughput transaction loop across Kenya, Nigeria, Ghana, and South Africa. Enable autopilot to observe self-healing and auto-routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {/* Autoplay Toggle */}
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Autoplay Loop</span>
              <span className="text-xs text-slate-200">Inject TX every 4s</span>
            </div>
            <button
              onClick={() => setAutoplayEnabled(!autoplayEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                autoplayEnabled ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            >
              <span className={`h-4.5 w-4.5 rounded-full bg-white shadow absolute transition-all ${
                autoplayEnabled ? 'right-1' : 'left-1'
              }`}></span>
            </button>
          </div>

          {/* Trigger Random TX Button */}
          <button
            onClick={onSimulateRandomTransaction}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider hover:bg-amber-400 transition shadow-lg shadow-amber-500/10 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            Inject Random TX
          </button>
        </div>
      </div>

      {/* Grid of basic volume summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Viewed Volume Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viewed Success Volume</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            ${viewedSuccessfulVolumeUSD.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </h3>
          <div className="mt-3 flex items-center gap-1.5">
            {isFilterActive ? (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full animate-pulse">
                Filtered Subset
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full">
                Global Network
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">
              out of ${viewedAttemptedVolumeUSD.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} attempted
            </span>
          </div>
        </div>

        {/* Viewed Success Rate Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viewed Success Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {viewedSuccessRate.toFixed(1)}%
            </h3>
            <span className="text-xs text-slate-400 font-medium">SLA Gate</span>
          </div>
          <div className="mt-3.5 space-y-1.5">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  viewedSuccessRate >= 95 ? 'bg-emerald-500' :
                  viewedSuccessRate >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${viewedSuccessRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono uppercase">
              <span>{viewedSuccessfulTx.length} Approved</span>
              <span>{viewedCount} Total</span>
            </div>
          </div>
        </div>

        {/* Viewed Ledger Count Breakdown Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currently Viewed Ledger</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 transition-colors group-hover:bg-blue-500 group-hover:text-white">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {viewedCount} Items
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {viewedFailedCount > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-md font-mono uppercase">
                {viewedFailedCount} Failed
              </span>
            )}
            {viewedPendingCount > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md font-mono uppercase">
                {viewedPendingCount} Pending
              </span>
            )}
            {viewedReversedCount > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md font-mono uppercase">
                {viewedReversedCount} Reversed
              </span>
            )}
            {viewedFailedCount === 0 && viewedPendingCount === 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-mono uppercase">
                100% Operational Ingestion
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Merchant Name, Transaction ID, or Customer Reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-slate-50/30 placeholder-slate-400 font-medium"
              id="admin-tx-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition"
                title="Clear Search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block mt-1.5 pl-1">
            🔍 Multi-field index active: searches Merchant Name, TX ID, and Customer Reference
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase">
            <Filter className="h-3.5 w-3.5" />
            <span>Status</span>
          </div>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {['All', 'success', 'pending', 'failed', 'reversed'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize ${
                  selectedStatus === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {['All', 'mobile_money', 'bank_transfer', 'card', 'ussd'].map(method => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize ${
                  selectedMethod === method
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {method === 'All' ? 'All Methods' : method.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Ledger Entries */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 shrink-0 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Transaction stream ledger ({filteredTx.length} items)</span>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 font-bold rounded-lg text-[11px] uppercase tracking-wider transition-all shadow-sm active:scale-95 border border-slate-200/60"
                  title="Export options for audit reports"
                  id="btn-export-csv-dropdown"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Audit CSV
                </button>
                
                {exportDropdownOpen && (
                  <>
                    {/* Invisible click-away backdrop */}
                    <div 
                      className="fixed inset-0 z-10 cursor-default" 
                      onClick={() => setExportDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl z-20 py-1 overflow-hidden text-left">
                      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 mb-1">
                        <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase font-mono">Select Export Scope</span>
                      </div>
                      <button
                        onClick={() => handleExportCSV('filtered')}
                        disabled={filteredTx.length === 0}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-950 flex flex-col gap-0.5 transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-700"
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Current Filtered View
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium pl-3">
                          Exports {filteredTx.length} items from current filters
                        </span>
                      </button>
                      <button
                        onClick={() => handleExportCSV('full')}
                        disabled={transactions.length === 0}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-950 flex flex-col gap-0.5 transition disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Full Transaction Ledger
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium pl-3">
                          Exports entire history ({transactions.length} items)
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-bold animate-pulse">Ledger Active</span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredTx.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No simulated transactions match your filter guidelines.
              </div>
            ) : (
              filteredTx.map(tx => {
                const isSelected = selectedTxId === tx.id;
                const { icon, badge } = getStatusIconAndStyle(tx.status);

                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTxId(isSelected ? null : tx.id)}
                    className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition ${
                      isSelected ? 'bg-amber-50/20' : 'hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-1 shrink-0">{icon}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{tx.merchantName}</span>
                          <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                          <span className="text-[10px] text-slate-500 font-medium truncate">{tx.customerName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <span className="font-mono">{tx.id}</span>
                          <span>•</span>
                          <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px]">{tx.customerPhoneOrAccount}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">
                        {tx.currency} {tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        ${tx.amountUSD.toFixed(2)} USD
                      </p>
                      <div className="mt-1.5 flex items-center justify-end gap-1.5">
                        {getMethodBadge(tx.paymentMethod)}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${badge} capitalize`}>
                          {tx.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxId(tx.id);
                            setInspectedTxId(tx.id);
                          }}
                          className="p-1 bg-slate-50 border border-slate-200/60 text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 rounded transition active:scale-90"
                          title="Inspect Developer Payload"
                          id={`btn-inspect-${tx.id}`}
                        >
                          <Terminal className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Transaction Inspector Detail Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-[600px]">
          {selectedTxId ? (
            (() => {
              const tx = transactions.find(t => t.id === selectedTxId);
              if (!tx) return <div className="text-center text-slate-400 py-12">Transaction not found.</div>;
              const { icon, badge } = getStatusIconAndStyle(tx.status);
              const rail = rails.find(r => r.id === tx.railId);

              return (
                <div className="space-y-6 flex flex-col justify-between h-full">
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">TRANSACTION DETAILS</span>
                        <h4 className="text-base font-black text-slate-900 font-mono mt-1">{tx.id}</h4>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${badge} capitalize`}>
                          {tx.status}
                        </span>
                        <button
                          onClick={() => setInspectedTxId(tx.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-600 hover:border-amber-500 text-[9px] font-extrabold uppercase tracking-wider rounded transition active:scale-95 border border-slate-200"
                        >
                          <Terminal className="h-3 w-3" /> Diagnostic Payload
                        </button>
                      </div>
                    </div>

                    {/* Financial summary banner */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Settled Funds Amount</p>
                      <h5 className="text-xl font-extrabold text-slate-900 mt-1">
                        {tx.currency} {tx.amount.toLocaleString()}
                      </h5>
                      <span className="text-xs text-slate-500 font-mono">≈ ${tx.amountUSD.toFixed(2)} USD</span>
                    </div>

                    {/* Metadata specs */}
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Associated Merchant</span>
                        <span className="text-slate-800 font-bold text-right">{tx.merchantName}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Customer Beneficiary</span>
                        <span className="text-slate-800 font-bold text-right">{tx.customerName}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Settlement Target Account</span>
                        <span className="text-slate-800 font-mono font-semibold text-right">{tx.customerPhoneOrAccount}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Payment Channel Rail</span>
                        <span className="text-slate-800 font-semibold text-right">{rail?.name || tx.railId}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Created Timestamp</span>
                        <span className="text-slate-800 font-semibold text-right">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Error / Failure Banner if Failed */}
                    {tx.status === 'failed' && tx.failureReason && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 animate-pulse" />
                        <div>
                          <strong className="font-bold block">GATEWAY DECLINED</strong>
                          {tx.failureReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions (Refund mechanism) */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    {tx.status === 'success' ? (
                      <button
                        onClick={() => handleRefund(tx.id)}
                        className="w-full py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold uppercase tracking-wider transition border border-rose-200 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="h-4 w-4" /> Refund Completed Charge
                      </button>
                    ) : tx.status === 'reversed' ? (
                      <div className="bg-slate-100 p-3 rounded-xl border text-center text-xs text-slate-500 font-semibold">
                        Reversal and settlement return sweep completed.
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl border text-center text-xs text-slate-400">
                        Refund only available for successful settled transactions.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center gap-3">
              <div className="p-3 bg-slate-50 rounded-full border border-slate-100">
                <Sparkles className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600">Transaction Inspector</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Select any active transaction row in the ledger ledger to view full payment node metadata or issue instant client refunds.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dev Diagnostics Modal */}
      <AnimatePresence>
        {inspectedTxId && inspectedTx && diag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="diag-modal-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectedTxId(null)}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black tracking-wider text-slate-400 font-mono uppercase">Developer Diagnostic Ledger</h3>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase">Admin Session</span>
                    </div>
                    <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
                      {inspectedTx.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border flex items-center gap-1.5 ${
                    inspectedTx.status === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    inspectedTx.status === 'failed' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                    'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      inspectedTx.status === 'success' ? 'bg-emerald-500' :
                      inspectedTx.status === 'failed' ? 'bg-rose-500' :
                      'bg-amber-500'
                    }`} />
                    HTTP {diag.httpStatus}
                  </span>
                  
                  <button
                    onClick={() => setInspectedTxId(null)}
                    className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition"
                    title="Close Panel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Inner Grid */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white">
                
                {/* Left Side: Advanced Diagnostics / Telemetry */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Status & Code Summary */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Cpu className="h-4 w-4 text-slate-400" />
                      API Error & Node Codes
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">System Node Code</span>
                      <strong className="text-sm font-bold text-slate-800 font-mono block mt-0.5">
                        {diag.errorCode}
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Description</span>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {diag.statusDescription}
                      </p>
                    </div>
                  </div>

                  {/* Latency Breakdown Gauge */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                        Latency Breakdown
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {diag.totalLatency}ms Total
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* DNS & Gateway Routing */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">1. DNS Lookup & Gateway Ingress</span>
                          <span className="font-mono text-slate-700 font-bold">{diag.dnsAndGateway}ms ({Math.round((diag.dnsAndGateway / diag.totalLatency) * 100)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(diag.dnsAndGateway / diag.totalLatency) * 100}%` }} />
                        </div>
                      </div>

                      {/* TLS Handshake */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">2. Regional TLS & Node Auth Handshake</span>
                          <span className="font-mono text-slate-700 font-bold">{diag.tlsAndHandshake}ms ({Math.round((diag.tlsAndHandshake / diag.totalLatency) * 100)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(diag.tlsAndHandshake / diag.totalLatency) * 100}%` }} />
                        </div>
                      </div>

                      {/* Provider API / Carrier authorization */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">3. Carrier Integration Network (SLA Auth)</span>
                          <span className="font-mono text-slate-700 font-bold">{diag.providerApi}ms ({Math.round((diag.providerApi / diag.totalLatency) * 100)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(diag.providerApi / diag.totalLatency) * 100}%` }} />
                        </div>
                      </div>

                      {/* Stripe Africa Ledger Sync */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">4. Stripe Africa Ledger Commit & Callback</span>
                          <span className="font-mono text-slate-700 font-bold">{diag.ledgerWrite}ms ({Math.round((diag.ledgerWrite / diag.totalLatency) * 100)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(diag.ledgerWrite / diag.totalLatency) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Lifecycle Timeline */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                      Lifecycle Events Timeline
                    </div>

                    <div className="relative pl-6 space-y-6">
                      {/* Vertical line connector */}
                      <div className="absolute left-2.5 top-1 bottom-1 w-0.5 border-dashed border-l-2 border-slate-200" />

                      {/* Event 1: Initiation */}
                      <div className="relative flex items-start gap-3">
                        {/* Dot */}
                        <div className="absolute -left-6 mt-1 flex items-center justify-center">
                          <div className="h-5 w-5 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                            <PlusCircle className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">Initiation Handshake</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+0ms</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            Client handshake initialized. Payload sent via <span className="font-semibold text-slate-700">{inspectedTx.paymentMethod.replace('_', ' ').toUpperCase()}</span>.
                          </p>
                        </div>
                      </div>

                      {/* Event 2: Routing */}
                      <div className="relative flex items-start gap-3">
                        {/* Dot */}
                        <div className="absolute -left-6 mt-1 flex items-center justify-center">
                          <div className="h-5 w-5 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                            <Layers className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">Regional DNS Routing</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+{diag.dnsAndGateway}ms</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            API Ingress resolved. Cryptographic auth handshake established with regional node <span className="font-semibold text-slate-700 font-mono">{inspectedTx.railId}</span>.
                          </p>
                        </div>
                      </div>

                      {/* Event 3: Gateway SLA */}
                      <div className="relative flex items-start gap-3">
                        {/* Dot */}
                        <div className="absolute -left-6 mt-1 flex items-center justify-center">
                          {(() => {
                            if (inspectedTx.status === 'success') {
                              return (
                                <div className="h-5 w-5 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                                  <Cpu className="h-3 w-3" />
                                </div>
                              );
                            } else if (inspectedTx.status === 'failed') {
                              return (
                                <div className="h-5 w-5 rounded-full border border-rose-200 bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
                                  <AlertCircle className="h-3 w-3" />
                                </div>
                              );
                            } else if (inspectedTx.status === 'pending') {
                              return (
                                <div className="h-5 w-5 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm animate-pulse">
                                  <Clock className="h-3 w-3" />
                                </div>
                              );
                            } else {
                              return (
                                <div className="h-5 w-5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm">
                                  <Cpu className="h-3 w-3" />
                                </div>
                              );
                            }
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">Gateway Provider SLA</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              +{diag.dnsAndGateway + diag.tlsAndHandshake + diag.providerApi}ms
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {(() => {
                              if (inspectedTx.status === 'success') {
                                return `Provider ${inspectedRail?.provider || 'Direct Gateway'} approved transaction request. SLA authorization confirmed in 200 OK.`;
                              } else if (inspectedTx.status === 'failed') {
                                return `Provider rejected transaction request. Reason: ${inspectedTx.failureReason || 'Declined by carrier platform.'}`;
                              } else if (inspectedTx.status === 'pending') {
                                return `Gateway accepted transaction asynchronously. Waiting for regional callback webhooks to trigger status confirmation.`;
                              } else if (inspectedTx.status === 'reversed') {
                                return `Original gateway authorization reversed. Settlement swept back per protocol instruction.`;
                              } else {
                                return `Carrier SLA handshake finalized. Status resolved.`;
                              }
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Event 4: Final Settlement */}
                      <div className="relative flex items-start gap-3">
                        {/* Dot */}
                        <div className="absolute -left-6 mt-1 flex items-center justify-center">
                          {(() => {
                            if (inspectedTx.status === 'success') {
                              return (
                                <div className="h-5 w-5 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </div>
                              );
                            } else if (inspectedTx.status === 'failed') {
                              return (
                                <div className="h-5 w-5 rounded-full border border-rose-200 bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
                                  <XCircle className="h-3.5 w-3.5" />
                                </div>
                              );
                            } else if (inspectedTx.status === 'pending') {
                              return (
                                <div className="h-5 w-5 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm animate-pulse">
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                </div>
                              );
                            } else if (inspectedTx.status === 'reversed') {
                              return (
                                <div className="h-5 w-5 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                                  <RotateCcw className="h-3 w-3" />
                                </div>
                              );
                            } else {
                              return (
                                <div className="h-5 w-5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </div>
                              );
                            }
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">Ledger Settlement</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              +{diag.totalLatency}ms
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {(() => {
                              if (inspectedTx.status === 'success') {
                                return `Funds successfully cleared and settled to ${inspectedTx.merchantName}'s ledger pool. Settlement reference generated.`;
                              } else if (inspectedTx.status === 'failed') {
                                return `Rollback finalized. Zero ledger movements occurred. Dispatched code ${diag.errorCode} back to merchant client.`;
                              } else if (inspectedTx.status === 'pending') {
                                return `Settlement pending confirmation. Holding transaction in escrow ledger state.`;
                              } else if (inspectedTx.status === 'reversed') {
                                return `Ledger returned to original state. Funds swept back to client's pool successfully. Reversal confirmed.`;
                              } else {
                                return `Ledger state finalized.`;
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Network Infrastructure Summary */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Layers className="h-4 w-4 text-slate-400" />
                      Infrastructure Routing
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Node Cluster</span>
                      <span className="font-mono font-bold text-slate-800">eu-west-2 (London)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Merchant API Key tier</span>
                      <span className="font-bold text-slate-800 uppercase">{inspectedTx.status === 'success' ? 'Enterprise SLA (99.95%)' : 'Standard API'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">PCI Handshake protocol</span>
                      <span className="font-mono font-bold text-slate-800">TLS_1.3_AES_256_GCM</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Raw JSON Developer Payload */}
                <div className="lg:col-span-7 flex flex-col min-w-0">
                  <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col flex-1 h-[400px] lg:h-auto">
                    {/* JSON Header */}
                    <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-mono font-bold text-slate-300">payload_response_200.json</span>
                      </div>

                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono rounded-lg transition active:scale-95"
                      >
                        {copiedState ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy JSON
                          </>
                        )}
                      </button>
                    </div>

                    {/* JSON Body */}
                    <div className="p-5 overflow-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/95 scrollbar-thin scrollbar-thumb-slate-800">
                      <pre className="text-[11px] whitespace-pre-wrap">
                        {(() => {
                          // Simple high-end regex-based syntax highlight for JSON!
                          const json = diag.jsonString;
                          return json.split('\n').map((line, idx) => {
                            // Match keys, strings, numbers, booleans, nulls
                            const keyMatch = line.match(/^(\s*)"([^"]+)"(\s*):/);
                            if (keyMatch) {
                              const key = keyMatch[2];
                              const valuePart = line.substring(keyMatch[0].length);
                              
                              let highlightedVal = valuePart;
                              // Highlight string values
                              if (valuePart.includes('"')) {
                                highlightedVal = valuePart.replace(/"([^"]*)"/g, '<span class="text-emerald-400">"$1"</span>');
                              } else if (valuePart.includes('true') || valuePart.includes('false')) {
                                highlightedVal = valuePart.replace(/(true|false)/g, '<span class="text-blue-400 font-bold">$1</span>');
                              } else if (valuePart.includes('null')) {
                                highlightedVal = valuePart.replace(/null/g, '<span class="text-slate-500 font-semibold">null</span>');
                              } else if (/[0-9]/.test(valuePart)) {
                                highlightedVal = valuePart.replace(/([0-9.]+)/g, '<span class="text-amber-400">$1</span>');
                              }

                              return (
                                <div key={idx} className="hover:bg-slate-900/60 px-1 rounded transition-colors">
                                  <span className="text-slate-500">{keyMatch[1]}</span>
                                  <span className="text-slate-300 font-bold">"{key}"</span>
                                  <span className="text-slate-400">:</span>
                                  <span dangerouslySetInnerHTML={{ __html: highlightedVal }} />
                                </div>
                              );
                            }
                            
                            // Bracket lines or formatting lines
                            return (
                              <div key={idx} className="hover:bg-slate-900/60 px-1 rounded transition-colors text-slate-500">
                                {line}
                              </div>
                            );
                          });
                        })()}
                      </pre>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" /> Secure admin debugger session. ISO-27001 audit logged.
                </span>
                <button
                  onClick={() => setInspectedTxId(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow-sm"
                >
                  Dismiss diagnostics
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
