/**
 * Stripe Africa Admin - Mock Data Setup
 */

import {
  PaymentRail,
  Merchant,
  Transaction,
  TreasuryFloat,
  ExchangeRate,
  SystemLog,
  SettlementBatch
} from '../types';

export const exchangeRates: Record<string, ExchangeRate> = {
  NGN: { currency: 'NGN', rateToUSD: 1520.0, symbol: '₦' },
  KES: { currency: 'KES', rateToUSD: 129.5, symbol: 'KSh' },
  GHS: { currency: 'GHS', rateToUSD: 14.8, symbol: 'GH₵' },
  ZAR: { currency: 'ZAR', rateToUSD: 18.7, symbol: 'R' },
  UGX: { currency: 'UGX', rateToUSD: 3720.0, symbol: 'USh' },
  USD: { currency: 'USD', rateToUSD: 1.0, symbol: '$' }
};

export const initialRails: PaymentRail[] = [
  {
    id: 'ke-mpesa',
    name: 'Safaricom M-Pesa C2B/B2C',
    type: 'mobile_money',
    country: 'Kenya',
    currency: 'KES',
    provider: 'Safaricom',
    status: 'operational',
    latencyMs: 142,
    successRate: 99.4,
    volume24h: 38450000,
    volume24hUSD: 296911,
    autoRouteEnabled: true,
    isFallbackActive: false,
    fallbackRailId: 'ke-airtel'
  },
  {
    id: 'ng-nip',
    name: 'NIP Instant Bank Transfer',
    type: 'bank_transfer',
    country: 'Nigeria',
    currency: 'NGN',
    provider: 'NIBSS (Nigeria Inter-Bank Settlement System)',
    status: 'operational',
    latencyMs: 310,
    successRate: 94.8,
    volume24h: 582400000,
    volume24hUSD: 383157,
    autoRouteEnabled: true,
    isFallbackActive: false,
    fallbackRailId: 'ng-ussd'
  },
  {
    id: 'gh-mtn',
    name: 'MTN Mobile Money API',
    type: 'mobile_money',
    country: 'Ghana',
    currency: 'GHS',
    provider: 'MTN Ghana',
    status: 'operational',
    latencyMs: 185,
    successRate: 98.1,
    volume24h: 1250000,
    volume24hUSD: 84459,
    autoRouteEnabled: true,
    isFallbackActive: false,
    fallbackRailId: 'gh-telecel'
  },
  {
    id: 'za-eft',
    name: 'Ozow Instant EFT',
    type: 'bank_transfer',
    country: 'South Africa',
    currency: 'ZAR',
    provider: 'Ozow Secure Pay',
    status: 'operational',
    latencyMs: 220,
    successRate: 97.2,
    volume24h: 4620000,
    volume24hUSD: 247058,
    autoRouteEnabled: true,
    isFallbackActive: false
  },
  {
    id: 'ng-verve',
    name: 'Interswitch Verve Local Card Routing',
    type: 'card',
    country: 'Nigeria',
    currency: 'NGN',
    provider: 'Interswitch',
    status: 'degraded',
    latencyMs: 820,
    successRate: 81.5,
    volume24h: 184500000,
    volume24hUSD: 121381,
    autoRouteEnabled: true,
    isFallbackActive: true,
    fallbackRailId: 'ng-card-intl'
  },
  {
    id: 'ng-card-intl',
    name: 'Visa/Mastercard Gateway Africa',
    type: 'card',
    country: 'Nigeria',
    currency: 'NGN',
    provider: 'Flutterwave Switch',
    status: 'operational',
    latencyMs: 245,
    successRate: 98.5,
    volume24h: 220000000,
    volume24hUSD: 144736,
    autoRouteEnabled: false,
    isFallbackActive: false
  },
  {
    id: 'ke-airtel',
    name: 'Airtel Money KE API',
    type: 'mobile_money',
    country: 'Kenya',
    currency: 'KES',
    provider: 'Airtel Kenya',
    status: 'operational',
    latencyMs: 195,
    successRate: 96.5,
    volume24h: 4200000,
    volume24hUSD: 32432,
    autoRouteEnabled: true,
    isFallbackActive: false
  },
  {
    id: 'gh-telecel',
    name: 'Telecel Cash Gateway',
    type: 'mobile_money',
    country: 'Ghana',
    currency: 'GHS',
    provider: 'Telecel Ghana',
    status: 'operational',
    latencyMs: 210,
    successRate: 95.8,
    volume24h: 310000,
    volume24hUSD: 20945,
    autoRouteEnabled: true,
    isFallbackActive: false
  },
  {
    id: 'ug-mtn',
    name: 'MTN Mobile Money Uganda',
    type: 'mobile_money',
    country: 'Uganda',
    currency: 'UGX',
    provider: 'MTN Uganda',
    status: 'major_outage',
    latencyMs: 2500,
    successRate: 12.4,
    volume24h: 8400000,
    volume24hUSD: 2258,
    autoRouteEnabled: true,
    isFallbackActive: true,
    fallbackRailId: 'ug-airtel'
  },
  {
    id: 'ug-airtel',
    name: 'Airtel Money Uganda API',
    type: 'mobile_money',
    country: 'Uganda',
    currency: 'UGX',
    provider: 'Airtel Uganda',
    status: 'operational',
    latencyMs: 160,
    successRate: 97.9,
    volume24h: 15400000,
    volume24hUSD: 4139,
    autoRouteEnabled: true,
    isFallbackActive: false
  }
];

