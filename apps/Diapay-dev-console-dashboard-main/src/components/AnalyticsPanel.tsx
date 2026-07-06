import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Download, Check, HelpCircle, ArrowUpRight, BarChart2 } from "lucide-react";

export default function AnalyticsPanel() {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Daily statistics for the last 8 days
  const dailyData = [
    { day: "Jun 26", volume: 220000, txCount: 3 },
    { day: "Jun 27", volume: 350000, txCount: 5 },
    { day: "Jun 28", volume: 180000, txCount: 2 },
    { day: "Jun 29", volume: 450000, txCount: 6 },
    { day: "Jun 30", volume: 310000, txCount: 4 },
    { day: "Jul 01", volume: 520000, txCount: 8 },
    { day: "Jul 02", volume: 410000, txCount: 5 },
    { day: "Jul 03", volume: 1450000, txCount: 12 }, // spike due to completed simulator runs
  ];

  const metrics = [
    { label: "Consolidated Gross Volume", value: "16,780,000 XOF", sub: "+12.4% vs last month", color: "text-indigo-600" },
    { label: "Completion Success Rate", value: "94.2%", sub: "Industry average 78%", color: "text-emerald-600" },
    { label: "Effective Gateway Fee", value: "2.21%", sub: "Platform 0.5% + Network 1.71%", color: "text-teal-600" },
    { label: "Average Transaction Ticket", value: "67,661 XOF", sub: "Calculated over 248 sales", color: "text-slate-800" }
  ];

  const handleExport = () => {
    setExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    }, 1200);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 text-xs shadow-md font-sans">
          <p className="font-bold mb-1">{payload[0].payload.day}</p>
          <p className="text-teal-400">Volume: <strong className="font-mono">{payload[0].value.toLocaleString()} XOF</strong></p>
          <p className="text-gray-400">Transactions: <strong className="font-mono">{payload[0].payload.txCount}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="analytics-panel-container" className="space-y-6 text-left">
      {/* Top Banner with export action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
        <div>
          <h3 className="font-display font-semibold text-gray-800 text-lg">Financial Performance & Analytics</h3>
          <p className="text-xs text-gray-400">Consolidated reports of multiple mobile operators, cards, and crypto</p>
        </div>

        <div>
          {exportSuccess ? (
            <div className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs">
              <Check size={14} /> Diapay_Ledger_Statement_2026.csv Downloaded!
            </div>
          ) : (
            <button 
              id="export-statement-btn"
              onClick={handleExport}
              disabled={exporting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Download size={14} />
              {exporting ? "Generating Ledger Consolidations..." : "Download Ledger CSV"}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-sm transition">
            <span className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
              {m.label}
            </span>
            <h2 className={`text-2xl font-display font-bold ${m.color} tracking-tight`}>
              {m.value}
            </h2>
            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-100/60 text-[10px] text-gray-500">
              <span>{m.sub}</span>
              <ArrowUpRight size={12} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Bar Chart Panel */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">Processing Volume (Daily Breakdown)</h4>
            <p className="text-xs text-gray-400">Fills up automatically as you execute payments inside the Checkout Simulator</p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md">8-DAY ANALYSIS</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic breakdown legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-indigo-600 rounded-full flex-shrink-0"></span>
            <div>
              <strong className="text-gray-800">Mobile Money Dominance (82%)</strong>
              <p className="text-[10px] text-gray-400">Orange Money Senegal & Wave represent the vast majority of payments.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-teal-500 rounded-full flex-shrink-0"></span>
            <div>
              <strong className="text-gray-800">Acquirer Redundancy Active</strong>
              <p className="text-[10px] text-gray-400">Card payments routed dynamically across 2 local tokenized acquirers.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></span>
            <div>
              <strong className="text-gray-800">Crypto Settlement Stable (XOF)</strong>
              <p className="text-[10px] text-gray-400">Zero-volatility compliance pool liquidation pairs executing safely.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
