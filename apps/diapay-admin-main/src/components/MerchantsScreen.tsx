import React, { useState } from 'react';
import { Merchant, KYCStatus, MerchantTier } from '../types';
import {
  Users,
  Search,
  Filter,
  Check,
  X,
  FileText,
  AlertTriangle,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Percent,
  Banknote,
  Lock,
  UserCheck
} from 'lucide-react';

interface MerchantsScreenProps {
  merchants: Merchant[];
  onUpdateMerchant: (merchantId: string, updatedFields: Partial<Merchant>) => void;
  onAddSystemLog: (category: 'rail' | 'merchant' | 'settlement' | 'routing', type: 'info' | 'warning' | 'error' | 'success', message: string) => void;
}

export default function MerchantsScreen({
  merchants,
  onUpdateMerchant,
  onAddSystemLog
}: MerchantsScreenProps) {
  const [selectedKyc, setSelectedKyc] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingMerchantId, setEditingMerchantId] = useState<string | null>(null);

  // Fee adjusters temp state
  const [tempMoMoFee, setTempMoMoFee] = useState<number>(0);
  const [tempCardFee, setTempCardFee] = useState<number>(0);

  // Stats
  const totalMerchants = merchants.length;
  const approvedCount = merchants.filter(m => m.kycStatus === 'approved').length;
  const pendingVerificationCount = merchants.filter(m => m.kycStatus === 'pending_verification').length;
  const riskAlertsCount = merchants.filter(m => m.riskScore > 40).length;

  const totalVolume30d = merchants.reduce((acc, curr) => acc + curr.volume30d, 0);

  const handleKycStatusUpdate = (merchantId: string, status: KYCStatus) => {
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return;

    onUpdateMerchant(merchantId, { kycStatus: status });

    let logType: 'info' | 'warning' | 'error' | 'success' = 'info';
    let message = '';

    if (status === 'approved') {
      logType = 'success';
      message = `Merchant [${merchant.businessName}] has been APPROVED. Live API token activated and settlement queue enabled.`;
    } else if (status === 'rejected') {
      logType = 'error';
      message = `Merchant [${merchant.businessName}] KYC has been REJECTED due to failed compliance verification.`;
    } else if (status === 'documents_required') {
      logType = 'warning';
      message = `Requested additional compliance documentation (ID/Certificate of Incorporation) from [${merchant.businessName}].`;
    }

    onAddSystemLog('merchant', logType, message);
  };

  const handleUpdateFees = (merchantId: string) => {
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return;

    onUpdateMerchant(merchantId, {
      pricing: {
        ...merchant.pricing,
        mobileMoneyFee: tempMoMoFee,
        cardFee: tempCardFee
      }
    });

    setEditingMerchantId(null);
    onAddSystemLog(
      'merchant',
      'info',
      `Custom merchant fees configured for [${merchant.businessName}]: Mobile Money: ${tempMoMoFee}%, Cards: ${tempCardFee}%.`
    );
  };

  const startEditingFees = (merchant: Merchant) => {
    setEditingMerchantId(merchant.id);
    setTempMoMoFee(merchant.pricing.mobileMoneyFee);
    setTempCardFee(merchant.pricing.cardFee);
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesKyc = selectedKyc === 'All' || merchant.kycStatus === selectedKyc;
    const matchesTier = selectedTier === 'All' || merchant.tier === selectedTier;
    const matchesSearch = merchant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          merchant.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          merchant.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesKyc && matchesTier && matchesSearch;
  });

  const getKycBadge = (status: KYCStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <UserCheck className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <FileText className="h-3.5 w-3.5" />
            Pending KYC
          </span>
        );
      case 'documents_required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            Docs Needed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
    }
  };

  const getTierBadge = (tier: MerchantTier) => {
    switch (tier) {
      case 'enterprise':
        return <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-bold uppercase">Enterprise</span>;
      case 'growth':
        return <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-bold uppercase">Growth</span>;
      case 'standard':
        return <span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-bold uppercase">Standard</span>;
    }
  };

  return (
    <div className="space-y-8" id="merchants-screen">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-amber-600" />
          Merchant Onboarding & Compliance Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review KYC approvals, configure custom commission parameters, and monitor credit risk indices.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Merchants</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{totalMerchants} Registered</h3>
          <p className="text-xs text-slate-500 mt-1.5">{approvedCount} fully activated merchants</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">KYC Review Queue</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {pendingVerificationCount} Awaiting
          </h3>
          <p className="text-xs text-slate-500 mt-1.5">
            {pendingVerificationCount > 0 ? '⚠️ Immediate action recommended' : '✅ Queue fully cleared'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aggregate 30D Volume</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            ${totalVolume30d.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>+14.8% growth this month</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Risk Flag</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {riskAlertsCount} High Risk
          </h3>
          <p className="text-xs text-slate-500 mt-1.5">Risk index evaluated on chargebacks</p>
        </div>
      </div>

      {/* KYC Warning Banner */}
      {pendingVerificationCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-950">KYC Approvals Required</p>
              <p className="text-xs text-amber-800 mt-0.5">
                There are {pendingVerificationCount} new merchants that have uploaded business records and are awaiting API enablement.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedKyc('pending_verification');
            }}
            className="text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 px-3 py-1.5 rounded-lg border border-amber-500 shadow-sm transition active:scale-95"
          >
            Review Pending Queue
          </button>
        </div>
      )}

      {/* Filters & search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchants, email or id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase">
            <Filter className="h-3.5 w-3.5" />
            <span>KYC Status</span>
          </div>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {['All', 'approved', 'pending_verification', 'documents_required', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedKyc(status)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  selectedKyc === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status === 'All' ? 'All KYC' : status === 'pending_verification' ? 'Pending' : status === 'documents_required' ? 'Docs Needed' : status}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {['All', 'enterprise', 'growth', 'standard'].map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize ${
                  selectedTier === tier
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tier === 'All' ? 'All Tiers' : tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Merchants List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="p-4 pl-6">Merchant ID & Name</th>
                <th className="p-4">Contact & Onboarded</th>
                <th className="p-4">Region</th>
                <th className="p-4">Tier</th>
                <th className="p-4">30D Volume</th>
                <th className="p-4">Risk Index</th>
                <th className="p-4">KYC State</th>
                <th className="p-4 pr-6 text-right">Merchant Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No merchants found matching your query.
                  </td>
                </tr>
              ) : (
                filteredMerchants.map(merchant => (
                  <React.Fragment key={merchant.id}>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-900">{merchant.businessName}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{merchant.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700">{merchant.contactEmail}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Joined: {merchant.joinedDate}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {merchant.country}
                      </td>
                      <td className="p-4">
                        {getTierBadge(merchant.tier)}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        ${merchant.volume30d.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${
                            merchant.riskScore > 50
                              ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded'
                              : merchant.riskScore > 20
                              ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded'
                              : 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'
                          }`}>
                            {merchant.riskScore}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getKycBadge(merchant.kycStatus)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => {
                            if (editingMerchantId === merchant.id) {
                              setEditingMerchantId(null);
                            } else {
                              startEditingFees(merchant);
                            }
                          }}
                          className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 transition active:scale-95"
                        >
                          {editingMerchantId === merchant.id ? 'Close Settings' : 'Configure Account'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Account Configuration Form */}
                    {editingMerchantId === merchant.id && (
                      <tr>
                        <td colSpan={8} className="p-6 bg-slate-50 border-t border-b border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Compliance review panel */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1">
                                  <Lock className="h-3.5 w-3.5" />
                                  Compliance & KYC Controls
                                </h4>
                                <p className="text-xs text-slate-500 mb-4">
                                  Manually override KYC state based on banking background checks or risk assessment.
                                </p>

                                <div className="space-y-2">
                                  <button
                                    onClick={() => handleKycStatusUpdate(merchant.id, 'approved')}
                                    disabled={merchant.kycStatus === 'approved'}
                                    className="w-full flex items-center gap-2 justify-center py-2 px-4 rounded-xl text-xs font-bold border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 disabled:opacity-50 transition"
                                  >
                                    <Check className="h-4 w-4" /> Approve Merchant Gateway Access
                                  </button>

                                  <button
                                    onClick={() => handleKycStatusUpdate(merchant.id, 'documents_required')}
                                    disabled={merchant.kycStatus === 'documents_required'}
                                    className="w-full flex items-center gap-2 justify-center py-2 px-4 rounded-xl text-xs font-bold border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50 disabled:opacity-50 transition"
                                  >
                                    <FileText className="h-4 w-4" /> Flag: Documents Required
                                  </button>

                                  <button
                                    onClick={() => handleKycStatusUpdate(merchant.id, 'rejected')}
                                    disabled={merchant.kycStatus === 'rejected'}
                                    className="w-full flex items-center gap-2 justify-center py-2 px-4 rounded-xl text-xs font-bold border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-50 disabled:opacity-50 transition"
                                  >
                                    <X className="h-4 w-4" /> Decline / Fraud Blacklist
                                  </button>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                                Current Account Risk Score: <span className="font-bold text-slate-700">{merchant.riskScore}%</span>
                              </div>
                            </div>

                            {/* Pricing & Fees settings panel */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-1">
                                  <Percent className="h-3.5 w-3.5" />
                                  Gateway Transaction Pricing
                                </h4>

                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                                      <label>Mobile Money Fee</label>
                                      <span className="text-amber-600 font-bold">{tempMoMoFee}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0.5"
                                      max="4.0"
                                      step="0.1"
                                      value={tempMoMoFee}
                                      onChange={(e) => setTempMoMoFee(parseFloat(e.target.value))}
                                      className="w-full accent-amber-500 cursor-pointer"
                                    />
                                    <span className="text-[10px] text-slate-400 block mt-0.5">Average regional fee is 1.5%</span>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                                      <label>Card Gateway Fee</label>
                                      <span className="text-amber-600 font-bold">{tempCardFee}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="1.5"
                                      max="5.0"
                                      step="0.1"
                                      value={tempCardFee}
                                      onChange={(e) => setTempCardFee(parseFloat(e.target.value))}
                                      className="w-full accent-amber-500 cursor-pointer"
                                    />
                                    <span className="text-[10px] text-slate-400 block mt-0.5">Average local card fee is 2.9%</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleUpdateFees(merchant.id)}
                                className="w-full mt-4 py-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm active:scale-95"
                              >
                                Save Pricing Parameters
                              </button>
                            </div>

                            {/* Settlement Account Details */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1">
                                  <Banknote className="h-3.5 w-3.5" />
                                  Settlement Destination
                                </h4>
                                <p className="text-xs text-slate-500 mb-4">
                                  Primary bank or treasury wallet where batch settlements are swept daily.
                                </p>

                                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                  <div>
                                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Bank Name</span>
                                    <span className="text-xs font-bold text-slate-700 block mt-0.5">{merchant.settlementAccount.bankName}</span>
                                  </div>
                                  <div className="border-t border-slate-200/60 pt-2">
                                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Account Number</span>
                                    <span className="text-xs font-mono font-bold text-slate-700 block mt-0.5">{merchant.settlementAccount.accountNumber}</span>
                                  </div>
                                  <div className="border-t border-slate-200/60 pt-2">
                                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Account Beneficiary</span>
                                    <span className="text-xs font-bold text-slate-700 block mt-0.5">{merchant.settlementAccount.accountName}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-[10px] text-slate-400 mt-4 text-center">
                                Automated banking verification sweep completed successfully.
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