export const initialMerchants: Merchant[] = [
  {
    id: 'm-jumia',
    businessName: 'Jumia Technologies Group',
    country: 'Nigeria',
    contactEmail: 'treasury@jumia.com',
    kycStatus: 'approved',
    tier: 'enterprise',
    volume30d: 485000,
    joinedDate: '2022-04-12',
    pricing: {
      mobileMoneyFee: 1.2,
      cardFee: 2.2,
      bankTransferFee: 100 // 100 NGN flat
    },
    riskScore: 12,
    settlementAccount: {
      bankName: 'Access Bank Nigeria PLC',
      accountNumber: '0012948571',
      accountName: 'Jumia Nigeria Settlements'
    }
  },
  {
    id: 'm-copia',
    businessName: 'Copia Global Logistics',
    country: 'Kenya',
    contactEmail: 'payouts@copia.co.ke',
    kycStatus: 'approved',
    tier: 'enterprise',
    volume30d: 182000,
    joinedDate: '2023-01-18',
    pricing: {
      mobileMoneyFee: 1.4,
      cardFee: 2.5,
      bankTransferFee: 40 // 40 KES flat
    },
    riskScore: 5,
    settlementAccount: {
      bankName: 'KCB Bank Kenya',
      accountNumber: '1109485762',
      accountName: 'Copia Global East Africa'
    }
  },
  {
    id: 'm-kasha',
    businessName: 'Kasha Healthcare E-comm',
    country: 'Kenya',
    contactEmail: 'finance@kasha.co',
    kycStatus: 'approved',
    tier: 'growth',
    volume30d: 45000,
    joinedDate: '2024-03-05',
    pricing: {
      mobileMoneyFee: 1.5,
      cardFee: 2.9,
      bankTransferFee: 50
    },
    riskScore: 8,
    settlementAccount: {
      bankName: 'NCBA Bank Kenya',
      accountNumber: '9903827163',
      accountName: 'Kasha Kenya Limited'
    }
  },
  {
    id: 'm-safeboda',
    businessName: 'SafeBoda Ride Hailing',
    country: 'Uganda',
    contactEmail: 'accounts@safeboda.com',
    kycStatus: 'approved',
    tier: 'enterprise',
    volume30d: 94000,
    joinedDate: '2022-08-20',
    pricing: {
      mobileMoneyFee: 1.0,
      cardFee: 2.0,
      bankTransferFee: 1500 // 1500 UGX flat
    },
    riskScore: 15,
    settlementAccount: {
      bankName: 'Stanbic Bank Uganda',
      accountNumber: '01428574921',
      accountName: 'SafeBoda Uganda Tech Ltd'
    }
  },
  {
    id: 'm-showmax',
    businessName: 'Showmax Africa South',
    country: 'South Africa',
    contactEmail: 'billing@showmax.co.za',
    kycStatus: 'approved',
    tier: 'enterprise',
    volume30d: 320000,
    joinedDate: '2023-05-15',
    pricing: {
      mobileMoneyFee: 1.5,
      cardFee: 2.4,
      bankTransferFee: 5 // 5 ZAR flat
    },
    riskScore: 4,
    settlementAccount: {
      bankName: 'Standard Bank South Africa',
      accountNumber: '1014958372',
      accountName: 'MultiChoice South Africa / Showmax'
    }
  },
  {
    id: 'm-agrohub',
    businessName: 'AgroHub Ghana Co-op',
    country: 'Ghana',
    contactEmail: 'agrohub@ghana.com',
    kycStatus: 'pending_verification',
    tier: 'standard',
    volume30d: 0,
    joinedDate: '2026-06-28',
    pricing: {
      mobileMoneyFee: 1.8,
      cardFee: 3.2,
      bankTransferFee: 2 // 2 GHS flat
    },
    riskScore: 42,
    settlementAccount: {
      bankName: 'GCB Bank Ghana',
      accountNumber: '401093847291',
      accountName: 'AgroHub Ghana Limited'
    }
  },
  {
    id: 'm-afroprint',
    businessName: 'AfroPrint Creations',
    country: 'Nigeria',
    contactEmail: 'contact@afroprint.store',
    kycStatus: 'documents_required',
    tier: 'standard',
    volume30d: 1400,
    joinedDate: '2026-06-15',
    pricing: {
      mobileMoneyFee: 1.8,
      cardFee: 3.0,
      bankTransferFee: 150
    },
    riskScore: 28,
    settlementAccount: {
      bankName: 'Guaranty Trust Bank (GTB)',
      accountNumber: '0112948572',
      accountName: 'AfroPrint Creations Enterp'
    }
  },
  {
    id: 'm-chipalepay',
    businessName: 'Chipale Logistics Malaw',
    country: 'Uganda',
    contactEmail: 'info@chipale.com',
    kycStatus: 'rejected',
    tier: 'standard',
    volume30d: 0,
    joinedDate: '2026-05-10',
    pricing: {
      mobileMoneyFee: 1.8,
      cardFee: 3.0,
      bankTransferFee: 2000
    },
    riskScore: 85,
    settlementAccount: {
      bankName: 'DFCU Bank Uganda',
      accountNumber: '0234857610',
      accountName: 'Chipale Uganda Ltd'
    }
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-829381',
    merchantId: 'm-jumia',
    merchantName: 'Jumia Technologies Group',
    amount: 45000,
    currency: 'NGN',
    amountUSD: 29.61,
    paymentMethod: 'bank_transfer',
    railId: 'ng-nip',
    status: 'success',
    timestamp: '2026-07-06T11:58:34-07:00',
    customerName: 'Chidi Nnamdi',
    customerPhoneOrAccount: 'Access Bank ••••8271',
    failureReason: null
  },
  {
    id: 'tx-829382',
    merchantId: 'm-copia',
    merchantName: 'Copia Global Logistics',
    amount: 3500,
    currency: 'KES',
    amountUSD: 27.03,
    paymentMethod: 'mobile_money',
    railId: 'ke-mpesa',
    status: 'success',
    timestamp: '2026-07-06T11:54:12-07:00',
    customerName: 'Grace Wambui',
    customerPhoneOrAccount: '+254 712 ••• 384',
    failureReason: null
  },
  {
    id: 'tx-829383',
    merchantId: 'm-safeboda',
    merchantName: 'SafeBoda Ride Hailing',
    amount: 12000,
    currency: 'UGX',
    amountUSD: 3.23,
    paymentMethod: 'mobile_money',
    railId: 'ug-mtn',
    status: 'failed',
    timestamp: '2026-07-06T11:50:00-07:00',
    customerName: 'Mukasa Ronald',
    customerPhoneOrAccount: '+256 772 ••• 109',
    failureReason: 'Rail gateway timeout (MTN Uganda major outage)'
  },
  {
    id: 'tx-829384',
    merchantId: 'm-safeboda',
    merchantName: 'SafeBoda Ride Hailing',
    amount: 12000,
    currency: 'UGX',
    amountUSD: 3.23,
    paymentMethod: 'mobile_money',
    railId: 'ug-airtel',
    status: 'success',
    timestamp: '2026-07-06T11:51:15-07:00',
    customerName: 'Mukasa Ronald',
    customerPhoneOrAccount: '+256 701 ••• 924',
    failureReason: null // Auto-routed to Airtel after MTN failed!
  },
  {
    id: 'tx-829385',
    merchantId: 'm-showmax',
    merchantName: 'Showmax Africa South',
    amount: 149,
    currency: 'ZAR',
    amountUSD: 7.97,
    paymentMethod: 'card',
    railId: 'za-eft', // Ozow secure pay
    status: 'success',
    timestamp: '2026-07-06T11:45:10-07:00',
    customerName: 'Sipho Ndlovu',
    customerPhoneOrAccount: 'Capitec Bank ••••4821',
    failureReason: null
  },
  {
    id: 'tx-829386',
    merchantId: 'm-jumia',
    merchantName: 'Jumia Technologies Group',
    amount: 85000,
    currency: 'NGN',
    amountUSD: 55.92,
    paymentMethod: 'card',
    railId: 'ng-verve',
    status: 'pending',
    timestamp: '2026-07-06T12:02:45-07:00',
    customerName: 'Amina Bello',
    customerPhoneOrAccount: 'Verve Card ••••9382',
    failureReason: null
  },
  {
    id: 'tx-829387',
    merchantId: 'm-kasha',
    merchantName: 'Kasha Healthcare E-comm',
    amount: 480,
    currency: 'GHS',
    amountUSD: 32.43,
    paymentMethod: 'mobile_money',
    railId: 'gh-mtn',
    status: 'success',
    timestamp: '2026-07-06T11:32:19-07:00',
    customerName: 'Kofi Mensah',
    customerPhoneOrAccount: '+233 244 ••• 827',
    failureReason: null
  },
  {
    id: 'tx-829388',
    merchantId: 'm-afroprint',
    merchantName: 'AfroPrint Creations',
    amount: 15000,
    currency: 'NGN',
    amountUSD: 9.87,
    paymentMethod: 'card',
    railId: 'ng-verve',
    status: 'failed',
    timestamp: '2026-07-06T11:20:00-07:00',
    customerName: 'Yusuf Kola',
    customerPhoneOrAccount: 'Verve Card ••••1102',
    failureReason: 'Terminal connection degraded (Verve routing latency spike)'
  }
];

