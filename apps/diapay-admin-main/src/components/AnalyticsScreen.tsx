import React from 'react';
import { Transaction, PaymentRail } from '../types';
import {
  BarChart3,
  Globe,
  CreditCard,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  TrendingUp as TrendingIcon
} from 'lucide-react';

interface AnalyticsScreenProps {
  transactions: Transaction[];
  rails: PaymentRail[];
}

export default function AnalyticsScreen({
  transactions,
  rails
}: AnalyticsScreenProps) {
  // Volume stats calculations
  const totalTx = transactions.length;
  const successfulTx = transactions.filter(t => t.status === 'success');
  const totalVolumeUSD = successfulTx.reduce((acc, curr) => acc + curr.amountUSD, 0);
  
  // Method breakdowns
  const methodVolume = transactions.reduce((acc, tx) => {
    if (tx.status !== 'success') return acc;
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + tx.amountUSD;
    return acc;
  }, {} as Record<string, number>);

  const methodCounts = transactions.reduce((acc, tx) => {
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Country breakdowns
  const countryVolume = transactions.reduce((acc, tx) => {
    if (tx.status !== 'success') return acc;
    // Map rail to country
    const rail = rails.find(r => r.id === tx.railId);
    const country = rail ? rail.country : 'Other';
    acc[country] = (acc[country] || 0) + tx.amountUSD;
    return acc;
  }, {} as Record<string, number>);

  // Render a responsive high-fidelity custom SVG bar chart for Country Volume
  const renderCountryChart = () => {
    const countries = Object.keys(countryVolume);
    const volumes = Object.values(countryVolume);
    const maxVolume = Math.max(...volumes, 100);

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Globe className="h-4.5 w-4.5 text-amber-500" />
            Processing Volume by Country (USD)
          </h4>
          <span className="text-xs text-slate-400">Total volume processed securely</span>
        </div>

        {countries.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
            No volume logged.
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {countries.map((country, index) => {
              const vol = countryVolume[country];
              const pct = (vol / maxVolume) * 100;
              const colorClass = index % 3 === 0 ? 'bg-amber-500' : index % 3 === 1 ? 'bg-indigo-500' : 'bg-emerald-500';

              return (
                <div key={country} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{country}</span>
                    <span>${vol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render method breakdown
  const renderMethodBreakdown = () => {
    const methods = ['mobile_money', 'bank_transfer', 'card', 'ussd'];
    const totalCount = Object.values(methodCounts).reduce((a, b) => a + b, 0) || 1;

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CreditCard className="h-4.5 w-4.5 text-amber-500" />
            Payment Channel Shares
          </h4>
          <span className="text-xs text-slate-400">Distribution by channel count</span>
        </div>

        <div className="space-y-4">
          {methods.map((method, index) => {
            const count = methodCounts[method] || 0;
            const volume = methodVolume[method] || 0;
            const percentage = Math.round((count / totalCount) * 100);
            const colorClass = index % 4 === 0 ? 'bg-amber-500' : index % 4 === 1 ? 'bg-indigo-500' : index % 4 === 2 ? 'bg-blue-500' : 'bg-slate-400';

            return (
              <div key={method} className="flex items-center justify-between gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${colorClass}`}></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase block">
                      {method.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{count} payments recorded</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">${volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-[10px] text-slate-500 font-bold">{percentage}% share</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render a responsive high-fidelity custom SVG line chart of processing trends
  const renderTrendChart = () => {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Infrastructure Conversion Index</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Continuous telemetry conversion tracker</p>
          </div>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
            96.8% Average
          </span>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative pt-4">
          <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />

            {/* Area path */}
            <path
              d="M 0 50 Q 100 20 180 30 T 300 15 T 420 40 T 500 10 L 500 100 L 0 100 Z"
              fill="url(#chartGradient)"
            />

            {/* Spark line */}
            <path
              d="M 0 50 Q 100 20 180 30 T 300 15 T 420 40 T 500 10"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Markers */}
            <circle cx="180" cy="30" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="300" cy="15" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="500" cy="10" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          </svg>

          {/* X axis labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono mt-3">
            <span>08:00</span>
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00</span>
            <span>16:00</span>
            <span>18:00 (Current)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in" id="analytics-screen">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-amber-600" />
          Gateway Analytics & Traffic Diagnostics
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Perform analytical health reviews across high-throughput payment corridors in key African currencies.
        </p>
      </div>

      {/* High level volumes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aggregate Processing Value</p>
            <h3 className="text-2xl font-black text-slate-900 mt-2">${totalVolumeUSD.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-600 font-bold">+18.5%</span> than yesterday
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gateway Conversions</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {((successfulTx.length / (totalTx || 1)) * 100).toFixed(1)}%
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-3">Overall SLA: 95.0% Operational target</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Settlement Time</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">1.8 seconds</h3>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded self-start">
            Instant settlement active
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dispute / Chargeback Index</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-2">0.02%</h3>
          </div>
          <p className="text-xs text-slate-500 mt-3">SLA Safe Limit: &lt; 0.5%</p>
        </div>
      </div>

      {/* Graphical Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCountryChart()}
        {renderMethodBreakdown()}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {renderTrendChart()}
      </div>
    </div>
  );
}
