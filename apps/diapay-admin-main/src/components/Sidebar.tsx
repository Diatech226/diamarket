import React from 'react';
import {
  Layers,
  Users,
  CreditCard,
  Wallet,
  BarChart3,
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  Cpu,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingKycCount: number;
  criticalFloatsCount: number;
  degradedRailsCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  pendingKycCount,
  criticalFloatsCount,
  degradedRailsCount
}: SidebarProps) {
  const navItems = [
    {
      id: 'infrastructure',
      label: 'Infrastructure',
      icon: Layers,
      badge: degradedRailsCount > 0 ? { count: degradedRailsCount, type: 'error' } : undefined,
      description: 'Payment rails & gateway routing'
    },
    {
      id: 'merchants',
      label: 'Merchants',
      icon: Users,
      badge: pendingKycCount > 0 ? { count: pendingKycCount, type: 'warning' } : undefined,
      description: 'KYC & merchant tiering'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      badge: undefined,
      description: 'Live Ledger & mock logs'
    },
    {
      id: 'settlements',
      label: 'Settlements & Float',
      icon: Wallet,
      badge: criticalFloatsCount > 0 ? { count: criticalFloatsCount, type: 'critical' } : undefined,
      description: 'Treasury & telecom wallets'
    },
    {
      id: 'providers',
      label: 'Providers & Keys',
      icon: Cpu,
      badge: undefined,
      description: 'Carrier gateways & API secrets'
    },
    {
      id: 'users',
      label: 'Admins & Teams',
      icon: UserCheck,
      badge: undefined,
      description: 'Role access & MFA audits'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: undefined,
      description: 'Volume & performance trends'
    },
    {
      id: 'logs',
      label: 'System Logs',
      icon: Terminal,
      badge: undefined,
      description: 'Audit trails & API webhooks'
    }
  ];

  return (
    <aside className="w-80 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 rounded-lg text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Zap className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              BantuPay <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-amber-500 border border-slate-700">ADMIN</span>
            </h1>
            <p className="text-xs text-slate-400">Pan-African Payment Rails</p>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-3">
          Core Operations
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-medium shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badge.type === 'error'
                          ? 'bg-rose-500 text-white'
                          : item.badge.type === 'critical'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {item.badge.count}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-slate-900 font-normal' : 'text-slate-500'}`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Node Status</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All Core Engines Live
          </span>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
          <span className="text-slate-500">Security</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            TLS 1.3 Secure
          </span>
        </div>
        <div className="text-[10px] text-slate-600 text-center mt-1">
          BantuPay Network Admin v2.4.0
        </div>
      </div>
    </aside>
  );
}