export const initialFloats: TreasuryFloat[] = [
  {
    id: 'fl-mpesa',
    railId: 'ke-mpesa',
    railName: 'Safaricom M-Pesa C2B/B2C',
    country: 'Kenya',
    currency: 'KES',
    balance: 14500000,
    balanceUSD: 111969,
    minThreshold: 2000000,
    status: 'healthy'
  },
  {
    id: 'fl-mtn-gh',
    railId: 'gh-mtn',
    railName: 'MTN Mobile Money API',
    country: 'Ghana',
    currency: 'GHS',
    balance: 85000,
    balanceUSD: 5743,
    minThreshold: 50000,
    status: 'healthy'
  },
  {
    id: 'fl-nibss',
    railId: 'ng-nip',
    railName: 'NIP Instant Bank Transfer',
    country: 'Nigeria',
    currency: 'NGN',
    balance: 8400000,
    balanceUSD: 5526,
    minThreshold: 10000000, // min is 10M NGN!
    status: 'low_balance' // triggered since balance is 8.4M NGN
  },
  {
    id: 'fl-mtn-ug',
    railId: 'ug-mtn',
    railName: 'MTN Mobile Money Uganda',
    country: 'Uganda',
    currency: 'UGX',
    balance: 1200000,
    balanceUSD: 322,
    minThreshold: 5000000, // min is 5M UGX
    status: 'critical' // triggered since balance is 1.2M UGX
  },
  {
    id: 'fl-airtel-ug',
    railId: 'ug-airtel',
    railName: 'Airtel Money Uganda API',
    country: 'Uganda',
    currency: 'UGX',
    balance: 18400000,
    balanceUSD: 4946,
    minThreshold: 4000000,
    status: 'healthy'
  }
];

