import React, { useState } from 'react';
import { PaymentRail } from '../types';
import {
  Activity,
  Layers,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Sliders,
  TrendingUp,
  Globe,
  Shuffle,
  ShieldCheck,
  ZapOff
} from 'lucide-react';

interface InfrastructureScreenProps {
  rails: PaymentRail[];
  onUpdateRail: (railId: string, updatedFields: Partial<PaymentRail>) => void;
  onAddSystemLog: (category: 'rail' | 'merchant' | 'settlement' | 'routing', type: 'info' | 'warning' | 'error' | 'success', message: string) => void;
}

export default function InfrastructureScreen({
  rails,
  onUpdateRail,
  onAddSystemLog
}: InfrastructureScreenProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRailId, setActiveRailId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Stats calculation
  const totalRails = rails.length;
  const operationalRails = rails.filter(r => r.status === 'operational').length;
  const degradedRails = rails.filter(r => r.status === 'degraded').length;
  const outageRails = rails.filter(r => r.status === 'major_outage').length;
  
  const avgSuccessRate = parseFloat(
    (rails.reduce((acc, curr) => acc + curr.successRate, 0) / totalRails).toFixed(1)
  );
  
  const avgLatency = Math.round(
    rails.reduce((acc, curr) => acc + curr.latencyMs, 0) / totalRails
  );

  const countries = ['All', 'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Uganda'];
  const types = ['All', 'mobile_money', 'bank_transfer', 'card'];

  // Handle manual status adjustments for simulations
  const handleStatusChange = (railId: string, status: PaymentRail['status']) => {
    const rail = rails.find(r => r.id === railId);
    if (!rail) return;

    let successRate = rail.successRate;
    let latencyMs = rail.latencyMs;
    let isFallbackActive = rail.isFallbackActive;

    if (status === 'operational') {
      successRate = parseFloat((95 + Math.random() * 4).toFixed(1));
      latencyMs = Math.floor(60 + Math.random() * 140);
      isFallbackActive = false;
    } else if (status === 'degraded') {
      successRate = parseFloat((75 + Math.random() * 10).toFixed(1));
      latencyMs = Math.floor(400 + Math.random() * 450);
      isFallbackActive = false;
    } else if (status === 'major_outage') {
      successRate = parseFloat((5 + Math.random() * 10).toFixed(1));
      latencyMs = Math.floor(2000 + Math.random() * 1000);
      isFallbackActive = rail.fallbackRailId ? true : false;
    } else if (status === 'maintenance') {
      successRate = 0.0;
      latencyMs = 0;
      isFallbackActive = rail.fallbackRailId ? true : false;
    }

    onUpdateRail(railId, {
      status,
      successRate,
      latencyMs,
      isFallbackActive
    });

    // Generate dynamic logs reflecting this infrastructure event
    let logType: 'info' | 'warning' | 'error' | 'success' = 'info';
    let message = '';

    if (status === 'operational') {
      logType = 'success';
      message = `Gateway [${rail.name}] is fully restored. Uptime telemetry reports normal latency (${latencyMs}ms).`;
    } else if (status === 'degraded') {
      logType = 'warning';
      message = `Telemetry Warning: Gateway [${rail.name}] latency exceeded 400ms. Latency: ${latencyMs}ms, Success: ${successRate}%.`;
    } else if (status === 'major_outage') {
      logType = 'error';
      message = `CRITICAL OUTAGE: Gateway [${rail.name}] down! Success rate: ${successRate}%.`;
      if (rail.fallbackRailId && rail.autoRouteEnabled) {
        const fallback = rails.find(r => r.id === rail.fallbackRailId);
        message += ` Auto-routed traffic to fallback: ${fallback?.name || rail.fallbackRailId}.`;
      }
    } else if (status === 'maintenance') {
      logType = 'info';
      message = `Scheduled maintenance initiated for [${rail.name}]. Traffic diverted.`;
    }

    onAddSystemLog('rail', logType, message);
  };

  // Toggle routing fallback toggle
  const handleToggleAutoRoute = (railId: string, enabled: boolean) => {
    const rail = rails.find(r => r.id === railId);
    if (!rail) return;

    onUpdateRail(railId, { autoRouteEnabled: enabled });
    onAddSystemLog(
      'routing',
      enabled ? 'success' : 'warning',
      `Auto-route routing engine ${enabled ? 'ENABLED' : 'DISABLED'} for gateway [${rail.name}].`
    );
  };

  // Trigger manual gateway ping test
  const triggerHealthCheck = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      rails.forEach(rail => {
        if (rail.status === 'operational') {
          // Normal slight fluctuations
          const successRate = parseFloat((96 + Math.random() * 3.8).toFixed(1));
          const latencyMs = Math.floor(80 + Math.random() * 120);
          onUpdateRail(rail.id, { successRate, latencyMs });
        } else if (rail.status === 'degraded') {
          const successRate = parseFloat((70 + Math.random() * 15).toFixed(1));
          const latencyMs = Math.floor(450 + Math.random() * 350);
          onUpdateRail(rail.id, { successRate, latencyMs });
        }
      });
      setIsRefreshing(false);
      onAddSystemLog('rail', 'success', 'Completed global payment rail ping check. 10 channels validated.');
    }, 800);
  };

  // Filter Rails
  const filteredRails = rails.filter(rail => {
    const matchesCountry = selectedCountry === 'All' || rail.country === selectedCountry;
    const matchesType = selectedType === 'All' || rail.type === selectedType;
    const matchesSearch = rail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rail.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rail.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: PaymentRail['status']) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Degraded Latency
          </span>
        );
      case 'major_outage':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Major Outage
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            Maintenance
          </span>
        );
    }
  };

  return (
    <div className="space-y-8" id="infra-screen">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-amber-600" />
            Infrastructure Gateway & Routing Control
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status, automated failovers, and latency optimization for Africa's key payment networks.
          </p>
        </div>
        <button
          onClick={triggerHealthCheck}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm active:scale-95 disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Pinging Channels...' : 'Ping Telemetry Engine'}
        </button>
      </div>

      {/* Grid of Uptime Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gateway Network Health</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {operationalRails} / {totalRails}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
              {operationalRails} Online
            </span>
            {degradedRails > 0 && (
              <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                {degradedRails} Degraded
              </span>
            )}
            {outageRails > 0 && (
              <span className="flex items-center gap-1 text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded animate-pulse">
                {outageRails} Out
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Average Success</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {avgSuccessRate}%
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${avgSuccessRate > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-xs text-slate-500 font-medium">Over last 10,000 transactions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Gateway Latency</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {avgLatency} ms
            </h3>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">Target: &lt; 350ms average</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Automated Failover Routing</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {rails.filter(r => r.autoRouteEnabled).length} Active
            </h3>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-1">
            <Shuffle className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">Self-healing active on major routes</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Block */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search gateway name, provider or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase">
            <Globe className="h-3.5 w-3.5" />
            <span>Country</span>
          </div>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {countries.map(country => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  selectedCountry === country
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {country === 'All' ? 'All' : country}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize ${
                  selectedType === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'All' ? 'All Types' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gateway Rails Lists */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Payment Channel Gateway Telemetry ({filteredRails.length} Rails Listed)
          </span>
          <span className="text-xs text-slate-400">Click on any rail row to configure fallback routing & trigger manual mock outages</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRails.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No payment channels match your active filters.
            </div>
          ) : (
            filteredRails.map(rail => {
              const isExpanded = activeRailId === rail.id;
              const fallbackRail = rails.find(r => r.id === rail.fallbackRailId);

              return (
                <div key={rail.id} className={`transition-colors duration-150 ${isExpanded ? 'bg-amber-50/20' : 'hover:bg-slate-50/30'}`}>
                  {/* Primary Row Summary */}
                  <div
                    onClick={() => setActiveRailId(isExpanded ? null : rail.id)}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Logo Placeholder / Status color dot */}
                      <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${
                        rail.status === 'operational'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : rail.status === 'degraded'
                          ? 'bg-amber-50 border-amber-100 text-amber-600'
                          : 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse'
                      }`}>
                        <Activity className="h-5 w-5 stroke-[2.2]" />
                      </div>

                      {/* Rail Information */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{rail.name}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono uppercase">
                            {rail.currency}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>{rail.country}</span>
                          <span>•</span>
                          <span>{rail.provider}</span>
                          <span>•</span>
                          <span className="capitalize text-[11px] font-medium text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            {rail.type.replace('_', ' ')}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Stats summary columns */}
                    <div className="flex flex-wrap items-center gap-8 md:gap-12">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Success Rate</span>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                rail.successRate > 95
                                  ? 'bg-emerald-500'
                                  : rail.successRate > 80
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${rail.successRate}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold ${
                            rail.successRate > 95
                              ? 'text-emerald-600'
                              : rail.successRate > 80
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}>
                            {rail.successRate}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Latency</span>
                        <p className={`text-sm font-bold mt-0.5 ${
                          rail.latencyMs < 250
                            ? 'text-emerald-600'
                            : rail.latencyMs < 600
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}>
                          {rail.latencyMs === 0 ? 'N/A' : `${rail.latencyMs}ms`}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">24H Vol (USD)</span>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          ${rail.volume24hUSD.toLocaleString()}
                        </p>
                      </div>

                      <div className="min-w-[120px] text-right flex flex-col items-end">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Routing Mode</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          {rail.isFallbackActive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                              <Shuffle className="h-2.5 w-2.5 animate-spin" />
                              Fallback Active
                            </span>
                          ) : rail.autoRouteEnabled ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Auto Routing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Manual
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        {getStatusBadge(rail.status)}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Customizer Control Panel */}
                  {isExpanded && (
                    <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Config Column 1: Core Routing Config */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                            <Settings className="h-4 w-4 text-slate-500" />
                            Routing & Failover Policy
                          </h5>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-xs font-semibold text-slate-800 block">Automated Failover Router</label>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Route away on &lt; 85% Success Rate</span>
                              </div>
                              <button
                                onClick={() => handleToggleAutoRoute(rail.id, !rail.autoRouteEnabled)}
                                className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                                  rail.autoRouteEnabled ? 'bg-amber-500' : 'bg-slate-300'
                                }`}
                              >
                                <span className={`h-4.5 w-4.5 rounded-full bg-white shadow absolute transition-all ${
                                  rail.autoRouteEnabled ? 'right-1' : 'left-1'
                                }`}></span>
                              </button>
                            </div>

                            <div className="border-t border-slate-100 pt-3">
                              <span className="text-xs font-semibold text-slate-800 block">Designated Fallback Gateway</span>
                              <div className="mt-1.5 flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                <span className="text-xs text-slate-600 font-mono">
                                  {fallbackRail ? fallbackRail.name : rail.fallbackRailId || 'None Designated'}
                                </span>
                                {rail.fallbackRailId ? (
                                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                    Ready
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                                    Vulnerable
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {rail.isFallbackActive && fallbackRail && (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-4 text-[11px] text-amber-800 flex items-start gap-1.5">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 animate-pulse" />
                            <div>
                              <strong className="font-semibold block">TRAFFIC ROUTED</strong>
                              Primary rail down. Payouts currently bypass MTN and route through {fallbackRail.name}.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Config Column 2: Status Simulator */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                            <Sliders className="h-4 w-4 text-slate-500" />
                            Gateway Incident Simulator
                          </h5>
                          <p className="text-[11px] text-slate-400 mb-4">
                            Simulate real-world African telecom downtime to test client-side self-healing logic.
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleStatusChange(rail.id, 'operational')}
                              className={`flex items-center gap-1.5 justify-center py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                                rail.status === 'operational'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              Operational
                            </button>

                            <button
                              onClick={() => handleStatusChange(rail.id, 'degraded')}
                              className={`flex items-center gap-1.5 justify-center py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                                rail.status === 'degraded'
                                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                              Latency Spike
                            </button>

                            <button
                              onClick={() => handleStatusChange(rail.id, 'major_outage')}
                              className={`flex items-center gap-1.5 justify-center py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                                rail.status === 'major_outage'
                                  ? 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <ZapOff className="h-3.5 w-3.5 text-rose-600" />
                              Momo Outage
                            </button>

                            <button
                              onClick={() => handleStatusChange(rail.id, 'maintenance')}
                              className={`flex items-center gap-1.5 justify-center py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                                rail.status === 'maintenance'
                                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <Settings className="h-3.5 w-3.5 text-slate-500" />
                              Maintenance
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 mt-4 border-t border-slate-100 pt-3">
                          * Adjusting this changes transaction success rates in the Live Ledger simulation.
                        </div>
                      </div>

                      {/* Config Column 3: Metrics Dashboard */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-slate-500" />
                            Weekly Gateway Metrics
                          </h5>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                                <span>Core API Uptime</span>
                                <span className="text-slate-800 font-bold">{rail.status === 'operational' ? '99.98%' : rail.status === 'degraded' ? '98.42%' : '84.15%'}</span>
                              </div>
                              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${rail.status === 'operational' ? 'bg-emerald-500' : rail.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: rail.status === 'operational' ? '99%' : rail.status === 'degraded' ? '92%' : '75%' }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                                <span>Daily Settled Funds</span>
                                <span className="text-slate-800 font-bold">T+0 Instant</span>
                              </div>
                              <p className="text-[10px] text-slate-400">Direct wallet-to-settlement automated processing.</p>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                                <span>Avg Cost Per Tx</span>
                                <span className="text-slate-800 font-bold">
                                  {rail.type === 'mobile_money' ? '1.5%' : rail.type === 'card' ? '2.5%' : '100 NGN flat'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-4 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Interconnected node verified secure.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
