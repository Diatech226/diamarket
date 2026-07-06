import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Terminal, 
  Lock, 
  Clock, 
  Zap, 
  ArrowRight,
  Server,
  Signal,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ProviderStatus {
  id: string;
  name: string;
  uptime: number;
  baseLatency: number;
  latency: number;
  status: "operational" | "degraded" | "outage";
  region: string;
  endpoint: string;
  version: string;
  reliability: string;
}

export default function NetworkStatus() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providers, setProviders] = useState<ProviderStatus[]>([
    {
      id: "orange-money",
      name: "Orange Money Senegal",
      uptime: 99.98,
      baseLatency: 14,
      latency: 14,
      status: "operational",
      region: "Senegal (DKR-1)",
      endpoint: "https://api.orange.sn/om/v1/checkout",
      version: "v1.4.2",
      reliability: "High SLA Guaranteed"
    },
    {
      id: "wave",
      name: "Wave Gateway",
      uptime: 99.99,
      baseLatency: 22,
      latency: 22,
      status: "operational",
      region: "West Africa (DKR-2)",
      endpoint: "https://api.wave.com/v1/checkout/secure",
      version: "v2.0.1",
      reliability: "High SLA Guaranteed"
    },
    {
      id: "mtn-momo",
      name: "MTN MoMo",
      uptime: 99.15,
      baseLatency: 185,
      latency: 185,
      status: "operational",
      region: "Côte d'Ivoire (ABJ-1)",
      endpoint: "https://partner.momo.mtn.com/collection/v1_0",
      version: "v1.0.8",
      reliability: "Standard Operator SLA"
    },
    {
      id: "free-money",
      name: "Free Money",
      uptime: 98.92,
      baseLatency: 45,
      latency: 45,
      status: "operational",
      region: "Senegal (DKR-1)",
      endpoint: "https://api.free.sn/freemoney/v2/pay",
      version: "v2.1.0",
      reliability: "Standard Operator SLA"
    },
    {
      id: "moov-money",
      name: "Moov Money",
      uptime: 99.12,
      baseLatency: 65,
      latency: 65,
      status: "operational",
      region: "Mali & Bourkina (BKO-1)",
      endpoint: "https://moovmoney.telecom.ml/gateway/secure",
      version: "v1.3.0",
      reliability: "Standard Operator SLA"
    },
    {
      id: "cards",
      name: "Visa/Mastercard Acquirer",
      uptime: 99.95,
      baseLatency: 32,
      latency: 32,
      status: "operational",
      region: "PCI-DSS Gateway (FR-PAR)",
      endpoint: "https://acquirer.diapay.net/iso8583/v1",
      version: "v3.1.2-hsm",
      reliability: "High SLA Guaranteed"
    }
  ]);

  // Network round-trip latency simulator (real-time fluctuations)
  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener("open-telemetry-hub", handleOpenModal);

    const interval = setInterval(() => {
      setProviders(prev => 
        prev.map(p => {
          // Add small fluctuation: -3ms to +3ms
          const dev = Math.floor(Math.random() * 7) - 3;
          let newLatency = p.baseLatency + dev;
          if (newLatency < p.baseLatency - 10) newLatency = p.baseLatency - 10;
          if (newLatency < 2) newLatency = 2; // Prevent less than 2ms

          // Occasionally simulate temporary minor routing spikes for variety
          if (Math.random() > 0.96) {
            newLatency += Math.floor(Math.random() * 40) + 15;
          }

          return {
            ...p,
            latency: newLatency
          };
        })
      );
    }, 3000);

    return () => {
      window.removeEventListener("open-telemetry-hub", handleOpenModal);
      clearInterval(interval);
    };
  }, []);

  // Diagnostic traceroute states
  const [traceLogs, setTraceLogs] = useState<string[]>([]);
  const [isTracing, setIsTracing] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);

  const runTraceroute = () => {
    if (isTracing) return;
    setIsTracing(true);
    setTraceLogs([]);
    setTraceProgress(0);

    const now = () => {
      const d = new Date();
      return d.toTimeString().split(" ")[0];
    };

    const steps = [
      { msg: `[${now()}] 🔍 Initializing Diapay Multi-Gateway Diagnostic Traceroute...`, progress: 10, wait: 400 },
      { msg: `[${now()}] 🌐 Resolving secure regional endpoints to BGP routers...`, progress: 20, wait: 800 },
      { msg: `[${now()}] 🛰️ Route 1: Local Docker Container Ingress Gateway [172.17.0.1] - 1.2ms (OK)`, progress: 30, wait: 600 },
      { msg: `[${now()}] 📦 Route 2: Diapay Core API Router (Dakar Substation) [188.166.45.21] - 8.4ms (OK)`, progress: 45, wait: 700 },
      { msg: `[${now()}] 📞 Trace OM_SN: orange-money.telecom.sn [10.220.12.5] - ${providers.find(p => p.id === "orange-money")?.latency || 14}ms (ESTABLISHED)`, progress: 60, wait: 900 },
      { msg: `[${now()}] 🌊 Trace WAVE_SN: wave-partner-node.wave.com [10.220.12.9] - ${providers.find(p => p.id === "wave")?.latency || 22}ms (ESTABLISHED)`, progress: 75, wait: 800 },
      { msg: `[${now()}] ⚡ Trace MTN_CI: momo-node.mtn.ci [41.207.12.18] - ${providers.find(p => p.id === "mtn-momo")?.latency || 185}ms (ESTABLISHED)`, progress: 90, wait: 1000 },
      { msg: `[${now()}] ✅ Diagnosis complete. 0% Packet Loss. Average jitter: 1.8ms. All 6 payment tunnels securely authenticated via HSM.`, progress: 100, wait: 600 }
    ];

    let currentStep = 0;
    const runNextStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setTraceLogs(prev => [...prev, step.msg]);
        setTraceProgress(step.progress);
        currentStep++;
        setTimeout(runNextStep, step.wait);
      } else {
        setIsTracing(false);
      }
    };

    runNextStep();
  };

  return (
    <>
      {/* SIDEBAR WIDGET */}
      <div 
        id="sidebar-network-status-widget"
        onClick={() => setIsModalOpen(true)}
        className="mt-2 mb-4 mx-4 p-3 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 transition shadow-md cursor-pointer text-left select-none group"
        title="View Integrated Payment Provider Real-time Telemetry"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-indigo-400 group-hover:animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gateway Status</span>
          </div>
          <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full animate-pulse">
            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
            LIVE RTT
          </span>
        </div>

        {/* List the top 3 high volume providers briefly */}
        <div className="space-y-1.5 pt-1">
          {providers.slice(0, 3).map(p => (
            <div key={p.id} className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 truncate max-w-[110px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {p.name.split(" ")[0]} {p.name.includes("Senegal") && "SN"}
              </span>
              <span className="font-mono text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <span className="text-[8px] text-slate-500 font-normal">SLA {p.uptime}%</span>
                <span className="text-indigo-300 group-hover:text-white font-semibold">{p.latency}ms</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center text-[9px] text-indigo-400 font-semibold group-hover:text-indigo-300">
          <span>Troubleshoot & Trace</span>
          <ArrowRight size={10} className="transform translate-x-0 group-hover:translate-x-1 transition" />
        </div>
      </div>

      {/* TELEMETRY OVERLAY DIALOG / MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Wifi size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-base">Payment Gateway Telemetry Hub</h3>
                    <p className="text-xs text-slate-400">Live SLA performance audit and telecommunications diagnostics</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Overall Operational Bar */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">All Integrations Operational</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Average unified packet transit roundtrip: 60.3ms • Route caching warm</p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Last Network Pulse Check</span>
                    <strong className="text-xs text-white font-mono">Just Now (Real-time updates)</strong>
                  </div>
                </div>

                {/* Main Grid: Left is providers list, right is developer trace tool */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Comprehensive Provider List */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Server size={12} className="text-indigo-400" />
                      Integrated Payment Providers
                    </h4>

                    <div className="space-y-2.5">
                      {providers.map(p => (
                        <div 
                          key={p.id} 
                          className="bg-slate-950/45 hover:bg-slate-950/90 border border-slate-850 p-3.5 rounded-xl transition flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                              <strong className="text-xs font-bold text-white">{p.name}</strong>
                              <span className="text-[8.5px] bg-slate-800 text-slate-300 font-mono px-1 py-0.5 rounded font-normal shrink-0">
                                {p.region.split(" ")[0]}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono space-y-0.5 max-w-[280px] sm:max-w-xs truncate">
                              <p className="truncate"><span className="text-slate-500">API:</span> {p.endpoint}</p>
                              <p className="text-slate-500 flex items-center gap-2">
                                <span>VER: {p.version}</span>
                                <span>•</span>
                                <span>{p.reliability}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col justify-between items-center sm:items-end gap-1.5 border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0 shrink-0">
                            <div className="text-right">
                              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">LATENCY</p>
                              <strong className="text-sm font-black font-mono text-indigo-300">
                                {p.latency}ms
                              </strong>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">UPTIME SLA</p>
                              <strong className="text-xs font-bold text-emerald-400 font-mono">
                                {p.uptime}%
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Diagnostic Trace Routing Simulator */}
                  <div className="lg:col-span-5 space-y-3.5">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal size={12} className="text-indigo-400" />
                      Traceroute Diagnostics
                    </h4>

                    <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 space-y-4 h-full flex flex-col justify-between">
                      <div className="space-y-1 text-slate-300">
                        <p className="text-[11px] font-bold flex items-center gap-1 text-slate-200">
                          <Zap size={11} className="text-amber-400 animate-bounce" />
                          Carrier Route Troubleshooter
                        </p>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Trace the secure payload path from Diamarket subnodes to regional mobile network operator cellular gateways. Helps diagnose merchant endpoint latency or telecommunication carrier delays.
                        </p>
                      </div>

                      {/* Trace Output Terminal Window */}
                      <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 font-mono text-[9px] text-slate-400 min-h-[160px] overflow-y-auto space-y-1.5 flex flex-col justify-start">
                        {traceLogs.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-8 space-y-2">
                            <Signal size={24} className="opacity-25" />
                            <p>No active traces running.<br />Click below to start network diagnosis.</p>
                          </div>
                        ) : (
                          traceLogs.map((log, i) => (
                            <p key={i} className="leading-normal animate-fade-in break-words">
                              {log.includes("ESTABLISHED") ? (
                                <span className="text-indigo-300 font-semibold">{log}</span>
                              ) : log.includes("complete") ? (
                                <span className="text-emerald-400 font-bold">{log}</span>
                              ) : log.includes("Route") ? (
                                <span className="text-slate-200">{log}</span>
                              ) : (
                                <span>{log}</span>
                              )}
                            </p>
                          ))
                        )}
                      </div>

                      {/* Progress bar */}
                      {isTracing && (
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${traceProgress}%` }}
                          />
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isTracing}
                          onClick={runTraceroute}
                          className={`w-full py-2.5 rounded-lg text-[10.5px] font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer transition ${
                            isTracing
                              ? "bg-slate-900 text-slate-500 border border-slate-850"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                          }`}
                        >
                          {isTracing ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              Ping Routing Nodes... {traceProgress}%
                            </>
                          ) : (
                            <>
                              <Terminal size={12} />
                              Run Network Diagnostic Trace
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Trust and Encryption Footer notice */}
                <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Lock size={12} className="text-slate-500" />
                    All API connections secured with SHA-384 & TLS 1.3
                  </span>
                  <span>IP Substation Target: Senegal-WEST-Dkr</span>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
