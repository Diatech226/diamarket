import { Router, type Request, type Response } from 'express';
import { sandboxState } from '../services/checkout-store';
import { ledgerRepository } from './ledger/ledger.repository';
import { listWebhookEvents as listReliableEvents } from './webhooks/webhook-event.repository';

export const reportRouter = Router();

type Filters = { merchantId: string; environment: 'test' | 'live'; applicationId?: string; currency?: string; from?: string; to?: string; limit: number; page: number };

function filters(req: Request): Filters {
  return {
    merchantId: typeof req.query.merchantId === 'string' ? req.query.merchantId : sandboxState.resolveMerchant(req.header('authorization') ?? undefined),
    environment: req.query.environment === 'live' ? 'live' : 'test',
    applicationId: typeof req.query.applicationId === 'string' ? req.query.applicationId : undefined,
    currency: typeof req.query.currency === 'string' ? req.query.currency.toUpperCase() : undefined,
    from: typeof req.query.from === 'string' ? req.query.from : typeof req.query.startDate === 'string' ? req.query.startDate : undefined,
    to: typeof req.query.to === 'string' ? req.query.to : typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
    limit: Math.min(Math.max(Number(req.query.limit ?? 50), 1), 200),
    page: Math.max(Number(req.query.page ?? 1), 1),
  };
}

function inRange(createdAt: string, f: Filters) {
  const t = new Date(createdAt).getTime();
  return (!f.from || t >= new Date(f.from).getTime()) && (!f.to || t <= new Date(f.to).getTime());
}

function payments(f: Filters) {
  return Array.from(sandboxState.payments.values()).filter((p: any) =>
    (!f.merchantId || p.merchant === f.merchantId || f.merchantId === 'Diapay Sandbox Merchant') &&
    (!f.currency || p.currency === f.currency) && inRange(p.createdAt, f)
  );
}

function paginate<T>(items: T[], f: Filters) { const start = (f.page - 1) * f.limit; return { items: items.slice(start, start + f.limit), page: f.page, limit: f.limit, total: items.length }; }
function ok(res: Response, data: unknown) { res.json({ success: true, data, message: 'OK' }); }
function amount(items: any[], predicate = (_: any) => true) { return items.filter(predicate).reduce((sum, p) => sum + Number(p.amount ?? 0), 0); }
function csv(res: Response, filename: string, rows: Array<Record<string, unknown>>) {
  const headers = Object.keys(rows[0] ?? { id: '', createdAt: '' });
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send([headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n'));
}

reportRouter.get('/overview', (req, res) => { const f = filters(req); const ps = payments(f); const events = [...sandboxState.webhookEvents, ...listReliableEvents(f.merchantId) as any[]]; ok(res, { filters: f, source: 'sandbox_in_memory', totalRevenue: amount(ps, (p) => ['paid','succeeded'].includes(p.status)), successfulPayments: ps.filter((p) => ['paid','succeeded'].includes(p.status)).length, failedPayments: ps.filter((p) => p.status === 'failed').length, refundAmount: amount(ps, (p) => ['refunded','partially_refunded'].includes(p.status)), webhookFailures: events.flatMap((e: any) => e.attempts ?? []).filter((a: any) => ['failed','dead'].includes(a.status)).length, apiErrors: 0, payments: ps.length }); });
reportRouter.get('/revenue', (req, res) => { const f = filters(req); const ps = payments(f); ok(res, { filters: f, source: 'sandbox_in_memory', daily: ps.reduce((acc: any, p: any) => { const d = p.createdAt.slice(0,10); acc[d] = (acc[d] ?? 0) + p.amount; return acc; }, {}), currencyBreakdown: ps.reduce((acc: any, p: any) => { acc[p.currency] = (acc[p.currency] ?? 0) + p.amount; return acc; }, {}), providerBreakdown: ps.reduce((acc: any, p: any) => { acc[p.provider] = (acc[p.provider] ?? 0) + p.amount; return acc; }, {}) }); });
reportRouter.get('/payments', (req, res) => { const f = filters(req); ok(res, { filters: f, ...paginate(payments(f), f) }); });
reportRouter.get('/providers', (req, res) => { const f = filters(req); const ps = payments(f); ok(res, { filters: f, providers: sandboxState.listProviders().map((provider: any) => ({ ...provider, paymentCount: ps.filter((p: any) => p.provider === provider.provider || p.provider === provider.id).length })) }); });
reportRouter.get('/webhooks', (req, res) => { const f = filters(req); ok(res, { filters: f, events: sandboxState.webhookEvents.filter((e) => inRange(e.createdAt, f)), reliableEvents: listReliableEvents(f.merchantId) }); });
reportRouter.get('/export/payments.csv', (req, res) => csv(res, 'diapay-payments.csv', payments(filters(req)).map((p: any) => ({ id: p.id, amount: p.amount, currency: p.currency, status: p.status, method: p.method, provider: p.provider, merchant: p.merchant, createdAt: p.createdAt, updatedAt: p.updatedAt }))));
reportRouter.get('/export/ledger.csv', (req, res) => csv(res, 'diapay-ledger.csv', ledgerRepository.listTransactions().map((t: any) => ({ id: t.id, type: t.type, referenceType: t.referenceType, referenceId: t.referenceId, amount: t.amount, currency: t.currency, status: t.status, createdAt: t.createdAt, postedAt: t.postedAt }))));
