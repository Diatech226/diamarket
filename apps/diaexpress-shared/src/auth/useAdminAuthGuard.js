import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useBackendAuth } from './useBackendAuth';
import { fetchCurrentUser } from '../api/logistics';

const SIGN_IN_PATH = '/sign-in';
const FORBIDDEN_PATH = '/forbidden';
const isAdminUser = (user) => {
  if (!user) {
    return false;
  }

  const role = String(user.role || '').toLowerCase();
  if (role === 'admin') {
    return true;
  }

  return false;
};

export const useAdminAuthGuard = () => {
  const router = useRouter();
  const auth = useBackendAuth();
  const { isLoaded, isSignedIn, requireToken } = auth;
  const [guardStatus, setGuardStatus] = useState('idle');

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      const target = new URL(SIGN_IN_PATH, window.location.href);
      target.searchParams.set('reason', 'unauthenticated');
      router.replace(target.toString());
      setGuardStatus('unauthenticated');
      return;
    }

    let cancelled = false;

    (async () => {
      setGuardStatus('checking');
      try {
        const token = await requireToken();
        const me = await fetchCurrentUser(token);

        if (cancelled) {
          return;
        }

        if (!isAdminUser(me)) {
          setGuardStatus('forbidden');
          router.replace(FORBIDDEN_PATH);
          return;
        }

        setGuardStatus('ready');
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error?.status === 401) {
          setGuardStatus('unauthenticated');
          const target = new URL(SIGN_IN_PATH, window.location.href);
          target.searchParams.set('reason', 'session-expired');
          router.replace(target.toString());
          return;
        }

        if (error?.status === 403) {
          setGuardStatus('forbidden');
          router.replace(FORBIDDEN_PATH);
          return;
        }

        setGuardStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, requireToken, router]);

  const isAdminReady = useMemo(() => guardStatus === 'ready', [guardStatus]);

  const requireAdminToken = useCallback(
    async (options = {}) => {
      if (guardStatus === 'forbidden') {
        throw new Error('Accès refusé: rôle administrateur requis.');
      }

      if (!isAdminReady) {
        throw new Error('Authentification administrateur en cours de vérification.');
      }

      return requireToken(options);
    },
    [guardStatus, isAdminReady, requireToken],
  );

  return { ...auth, isAdminReady, requireAdminToken, guardStatus };
};

export default useAdminAuthGuard;
