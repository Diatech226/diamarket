import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useBackendAuth } from './useBackendAuth';

const SIGN_IN_PATH = '/sign-in';

export const useAdminAuthGuard = () => {
  const router = useRouter();
  const auth = useBackendAuth();
  const { isLoaded, isSignedIn } = auth;
  const hasRedirectedRef = useRef(false);

  const isAdminReady = useMemo(() => isLoaded && isSignedIn, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      hasRedirectedRef.current = false;
      return;
    }

    if (hasRedirectedRef.current) {
      return;
    }

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    if (currentPath === SIGN_IN_PATH) {
      return;
    }

    hasRedirectedRef.current = true;

    router.replace(
      {
        pathname: SIGN_IN_PATH,
        query: {
          reason: 'unauthenticated',
          returnTo: router.asPath || '/admin',
        },
      },
      undefined,
      { shallow: true },
    );
  }, [isLoaded, isSignedIn, router]);

  const requireAdminToken = useCallback(
    async (options = {}) => {
      if (!isAdminReady) {
        throw new Error('Authentification requise pour les pages administrateur.');
      }
      return auth.requireToken(options);
    },
    [auth, isAdminReady],
  );

  return { ...auth, isAdminReady, requireAdminToken };
};

export default useAdminAuthGuard;
