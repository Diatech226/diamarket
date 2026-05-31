import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { handleAuthFailure } from '@/lib/api/auth';

describe('handleAuthFailure', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    let now = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      now += 2000;
      return now;
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        pathname: '/admin',
        search: '',
        assign: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('redirects active session 401 to auth-error once', () => {
    (window as Window & { Clerk?: unknown }).Clerk = { session: { getToken: vi.fn() } };

    handleAuthFailure(401, 'invalid_token');

    expect(window.location.assign).toHaveBeenCalledWith('/admin/auth-error?reason=backend-unauthorized');
  });

  it('does not redirect when already on /admin/auth-error', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        pathname: '/admin/auth-error',
        search: '?reason=backend-unauthorized',
        assign: vi.fn(),
      },
    });

    (window as Window & { Clerk?: unknown }).Clerk = { session: { getToken: vi.fn() } };
    handleAuthFailure(401, 'invalid_token');

    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('does not redirect on missing_token bridge errors', () => {
    (window as Window & { Clerk?: unknown }).Clerk = { session: { getToken: vi.fn() } };

    handleAuthFailure(401, 'missing_token');

    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('redirects 403 to access denied', () => {
    (window as Window & { Clerk?: unknown }).Clerk = { session: { getToken: vi.fn() } };

    handleAuthFailure(403, 'role_forbidden');

    expect(window.location.assign).toHaveBeenCalledWith('/access-denied');
  });
});