export const initialLogs: SystemLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-06T12:05:12-07:00',
    type: 'info',
    category: 'routing',
    message: 'Auto-router adjusted weights for MTN Uganda due to massive latency spike (2500ms).'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-06T12:04:00-07:00',
    type: 'error',
    category: 'rail',
    message: 'MTN Uganda rail health dropped below threshold (12.4% success). Gateway is responding with TIMEOUT.'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-06T12:02:50-07:00',
    type: 'warning',
    category: 'settlement',
    message: 'Liquidity alert: NIBSS NGN settlement pool balance has fallen below 10,000,000 NGN.'
  },
  {
    id: 'log-4',
    timestamp: '2026-07-06T11:51:15-07:00',
    type: 'success',
    category: 'routing',
    message: 'TX tx-829384 successfully auto-routed to fallback Airtel Money Uganda API.'
  },
  {
    id: 'log-5',
    timestamp: '2026-07-06T11:40:12-07:00',
    type: 'info',
    category: 'merchant',
    message: 'Merchant AgroHub Ghana Co-op submitted KYC verification documents.'
  }
];

export const initialBatches: SettlementBatch[] = [
  {
    id: 'sb-001',
    merchantId: 'm-jumia',
    merchantName: 'Jumia Technologies Group',
    amount: 14850000,
    currency: 'NGN',
    amountUSD: 9769.74,
    status: 'completed',
    initiatedAt: '2026-07-05T18:00:00-07:00',
    completedAt: '2026-07-05T20:30:00-07:00',
    bankRef: 'NIP-SETTLE-8472918'
  },
  {
    id: 'sb-002',
    merchantId: 'm-copia',
    merchantName: 'Copia Global Logistics',
    amount: 284500,
    currency: 'KES',
    amountUSD: 2196.91,
    status: 'completed',
    initiatedAt: '2026-07-05T18:30:00-07:00',
    completedAt: '2026-07-05T19:15:00-07:00',
    bankRef: 'KCB-SETTLE-3948572'
  },
  {
    id: 'sb-003',
    merchantId: 'm-showmax',
    merchantName: 'Showmax Africa South',
    amount: 45000,
    currency: 'ZAR',
    amountUSD: 2406.41,
    status: 'processing',
    initiatedAt: '2026-07-06T08:00:00-07:00'
  },
  {
    id: 'sb-004',
    merchantId: 'm-safeboda',
    merchantName: 'SafeBoda Ride Hailing',
    amount: 15400000,
    currency: 'UGX',
    amountUSD: 4139.78,
    status: 'pending',
    initiatedAt: '2026-07-06T11:30:00-07:00'
  }
];

