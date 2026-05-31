import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError, buildApiUrl } from '@/lib/api/client';

global.fetch = vi.fn();

const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;

const buildResponse = (body: unknown, ok = true, status = 200) =>
  new Response(JSON.stringify(body), { status, statusText: ok ? 'OK' : 'Error' });

describe('api client', () => {
  const previousDevBearerToken = process.env.NEXT_PUBLIC_ADMIN_BEARER_TOKEN;

  beforeEach(() => {
    mockFetch.mockReset();
    process.env.NEXT_PUBLIC_ADMIN_BEARER_TOKEN = previousDevBearerToken;
    (window as Window & { Clerk?: unknown }).Clerk = {
      session: {
        getToken: vi.fn().mockResolvedValue('browser-token'),
      },
    };
  });

  it('buildApiUrl ajoute les query params valides', () => {
    const url = buildApiUrl('/api/quotes', { status: 'pending', empty: '' });
    expect(url).toContain('/api/quotes');
    expect(url).toContain('status=pending');
    expect(url).not.toContain('empty=');
  });

  it('apiClient expose un message clair sur erreur JSON', async () => {
    mockFetch.mockResolvedValueOnce(buildResponse({ message: 'Bad request' }, false, 400));

    let thrown: unknown;
    try {
      await apiClient('/api/test');
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).message).toBe('Bad request');
  });

  it('injects bearer token for protected quotes requests', async () => {
    mockFetch.mockResolvedValueOnce(buildResponse({ quotes: [] }));

    await apiClient('/api/quotes');

    const [, options] = mockFetch.mock.calls[0];
    const authHeader = new Headers(options?.headers).get('Authorization');
    expect(authHeader).toBe('Bearer browser-token');
  });

  it('uses server auth bridge fallback when Clerk is not hydrated yet', async () => {
    (window as Window & { Clerk?: unknown }).Clerk = undefined;
    mockFetch
      .mockResolvedValueOnce(buildResponse({ token: 'bridge-token' }))
      .mockResolvedValueOnce(buildResponse({ shipments: [] }));

    await apiClient('/api/shipments');

    expect(mockFetch.mock.calls[0]?.[0]).toContain('/api/admin/auth/token');
    const [, options] = mockFetch.mock.calls[1];
    const authHeader = new Headers(options?.headers).get('Authorization');
    expect(authHeader).toBe('Bearer bridge-token');
  });

  it('uses local dev bearer fallback when Clerk + bridge token are unavailable', async () => {
    process.env.NEXT_PUBLIC_ADMIN_BEARER_TOKEN = 'local-dev-token';
    (window as Window & { Clerk?: unknown }).Clerk = undefined;
    mockFetch
      .mockResolvedValueOnce(buildResponse({ token: null, reason: 'no_token' }, false, 401))
      .mockResolvedValueOnce(buildResponse({ shipments: [] }));

    await apiClient('/api/shipments');

    const [, options] = mockFetch.mock.calls[1];
    const authHeader = new Headers(options?.headers).get('Authorization');
    expect(authHeader).toBe('Bearer local-dev-token');
  });

  it('fails gracefully when Clerk template is missing and avoids protected backend request spam', async () => {
    const getToken = vi.fn().mockRejectedValue(new Error('No JWT template exists with name: diaexpress-backend'));
    (window as Window & { Clerk?: unknown }).Clerk = { session: { getToken } };

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ token: null, reason: 'token_template_not_found', detail: 'Not Found' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await expect(apiClient('/api/expeditions/transport-lines')).rejects.toMatchObject({
      status: 401,
      reason: 'token_template_not_found',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(String(mockFetch.mock.calls[0]?.[0])).toContain('/api/admin/auth/token');

    await expect(apiClient('/api/expeditions/transport-lines')).rejects.toMatchObject({
      status: 401,
      reason: 'token_template_not_found',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(getToken).toHaveBeenCalledTimes(1);
  });

});
