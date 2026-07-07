import React, { useState } from 'react';
import { PaymentRail, Merchant } from '../types';
import {
  Cpu,
  Key,
  Layers,
  Database,
  Globe,
  Plus,
  RefreshCw,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  X,
  Server,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Terminal,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
  Info,
  Download,
  BookOpen,
  FileText
} from 'lucide-react';

interface ProvidersScreenProps {
  rails: PaymentRail[];
  merchants: Merchant[];
  onAddSystemLog: (
    category: 'rail' | 'merchant' | 'settlement' | 'routing',
    type: 'info' | 'warning' | 'error' | 'success',
    message: string
  ) => void;
}

export interface ExternalProvider {
  id: string;
  name: string;
  type: 'telco' | 'aggregator' | 'bank';
  status: 'operational' | 'degraded' | 'major_outage' | 'maintenance';
  baseUrl: string;
  webhookUrl: string;
  webhookSecret: string;
  clientId: string;
  clientSecret: string;
  mode: 'production' | 'sandbox';
  latencyMs: number;
  successRate: number;
  connectedRailsCount: number;
  lastPing: string;
}

export interface ClientApiKey {
  id: string;
  name: string;
  merchantId: string;
  merchantName: string;
  keyPrefix: string;
  token: string;
  environment: 'production' | 'sandbox';
  scope: 'read_write' | 'read_only' | 'admin';
  status: 'active' | 'suspended' | 'revoked';
  createdAt: string;
  lastUsedAt: string | null;
}

export interface KeyUsageLog {
  id: string;
  timestamp: string;
  apiKeyId: string;
  keyLabel: string;
  keyPrefix: string;
  merchantName: string;
  action: 'generated' | 'rotated' | 'used' | 'suspended' | 'activated' | 'revoked';
  details: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export default function ProvidersScreen({
  rails,
  merchants,
  onAddSystemLog
}: ProvidersScreenProps) {
  const [activeSubTab, setActiveSubTab] = useState<'providers' | 'apikeys'>('providers');

  // ----------------------------------------------------
  // PROVIDERS STATE & ACTIONS
  // ----------------------------------------------------
  const [providers, setProviders] = useState<ExternalProvider[]>([
    {
      id: 'prov-safaricom',
      name: 'Safaricom M-Pesa Telecomm',
      type: 'telco',
      status: 'operational',
      baseUrl: 'https://api.safaricom.co.ke/v1/mpesa',
      webhookUrl: 'https://api.bantupay.com/v1/webhooks/safaricom',
      webhookSecret: 'wh_sec_mpesa_91a0f8b3c2e5d7',
      clientId: 'saf_c_9x29184a821c098',
      clientSecret: 'saf_s_8b2918c7283d0a9283f01928372e918',
      mode: 'production',
      latencyMs: 142,
      successRate: 99.4,
      connectedRailsCount: 1,
      lastPing: '2026-07-06T16:20:00Z'
    },
    {
      id: 'prov-mtn',
      name: 'MTN Group Mobile Money API',
      type: 'telco',
      status: 'degraded',
      baseUrl: 'https://api.mtn.com/v1/momo',
      webhookUrl: 'https://api.bantupay.com/v1/webhooks/mtn',
      webhookSecret: 'wh_sec_mtn_28d019ab3f019a',
      clientId: 'mtn_c_2a9184a829103e',
      clientSecret: 'mtn_s_9f283a091c01e9283f0128918231920',
      mode: 'production',
      latencyMs: 1342,
      successRate: 55.1,
      connectedRailsCount: 2,
      lastPing: '2026-07-06T16:21:12Z'
    },
    {
      id: 'prov-flutterwave',
      name: 'Flutterwave Africa Switch',
      type: 'aggregator',
      status: 'operational',
      baseUrl: 'https://api.flutterwave.com/v3',
      webhookUrl: 'https://api.bantupay.com/v1/webhooks/flutterwave',
      webhookSecret: 'wh_sec_flw_0a92831b0293ec4',
      clientId: 'flw_pub_live_9201f928a01f928e0',
      clientSecret: 'flw_sec_live_a0293ec4f8b918d0f1c29e38d01a91',
      mode: 'production',
      latencyMs: 245,
      successRate: 98.5,
      connectedRailsCount: 1,
      lastPing: '2026-07-06T16:21:40Z'
    },
    {
      id: 'prov-paystack',
      name: 'Paystack Pan-African API',
      type: 'aggregator',
      status: 'operational',
      baseUrl: 'https://api.paystack.co',
      webhookUrl: 'https://api.bantupay.com/v1/webhooks/paystack',
      webhookSecret: 'wh_sec_pstk_8c9e0d1f2a3b4c5',
      clientId: 'pst_pub_live_8192d0c91e0a29381',
      clientSecret: 'pst_sec_live_9f0e1d2c3b4a59182d0c9e8f1a2b3c',
      mode: 'sandbox',
      latencyMs: 198,
      successRate: 97.9,
      connectedRailsCount: 0,
      lastPing: '2026-07-06T16:19:15Z'
    },
    {
      id: 'prov-ozow',
      name: 'Ozow Secure EFT Payments',
      type: 'bank',
      status: 'operational',
      baseUrl: 'https://api.ozow.com/v2',
      webhookUrl: 'https://api.bantupay.com/v1/webhooks/ozow',
      webhookSecret: 'wh_sec_ozow_7d8e9f0a1b2c3d4',
      clientId: 'ozow_c_192831c029381',
      clientSecret: 'ozow_s_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o',
      mode: 'production',
      latencyMs: 220,
      successRate: 97.2,
      connectedRailsCount: 1,
      lastPing: '2026-07-06T16:20:10Z'
    }
  ]);

  const [searchProviderQuery, setSearchProviderQuery] = useState('');
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ExternalProvider | null>(null);

  // Form states for Provider Add/Edit
  const [provName, setProvName] = useState('');
  const [provType, setProvType] = useState<'telco' | 'aggregator' | 'bank'>('telco');
  const [provStatus, setProvStatus] = useState<ExternalProvider['status']>('operational');
  const [provBaseUrl, setProvBaseUrl] = useState('');
  const [provWebhookUrl, setProvWebhookUrl] = useState('');
  const [provWebhookSecret, setProvWebhookSecret] = useState('');
  const [provClientId, setProvClientId] = useState('');
  const [provClientSecret, setProvClientSecret] = useState('');
  const [provMode, setProvMode] = useState<'production' | 'sandbox'>('production');

  // Test Connection Console State
  const [testConsoleOpen, setTestConsoleOpen] = useState(false);
  const [testingProvider, setTestingProvider] = useState<ExternalProvider | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [consoleIsTesting, setConsoleIsTesting] = useState(false);

  // Webhook Tester State variables
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookTargetUrl, setWebhookTargetUrl] = useState('');
  const [webhookProviderName, setWebhookProviderName] = useState('');
  const [webhookPreset, setWebhookPreset] = useState<'mpesa_success' | 'mtn_payout' | 'generic_heartbeat'>('mpesa_success');
  const [webhookPayload, setWebhookPayload] = useState('');
  const [webhookSending, setWebhookSending] = useState(false);
  const [webhookConsoleLogs, setWebhookConsoleLogs] = useState<{ timestamp: string; message: string; type: 'info' | 'success' | 'error' | 'outgoing' | 'incoming' }[]>([]);
  const [webhookResponseStatus, setWebhookResponseStatus] = useState<number | null>(null);
  const [webhookResponseLatency, setWebhookResponseLatency] = useState<number | null>(null);

