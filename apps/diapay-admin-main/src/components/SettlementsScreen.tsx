import React, { useState } from 'react';
import { TreasuryFloat, SettlementBatch, ExchangeRate } from '../types';
import {
  Wallet,
  Coins,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Globe,
  Settings2,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Plus
} from 'lucide-react';

interface SettlementsScreenProps {
  floats: TreasuryFloat[];
  batches: SettlementBatch[];
  exchangeRates: Record<string, ExchangeRate>;
  onReplenishFloat: (floatId: string, amountUSD: number) => void;
  onExecuteSettlement: (batchId: string) => void;
  onUpdateExchangeRate: (currency: string, newRate: number) => void;
  onAddSystemLog: (category: 'rail' | 'merchant' | 'settlement' | 'routing', type: 'info' | 'warning' | 'error' | 'success', message: string) => void;
}

export default function SettlementsScreen({
  floats,
  batches,
  exchangeRates,
  onReplenishFloat,
  onExecuteSettlement,
  onUpdateExchangeRate,
  onAddSystemLog
}: SettlementsScreenProps) {
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [newRateValue, setNewRateValue] = useState<number>(0);
  const [selectedFloatToReplenish, setSelectedFloatToReplenish] = useState<string | null>(null);
  const [replenishAmount, setReplenishAmount] = useState<number>(5000);

  const getFloatStatusBadge = (status: TreasuryFloat['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            Healthy Float
          </span>
        );
      case 'low_balance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Low Balance
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            🚨 Critical Warning
          </span>
        );
    }
  };

  const handleReplenishFloatAction = (floatId: string) => {
    onReplenishFloat(floatId, replenishAmount);
    setSelectedFloatToReplenish(null);
  };

  const handleSettlementAction = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    onExecuteSettlement(batchId);
    onAddSystemLog(
      'settlement',
      'success',
      `BANK SWEEP SUCCESSFUL: Disbursed ${batch.currency} ${batch.amount.toLocaleString()} to ${batch.merchantName}. Bank Reference assigned.`
    );
  };

  const startEditingRate = (currency: string, currentRate: number) => {
    setEditingCurrency(currency);
    setNewRateValue(currentRate);
  };

  const saveRateUpdate = (currency: string) => {
    onUpdateExchangeRate(currency, newRateValue);
    setEditingCurrency(null);
    onAddSystemLog(
      'settlement',
      'info',
      `FX Rate Update: Modified exchange parameters for currency [${currency}] to ${newRateValue} per 1 USD.`
    );
  };

  return (
    <div className="space-y-8 animate-fade-in" id="settlements-screen">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Wallet className="h-6 w-6 text-amber-600" />
          Treasury Liquidity & Merchant Settlement
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Monitor localized float balances inside carrier bank accounts, manage FX margins, and sweep pending payouts.
        </p>
      </div>

      {/* FX Rates Grid and Liquidity Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treasury Floats Status Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Coins className="h-4.5 w-4.5 text-amber-500" />
              Telco Wallet & Bank Liquidity pools
            </h3>
            <span className="text-xs text-slate-400">Holds capital for instant B2C merchant payouts</span>
          </div>

          <div className="space-y-4">
            {floats.map(float => {
              const pctOfMin = Math.round((float.balance / (float.minThreshold || 1)) * 100);

              return (
                <div key={float.id} className="p-4 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{float.railName}</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                          {float.currency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{float.country} Regional Payout Pool</p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm font-black text-slate-800">
                        {float.currency} {float.balance.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">≈ ${float.balanceUSD.toLocaleString()} USD</p>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                      {getFloatStatusBadge(float.status)}
                      <button
                        onClick={() => {
                          setSelectedFloatToReplenish(float.id);
                          setReplenishAmount(float.status === 'critical' ? 15000 : 5000);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition bg-white text-xs font-semibold"
                      >
                        Replenish Pool
                      </button>
                    </div>
                  </div>

                  {/* Progress bar of threshold */}
                  <div className="mt-3.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                      <span>Minimum Safe Threshold: {float.currency} {float.minThreshold.toLocaleString()}</span>
                      <span className={float.status === 'healthy' ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                        {pctOfMin}% of safe limit
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          float.status === 'healthy'
                            ? 'bg-emerald-500'
                            : float.status === 'low_balance'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(pctOfMin, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Manual Replenishment overlay */}
                  {selectedFloatToReplenish === float.id && (
                    <div className="mt-4 p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in">
                      <div>
                        <span className="text-xs font-bold text-amber-900">Float Replenishment Pool Setup</span>
                        <p className="text-[11px] text-amber-700 mt-0.5">Simulate transferring reserves from core Citibank vault to telco ledger.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={replenishAmount}
                          onChange={(e) => setReplenishAmount(parseInt(e.target.value))}
                          className="p-1.5 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none"
                        >
                          <option value={2000}>$2,000 USD</option>
                          <option value={5000}>$5,000 USD</option>
                          <option value={15000}>$15,000 USD</option>
                          <option value={50000}>$50,000 USD</option>
                        </select>
                        <button
                          onClick={() => handleReplenishFloatAction(float.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition"
                        >
                          Confirm Sweep
                        </button>
                        <button
                          onClick={() => setSelectedFloatToReplenish(null)}
                          className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FX Board Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Globe className="h-4.5 w-4.5 text-amber-500" />
              FX conversion rates
            </h3>
            <span className="text-xs text-slate-400">1 USD = Local</span>
          </div>

          <div className="space-y-4 flex-1">
            {Object.values(exchangeRates).map(rate => {
              if (rate.currency === 'USD') return null;
              const isEditing = editingCurrency === rate.currency;

              return (
                <div key={rate.currency} className="p-3.5 border border-slate-100 rounded-xl flex items-center justify-between bg-slate-50/50">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{rate.currency} ({rate.symbol})</span>
                    <span className="text-[10px] text-slate-400 font-medium">Mid-Market Rate</span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={newRateValue}
                        onChange={(e) => setNewRateValue(parseFloat(e.target.value))}
                        className="w-20 p-1 text-xs border border-slate-300 rounded font-mono text-right"
                      />
                      <button
                        onClick={() => saveRateUpdate(rate.currency)}
                        className="px-2 py-1 bg-amber-500 text-slate-950 rounded text-[11px] font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-slate-800">
                        {rate.rateToUSD}
                      </span>
                      <button
                        onClick={() => startEditingRate(rate.currency, rate.rateToUSD)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-[11px] text-amber-800">
            * Adjusting currency parameters alters USD conversion formulas dynamically in real-time in the merchant ledger.
          </div>
        </div>
      </div>

      {/* Payout Settlements Batch Queue */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Merchant settlement batch payouts queue</span>
            <span className="text-[11px] text-slate-400">Funds aggregated in merchant ledger wallets are swept to their local bank accounts</span>
          </div>
          <span className="text-xs bg-slate-100 border px-2.5 py-1 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-500" />
            Payout Batching: Daily 18:00 UTC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="p-4 pl-6">Batch ID & Merchant</th>
                <th className="p-4">Payout Amount</th>
                <th className="p-4">Aggregate (USD)</th>
                <th className="p-4">Initiated Timestamp</th>
                <th className="p-4">State Status</th>
                <th className="p-4">Bank Ref No.</th>
                <th className="p-4 pr-6 text-right">Settlement Processing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {batches.map(batch => (
                <tr key={batch.id} className="hover:bg-slate-50/20">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-800 font-mono text-xs">{batch.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{batch.merchantName}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {batch.currency} {batch.amount.toLocaleString()}
                  </td>
                  <td className="p-4 font-semibold text-slate-500">
                    ${batch.amountUSD.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(batch.initiatedAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {batch.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Completed
                      </span>
                    ) : batch.status === 'processing' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        Pending Admin Sweep
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {batch.bankRef || 'Awaiting Sweep'}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {batch.status === 'pending' ? (
                      <button
                        onClick={() => handleSettlementAction(batch.id)}
                        className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg border border-amber-500 shadow-sm transition active:scale-95 flex items-center gap-1 ml-auto"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" /> Direct Bank Sweep
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sweep Authorized</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
