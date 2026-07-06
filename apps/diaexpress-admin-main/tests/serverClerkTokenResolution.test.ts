import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const getToken = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ getToken })),
}));

import { resolveServerClerkTokenWithClerk } from '@/lib/api/auth.server';

describe('resolveServerClerkTokenWithClerk', () => {
  it('falls back to template-less token when template is not found', async () => {
    getToken.mockReset();
    getToken.mockRejectedValueOnce(new Error('Not Found'));
    getToken.mockResolvedValueOnce('fallback-token');

    const result = await resolveServerClerkTokenWithClerk({ template: 'diaexpress-backend', skipCache: true });

    expect(result).toEqual({
      token: 'fallback-token',
      usedTemplate: null,
      errorReason: null,
      errorDetail: 'Not Found',
    });
  });
});
