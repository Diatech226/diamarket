import React, { useState, useEffect } from "react";
import CheckoutSimulator from "./components/CheckoutSimulator";
import MerchantDashboard from "./components/MerchantDashboard";
import AnalyticsPanel from "./components/AnalyticsPanel";
import DeveloperConsole from "./components/DeveloperConsole";
import DisputesDesk from "./components/DisputesDesk";
import SupportPortal from "./components/SupportPortal";
import NotificationEmails from "./components/NotificationEmails";
import NetworkStatus from "./components/NetworkStatus";
import CommandPalette from "./components/CommandPalette";
import { 
  Globe, 
  LayoutDashboard, 
  BarChart3, 
  Terminal, 
  ShieldAlert, 
  HelpCircle, 
  Mail, 
  RefreshCw, 
  ExternalLink,
  Menu,
  X,
  Lock,
  Search,
  Command
} from "lucide-react";

type ActiveTab = "checkout" | "dashboard" | "analytics" | "developer" | "disputes" | "support" | "emails";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [balance, setBalance] = useState({ masterClearing: 14250000, escrowReserve: 1520000, inDispute: 450000 });
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [initialSessionId, setInitialSessionId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global keydown listeners for shortcuts (Cmd+K / Ctrl+K and Alt+1..7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Palette: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }

      // Alt + Number direct switches
      if (e.altKey && e.key >= "1" && e.key <= "7") {
        e.preventDefault();
        const tabMap: Record<string, ActiveTab> = {
          "1": "dashboard",
          "2": "checkout",
          "3": "analytics",
          "4": "developer",
          "5": "disputes",
          "6": "support",
          "7": "emails",
        };
        const targetTab = tabMap[e.key];
        if (targetTab) {
          setActiveTab(targetTab);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Detect session_id deep links on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessId = params.get("session_id");
    if (sessId) {
      setInitialSessionId(sessId);
      setActiveTab("checkout");
      // Clean up URL parameters cleanly
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleNavigateToTab = (tab: ActiveTab, sessionId?: string) => {
    if (sessionId) {
      setInitialSessionId(sessionId);
    }
    setActiveTab(tab);
  };

  // Fetch real-time balances computed from double-entry ledger rows on the server
  const getBalance = async () => {
    setFetchingBalance(true);
    try {
      const res = await fetch("/api/v1/balance");
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      }
    } catch (e) {
      console.error("Failed to fetch balance from express server", e);
    } finally {
      setFetchingBalance(false);
    }
  };

  useEffect(() => {
    getBalance();
  }, []);

  const navigationItems = [
    { id: "dashboard", label: "Ledger Register", icon: LayoutDashboard },
    { id: "checkout", label: "Checkout Simulator", icon: Globe },
    { id: "analytics", label: "Analytics & Stats", icon: BarChart3 },
    { id: "developer", label: "Developer Console", icon: Terminal },
    { id: "disputes", label: "Disputes Desk", icon: ShieldAlert },
    { id: "support", label: "Payer Support", icon: HelpCircle },
    { id: "emails", label: "Mailer Hub", icon: Mail },
  ] as const;

  return (
    <div id="diapay-application-frame" className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans flex antialiased">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-display font-bold text-white shadow-sm text-base">
              Dp
            </div>
            <div className="text-left">
              <h1 className="text-lg font-display font-bold tracking-tight text-slate-900">
                Dia<span className="text-indigo-600">pay</span>
              </h1>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                Unified African API
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation Tab list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Quick search & shortcut trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 mb-3 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer text-slate-500 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-800"
            title="Open Command Palette (Cmd+K)"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-slate-400" />
              <span>Search actions...</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer text-left ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={16} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Network status real-time monitor component */}
        <NetworkStatus />

        {/* Sidebar Merchant Badge */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100/70">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 font-mono">
              DM
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-slate-800 truncate">Diamarket Sarl</p>
              <p className="text-[10px] text-slate-400 font-mono">Merchant: DM-8802</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Slide-over Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-xs">
          <div className="w-64 bg-white h-full flex flex-col border-r border-slate-200 animate-in slide-in-from-left duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-display font-bold text-white shadow-sm text-base">
                  Dp
                </div>
                <div className="text-left">
                  <h1 className="text-lg font-display font-bold tracking-tight text-slate-900">
                    Dia<span className="text-indigo-600">pay</span>
                  </h1>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                    Unified African API
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {/* Mobile Quick Search trigger */}
              <button
                onClick={() => {
                  setPaletteOpen(true);
                  setMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 mb-3 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer text-slate-500 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-slate-400" />
                  <span>Search actions...</span>
                </div>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold font-mono text-slate-400">
                  ⌘K
                </kbd>
              </button>

              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer text-left ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Network status real-time monitor component for mobile */}
            <NetworkStatus />

            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100/70">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 font-mono">
                  DM
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-bold text-slate-800 truncate">Diamarket Sarl</p>
                  <p className="text-[10px] text-slate-400 font-mono">Merchant: DM-8802</p>
                </div>
              </div>
            </div>
          </div>
          {/* Tapping outside on screen will close side menu */}
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
            >
              <Menu size={18} />
            </button>
            <div className="hidden sm:block h-5 w-px bg-slate-200 lg:hidden"></div>

            <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-[11px] font-bold rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              LIVE MODE
            </span>
            <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
            
            {/* Command Palette Header Trigger */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 text-slate-500 hover:text-slate-800 rounded-lg text-[11px] font-semibold cursor-pointer transition shadow-3xs"
              title="Open Command Palette (Cmd+K)"
            >
              <Search size={12} className="text-slate-400" />
              <span>Search Actions</span>
              <kbd className="hidden sm:inline px-1 bg-white border border-slate-200 rounded font-mono text-[9px] text-slate-400 leading-none">
                ⌘K
              </kbd>
            </button>
            
            <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              CFA Franc (XOF) Gateway
            </p>
          </div>

          {/* Quick Real-time Balances display */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-4 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-100">
              <div className="text-left font-mono">
                <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Clearing</span>
                <strong className="text-slate-800 font-bold text-xs">
                  {balance.masterClearing.toLocaleString()} XOF
                </strong>
              </div>

              <div className="w-px h-5 bg-slate-200"></div>

              <div className="text-left font-mono">
                <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Reserves</span>
                <strong className="text-slate-800 font-bold text-xs">
                  {balance.escrowReserve.toLocaleString()} XOF
                </strong>
              </div>
            </div>

            <button 
              id="refresh-balance-indicator"
              onClick={getBalance}
              disabled={fetchingBalance}
              className="text-slate-400 hover:text-slate-700 transition p-2 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-center bg-white"
              title="Refresh balances from ledger database"
            >
              <RefreshCw size={13} className={fetchingBalance ? "animate-spin text-indigo-600" : ""} />
            </button>

            {activeTab !== "checkout" && (
              <button
                onClick={() => setActiveTab("checkout")}
                className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xs flex items-center gap-1.5"
              >
                <span>+ Simulate Checkout</span>
              </button>
            )}
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header Dynamic Title */}
          <div className="text-left">
            <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900 capitalize">
              {activeTab === "dashboard" ? "Ledger Register & Balances" : activeTab.replace("-", " ")}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === "dashboard" && "Audit live double-entry general ledger balance rules and transaction journals."}
              {activeTab === "checkout" && "Test unified carrier mobile operator pushes and secure checkout card flows."}
              {activeTab === "analytics" && "Visualize transaction clearance rates, failure latency audits, and network statistics."}
              {activeTab === "developer" && "Inspect secret API key rules, webhooks testing tools, and real-time ledger payloads."}
              {activeTab === "disputes" && "Manage customer chargebacks, upload proof records, and clear locked balances."}
              {activeTab === "support" && "Search historic payer receipts instantly or report telecommunication carrier delays."}
              {activeTab === "emails" && "Preview transactional notification emails dispatched automatically by Diapay core routers."}
            </p>
          </div>

          {/* Render Active View component */}
          <div id="workspace-rendering-area">
            {activeTab === "dashboard" && (
              <MerchantDashboard 
                balanceData={balance} 
                onRefreshBalance={getBalance} 
              />
            )}

            {activeTab === "checkout" && (
              <CheckoutSimulator 
                onPaymentSuccess={getBalance} 
                initialSessionId={initialSessionId}
                onClearInitialSessionId={() => setInitialSessionId(null)}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsPanel />
            )}

            {activeTab === "developer" && (
              <DeveloperConsole onNavigateToTab={handleNavigateToTab} />
            )}

            {activeTab === "disputes" && (
              <DisputesDesk 
                onRefreshBalance={getBalance} 
              />
            )}

            {activeTab === "support" && (
              <SupportPortal />
            )}

            {activeTab === "emails" && (
              <NotificationEmails />
            )}
          </div>
        </main>

        {/* Footer Status Bar */}
        <footer className="bg-white border-t border-slate-200 text-slate-400 py-4 px-6 text-xs shrink-0 select-none">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent("open-telemetry-hub"))}
              className="flex flex-wrap gap-4 justify-center md:justify-start cursor-pointer hover:text-slate-600 transition group font-medium"
              title="Click to view deep-dive network diagnostics"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                Orange Money: <span className="text-indigo-600 group-hover:text-indigo-700 font-bold font-mono">14ms</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                Wave: <span className="text-indigo-600 group-hover:text-indigo-700 font-bold font-mono">22ms</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                MTN MoMo: <span className="text-indigo-600 group-hover:text-indigo-700 font-bold font-mono">185ms</span>
              </span>
              <span className="text-[10px] text-slate-400 underline font-semibold decoration-slate-300">
                (View All Gateway Latencies & SLA)
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Compliance: P0 Verified</span>
              <span className="h-3 w-px bg-slate-200"></span>
              <span className="flex items-center gap-1 text-indigo-600 hover:underline cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent("open-telemetry-hub"))}>
                <Lock size={11} />
                AES-256 HSM Cryptography
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={paletteOpen} 
        onClose={() => setPaletteOpen(false)} 
        onSelectTab={handleNavigateToTab} 
        activeTab={activeTab} 
      />
    </div>
  );
}