  // API Integration Documentation state
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsProvider, setDocsProvider] = useState<ExternalProvider | null>(null);
  const [docsViewMode, setDocsViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [docsCopied, setDocsCopied] = useState(false);
  const [syncedDocs, setSyncedDocs] = useState<Record<string, string>>({});
  const [docsSyncing, setDocsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, { syncedAt: string; source: string }>>({});

  const handleSyncDocs = async (provider: ExternalProvider) => {
    setDocsSyncing(true);
    onAddSystemLog(
      'rail',
      'info',
      `SYNCING REMOTELY: AI Agent is searching and synthesizing official endpoints for ${provider.name}.`
    );

    try {
      const response = await fetch("/api/sync-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName: provider.name,
          baseUrl: provider.baseUrl,
          clientId: provider.clientId,
          clientSecret: provider.clientSecret,
          webhookUrl: provider.webhookUrl,
          webhookSecret: provider.webhookSecret,
          mode: provider.mode
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.markdown) {
        setSyncedDocs(prev => ({
          ...prev,
          [provider.id]: data.markdown
        }));
        setSyncStatus(prev => ({
          ...prev,
          [provider.id]: {
            syncedAt: data.syncedAt || new Date().toLocaleTimeString(),
            source: data.source || "Gemini 3.5-Flash (Search Grounded)"
          }
        }));

        onAddSystemLog(
          'rail',
          'success',
          `SYNC COMPLETED: Successfully updated documentation for ${provider.name} using ${data.source}.`
        );
      } else {
        throw new Error(data.error || "Malformed sync response");
      }
    } catch (err: any) {
      console.error("Documentation Sync failed", err);
      onAddSystemLog(
        'rail',
        'error',
        `SYNC FAILED: Could not reach remote API indexers for ${provider.name}. Details: ${err.message}`
      );
    } finally {
      setDocsSyncing(false);
    }
  };

  const getProviderMarkdownDocs = (provider: ExternalProvider): string => {
    if (syncedDocs[provider.id]) {
      return syncedDocs[provider.id];
    }
    const { name, baseUrl, webhookUrl, webhookSecret, clientId, clientSecret, mode } = provider;
    
    if (provider.id === 'prov-safaricom' || name.toLowerCase().includes('safaricom') || name.toLowerCase().includes('mpesa')) {
      return `# Safaricom M-Pesa API Integration Guide
This document details the configuration and request lifecycle for **Safaricom M-Pesa** within BantuPay's unified routing matrix.

---

## 1. Credentials Configuration
These credentials are synchronized with your BantuPay connection pool:
- **Base Endpoint URL:** \`${baseUrl}\`
- **Consumer Key (Client ID):** \`${clientId}\`
- **Consumer Secret (Client Secret):** \`${clientSecret}\`
- **Environment Mode:** \`${mode.toUpperCase()}\`

---

## 2. Generate Access Token (OAuth Client Credentials)
Before making any payment requests, fetch an OAuth 2.0 access token using your client credentials:

\`\`\`bash
curl -X GET "${baseUrl}/oauth/v1/generate?grant_type=client_credentials" \\
  -u "${clientId}:${clientSecret}"
\`\`\`

**Response:**
\`\`\`json
{
  "access_token": "bantu_saf_access_token_token_example",
  "expires_in": "3599"
}
\`\`\`

---

## 3. Initiate Lipa Na M-Pesa Request (STK Push)
Triggers a prompt on the customer's phone to authorize the amount.

### Request [POST] \`/stkpush/v1/processrequest\`
**Headers:**
- \`Authorization: Bearer <access_token>\`
- \`Content-Type: application/json\`

**Body:**
\`\`\`json
{
  "BusinessShortCode": "174379",
  "Password": "YmFudHVwYXlfcGFzc3dvcmRfZXhhbXBsZQ==",
  "Timestamp": "20260706170500",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": 4500,
  "PartyA": "254712345678",
  "PartyB": "174379",
  "PhoneNumber": "254712345678",
  "CallBackURL": "${webhookUrl}",
  "AccountReference": "BantuPayInvoice",
  "TransactionDesc": "BantuPay STK Push"
}
\`\`\`

---

## 4. Webhook Callback Event
Safaricom dispatches transaction status callback events asynchronously to your webhook URL.

**Target Webhook URL:** \`${webhookUrl}\`
**HMAC Secret Key:** \`${webhookSecret}\`

Validate the \`X-BantuPay-Signature\` header against your Webhook Secret before updating your system status.`;
    }

    if (provider.id === 'prov-mtn' || name.toLowerCase().includes('mtn') || name.toLowerCase().includes('momo')) {
      return `# MTN Mobile Money (MoMo) API Integration Guide
This document details specifications for routing payments using **MTN Mobile Money Open API**.

---

## 1. Provisioning Settings
- **Base API URL:** \`${baseUrl}\`
- **API User (Client ID):** \`${clientId}\`
- **API Key (Client Secret):** \`${clientSecret}\`
- **Subscription Key:** \`momo_sub_key_5d290ac9a28e\`
- **Target Environment Mode:** \`${mode}\`

---

## 2. API Token Generation [POST] \`/token\`
Acquire an authorization token to authenticate subsequent operations.

\`\`\`bash
curl -X POST "${baseUrl}/token" \\
  -H "Authorization: Basic Base64(${clientId}:${clientSecret})" \\
  -H "Ocp-Apim-Subscription-Key: momo_sub_key_5d290ac9a28e"
\`\`\`

**Response:**
\`\`\`json
{
  "access_token": "mtn_momo_jwt_token_example",
  "token_type": "Bearer",
  "expires_in": 3600
}
\`\`\`

---

## 3. Request-to-Pay / Collection [POST] \`/collection/v1_0/requesttopay\`
Requests payment authorization from the specified customer wallet.

**Headers:**
- \`Authorization: Bearer <access_token>\`
- \`X-Reference-Id: <UUID>\`
- \`X-Target-Environment: ${mode}\`
- \`Ocp-Apim-Subscription-Key: momo_sub_key_5d290ac9a28e\`

**Body:**
\`\`\`json
{
  "amount": "250.00",
  "currency": "GHS",
  "externalId": "BANTU_GHS_9028",
  "payer": {
    "partyIdType": "MSISDN",
    "partyId": "233241234567"
  },
  "payerMessage": "BantuPay Checkout Payment",
  "payeeNote": "BantuPay Ref"
}
\`\`\`

---

## 4. Callback Webhook Events
MTN MoMo dispatches notifications to your callback URL upon finalization.

- **Webhook URL:** \`${webhookUrl}\`
- **Callback Signature Key:** \`${webhookSecret}\``;
    }

    if (provider.id === 'prov-flutterwave' || name.toLowerCase().includes('flutterwave') || name.toLowerCase().includes('flw')) {
      return `# Flutterwave Africa Switch Integration Guide
Deploy a unified checkout flow using the **Flutterwave v3** API.

---

## 1. Authentication Credentials
BantuPay secures client requests by injecting authorization headers:
- **Base Endpoint:** \`${baseUrl}\`
- **Public Key (Client ID):** \`${clientId}\`
- **Secret Key (Client Secret):** \`${clientSecret}\`
- **Integration Mode:** \`${mode.toUpperCase()}\`

All requests require the following authorization format:
\`Authorization: Bearer ${clientSecret}\`

---

## 2. Dispatch Payment Charge [POST] \`/charges?type=mobile_money_ghana\`
Route a standard mobile money charge request to Flutterwave's ledger.

**Headers:**
- \`Authorization: Bearer ${clientSecret}\`
- \`Content-Type: application/json\`

**Body:**
\`\`\`json
{
  "amount": 250,
  "currency": "GHS",
  "email": "customer@bantupay.com",
  "tx_ref": "BANTU-TX-891029",
  "phone_number": "233241234567",
  "network": "MTN",
  "fullname": "John Kofi",
  "redirect_url": "https://api.bantupay.com/v1/callbacks/flw-redirect"
}
\`\`\`

---

## 3. Webhook Response Verification
Flutterwave secures HTTP notifications by sending a signature signature header.
- **Webhook Header:** \`verif-hash\`
- **Your Webhook Secret:** \`${webhookSecret}\`
- **Callback URL:** \`${webhookUrl}\`

Verify that the incoming \`verif-hash\` header matches your configured \`webhookSecret\` before releasing value.`;
    }

    if (provider.id === 'prov-paystack' || name.toLowerCase().includes('paystack')) {
      return `# Paystack Pan-African API Integration Guide
This document contains checkout and routing setups for **Paystack**.

---

## 1. Environment Configurations
- **Base API Endpoint:** \`${baseUrl}\`
- **Public Key (Client ID):** \`${clientId}\`
- **Secret Key (Client Secret):** \`${clientSecret}\`
- **Webhook HMAC Secret:** \`${webhookSecret}\`

---

## 2. Initialize Checkout Transaction [POST] \`/transaction/initialize\`
Generates a payment web link and unique authorization reference.

**Headers:**
- \`Authorization: Bearer ${clientSecret}\`
- \`Content-Type: application/json\`

**Body:**
\`\`\`json
{
  "amount": 500000, 
  "email": "customer@bantupay.com",
  "reference": "PSTK_BANTU_77312",
  "callback_url": "${webhookUrl}",
  "channels": ["card", "bank", "ussd", "mobile_money"]
}
\`\`\`

**Response:**
\`\`\`json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/7gwy0u1r1p",
    "access_code": "7gwy0u1r1p",
    "reference": "PSTK_BANTU_77312"
  }
}
\`\`\`

---

## 3. Verify Payment Status [GET] \`/transaction/verify/{reference}\`
Always fetch status verification from Paystack's ledger before updating user balances:

\`\`\`bash
curl -X GET "${baseUrl}/transaction/verify/PSTK_BANTU_77312" \\
  -H "Authorization: Bearer ${clientSecret}"
\`\`\`

---

## 4. Callback Webhooks
Paystack transmits JSON updates to your configured endpoint.
- **Webhook URL:** \`${webhookUrl}\`
- **HMAC Signature Header:** \`x-paystack-signature\` calculated over the request body with key \`${webhookSecret}\`.`;
    }

    if (provider.id === 'prov-ozow' || name.toLowerCase().includes('ozow')) {
      return `# Ozow Secure EFT Integration Guide
This document details instant Electronic Funds Transfer (EFT) integration specifications for **Ozow**.

---

## 1. Credentials Configuration
- **Base Endpoint URL:** \`${baseUrl}\`
- **Site Code (Client ID):** \`${clientId}\`
- **Private Key (Client Secret):** \`${clientSecret}\`
- **ApiKey Header:** \`ozow-api-key-9281a029\`

---

## 2. Initiate Payment (EFT Prompt) [POST] \`/payments\`
To initiate an EFT flow, compile a payment request and append an SHA-512 Hash string generated by concatenating parameters and your Secret Key.

**Headers:**
- \`Accept: application/json\`
- \`Content-Type: application/json\`
- \`ApiKey: ozow-api-key-9281a029\`

**Body:**
\`\`\`json
{
  "siteCode": "${clientId}",
  "countryCode": "ZA",
  "currencyCode": "ZAR",
  "amount": 450.00,
  "transactionReference": "OZOW_BANTU_1908",
  "bankReference": "BantuPay EFT",
  "cancelUrl": "https://bantupay.com/cancel",
  "errorUrl": "https://bantupay.com/error",
  "successUrl": "https://bantupay.com/success",
  "notifyUrl": "${webhookUrl}",
  "isTest": "${mode === 'sandbox' ? 'true' : 'false'}",
  "hash": "8f8b89e83a93d...[SHA512 calculated string]"
}
\`\`\`

---

## 3. Secure Webhook Notification
Upon successful customer authorization, Ozow delivers a POST callback notification.
- **Webhook Secret Key:** \`${webhookSecret}\`
- **Target URL:** \`${webhookUrl}\`
- **Header:** \`IsTest: ${mode === 'sandbox' ? 'true' : 'false'}\``;
    }

    // Fallback for custom added provider
    return `# API Integration Guide: ${name}
Integrate **${name}** as a secure routing channel inside your BantuPay gateway workspace.

---

## 1. Connection Configurations
Configure your system to route API payment requests to the following gateway endpoints:
- **API Base Endpoint:** \`${baseUrl}\`
- **Credentials (Client ID):** \`${clientId}\`
- **Credentials (Client Secret):** \`${clientSecret}\`
- **Current Mode:** \`${mode.toUpperCase()}\`

---

## 2. Authentication Request [POST] \`/auth/token\`
Exchange client credentials for a temporary API Session Token:

\`\`\`bash
curl -X POST "${baseUrl}/auth/token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "${clientId}",
    "client_secret": "${clientSecret}"
  }'
\`\`\`

---

## 3. Payment Dispatch Request [POST] \`/payments\`
**Headers:**
- \`Authorization: Bearer <your_session_token>\`
- \`Content-Type: application/json\`

**Body:**
\`\`\`json
{
  "amount": 1000.00,
  "currency": "KES",
  "external_id": "BANTU_DISPATCH_99018",
  "callback_url": "${webhookUrl}"
}
\`\`\`

---

## 4. Webhook Security Verification
Validate all callback signals sent to your webhook endpoint by checking signature HMACs against your security key:
- **Webhook URL:** \`${webhookUrl}\`
- **Webhook HMAC Signature Key:** \`${webhookSecret}\``;
  };

  const handleOpenApiDocs = (provider: ExternalProvider) => {
    setDocsProvider(provider);
    setDocsViewMode('rendered');
    setDocsCopied(false);
    setDocsModalOpen(true);
    onAddSystemLog(
      'rail',
      'info',
      `INTEGRATION MANUAL LOADED: Displaying API documentation for ${provider.name}.`
    );
  };

  const handleCopyAllDocs = () => {
    if (!docsProvider) return;
    const content = getProviderMarkdownDocs(docsProvider);
    navigator.clipboard.writeText(content);
    setDocsCopied(true);
    setTimeout(() => setDocsCopied(false), 2000);
    onAddSystemLog(
      'rail',
      'success',
      `COPIED API DOCS: Full Markdown documentation for ${docsProvider.name} copied to clipboard.`
    );
  };

  const parseInlineStyles = (text: string) => {
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const tokens = text.split(regex);

    return tokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-white">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return <code key={idx} className="px-1.5 py-0.5 bg-slate-950 text-indigo-300 font-mono text-[10px] rounded border border-slate-850 font-semibold">{token.slice(1, -1)}</code>;
      }
      return token;
    });
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    const renderedElements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line === '---') {
        renderedElements.push(<hr key={`hr-${i}`} className="border-slate-850 my-5" />);
        continue;
      }

      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          const finalCode = codeBlockContent.join('\n');
          const currentLang = codeBlockLang;
          renderedElements.push(
            <div key={`code-${i}`} className="relative group bg-slate-950 border border-slate-850 rounded-xl my-4 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-850">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">{currentLang || 'code'}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(finalCode);
                    onAddSystemLog('rail', 'success', 'Code snippet copied to clipboard.');
                  }}
                  className="text-[9px] hover:text-white text-slate-400 font-extrabold uppercase transition font-mono border border-slate-800 bg-slate-950 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs font-mono text-indigo-300 leading-relaxed max-h-[300px]">
                <code>{finalCode}</code>
              </pre>
            </div>
          );
          codeBlockContent = [];
          codeBlockLang = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.trim().substring(3).toLowerCase();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      if (line.startsWith('# ')) {
        renderedElements.push(
          <h1 key={`h1-${i}`} className="text-lg font-black text-white mt-5 mb-3 tracking-tight flex items-center gap-2 border-b border-slate-800 pb-2">
            <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
            {parseInlineStyles(line.substring(2))}
          </h1>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        renderedElements.push(
          <h2 key={`h2-${i}`} className="text-sm font-extrabold text-slate-200 mt-4 mb-2 tracking-tight">
            {parseInlineStyles(line.substring(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        renderedElements.push(
          <h3 key={`h3-${i}`} className="text-xs font-bold text-slate-300 mt-3.5 mb-1.5">
            {parseInlineStyles(line.substring(4))}
          </h3>
        );
        continue;
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listText = line.trim().substring(2);
        renderedElements.push(
          <li key={`li-${i}`} className="list-disc list-inside text-xs text-slate-300 ml-4 mb-1.5 leading-relaxed">
            {parseInlineStyles(listText)}
          </li>
        );
        continue;
      }

      if (line.trim() === '') {
        continue;
      }

      renderedElements.push(
        <p key={`p-${i}`} className="text-xs text-slate-300 leading-relaxed mb-3">
          {parseInlineStyles(line)}
        </p>
      );
    }

    return renderedElements;
  };

  const getWebhookPresetPayload = (preset: 'mpesa_success' | 'mtn_payout' | 'generic_heartbeat') => {
    switch (preset) {
      case 'mpesa_success':
        return JSON.stringify({
          event: "payment.completed",
          timestamp: new Date().toISOString(),
          data: {
            transaction_id: `TXN_MPESA_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            provider: "safaricom_mpesa",
            amount: 4500,
            currency: "KES",
            status: "SUCCESSFUL",
            customer: {
              phone: "+254712345678",
              name: "Jane Doe"
            },
            reference: "BP_INV_90812A"
          }
        }, null, 2);
      case 'mtn_payout':
        return JSON.stringify({
          event: "payout.dispatched",
          timestamp: new Date().toISOString(),
          data: {
            payout_id: `PAY_MTN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            provider: "mtn_momo",
            amount: 250,
            currency: "GHS",
            status: "SETTLED",
            recipient: {
              phone: "+233241234567",
              name: "John Kofi"
            },
            reference: "BP_OUT_83102C"
          }
        }, null, 2);
      case 'generic_heartbeat':
        return JSON.stringify({
          event: "gateway.heartbeat",
          timestamp: new Date().toISOString(),
          data: {
            gateway_id: "gw-sub-east-01",
            status: "UP",
            load_factor: 0.34,
            active_channels: 12
          }
        }, null, 2);
    }
  };

  const handleOpenWebhookTester = (url: string, providerName: string) => {
    const target = url || 'https://api.bantupay.com/v1/callbacks';
    setWebhookTargetUrl(target);
    setWebhookProviderName(providerName);
    const initialPayload = getWebhookPresetPayload('mpesa_success');
    setWebhookPreset('mpesa_success');
    setWebhookPayload(initialPayload);
    setWebhookConsoleLogs([
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `INITIALIZED: Webhook Simulator ready for ${providerName}.`,
        type: 'info'
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `TARGET ENDPOINT: [POST] ${target}`,
        type: 'info'
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `READY: Select a preset payload or customize the raw JSON body below.`,
        type: 'info'
      }
    ]);
    setWebhookResponseStatus(null);
    setWebhookResponseLatency(null);
    setWebhookModalOpen(true);
  };

  const handlePresetChange = (preset: 'mpesa_success' | 'mtn_payout' | 'generic_heartbeat') => {
    setWebhookPreset(preset);
    setWebhookPayload(getWebhookPresetPayload(preset));
    setWebhookConsoleLogs(prev => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `LOADED PRESET: Switched payload template to "${preset.replace('_', ' ').toUpperCase()}".`,
        type: 'info'
      }
    ]);
  };

  const handleSendWebhook = async () => {
    if (!webhookTargetUrl) {
      alert("Please enter a valid target Webhook URL.");
      return;
    }

    setWebhookSending(true);
    setWebhookResponseStatus(null);
    setWebhookResponseLatency(null);

    const startTime = performance.now();
    const currentTimestamp = new Date().toLocaleTimeString();

    setWebhookConsoleLogs(prev => [
      ...prev,
      {
        timestamp: currentTimestamp,
        message: `DISPATCHING WEBHOOK: POST to ${webhookTargetUrl}`,
        type: 'outgoing'
      },
      {
        timestamp: currentTimestamp,
        message: `RAW HEADERS:\n{\n  "Content-Type": "application/json",\n  "X-BantuPay-Signature": "sha256=••••••••••••"\n}`,
        type: 'outgoing'
      }
    ]);

    try {
      // Validate JSON payload
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(webhookPayload);
      } catch (err) {
        throw new Error("Invalid JSON payload structure. Please verify syntax.");
      }

      // Perform actual fetch call with a 6s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(webhookTargetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-BantuPay-Signature': 'sha256=' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        },
        body: JSON.stringify(parsedPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      setWebhookResponseLatency(latency);
      setWebhookResponseStatus(response.status);

      let respText = '';
      try {
        respText = await response.text();
      } catch (e) {
        respText = '[Unable to read response body]';
      }

      setWebhookConsoleLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `RECEIVED RESPONSE: HTTP Status ${response.status} (${response.statusText || 'OK'}) in ${latency}ms.`,
          type: response.ok ? 'success' : 'error'
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `RESPONSE BODY:\n${respText || '[Empty / No Body returned]'}`,
          type: response.ok ? 'success' : 'info'
        }
      ]);

      onAddSystemLog(
        'rail',
        response.ok ? 'success' : 'warning',
        `WEBHOOK CALLBACK DISPATCHED: Callback to ${webhookTargetUrl} responded with status ${response.status} (${latency}ms).`
      );

    } catch (error: any) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      setWebhookResponseLatency(latency);
      setWebhookResponseStatus(0);

      let errorMsg = error?.message || 'Unknown network error';
      if (error?.name === 'AbortError') {
        errorMsg = 'Request timed out after 6 seconds.';
      }

      setWebhookConsoleLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `NETWORK DISPATCH FAILED: ${errorMsg}`,
          type: 'error'
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `EXPLANATION: Direct browser requests to external URLs may fail due to browser CORS policies, local network limits, or missing HTTPS. The BantuPay core simulator has registered this event successfully.`,
          type: 'info'
        }
      ]);

      onAddSystemLog(
        'rail',
        'error',
        `WEBHOOK DISPATCH ERROR: Failed to reach ${webhookTargetUrl}. Error: ${errorMsg}`
      );
    } finally {
      setWebhookSending(false);
    }
  };

  // Toggle mode prod/sandbox
  const handleToggleProviderMode = (providerId: string) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId) {
          const nextMode = p.mode === 'production' ? 'sandbox' : 'production';
          onAddSystemLog(
            'routing',
            'warning',
            `GATEWAY RECONFIGURED: Switched ${p.name} integration to ${nextMode.toUpperCase()} mode.`
          );
          return { ...p, mode: nextMode };
        }
        return p;
      })
    );
  };

  // Open Add Modal
  const handleOpenAddProvider = () => {
    setEditingProvider(null);
    setProvName('');
    setProvType('telco');
    setProvStatus('operational');
    setProvBaseUrl('https://api.telecom.com/v1');
    setProvWebhookUrl('https://api.bantupay.com/v1/webhooks/telecom');
    setProvWebhookSecret(`wh_sec_tel_${Math.floor(Math.random() * 900000) + 100000}`);
    setProvClientId(`c_id_${Math.floor(Math.random() * 9000000) + 1000000}`);
    setProvClientSecret(`c_sec_${Math.floor(Math.random() * 900000000) + 100000000}`);
    setProvMode('production');
    setProviderModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditProvider = (provider: ExternalProvider) => {
    setEditingProvider(provider);
    setProvName(provider.name);
    setProvType(provider.type);
    setProvStatus(provider.status);
    setProvBaseUrl(provider.baseUrl);
    setProvWebhookUrl(provider.webhookUrl);
    setProvWebhookSecret(provider.webhookSecret);
    setProvClientId(provider.clientId);
    setProvClientSecret(provider.clientSecret);
    setProvMode(provider.mode);
    setProviderModalOpen(true);
  };

  // Save Provider
  const handleSaveProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName || !provBaseUrl) return;

    if (editingProvider) {
      // Edit
      setProviders(prev =>
        prev.map(p =>
          p.id === editingProvider.id
            ? {
                ...p,
                name: provName,
                type: provType,
                status: provStatus,
                baseUrl: provBaseUrl,
                webhookUrl: provWebhookUrl,
                webhookSecret: provWebhookSecret,
                clientId: provClientId,
                clientSecret: provClientSecret,
                mode: provMode
              }
            : p
        )
      );
      onAddSystemLog(
        'rail',
        'info',
        `GATEWAY UPDATE: Successfully modified core configuration parameters for ${provName}.`
      );
    } else {
      // Add
      const newProv: ExternalProvider = {
        id: `prov-${provName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: provName,
        type: provType,
        status: provStatus,
        baseUrl: provBaseUrl,
        webhookUrl: provWebhookUrl,
        webhookSecret: provWebhookSecret,
        clientId: provClientId,
        clientSecret: provClientSecret,
        mode: provMode,
        latencyMs: 180,
        successRate: 98.0,
        connectedRailsCount: 0,
        lastPing: new Date().toISOString()
      };
      setProviders(prev => [...prev, newProv]);
      onAddSystemLog(
        'rail',
        'success',
        `NEW GATEWAY CONFIGURED: Successfully provisioned new network partner node ${provName} into carrier pools.`
      );
    }
    setProviderModalOpen(false);
  };

  // Test Connection Trigger
  const handleStartConnectionTest = (provider: ExternalProvider) => {
    setTestingProvider(provider);
    setTestConsoleOpen(true);
    setConsoleIsTesting(true);
    setConsoleLogs([`[INFO] Initializing BantuPay Handshake test with ${provider.name}...`]);

    const stepLogs = [
      `[INFO] Resolving DNS entry: ${provider.baseUrl.split('/')[2] || 'api.provider.com'}...`,
      `[SUCCESS] Resolved IP address: ${[172, 64, 148, Math.floor(Math.random() * 250)].join('.')} (TTL 300s)`,
      `[INFO] Establishing cryptographically secure socket via TLS 1.3...`,
      `[SUCCESS] Established Cipher: TLS_AES_256_GCM_SHA384 (ECDHE_RSA_4096)`,
      `[INFO] Dispatching authorization payload with Client ID [${provider.clientId.substring(0, 8)}••••]...`,
      `[INFO] Awaiting provider API platform acknowledgement header...`,
      `[SUCCESS] Received HTTP/1.1 200 OK | Content-Type: application/json`,
      `[TELEMETRY] Measured regional round-trip-time (RTT): ${provider.latencyMs}ms`,
      `[SUCCESS] Secure tunnel authenticated. Verification successful! API connection is solid.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < stepLogs.length) {
        setConsoleLogs(prev => [...prev, stepLogs[currentStep]]);
        currentStep++;
      } else {
        setConsoleIsTesting(false);
        clearInterval(interval);
        onAddSystemLog(
          'routing',
          'success',
          `PING TEST SUCCESSFUL: Verified cryptographic connection parameters with ${provider.name} in ${provider.latencyMs}ms.`
        );
      }
    }, 600);
  };

  // Delete Provider
  const handleDeleteProvider = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove the integration provider "${name}"? This will disrupt routing pools connected to this node.`)) {
      setProviders(prev => prev.filter(p => p.id !== id));
      onAddSystemLog(
        'rail',
        'error',
        `GATEWAY TERMINATED: Provider ${name} has been permanently deleted from infrastructure pools.`
      );
    }
  };


  // ----------------------------------------------------
  // CLIENT API KEYS STATE & ACTIONS
  // ----------------------------------------------------
  const [clientKeys, setClientKeys] = useState<ClientApiKey[]>([
    {
      id: 'key-1',
      name: 'Jumia Tech Prod Webhook Primary',
      merchantId: 'm-jumia',
      merchantName: 'Jumia Technologies Group',
      keyPrefix: 'bp_live_a81c72f',
      token: 'bp_live_8f3c7a91b2e45d6c8e0a1f2c3b4d5e12a3b4c5d6e7f8a9b0c1d2e3f4a5',
      environment: 'production',
      scope: 'read_write',
      status: 'active',
      createdAt: '2022-04-12T14:30:10Z',
      lastUsedAt: '2026-07-06T16:04:12Z'
    },
    {
      id: 'key-2',
      name: 'Copia Kenya Checkout Sandbox Key',
      merchantId: 'm-copia',
      merchantName: 'Copia Global Logistics',
      keyPrefix: 'bp_test_x90184b',
      token: 'bp_test_9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
      environment: 'sandbox',
      scope: 'read_write',
      status: 'active',
      createdAt: '2023-01-18T09:12:34Z',
      lastUsedAt: '2026-07-06T16:21:00Z'
    },
    {
      id: 'key-3',
      name: 'SafeBoda Uganda App Payout Access',
      merchantId: 'm-safeboda',
      merchantName: 'SafeBoda Ride Hailing',
      keyPrefix: 'bp_live_u718c9b',
      token: 'bp_live_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
      environment: 'production',
      scope: 'read_write',
      status: 'active',
      createdAt: '2022-08-20T11:45:00Z',
      lastUsedAt: '2026-07-06T11:51:15Z'
    },
    {
      id: 'key-4',
      name: 'Showmax Africa South Billing Cron',
      merchantId: 'm-showmax',
      merchantName: 'Showmax Africa South',
      keyPrefix: 'bp_live_s9281c3',
      token: 'bp_live_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
      environment: 'production',
      scope: 'read_only',
      status: 'active',
      createdAt: '2023-05-15T15:22:11Z',
      lastUsedAt: '2026-07-06T11:45:10Z'
    },
    {
      id: 'key-5',
      name: 'AgroHub Ghana Sandboxed Mobile Money Integration',
      merchantId: 'm-agrohub',
      merchantName: 'AgroHub Ghana Co-op',
      keyPrefix: 'bp_test_g29103e',
      token: 'bp_test_8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      environment: 'sandbox',
      scope: 'read_write',
      status: 'active',
      createdAt: '2026-06-28T16:00:00Z',
      lastUsedAt: null
    },
    {
      id: 'key-6',
      name: 'AfroPrint Creations Store Checkout',
      merchantId: 'm-afroprint',
      merchantName: 'AfroPrint Creations',
      keyPrefix: 'bp_live_f01928a',
      token: 'bp_live_a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
      environment: 'production',
      scope: 'read_write',
      status: 'suspended',
      createdAt: '2026-06-15T10:00:00Z',
      lastUsedAt: '2026-07-06T11:20:00Z'
    }
  ]);

  const [searchKeyQuery, setSearchKeyQuery] = useState('');
  const [selectedKeyEnvFilter, setSelectedKeyEnvFilter] = useState<'All' | 'production' | 'sandbox'>('All');
  const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
  
  // New Key Form State
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyMerchantId, setNewKeyMerchantId] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'sandbox'>('production');
  const [newKeyScope, setNewKeyScope] = useState<'read_write' | 'read_only' | 'admin'>('read_write');
  
  // Revealed Raw Token State (Shown only once)
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [revealedTokenName, setRevealedTokenName] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Cryptographic Key Usage Ledger History state
  const [keyUsageLogs, setKeyUsageLogs] = useState<KeyUsageLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-07-06T16:21:00Z',
      apiKeyId: 'key-2',
      keyLabel: 'Copia Kenya Checkout Sandbox Key',
      keyPrefix: 'bp_test_x90184b',
      merchantName: 'Copia Global Logistics',
      action: 'used',
      details: 'API REQUEST: POST /v1/payments/charge (Amount: 4,500 KES via Safaricom M-Pesa. 202 Accepted)',
      status: 'success'
    },
    {
      id: 'log-2',
      timestamp: '2026-07-06T16:04:12Z',
      apiKeyId: 'key-1',
      keyLabel: 'Jumia Tech Prod Webhook Primary',
      keyPrefix: 'bp_live_a81c72f',
      merchantName: 'Jumia Technologies Group',
      action: 'used',
      details: 'API REQUEST: GET /v1/transactions (Latency 48ms - Return 200 OK)',
      status: 'success'
    },
    {
      id: 'log-3',
      timestamp: '2026-07-06T15:45:00Z',
      apiKeyId: 'key-1',
      keyLabel: 'Jumia Tech Prod Webhook Primary',
      keyPrefix: 'bp_live_a81c72f',
      merchantName: 'Jumia Technologies Group',
      action: 'rotated',
      details: 'KEY ROTATION: Programmatically rotated secret key. New active prefix: bp_live_a81c72f••••',
      status: 'warning'
    },
    {
      id: 'log-4',
      timestamp: '2026-06-28T16:00:00Z',
      apiKeyId: 'key-5',
      keyLabel: 'AgroHub Ghana Sandboxed Mobile Money Integration',
      keyPrefix: 'bp_test_g29103e',
      merchantName: 'AgroHub Ghana Co-op',
      action: 'generated',
      details: 'PROVISIONED: Generated credentials with scope: read:write',
      status: 'info'
    },
    {
      id: 'log-5',
      timestamp: '2026-06-15T10:00:00Z',
      apiKeyId: 'key-6',
      keyLabel: 'AfroPrint Creations Store Checkout',
      keyPrefix: 'bp_live_f01928a',
      merchantName: 'AfroPrint Creations',
      action: 'suspended',
      details: 'ACCESS SUSPENDED: Admin suspended key due to repeated signature mismatch alerts.',
      status: 'error'
    }
  ]);

  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<'all' | 'generated' | 'rotated' | 'used' | 'revoked' | 'status_change'>('all');

  // Filter keys
  const filteredKeys = clientKeys.filter(key => {
    const matchesSearch =
      key.name.toLowerCase().includes(searchKeyQuery.toLowerCase()) ||
      key.merchantName.toLowerCase().includes(searchKeyQuery.toLowerCase()) ||
      key.keyPrefix.toLowerCase().includes(searchKeyQuery.toLowerCase());
    const matchesEnv = selectedKeyEnvFilter === 'All' || key.environment === selectedKeyEnvFilter;
    return matchesSearch && matchesEnv;
  });

  // Filter cryptographic usage history logs
  const filteredHistoryLogs = keyUsageLogs.filter(log => {
    const matchesSearch =
      log.keyLabel.toLowerCase().includes(searchHistoryQuery.toLowerCase()) ||
      log.merchantName.toLowerCase().includes(searchHistoryQuery.toLowerCase()) ||
      log.keyPrefix.toLowerCase().includes(searchHistoryQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchHistoryQuery.toLowerCase());
    
    let matchesAction = false;
    if (selectedActionFilter === 'all') {
      matchesAction = true;
    } else if (selectedActionFilter === 'status_change') {
      matchesAction = log.action === 'suspended' || log.action === 'activated';
    } else {
      matchesAction = log.action === selectedActionFilter;
    }

    return matchesSearch && matchesAction;
  });

  // Export Key Usage History & Rotation Ledger as CSV
  const handleExportAuditLogs = () => {
    if (keyUsageLogs.length === 0) {
      alert("No cryptographic usage logs available to export.");
      return;
    }

    // Headers conforming to requested elements (timestamp, apiKeyId, keyLabel, keyPrefix, merchantName, action, details, status)
    const headers = ["Timestamp", "Log ID", "API Key ID", "Key Label", "Key Prefix", "Merchant Name", "Action Type", "Audit Details", "Status Level"];

    const rows = keyUsageLogs.map(log => {
      // Escape text with quotes and escape embedded double-quotes
      const escapeCsvVal = (val: string) => {
        const clean = val || '';
        return `"${clean.replace(/"/g, '""')}"`;
      };

      return [
        log.timestamp,
        log.id,
        log.apiKeyId,
        escapeCsvVal(log.keyLabel),
        log.keyPrefix,
        escapeCsvVal(log.merchantName),
        log.action.toUpperCase(),
        escapeCsvVal(log.details),
        log.status.toUpperCase()
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `bantupay_api_keys_security_ledger_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onAddSystemLog(
        'merchant',
        'success',
        `CRYPTOGRAPHIC LOGS EXPORTED: Compiled and exported ${keyUsageLogs.length} security audit ledger records to CSV.`
      );
    } catch (error) {
      console.error('Failed to export CSV', error);
      alert('Failed to generate CSV download file.');
    }
  };

  // Toggle client key active/suspended status
  const handleToggleKeyStatus = (keyId: string, currentStatus: ClientApiKey['status']) => {
    if (currentStatus === 'revoked') return;
    const nextStatus: ClientApiKey['status'] = currentStatus === 'active' ? 'suspended' : 'active';
    
    setClientKeys(prev =>
      prev.map(k => (k.id === keyId ? { ...k, status: nextStatus } : k))
    );

    const targetKey = clientKeys.find(k => k.id === keyId);
    onAddSystemLog(
      'merchant',
      nextStatus === 'suspended' ? 'warning' : 'success',
      `API KEY MODIFICATION: API key with prefix ${targetKey?.keyPrefix} for ${targetKey?.merchantName} was ${nextStatus === 'suspended' ? 'SUSPENDED' : 'ACTIVATED'}.`
    );

    // Audit Log Entry
    if (targetKey) {
      const newLog: KeyUsageLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        apiKeyId: keyId,
        keyLabel: targetKey.name,
        keyPrefix: targetKey.keyPrefix,
        merchantName: targetKey.merchantName,
        action: nextStatus === 'suspended' ? 'suspended' : 'activated',
        details: nextStatus === 'suspended' ? `ACCESS SUSPENDED: Key suspended by system administrator.` : `ACCESS RE-ACTIVATED: Key reactivated by system administrator.`,
        status: nextStatus === 'suspended' ? 'warning' : 'success'
      };
      setKeyUsageLogs(prev => [newLog, ...prev]);
    }
  };

  // Revoke client key
  const handleRevokeKey = (keyId: string) => {
    const targetKey = clientKeys.find(k => k.id === keyId);
    if (!targetKey) return;

    if (confirm(`CRITICAL WARNING: Are you sure you want to permanently REVOKE the client API key "${targetKey.name}"? This action is immediate, irreversible, and will completely block any running API integrations using this key.`)) {
      setClientKeys(prev =>
        prev.map(k => (k.id === keyId ? { ...k, status: 'revoked', lastUsedAt: new Date().toISOString() } : k))
      );
      onAddSystemLog(
        'merchant',
        'error',
        `API KEY REVOKED: Client API key [${targetKey.keyPrefix}••••] belonging to ${targetKey.merchantName} was permanently revoked per admin mandate.`
      );

      // Audit Log Entry
      const newLog: KeyUsageLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        apiKeyId: keyId,
        keyLabel: targetKey.name,
        keyPrefix: targetKey.keyPrefix,
        merchantName: targetKey.merchantName,
        action: 'revoked',
        details: `REVOCATION EXECUTED: Cryptographic authorization revoked permanently.`,
        status: 'error'
      };
      setKeyUsageLogs(prev => [newLog, ...prev]);
    }
  };

  // Rotate client key
  const handleRotateKey = (keyId: string) => {
    const targetKey = clientKeys.find(k => k.id === keyId);
    if (!targetKey) return;

    if (confirm(`Are you sure you want to ROTATE the key "${targetKey.name}"? This will generate a new secret token and invalidate the existing one.`)) {
      // Generate secure token & prefix
      const randomHex = Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const prefix = targetKey.environment === 'production' ? 'bp_live_' : 'bp_test_';
      const finalToken = `${prefix}${randomHex}`;
      const keyPrefix = `${prefix}${randomHex.substring(0, 7)}`;

      setClientKeys(prev =>
        prev.map(k => (k.id === keyId ? { ...k, keyPrefix, token: finalToken } : k))
      );

      // Audit Log Entry
      const newLog: KeyUsageLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        apiKeyId: keyId,
        keyLabel: targetKey.name,
        keyPrefix,
        merchantName: targetKey.merchantName,
        action: 'rotated',
        details: `KEY ROTATION: Programmatically rotated secret key. New active prefix: ${keyPrefix}••••`,
        status: 'warning'
      };
      setKeyUsageLogs(prev => [newLog, ...prev]);

      // Open revealed secret token view so they can copy the rotated key!
      setRevealedToken(finalToken);
      setRevealedTokenName(`${targetKey.name} (Rotated)`);

      onAddSystemLog(
        'merchant',
        'warning',
        `API KEY ROTATED: Client credentials for ${targetKey.merchantName} have been rotated. Old secret revoked.`
      );
    }
  };

  // Simulate an API client request using a specific active key
  const handleSimulateApiCall = (keyId: string) => {
    const targetKey = clientKeys.find(k => k.id === keyId);
    if (!targetKey) return;

    if (targetKey.status !== 'active') {
      alert(`API Request Rejected: Key is currently ${targetKey.status.toUpperCase()}. Please activate the key first.`);
      return;
    }

    const now = new Date().toISOString();
    
    // Update last used at timestamp
    setClientKeys(prev =>
      prev.map(k => (k.id === keyId ? { ...k, lastUsedAt: now } : k))
    );

    // List of realistic mock payments
    const actions = [
      { details: `API REQUEST: GET /v1/transactions (Latency 48ms - Return 200 OK)`, status: 'success' },
      { details: `API REQUEST: POST /v1/payments/charge (Amount: ${Math.floor(Math.random() * 8000) + 1000} KES via Safaricom M-Pesa. 222 Accepted)`, status: 'success' },
      { details: `API REQUEST: POST /v1/payments/charge (Amount: ${Math.floor(Math.random() * 500) + 50} GHS via MTN momo. 222 Accepted)`, status: 'success' },
      { details: `API REQUEST: GET /v1/balance (Scope verified - 200 OK)`, status: 'success' },
      { details: `API REQUEST: POST /v1/webhooks/verify (SHA-256 HMAC Signature validation passed)`, status: 'success' }
    ];

    const chosen = actions[Math.floor(Math.random() * actions.length)];

    const newLog: KeyUsageLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      apiKeyId: keyId,
      keyLabel: targetKey.name,
      keyPrefix: targetKey.keyPrefix,
      merchantName: targetKey.merchantName,
      action: 'used',
      details: chosen.details,
      status: chosen.status as any
    };

    setKeyUsageLogs(prev => [newLog, ...prev]);

    onAddSystemLog(
      'merchant',
      'info',
      `API TRANSACTION LOGGED: Merchant ${targetKey.merchantName} dispatched call with key prefix ${targetKey.keyPrefix}.`
    );
  };

  // Handle Create Key Submit
  const handleCreateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyMerchantId) return;

    const selectedMerchant = merchants.find(m => m.id === newKeyMerchantId);
    const merchantName = selectedMerchant ? selectedMerchant.businessName : 'Unknown Merchant';
    
    // Generate secure token & prefix
    const randomHex = Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const prefix = newKeyEnv === 'production' ? 'bp_live_' : 'bp_test_';
    const finalToken = `${prefix}${randomHex}`;
    const keyPrefix = `${prefix}${randomHex.substring(0, 7)}`;

    const newKey: ClientApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      merchantId: newKeyMerchantId,
      merchantName,
      keyPrefix,
      token: finalToken,
      environment: newKeyEnv,
      scope: newKeyScope,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    };

    setClientKeys(prev => [newKey, ...prev]);

    // Audit Log Entry
    const newLog: KeyUsageLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      apiKeyId: newKey.id,
      keyLabel: newKey.name,
      keyPrefix: newKey.keyPrefix,
      merchantName: newKey.merchantName,
      action: 'generated',
      details: `PROVISIONED: Generated credentials with scope: ${newKey.scope.replace('_', ':')}`,
      status: 'success'
    };
    setKeyUsageLogs(prev => [newLog, ...prev]);

    onAddSystemLog(
      'merchant',
      'success',
      `NEW API KEY GENERATED: Issued new [${newKeyEnv.toUpperCase()}] key with scope [${newKeyScope}] to ${merchantName}.`
    );

    // Save token to show once in modal
    setRevealedToken(finalToken);
    setRevealedTokenName(newKeyName);
    setNewKeyModalOpen(false);

    // Clear form
    setNewKeyName('');
    setNewKeyMerchantId('');
  };

  const handleCopyRevealedToken = () => {
    if (!revealedToken) return;
    navigator.clipboard.writeText(revealedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };


  return (
    <div className="space-y-8 animate-fade-in" id="providers-screen">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-amber-500" />
            Integrations & API Gateways
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure pan-African carrier integrations, toggle live sandbox switches, and issue BantuPay developer API keys to merchants.
          </p>
        </div>

        {/* Sub tab selectors */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/50 flex items-center self-start md:self-auto shadow-sm">
          <button
            onClick={() => setActiveSubTab('providers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === 'providers'
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Server className="h-4 w-4 text-amber-500" />
            Carrier Providers
          </button>
          <button
            onClick={() => setActiveSubTab('apikeys')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === 'apikeys'
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="h-4 w-4 text-amber-500" />
            Merchant API Keys
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          TAB 1: CARRIER PROVIDERS
          ---------------------------------------------------- */}
      {activeSubTab === 'providers' && (
        <div className="space-y-6 animate-fade-in" id="tab-carrier-providers">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search connected carrier partners..."
                value={searchProviderQuery}
                onChange={(e) => setSearchProviderQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={handleOpenAddProvider}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow"
            >
              <Plus className="h-4 w-4" /> Add Integration Node
            </button>
          </div>

          {/* Providers Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {providers
              .filter(p => p.name.toLowerCase().includes(searchProviderQuery.toLowerCase()))
              .map(provider => {
                const getStatusColor = (status: ExternalProvider['status']) => {
                  switch (status) {
                    case 'operational':
                      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    case 'degraded':
                      return 'bg-amber-50 text-amber-700 border-amber-200';
                    case 'major_outage':
                      return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
                    case 'maintenance':
                      return 'bg-slate-100 text-slate-700 border-slate-200';
                  }
                };

                return (
                  <div
                    key={provider.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    {/* Upper Block */}
                    <div className="p-6 space-y-4">
                      {/* Name & Badge Status */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                            <Server className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">{provider.name}</h3>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                              ID: {provider.id} • {provider.type.toUpperCase()} NODE
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(provider.status)}`}>
                          ● {provider.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      {/* URL Config Display */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-bold text-slate-400 uppercase text-[9px] font-mono tracking-wider w-16 pt-0.5">Base URL</span>
                          <span className="font-mono text-slate-600 break-all bg-white px-2 py-0.5 rounded border border-slate-200/50 flex-1">{provider.baseUrl}</span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-bold text-slate-400 uppercase text-[9px] font-mono tracking-wider w-16 pt-0.5">Webhook</span>
                          <span className="font-mono text-slate-500 break-all bg-white px-2 py-0.5 rounded border border-slate-200/50 flex-1">{provider.webhookUrl}</span>
                        </div>
                      </div>

                      {/* Credentials Masked */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block">Client ID</span>
                          <div className="px-3 py-2 bg-slate-50 rounded-lg font-mono text-slate-600 truncate border border-slate-100">
                            {provider.clientId.substring(0, 8)}••••
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block">Client Secret</span>
                          <div className="px-3 py-2 bg-slate-50 rounded-lg font-mono text-slate-600 truncate border border-slate-100 flex items-center justify-between">
                            <span>••••••••</span>
                            <Lock className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                        </div>
                      </div>

                      {/* Telementry Metrics */}
                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
                          <p className={`text-sm font-black ${
                            provider.successRate > 95 ? 'text-emerald-600' : provider.successRate > 85 ? 'text-amber-500' : 'text-rose-600'
                          }`}>
                            {provider.successRate}%
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ping Latency</span>
                          <p className="text-sm font-black text-slate-700">
                            {provider.latencyMs}ms
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Rails</span>
                          <p className="text-sm font-black text-slate-700">
                            {provider.connectedRailsCount} Connected
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Control Actions */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                      {/* Production / Sandbox toggle */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest ${
                          provider.mode === 'production' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200'
                        } px-2 py-0.5 rounded border`}>
                          {provider.mode}
                        </span>
                        <button
                          onClick={() => handleToggleProviderMode(provider.id)}
                          className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition"
                          title="Toggle Integration Sandbox/Production Mode"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartConnectionTest(provider)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-[10px] uppercase tracking-wider border border-amber-200 transition"
                        >
                          <Play className="h-3 w-3 fill-amber-800 stroke-none" /> Test Ping
                        </button>
                        <button
                          onClick={() => handleOpenWebhookTester(provider.webhookUrl, provider.name)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-lg text-[10px] uppercase tracking-wider border border-indigo-200 transition"
                          title="Simulate / dispatch callback webhook payload"
                        >
                          <Activity className="h-3 w-3" /> Test Webhook
                        </button>
                        <button
                          onClick={() => handleOpenApiDocs(provider)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] uppercase tracking-wider border border-emerald-200 transition"
                          title="View API integration instructions"
                        >
                          <BookOpen className="h-3 w-3" /> API Docs
                        </button>
                        <button
                          onClick={() => handleOpenEditProvider(provider)}
                          className="px-2.5 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] uppercase tracking-wider border border-slate-200 transition"
                        >
                          Configure
                        </button>
                        <button
                          onClick={() => handleDeleteProvider(provider.id, provider.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Provider integration"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: CLIENT API KEYS
          ---------------------------------------------------- */}
      {activeSubTab === 'apikeys' && (
        <div className="space-y-6 animate-fade-in" id="tab-client-api-keys">
          {/* Controls: Search & Generate Key */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search keys by name, merchant, prefix..."
                value={searchKeyQuery}
                onChange={(e) => setSearchKeyQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 bg-slate-50/30 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <select
                value={selectedKeyEnvFilter}
                onChange={(e: any) => setSelectedKeyEnvFilter(e.target.value)}
                className="p-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none"
              >
                <option value="All">All Environments</option>
                <option value="production">Production Keys</option>
                <option value="sandbox">Sandbox Keys</option>
              </select>

              <button
                onClick={() => setNewKeyModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow"
              >
                <Key className="h-4 w-4" /> Create API Token
              </button>
            </div>
          </div>

          {/* Secure Raw Token Reveal Banner if a key was just generated */}
          {revealedToken && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6 rounded-2xl shadow-sm space-y-4 animate-bounce-short">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">BantuPay Client API Secret Token Generated!</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    This raw token was created for <strong className="text-slate-800">{revealedTokenName}</strong>. Copy it immediately. For PCI-DSS security compliance, we hash this key irreversibly; you will **never** be able to see this token value again once this alert is closed.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch gap-2">
                <div className="flex-1 bg-slate-900 text-slate-200 font-mono text-xs p-3 rounded-xl border border-slate-950 break-all select-all flex items-center justify-between gap-4">
                  <span>{revealedToken}</span>
                </div>
                <button
                  onClick={handleCopyRevealedToken}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition shrink-0 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  {copiedToken ? (
                    <>
                      <Check className="h-4 w-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy Key
                    </>
                  )}
                </button>
                <button
                  onClick={() => setRevealedToken(null)}
                  className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition shrink-0"
                >
                  Close & Dismiss
                </button>
              </div>
            </div>
          )}

          {/* API Keys Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-4 px-6">API Key Details</th>
                    <th className="py-4 px-6">Associated Merchant</th>
                    <th className="py-4 px-6">Env</th>
                    <th className="py-4 px-6">Scope</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Issued Date</th>
                    <th className="py-4 px-6">Last Live Call</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredKeys.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                        No developer keys found matching current filter query.
                      </td>
                    </tr>
                  ) : (
                    filteredKeys.map(key => {
                      const getStatusBadge = (status: ClientApiKey['status']) => {
                        switch (status) {
                          case 'active':
                            return 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          case 'suspended':
                            return 'bg-amber-50 text-amber-700 border-amber-100';
                          case 'revoked':
                            return 'bg-rose-50 text-rose-700 border-rose-150';
                        }
                      };

                      return (
                        <tr key={key.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-4.5 px-6">
                            <div className="flex items-center gap-2.5">
                              <Key className="h-4 w-4 text-slate-400 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">{key.name}</span>
                                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">
                                  Prefix: <strong className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200/50">{key.keyPrefix}••••</strong>
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4.5 px-6">
                            <div className="font-semibold text-slate-700">{key.merchantName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {key.merchantId}</span>
                          </td>

                          <td className="py-4.5 px-6">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              key.environment === 'production' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {key.environment}
                            </span>
                          </td>

                          <td className="py-4.5 px-6">
                            <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                              {key.scope.replace('_', ':')}
                            </span>
                          </td>

                          <td className="py-4.5 px-6">
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${getStatusBadge(key.status)}`}>
                              {key.status}
                            </span>
                          </td>

                          <td className="py-4.5 px-6 text-slate-500">
                            {new Date(key.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>

                          <td className="py-4.5 px-6 font-mono text-[11px] text-slate-500">
                            {key.lastUsedAt ? (
                              <span className="flex items-center gap-1 text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                {new Date(key.lastUsedAt).toLocaleTimeString()}
                              </span>
                            ) : (
                              <span className="text-slate-300 italic">Never used</span>
                            )}
                          </td>

                          <td className="py-4.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {key.status === 'active' && (
                                <button
                                  onClick={() => handleSimulateApiCall(key.id)}
                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                                  title="Simulate API Call / Request with this key"
                                >
                                  <Zap className="h-4 w-4" />
                                </button>
                              )}
                              {key.status !== 'revoked' && (
                                <>
                                  <button
                                    onClick={() => handleRotateKey(key.id)}
                                    className="p-1.5 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-700 border border-slate-200 rounded-lg transition"
                                    title="Rotate Key Secrets"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleKeyStatus(key.id, key.status)}
                                    className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition ${
                                      key.status === 'active'
                                        ? 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-600 hover:text-amber-700'
                                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                                    }`}
                                    title={key.status === 'active' ? 'Suspend Key' : 'Activate Key'}
                                  >
                                    {key.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleRevokeKey(key.id)}
                                disabled={key.status === 'revoked'}
                                className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Permanently Revoke Key"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Table Footer Warning */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium flex items-center gap-1.5 justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                All merchant client requests are cryptographically verified using SHA-256 HMAC digital signatures matching issued tokens.
              </span>
              <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">
                BantuPay Vault Core Active
              </span>
            </div>
          </div>

          {/* API Key Usage Audit Logs / History Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6" id="usage-history-section">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                  API Key Live Usage History & Security Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time cryptographic audit trail tracking credential issuance, rotation, suspension, and client api request logs.
                </p>
              </div>

              {/* Log Search and Filter */}
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Filter logs by key or merchant..."
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
                />
                <select
                  value={selectedActionFilter}
                  onChange={(e) => setSelectedActionFilter(e.target.value as any)}
                  className="p-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none text-slate-700"
                >
                  <option value="all">All Actions</option>
                  <option value="generated">Generated</option>
                  <option value="rotated">Rotated</option>
                  <option value="used">API Request Calls</option>
                  <option value="revoked">Revoked</option>
                  <option value="status_change">Suspended / Activated</option>
                </select>
                <button
                  onClick={handleExportAuditLogs}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs uppercase tracking-wider transition border border-amber-200"
                  title="Export Audit Log as CSV"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button
                  onClick={() => {
                    setKeyUsageLogs([]);
                    onAddSystemLog('merchant', 'info', 'API Key usage history audit logs cleared.');
                  }}
                  className="px-2.5 py-2 hover:bg-rose-50 text-rose-600 font-bold rounded-xl text-xs uppercase tracking-wider transition border border-rose-100"
                  title="Clear Audit Logs"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* List of usage logs */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {filteredHistoryLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  No cryptographic logs found. Click "Simulate API Call" (Zap icon) or generate a new key to populate.
                </div>
              ) : (
                filteredHistoryLogs.map((log) => {
                  const getActionBadge = (action: string) => {
                    switch (action) {
                      case 'generated':
                        return { text: 'GENERATED', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Key };
                      case 'rotated':
                        return { text: 'ROTATED', bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: RefreshCw };
                      case 'used':
                        return { text: 'API REQUEST', bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Zap };
                      case 'suspended':
                        return { text: 'SUSPENDED', bg: 'bg-slate-100 text-slate-600 border-slate-200', icon: Lock };
                      case 'activated':
                        return { text: 'ACTIVATED', bg: 'bg-teal-50 text-teal-700 border-teal-100', icon: CheckCircle };
                      case 'revoked':
                        return { text: 'REVOKED', bg: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle };
                      default:
                        return { text: 'LOG', bg: 'bg-slate-100 text-slate-600 border-slate-200', icon: Info };
                    }
                  };

                  const badge = getActionBadge(log.action);
                  const IconComp = badge.icon;

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border shrink-0 ${badge.bg}`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">{log.keyLabel}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">• {log.merchantName}</span>
                            <span className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-bold uppercase tracking-wider">{log.keyPrefix}••••</span>
                          </div>
                          <p className="text-xs font-mono text-slate-600 mt-1">{log.details}</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest border uppercase ${badge.bg}`}>
                          {badge.text}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------
          MODAL 1: CARRIER PROVIDER ADD / EDIT DIALOG
          ---------------------------------------------------- */}
      {providerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">
                  {editingProvider ? 'Update Carrier Node' : 'Register Carrier Provider'}
                </h3>
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mt-0.5">
                  BantuPay Regional Gateway Router Sync
                </p>
              </div>
              <button
                onClick={() => setProviderModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProviderSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Provider Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MTN Group Mobile Money"
                    value={provName}
                    onChange={(e) => setProvName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Provider Type</label>
                  <select
                    value={provType}
                    onChange={(e: any) => setProvType(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-bold"
                  >
                    <option value="telco">Telecom Carrier (M-Pesa, MTN)</option>
                    <option value="aggregator">Payment Aggregator (Flutterwave, Paystack)</option>
                    <option value="bank">Settlement Banking Node (Interswitch)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Operational Status</label>
                  <select
                    value={provStatus}
                    onChange={(e: any) => setProvStatus(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-bold text-slate-800"
                  >
                    <option value="operational">Operational</option>
                    <option value="degraded">Degraded Latency</option>
                    <option value="major_outage">Major Outage</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Integration Mode</label>
                  <select
                    value={provMode}
                    onChange={(e: any) => setProvMode(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-bold text-slate-800"
                  >
                    <option value="production">Production Gateway Node</option>
                    <option value="sandbox">Sandbox Test Sandbox</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">API Base URL Endpoint</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.carrier.com/v1"
                  value={provBaseUrl}
                  onChange={(e) => setProvBaseUrl(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Webhook Callback URL</label>
                  <input
                    type="url"
                    placeholder="https://api.bantupay.com/v1/callbacks"
                    value={provWebhookUrl}
                    onChange={(e) => setProvWebhookUrl(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Webhook Secret</label>
                  <input
                    type="text"
                    placeholder="wh_sec_••••"
                    value={provWebhookSecret}
                    onChange={(e) => setProvWebhookSecret(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">API Client ID/Username</label>
                  <input
                    type="text"
                    placeholder="client_id_key"
                    value={provClientId}
                    onChange={(e) => setProvClientId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">API Client Secret/Token</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={provClientSecret}
                    onChange={(e) => setProvClientSecret(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProviderModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow"
                >
                  {editingProvider ? 'Save Settings' : 'Initialize Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------
          MODAL 2: NEW CLIENT API KEY CREATE DIALOG
          ---------------------------------------------------- */}
      {newKeyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">Generate Client API Key</h3>
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mt-0.5">
                  Issue secure merchant token
                </p>
              </div>
              <button
                onClick={() => setNewKeyModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKeySubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Key Label Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jumia Mobile Checkout Hook"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Assign to Merchant</label>
                <select
                  required
                  value={newKeyMerchantId}
                  onChange={(e) => setNewKeyMerchantId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-bold"
                >
                  <option value="">-- Choose Merchant --</option>
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.businessName} ({m.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Environment</label>
                  <select
                    value={newKeyEnv}
                    onChange={(e: any) => setNewKeyEnv(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-bold"
                  >
                    <option value="production">Live Production (bp_live_)</option>
                    <option value="sandbox">Sandbox Test (bp_test_)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Access Scope</label>
                  <select
                    value={newKeyScope}
                    onChange={(e: any) => setNewKeyScope(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-bold"
                  >
                    <option value="read_write">Read & Write (Full)</option>
                    <option value="read_only">Read-Only (Telemetry)</option>
                    <option value="admin">Admin Operations (Settle)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[10px] text-slate-500 leading-relaxed flex gap-2">
                <Info className="h-5 w-5 text-amber-500 shrink-0" />
                <span>
                  By issuing this token, you grant this merchant client programmatic permission to process charges on connected pan-African telecom channels up to specified volume limits.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewKeyModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------
          MODAL 3: CONNECTION TEST TERMINAL CONSOLE
          ---------------------------------------------------- */}
      {testConsoleOpen && testingProvider && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-[480px]">
            {/* Console Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold font-mono tracking-tight text-slate-300">
                  BantuPay Gateway Handshake Terminal v1.0.8
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-slate-800 text-amber-500 font-mono px-1.5 py-0.5 rounded font-black border border-slate-700 uppercase">
                  Ping Testing: {testingProvider.name.split(' ')[0]}
                </span>
                <button
                  onClick={() => setTestConsoleOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                  disabled={consoleIsTesting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Simulated Live Feed */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-300 space-y-2.5 bg-slate-950">
              {consoleLogs.map((log, idx) => {
                let textClass = 'text-slate-300';
                if (log.startsWith('[SUCCESS]')) {
                  textClass = 'text-emerald-400 font-bold';
                } else if (log.startsWith('[INFO]')) {
                  textClass = 'text-slate-400';
                } else if (log.startsWith('[TELEMETRY]')) {
                  textClass = 'text-amber-400 font-black';
                } else if (log.startsWith('[ERROR]')) {
                  textClass = 'text-rose-400 font-black animate-pulse';
                }

                return (
                  <div key={idx} className={`leading-relaxed border-l-2 pl-2.5 transition-all duration-300 border-slate-800 ${textClass}`}>
                    {log}
                  </div>
                );
              })}

              {/* Cursor indicator */}
              {consoleIsTesting && (
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] italic mt-2.5 animate-pulse pl-2.5">
                  <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                  Establishing handshake packets...
                </div>
              )}
            </div>

            {/* Console Footer controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[10px]">
                Endpoint: {testingProvider.baseUrl}
              </span>
              <button
                onClick={() => setTestConsoleOpen(false)}
                disabled={consoleIsTesting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider transition"
              >
                {consoleIsTesting ? 'Testing Link...' : 'Dismiss Console'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 4: WEBHOOK CALLBACK TESTER / SIMULATOR
          ---------------------------------------------------- */}
      {webhookModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-scale-up my-8">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-950 border border-indigo-900 rounded-xl text-indigo-400">
                  <Activity className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">BantuPay Webhook callback Simulator</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mt-0.5">
                    Test Payload Dispatcher • {webhookProviderName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWebhookModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 h-[600px] overflow-hidden">
              
              {/* Left Column: Form & Configuration (5 cols) */}
              <div className="lg:col-span-5 p-6 space-y-5 overflow-y-auto h-full">
                {/* Target URL */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Webhook Endpoint URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://yourdomain.com/callbacks"
                    value={webhookTargetUrl}
                    onChange={(e) => setWebhookTargetUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    The URL configured to receive BantuPay push event messages. You can use webhook.site or mock services to test.
                  </p>
                </div>

                {/* Preset Templates */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Event Callback Preset</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePresetChange('mpesa_success')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs font-bold ${
                        webhookPreset === 'mpesa_success'
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>Safaricom payment.completed</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-900 text-emerald-400">Success</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePresetChange('mtn_payout')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs font-bold ${
                        webhookPreset === 'mtn_payout'
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>MTN MoMo payout.dispatched</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-900 text-blue-400 font-medium">Payout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePresetChange('generic_heartbeat')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs font-bold ${
                        webhookPreset === 'generic_heartbeat'
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>System gateway.heartbeat</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-850 border border-slate-750 text-slate-300">System</span>
                    </button>
                  </div>
                </div>

                {/* Edit Raw Payload Body */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">JSON Request Body</label>
                    <span className="text-[9px] text-slate-500 font-mono">Payload Editor</span>
                  </div>
                  <textarea
                    value={webhookPayload}
                    onChange={(e) => setWebhookPayload(e.target.value)}
                    className="w-full h-[180px] p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 resize-none"
                    spellCheck="false"
                  />
                </div>
              </div>

              {/* Right Column: Simulated Terminal & Response Console (7 cols) */}
              <div className="lg:col-span-7 p-6 bg-slate-950 flex flex-col justify-between h-full overflow-hidden">
                <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                  
                  {/* Status Banner */}
                  <div className="grid grid-cols-2 gap-4 pb-1 shrink-0">
                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Response Status</span>
                      <p className={`text-xl font-extrabold mt-1.5 ${
                        webhookResponseStatus === null 
                          ? 'text-slate-500' 
                          : webhookResponseStatus === 0 
                            ? 'text-rose-400' 
                            : webhookResponseStatus >= 200 && webhookResponseStatus < 300 
                              ? 'text-emerald-400' 
                              : 'text-amber-400'
                      }`}>
                        {webhookResponseStatus === null ? 'PENDING' : webhookResponseStatus === 0 ? 'FAIL (CORS)' : `HTTP ${webhookResponseStatus}`}
                      </p>
                    </div>
                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Roundtrip Latency</span>
                      <p className="text-xl font-extrabold mt-1.5 text-indigo-400 font-mono">
                        {webhookResponseLatency === null ? '—' : `${webhookResponseLatency}ms`}
                      </p>
                    </div>
                  </div>

                  {/* Terminal Console */}
                  <div className="flex-1 flex flex-col bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden min-h-[150px]">
                    <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-900 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="text-[10px] font-mono font-bold text-slate-400">Response & Handshake Telemetry</span>
                      </div>
                      <button
                        onClick={() => setWebhookConsoleLogs([])}
                        className="text-[9px] hover:text-white text-slate-500 uppercase font-bold transition font-mono"
                      >
                        Clear Feed
                      </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
                      {webhookConsoleLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                          Terminal logs are empty. Click "Dispatch Callback Webhook" to execute.
                        </div>
                      ) : (
                        webhookConsoleLogs.map((log, idx) => {
                          let textClass = 'text-slate-300 border-slate-900 bg-slate-900/10';
                          if (log.type === 'success') {
                            textClass = 'text-emerald-400 font-medium border-emerald-950/40 bg-emerald-950/10';
                          } else if (log.type === 'error') {
                            textClass = 'text-rose-400 font-medium border-rose-950/40 bg-rose-950/10';
                          } else if (log.type === 'outgoing') {
                            textClass = 'text-indigo-300 font-medium border-indigo-950/40 bg-indigo-950/10';
                          } else if (log.type === 'info') {
                            textClass = 'text-slate-400 border-slate-900 bg-slate-900/20';
                          }
                          return (
                            <div key={idx} className={`p-3 rounded-xl border whitespace-pre-wrap leading-relaxed ${textClass}`}>
                              <div className="flex items-center justify-between opacity-40 mb-1.5 text-[9px] uppercase font-black tracking-widest font-mono">
                                <span>{log.type}</span>
                                <span>{log.timestamp}</span>
                              </div>
                              {log.message}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Dispatch Button Actions */}
                <div className="pt-4 border-t border-slate-900 flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium leading-normal max-w-[65%]">
                    <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Transmits standard raw POST payload with simulated BantuPay SHA256 header.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWebhookModalOpen(false)}
                      className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSendWebhook}
                      disabled={webhookSending}
                      className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                    >
                      {webhookSending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Dispatching...
                        </>
                      ) : (
                        <>
                          <Activity className="h-4 w-4" /> Dispatch Webhook
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 5: PROVIDER API INTEGRATION DOCUMENTATION
          ---------------------------------------------------- */}
      {docsModalOpen && docsProvider && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-scale-up my-8">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950 border border-emerald-900 rounded-xl text-emerald-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">API Integration Reference</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mt-0.5">
                    BantuPay Core Routing Gateway • {docsProvider.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDocsModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Control Bar: View Switches & Copy */}
            <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-850 flex items-center justify-between gap-4">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setDocsViewMode('rendered')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    docsViewMode === 'rendered'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Rendered Guide
                </button>
                <button
                  onClick={() => setDocsViewMode('raw')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    docsViewMode === 'raw'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" /> Raw Markdown Source
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSyncDocs(docsProvider)}
                  disabled={docsSyncing}
                  className={`px-4 py-2 text-xs font-bold rounded-xl tracking-wider uppercase transition flex items-center gap-2 border ${
                    docsSyncing
                      ? 'bg-slate-950 border-slate-850 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-950/40 border-indigo-900 text-indigo-400 hover:border-indigo-800 hover:text-indigo-300'
                  }`}
                  title="Search and synchronize latest official documentation using BantuPay AI agent"
                >
                  <RefreshCw className={`h-4 w-4 ${docsSyncing ? 'animate-spin' : ''}`} />
                  {docsSyncing ? 'Syncing...' : 'Sync Documentation'}
                </button>

                <button
                  onClick={handleCopyAllDocs}
                  className={`px-4 py-2 text-xs font-bold rounded-xl tracking-wider uppercase transition flex items-center gap-2 ${
                    docsCopied
                      ? 'bg-emerald-950/40 border border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {docsCopied ? (
                    <>
                      <Check className="h-4 w-4" /> Copied Markdown!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy Entire Markdown
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-8 h-[500px] overflow-y-auto bg-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
              {docsViewMode === 'rendered' ? (
                <div className="space-y-4 text-slate-300">
                  {renderMarkdown(getProviderMarkdownDocs(docsProvider))}
                </div>
              ) : (
                <div className="h-full flex flex-col space-y-3">
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    Direct Copy-Paste Markdown Spec
                  </p>
                  <textarea
                    readOnly
                    value={getProviderMarkdownDocs(docsProvider)}
                    className="w-full flex-1 p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs font-mono text-emerald-400 leading-relaxed focus:outline-none resize-none select-all"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2 font-medium">
                <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>
                  {syncStatus[docsProvider.id] ? (
                    <span className="text-emerald-400 font-bold font-mono">
                      Synced live via {syncStatus[docsProvider.id].source} at {syncStatus[docsProvider.id].syncedAt}
                    </span>
                  ) : (
                    <span>Dynamic specifications compiled relative to active credential variables.</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setDocsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-bold rounded-xl text-[10px] uppercase tracking-wider transition"
              >
                Dismiss Docs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
