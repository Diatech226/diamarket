import { describe, expect, it, vi } from 'vitest';

describe('resolveClerkJwtTemplate', () => {
  it('uses NEXT_PUBLIC_BACKEND_JWT_TEMPLATE when provided', async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_BACKEND_JWT_TEMPLATE = 'custom-template';

    const { resolveClerkJwtTemplate } = await import('@/lib/api/clerk-template');
    expect(resolveClerkJwtTemplate()).toBe('custom-template');

    delete process.env.NEXT_PUBLIC_BACKEND_JWT_TEMPLATE;
  });

  it('falls back to diaexpress-backend when env is missing', async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_BACKEND_JWT_TEMPLATE;
    delete process.env.NEXT_PUBLIC_DIAEXPRESS_CLERK_JWT_TEMPLATE;
    delete process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE;
    delete process.env.NEXT_PUBLIC_CLERK_TEMPLATE;
    delete process.env.BACKEND_JWT_TEMPLATE;
    delete process.env.DIAEXPRESS_CLERK_JWT_TEMPLATE;
    delete process.env.CLERK_JWT_TEMPLATE;
    delete process.env.CLERK_TEMPLATE;

    const { resolveClerkJwtTemplate } = await import('@/lib/api/clerk-template');
    expect(resolveClerkJwtTemplate()).toBe('diaexpress-backend');
  });
});
