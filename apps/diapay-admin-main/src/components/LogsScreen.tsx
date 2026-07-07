import React, { useState } from 'react';
import { SystemLog } from '../types';
import {
  Terminal,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Trash2,
  Code,
  Zap,
  Globe,
  Bell
} from 'lucide-react';

interface LogsScreenProps {
  logs: SystemLog[];
  onClearLogs: () => void;
  onAddSystemLog: (category: 'rail' | 'merchant' | 'settlement' | 'routing', type: 'info' | 'warning' | 'error' | 'success', message: string) => void;
}

interface WebhookAlert {
  id: string;
  timestamp: string;
  merchant: string;
  event: string;
  status: 'sent' | 'failed' | 'retrying';
  payload: string;
}

export default function LogsScreen({
  logs,
  onClearLogs,
  onAddSystemLog
}: LogsScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Outgoing webhooks logs simulation state
  const [webhookLogs, setWebhookLogs] = useState<WebhookAlert[]>([
    {
      id: 'wh-839281',
      timestamp: '2026-07-06T12:05:00-07:00',
      merchant: 'Jumia Technologies Group',
      event: 'payment.success',
      status: 'sent',
      payload: '{"id": "tx-829381", "event": "payment.success", "amount": 45000, "currency": "NGN"}'
    },
    {
      id: 'wh-839282',
      timestamp: '2026-07-06T11:54:15-07:00',
      merchant: 'Copia Global Logistics',
      event: 'payment.success',
      status: 'sent',
      payload: '{"id": "tx-829382", "event": "payment.success", "amount": 3500, "currency": "KES"}'
    },
    {
      id: 'wh-839283',
      timestamp: '2026-07-06T11:50:05-07:00',
      merchant: 'SafeBoda Ride Hailing',
      event: 'payment.failed',
      status: 'failed',
      payload: '{"id": "tx-829383", "event": "payment.failed", "amount": 12000, "currency": "UGX", "error": "Gateway timeout"}'
    }
  ]);

  const triggerTestWebhook = () => {
    const newWh: WebhookAlert = {
      id: `wh-${Math.floor(Math.random() * 90000) + 10000}`,
      timestamp: new Date().toISOString(),
      merchant: 'Copia Global Logistics',
      event: 'payment.success',
      status: 'sent',
      payload: `{"id": "tx-${Math.floor(Math.random() * 900000) + 100000}", "event": "payment.success", "amount": 5400, "currency": "KES"}`
    };

    setWebhookLogs([newWh, ...webhookLogs]);
    onAddSystemLog('routing', 'success', 'TEST WEBHOOK SENT: payment.success webhook fired successfully to Copia endpoint (HTTPS 200 OK).');
  };

  const getLogTypeIcon = (type: SystemLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-rose-500 shrink-0 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };

  const getCategoryBadge = (category: SystemLog['category']) => {
    switch (category) {
      case 'rail':
        return <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.5 rounded font-bold uppercase">Rail</span>;
      case 'merchant':
        return <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-150 px-1.5 py-0.5 rounded font-bold uppercase">Merchant</span>;
      case 'settlement':
        return <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-150 px-1.5 py-0.5 rounded font-bold uppercase">Settlement</span>;
      case 'routing':
        return <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-150 px-1.5 py-0.5 rounded font-bold uppercase">Routing</span>;
    }
  };

  // Filter System logs
  const filteredLogs = logs.filter(log => {
    const matchesCategory = selectedCategory === 'All' || log.category === selectedCategory;
    const matchesType = selectedType === 'All' || log.type === selectedType;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in" id="logs-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="h-6 w-6 text-amber-600" />
            System Audit & API Webhook Console
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Browse structural system routing logs, API gateway failures, and verify merchant webhook deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={triggerTestWebhook}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 bg-white"
          >
            <Bell className="h-4 w-4" /> Trigger Test Webhook
          </button>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 border border-rose-200"
          >
            <Trash2 className="h-4 w-4" /> Wipe Audit Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core System logs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[550px]">
          {/* Controls */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Telemetry Audit Logs</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="rail">Rail</option>
                  <option value="merchant">Merchant</option>
                  <option value="settlement">Settlement</option>
                  <option value="routing">Routing</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="p-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none animate-fade-in"
                >
                  <option value="All">All Severity</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter logs by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 font-mono text-xs p-2 space-y-1 bg-slate-950 text-slate-300">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 italic">
                No logs recorded matching current parameters.
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="p-2.5 rounded hover:bg-slate-900 flex items-start gap-3 transition">
                  <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <div className="mt-0.5 shrink-0">{getLogTypeIcon(log.type)}</div>
                  <div className="shrink-0">{getCategoryBadge(log.category)}</div>
                  <p className="text-slate-200 flex-1 break-words">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Webhooks Deliveries Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-[550px]">
          <div className="space-y-4 overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Code className="h-4 w-4 text-purple-500" />
                Outgoing API Webhooks
              </h3>
              <span className="text-[10px] text-slate-400 font-mono uppercase">HTTPS Dispatcher</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {webhookLogs.map(wh => (
                <div key={wh.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{wh.merchant}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      wh.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {wh.status === 'sent' ? '200 OK' : '502 Bad Gateway'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-purple-600 font-bold">{wh.event}</span>
                    <span>{new Date(wh.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <pre className="p-2 bg-slate-950 text-slate-300 rounded-lg text-[10px] font-mono overflow-x-auto">
                    {wh.payload}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center mt-3 border-t border-slate-100 pt-3">
            * Automatic retry queue (3 retry attempts) enabled for failed merchant endpoints.
          </div>
        </div>
      </div>
    </div>
  );
}
