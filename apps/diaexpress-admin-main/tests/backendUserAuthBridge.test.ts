import { beforeEach, describe, expect, it, vi } from 'vitest';

const { resolveAppRouterAuthToken } = vi.hoisted(() => ({
  resolveAppRouterAuthToken: vi.fn(),
}));

vi.mock('@/lib/api/auth.server', () => ({
  resolveAppRouterAuthToken,
}));

import { resolveBackendAdminStatus } from '@/lib/auth/backend-user';

describe('resolveBackendAdminStatus', () => {
  beforeEach(() => {
    resolveAppRouterAuthToken.mockReset();
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('returns ok for authenticated admin user from legacy user payload', async () => {
    resolveAppRouterAuthToken.mockResolvedValue({ token: 'abc', errorReason: null, errorDetail: null, usedTemplate: null });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ user: { role: 'admin', email: 'admin@dia.com' } }), { status: 200 }),
    );

    const status = await resolveBackendAdminStatus();
    expect(status).toEqual({ ok: true, user: { role: 'admin', email: 'admin@dia.com' } });
  });

  it('returns ok for authenticated admin user from API data payload', async () => {
    resolveAppRouterAuthToken.mockResolvedValue({ token: 'abc', errorReason: null, errorDetail: null, usedTemplate: null });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ data: { role: 'admin', email: 'admin@dia.com' } }), { status: 200 }),
    );

    const status = await resolveBackendAdminStatus();
    expect(status).toEqual({ ok: true, user: { role: 'admin', email: 'admin@dia.com' } });
  });

  it('returns token_template_not_found when server token resolution fails on missing template', async () => {
    resolveAppRouterAuthToken.mockResolvedValue({
      token: null,
      errorReason: 'token_template_not_found',
      errorDetail: 'Not Found',
      usedTemplate: 'diaexpress-backend',
    });

    const status = await resolveBackendAdminStatus();
    expect(status).toMatchObject({ ok: false, status: 401, reason: 'token_template_not_found' });
  });

  it('returns 401 reason from backend without mapping it to unavailable', async () => {
    resolveAppRouterAuthToken.mockResolvedValue({ token: 'abc', errorReason: null, errorDetail: null, usedTemplate: null });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ error: { details: { reason: 'invalid_token' } } }), {
        status: 401,
        headers: { 'x-request-id': 'req-401' },
      }),
    );

    const status = await resolveBackendAdminStatus();
    expect(status).toMatchObject({ ok: false, status: 401, reason: 'invalid_token', requestId: 'req-401' });
  });

  it('keeps backend 403 distinct from backend unavailable', async () => {
    resolveAppRouterAuthToken.mockResolvedValue({ token: 'abc', errorReason: null, errorDetail: null, usedTemplate: null });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ error: { details: { reason: 'role_forbidden' } } }), { status: 403 }),
    );

    const status = await resolveBackendAdminStatus();
    expect(status).toMatchObject({ ok: false, status: 403, reason: 'role_forbidden' });
  });

  it('keeps backend 500 as server error instead of backend unavailable', async () => {
    resolveAppRouterAuthToken.mockResolvedValue({ token: 'abc', errorReason: null, errorDetail: null, usedTemplate: null });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Auth bridge failed' } }), { status: 500 }),
    );

    const status = await resolveBackendAdminStatus();
    expect(status).toMatchObject({ ok: false, status: 500, reason: 'internal_error', detail: 'Auth bridge failed' });
  });

  it('returns 403 role_forbidden when backend user is not admin', async () => {
    resolveAppRouterAuthToken.mockResolvedValue({ token: 'abc', errorReason: null, errorDetail: null, usedTemplate: null });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ user: { role: 'operator' } }), { status: 200 }),
    );

    const status = await resolveBackendAdminStatus();
    expect(status).toMatchObject({ ok: false, status: 403, reason: 'role_forbidden' });
  });
});