export const mockCustomers = [
  { name: 'Olamide Adebayo', phone: '+234 803 ••• 9482', account: 'Access Bank ••••1122' },
  { name: 'Phyllis Mwangi', phone: '+254 722 ••• 1928', account: 'M-Pesa Wallet ••• 192' },
  { name: 'Ama Osei', phone: '+233 244 ••• 0482', account: 'MTN Wallet ••• 048' },
  { name: 'Thabo Mokoena', phone: '+27 82 ••• 9481', account: 'Nedbank ••••5832' },
  { name: 'John Okello', phone: '+256 772 ••• 3847', account: 'Airtel Wallet ••• 384' }
];

export function generateRandomTx(
  rails: PaymentRail[],
  merchants: Merchant[]
): Transaction {
  const activeMerchants = merchants.filter(m => m.kycStatus === 'approved');
  const merchant = activeMerchants[Math.floor(Math.random() * activeMerchants.length)] || merchants[0];
  
  // Pick a rail in the merchant's country
  const countryRails = rails.filter(r => r.country === merchant.country);
  const rail = countryRails[Math.floor(Math.random() * countryRails.length)] || rails[0];
  
  const customer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
  
  // Generate amount
  let amount = 0;
  if (rail.currency === 'NGN') amount = Math.floor(Math.random() * 80000) + 1500;
  else if (rail.currency === 'KES') amount = Math.floor(Math.random() * 8000) + 100;
  else if (rail.currency === 'GHS') amount = Math.floor(Math.random() * 800) + 10;
  else if (rail.currency === 'ZAR') amount = Math.floor(Math.random() * 500) + 20;
  else amount = Math.floor(Math.random() * 100000) + 2000; // UGX
  
  const rate = exchangeRates[rail.currency]?.rateToUSD || 1.0;
  const amountUSD = parseFloat((amount / rate).toFixed(2));
  
  // Success state based on rail's success rate
  const isSuccess = Math.random() * 100 <= rail.successRate;
  
  let status: 'success' | 'failed' = isSuccess ? 'success' : 'failed';
  let failureReason = null;
  if (!isSuccess) {
    if (rail.status === 'major_outage') {
      failureReason = `Gateway connection refused (${rail.provider} main node down)`;
    } else {
      const reasons = [
        'Insufficient customer funds',
        'Customer PIN entry timeout',
        'Mobile Money carrier network timeout',
        'Issuer bank processing failure',
        'Do not Honor transaction response code'
      ];
      failureReason = reasons[Math.floor(Math.random() * reasons.length)];
    }
  }
  
  const timestamp = new Date().toISOString();
  
  return {
    id: `tx-${Math.floor(Math.random() * 900000) + 100000}`,
    merchantId: merchant.id,
    merchantName: merchant.businessName,
    amount,
    currency: rail.currency,
    amountUSD,
    paymentMethod: rail.type,
    railId: rail.id,
    status,
    timestamp,
    customerName: customer.name,
    customerPhoneOrAccount: rail.type === 'bank_transfer' || rail.type === 'card' ? customer.account : customer.phone,
    failureReason
  };
}
