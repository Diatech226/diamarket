import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import InfrastructureScreen from './components/InfrastructureScreen';
import MerchantsScreen from './components/MerchantsScreen';
import TransactionsScreen from './components/TransactionsScreen';
import SettlementsScreen from './components/SettlementsScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import LogsScreen from './components/LogsScreen';
import ProvidersScreen from './components/ProvidersScreen';
import UserManagementScreen from './components/UserManagementScreen';

import {
  PaymentRail,
  Merchant,
  Transaction,
  TreasuryFloat,
  ExchangeRate,
  SystemLog,
  SettlementBatch,
  AdminUser
} from './types';

import {
  initialRails,
  initialMerchants,
  initialTransactions,
  initialFloats,
  initialLogs,
  initialBatches,
  exchangeRates,
  generateRandomTx
} from './data/mockData';

import {
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  ZapOff
} from 'lucide-react';

const initialUsers: AdminUser[] = [
  {
    id: 'usr-1',
    name: 'Kofi Mensah',
    email: 'k.mensah@bantupay.com',
    role: 'super_admin',
    status: 'active',
    lastActive: 'Active Now',
    mfaEnabled: true,
    teams: ['SecOps', 'Compliance Audit']
  },
  {
    id: 'usr-2',
    name: 'Chioma Nwachukwu',
    email: 'c.nwachukwu@bantupay.com',
    role: 'treasury_manager',
    status: 'active',
    lastActive: 'Active Now',
    mfaEnabled: true,
    teams: ['Treasury Pool', 'Lagos Node']
  },
  {
    id: 'usr-3',
    name: 'Wanjiku Kamau',
    email: 'w.kamau@bantupay.com',
    role: 'compliance_officer',
    status: 'active',
    lastActive: '10 mins ago',
    mfaEnabled: true,
    teams: ['Compliance Audit', 'Nairobi Node']
  },
  {
    id: 'usr-4',
    name: 'Abisoye Balogun',
    email: 'a.balogun@bantupay.com',
    role: 'developer',
    status: 'active',
    lastActive: 'Active Now',
    mfaEnabled: false,
    teams: ['Core Dev', 'SecOps']
  },
  {
    id: 'usr-5',
    name: 'Zola Gwala',
    email: 'z.gwala@bantupay.com',
    role: 'support_specialist',
    status: 'pending_activation',
    lastActive: 'Never',
    mfaEnabled: true,
    teams: ['Support Tier 2']
  },
  {
    id: 'usr-6',
    name: 'Moussa Diop',
    email: 'm.diop@bantupay.com',
    role: 'support_specialist',
    status: 'suspended',
    lastActive: '3 days ago',
    mfaEnabled: true,
    teams: ['Support Tier 2']
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('infrastructure');
  const [rails, setRails] = useState<PaymentRail[]>(initialRails);
  const [merchants, setMerchants] = useState<Merchant[]>(initialMerchants);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [floats, setFloats] = useState<TreasuryFloat[]>(initialFloats);
  const [batches, setBatches] = useState<SettlementBatch[]>(initialBatches);
  const [logs, setLogs] = useState<SystemLog[]>(initialLogs);
  const [rates, setRates] = useState<Record<string, ExchangeRate>>(exchangeRates);
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(false);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);

  const addUser = (newUser: AdminUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, updatedFields: Partial<AdminUser>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updatedFields } : u))
    );
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Stats for badge alerts
  const pendingKycCount = merchants.filter(m => m.kycStatus === 'pending_verification').length;
  const criticalFloatsCount = floats.filter(f => f.status === 'critical').length;
  const degradedRailsCount = rails.filter(r => r.status === 'degraded' || r.status === 'major_outage').length;

  // Manual & automated logging function
  const addSystemLog = (
    category: SystemLog['category'],
    type: SystemLog['type'],
    message: string
  ) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      category,
      message
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Clear system logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Rail field updates
  const updateRail = (railId: string, updatedFields: Partial<PaymentRail>) => {
    setRails(prev =>
      prev.map(r => (r.id === railId ? { ...r, ...updatedFields } : r))
    );
  };

  // Merchant field updates
  const updateMerchant = (merchantId: string, updatedFields: Partial<Merchant>) => {
    setMerchants(prev =>
      prev.map(m => (m.id === merchantId ? { ...m, ...updatedFields } : m))
    );
  };

  // Transaction updates
  const updateTransaction = (txId: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, ...updatedFields } : t))
    );
  };

  // Float replenishment sweep
  const replenishFloat = (floatId: string, amountUSD: number) => {
    setFloats(prev =>
      prev.map(f => {
        if (f.id === floatId) {
          const rate = rates[f.currency]?.rateToUSD || 1.0;
          const additionalBalance = amountUSD * rate;
          const newBalance = f.balance + additionalBalance;
          const newBalanceUSD = f.balanceUSD + amountUSD;

          let status: TreasuryFloat['status'] = 'healthy';
          if (newBalance < f.minThreshold) {
            status = newBalance < f.minThreshold * 0.4 ? 'critical' : 'low_balance';
          }

          // Add a system log immediately
          addSystemLog(
            'settlement',
            'success',
            `REPLENISHMENT COMPLETE: Successfully wired $${amountUSD.toLocaleString()} USD (${f.currency} ${additionalBalance.toLocaleString()} local equivalent) to ${f.railName} pool.`
          );

          return {
            ...f,
            balance: newBalance,
            balanceUSD: newBalanceUSD,
            status
          };
        }
        return f;
      })
    );
  };

  // Execute manual settlement payout
  const executeSettlement = (batchId: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            status: 'completed',
            completedAt: new Date().toISOString(),
            bankRef: `NIP-SWEEP-${Math.floor(Math.random() * 900000) + 100000}`
          };
        }
        return b;
      })
    );
  };

  // Update Exchange rates
  const updateExchangeRate = (currency: string, newRate: number) => {
    setRates(prev => ({
      ...prev,
      [currency]: {
        ...prev[currency],
        rateToUSD: newRate
      }
    }));
  };

  // Inject a transaction with self-healing and auto-routing checks
  const simulateRandomTransaction = () => {
    // 1. Pick a random approved merchant
    const approvedMerchants = merchants.filter(m => m.kycStatus === 'approved');
    if (approvedMerchants.length === 0) return;
    const merchant = approvedMerchants[Math.floor(Math.random() * approvedMerchants.length)];

    // 2. Pick a rail in the merchant's country
    const countryRails = rails.filter(r => r.country === merchant.country);
    if (countryRails.length === 0) return;
    let selectedRail = countryRails[Math.floor(Math.random() * countryRails.length)];

    const customerNames = ['Adebayo Balogun', 'Nairobi Safaris', 'Kwame Nkrumah', 'Pretoria Miner', 'Zola Gwala', 'Fatuma Ali'];
    const selectedCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];
    const randomAmount = selectedRail.currency === 'NGN' ? Math.floor(Math.random() * 55000) + 1500
                        : selectedRail.currency === 'KES' ? Math.floor(Math.random() * 6500) + 200
                        : selectedRail.currency === 'GHS' ? Math.floor(Math.random() * 500) + 30
                        : selectedRail.currency === 'ZAR' ? Math.floor(Math.random() * 350) + 50
                        : Math.floor(Math.random() * 85000) + 3000; // UGX

    const conversionRate = rates[selectedRail.currency]?.rateToUSD || 1.0;
    const calculatedUSD = parseFloat((randomAmount / conversionRate).toFixed(2));

    // Initiate variables
    let finalRail = selectedRail;
    let status: Transaction['status'] = 'success';
    let failureReason: string | null = null;
    let autoRouted = false;

    // 3. Routing Analysis (outage checks)
    if (selectedRail.status === 'major_outage' || selectedRail.status === 'maintenance') {
      if (selectedRail.autoRouteEnabled && selectedRail.fallbackRailId) {
        // Self-heal: Route to fallback rail!
        const fallback = rails.find(r => r.id === selectedRail.fallbackRailId);
        if (fallback) {
          finalRail = fallback;
          autoRouted = true;
          // Roll success factor based on fallback success rate
          const successRoll = Math.random() * 100 <= fallback.successRate;
          status = successRoll ? 'success' : 'failed';
          if (!successRoll) {
            failureReason = 'SLA performance drop on secondary fallback node';
          }
        } else {
          status = 'failed';
          failureReason = `Primary rail down. No fallback route configured for ${selectedRail.name}.`;
        }
      } else {
        status = 'failed';
        failureReason = `Transaction failed: Gateway ${selectedRail.name} is currently offline. Self-healing routing was disabled.`;
      }
    } else {
      // Rail is functional or degraded
      const successRoll = Math.random() * 100 <= selectedRail.successRate;
      status = successRoll ? 'success' : 'failed';
      if (!successRoll) {
        const errorPool = [
          'Insufficient client account balance',
          'Carrier network handshake timeout',
          'Customer canceled transaction entry',
          'OTP input code verification failed'
        ];
        failureReason = errorPool[Math.floor(Math.random() * errorPool.length)];
      }
    }

    const newTx: Transaction = {
      id: `tx-${Math.floor(Math.random() * 900000) + 100000}`,
      merchantId: merchant.id,
      merchantName: merchant.businessName,
      amount: randomAmount,
      currency: finalRail.currency,
      amountUSD: calculatedUSD,
      paymentMethod: finalRail.type,
      railId: finalRail.id,
      status,
      timestamp: new Date().toISOString(),
      customerName: selectedCustomer,
      customerPhoneOrAccount: finalRail.type === 'bank_transfer' || finalRail.type === 'card' ? 'Bank Acct ••••8294' : '+254 792 ••• 904',
      failureReason
    };

    // Update transactions list
    setTransactions(prev => [newTx, ...prev]);

    // Update Merchant volumes dynamically on success
    if (status === 'success') {
      setMerchants(prev =>
        prev.map(m =>
          m.id === merchant.id
            ? { ...m, volume30d: m.volume30d + calculatedUSD }
            : m
        )
      );

      // Deduct from local float pool on successful payment
      setFloats(prev =>
        prev.map(f => {
          if (f.railId === finalRail.id) {
            const updatedBalance = f.balance - randomAmount;
            const updatedBalanceUSD = f.balanceUSD - calculatedUSD;
            let floatStatus: TreasuryFloat['status'] = 'healthy';
            if (updatedBalance < f.minThreshold) {
              floatStatus = updatedBalance < f.minThreshold * 0.4 ? 'critical' : 'low_balance';
            }
            return {
              ...f,
              balance: Math.max(0, updatedBalance),
              balanceUSD: Math.max(0, updatedBalanceUSD),
              status: floatStatus
            };
          }
          return f;
        })
      );
    }

    // Add corresponding logs
    if (autoRouted) {
      addSystemLog(
        'routing',
        'success',
        `SELF-HEALING SUCCESS: Diverted ${calculatedUSD} USD from down gateway [${selectedRail.name}] to fallback channel [${finalRail.name}] for ${merchant.businessName}.`
      );
    } else if (status === 'success') {
      addSystemLog(
        'rail',
        'success',
        `PROCESSED: Approved charge of ${finalRail.currency} ${randomAmount.toLocaleString()} via [${finalRail.name}] for Jumia/Copia customer.`
      );
    } else {
      addSystemLog(
        'rail',
        'error',
        `TRANSACTION DECLINED: [${finalRail.name}] returned code 411. Reason: ${failureReason}.`
      );
    }
  };

  // Autoplay Loop useEffect hook
  useEffect(() => {
    let intervalId: any;
    if (autoplayEnabled) {
      intervalId = setInterval(() => {
        simulateRandomTransaction();

        // Fluctuate rails success and latencies slightly to represent true telemetry
        setRails(prev =>
          prev.map(r => {
            if (r.status === 'operational') {
              const sr = parseFloat(Math.min(99.9, Math.max(92.0, r.successRate + (Math.random() * 2 - 1))).toFixed(1));
              const lat = Math.max(50, Math.min(300, r.latencyMs + Math.floor(Math.random() * 20 - 10)));
              return { ...r, successRate: sr, latencyMs: lat };
            }
            return r;
          })
        );
      }, 4000);
    }
    return () => clearInterval(intervalId);
  }, [autoplayEnabled, rails, merchants]);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'infrastructure':
        return (
          <InfrastructureScreen
            rails={rails}
            onUpdateRail={updateRail}
            onAddSystemLog={addSystemLog}
          />
        );
      case 'merchants':
        return (
          <MerchantsScreen
            merchants={merchants}
            onUpdateMerchant={updateMerchant}
            onAddSystemLog={addSystemLog}
          />
        );
      case 'transactions':
        return (
          <TransactionsScreen
            transactions={transactions}
            rails={rails}
            onAddTransaction={(tx) => setTransactions(prev => [tx, ...prev])}
            onUpdateTransaction={updateTransaction}
            onAddSystemLog={addSystemLog}
            onSimulateRandomTransaction={simulateRandomTransaction}
            autoplayEnabled={autoplayEnabled}
            setAutoplayEnabled={setAutoplayEnabled}
          />
        );
      case 'settlements':
        return (
          <SettlementsScreen
            floats={floats}
            batches={batches}
            exchangeRates={rates}
            onReplenishFloat={replenishFloat}
            onExecuteSettlement={executeSettlement}
            onUpdateExchangeRate={updateExchangeRate}
            onAddSystemLog={addSystemLog}
          />
        );
      case 'providers':
        return (
          <ProvidersScreen
            rails={rails}
            merchants={merchants}
            onAddSystemLog={addSystemLog}
          />
        );
      case 'analytics':
        return <AnalyticsScreen transactions={transactions} rails={rails} />;
      case 'users':
        return (
          <UserManagementScreen
            users={users}
            onAddUser={addUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            onAddSystemLog={addSystemLog}
          />
        );
      case 'logs':
        return (
          <LogsScreen
            logs={logs}
            onClearLogs={clearLogs}
            onAddSystemLog={addSystemLog}
          />
        );
      default:
        return (
          <InfrastructureScreen
            rails={rails}
            onUpdateRail={updateRail}
            onAddSystemLog={addSystemLog}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans text-slate-800 overflow-hidden" id="main-container">
      {/* Side navigation bar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingKycCount={pendingKycCount}
        criticalFloatsCount={criticalFloatsCount}
        degradedRailsCount={degradedRailsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-y-auto h-screen">
        {/* Banner Alarm system if a major outage exists */}
        {rails.some(r => r.status === 'major_outage') && (
          <div className="bg-rose-600 text-white px-6 py-2 flex items-center justify-between gap-4 font-sans shrink-0 animate-pulse text-xs font-semibold">
            <div className="flex items-center gap-2.5">
              <ZapOff className="h-4 w-4 shrink-0" />
              <span>
                CRITICAL OUTAGE DETECTED:{' '}
                {rails
                  .filter(r => r.status === 'major_outage')
                  .map(r => r.name)
                  .join(', ')}{' '}
                telemetry dropped below SLA thresholds. Self-healing router has initiated automated regional path rerouting.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('infrastructure')}
              className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase transition"
            >
              Analyze Gateways
            </button>
          </div>
        )}

        {/* Global floating notification header */}
        <header className="px-8 py-5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              BantuPay Gateway Node: Europe-West Gateway
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>Avg SLA: <strong className="text-slate-800 font-bold">99.82%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
            <div className="text-[11px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
              System Time: 12:06 UTC
            </div>
          </div>
        </header>

        {/* Dynamic Screen Stage */}
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto pb-16">
          {renderActiveScreen()}
        </div>
      </main>
    </div>
  );
}
