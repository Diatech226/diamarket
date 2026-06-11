import { useEffect, createContext, useContext, useMemo, useRef, useState } from 'react';
import { buildApiUrl } from '../api/api';
import { useBackendAuth } from './useBackendAuth';
import { useSafeUser } from './useSafeClerk';

export const UserContext = createContext();

const INITIAL_AUTH_STATE = {
  status: 'loading',
  reason: null,
  message: null,
  requestId: null,
};

const classifyAuthSyncError = (error) => {
  const status = Number(error?.status || 0);

  if (status === 401) {
    return {
      status: 'auth_error',
      reason: 'invalid_session',
      message: error?.message || 'Session invalide. Veuillez vous reconnecter.',
      requestId: error?.requestId || null,
    };
  }

  if (status === 403) {
    return {
      status: 'access_denied',
      reason: 'insufficient_role',
      message: error?.message || 'Accès refusé pour ce compte.',
      requestId: error?.requestId || null,
    };
  }

  if (status >= 500 || status === 0) {
    return {
      status: 'backend_unavailable',
      reason: 'backend_unavailable',
      message: error?.message || 'Backend indisponible.',
      requestId: error?.requestId || null,
    };
  }

  return {
    status: 'system_error',
    reason: 'unknown',
    message: error?.message || 'Erreur système inconnue.',
    requestId: error?.requestId || null,
  };
};

export const AuthProvider = ({
  children,
  clerkUser: clerkUserOverride,
  isUserLoaded: isUserLoadedOverride,
  getToken: getTokenOverride,
}) => {
  const { user: hookUser, isLoaded: hookIsLoaded } = useSafeUser();
  const { getToken: hookGetToken, isSignedIn } = useBackendAuth();

  const clerkUser = clerkUserOverride ?? hookUser;
  const isUserLoaded = isUserLoadedOverride ?? hookIsLoaded;
  const getToken = getTokenOverride ?? hookGetToken;
  const clerkUserId = clerkUser?.id;

  const [dbUser, setDbUser] = useState(null);
  const [authState, setAuthState] = useState(INITIAL_AUTH_STATE);
  const syncRef = useRef({ inFlight: false, lastKey: null, lastErrorKey: null, lastErrorAt: 0 });

  useEffect(() => {
    if (!isUserLoaded) {
      setAuthState(INITIAL_AUTH_STATE);
      return;
    }

    if (!clerkUserId || !isSignedIn || !getToken) {
      setDbUser(null);
      setAuthState({
        status: 'auth_error',
        reason: 'no_session',
        message: 'Aucune session active.',
        requestId: null,
      });
      syncRef.current.lastKey = null;
      return;
    }

    const syncKey = `${clerkUserId}:${isSignedIn ? 'signed-in' : 'signed-out'}`;
    const now = Date.now();
    const lastErrorKey = syncRef.current.lastErrorKey;
    if (syncRef.current.lastKey === syncKey || syncRef.current.inFlight) {
      return;
    }
    if (lastErrorKey === syncKey && now - syncRef.current.lastErrorAt < 10000) {
      return;
    }

    let isActive = true;
    syncRef.current.inFlight = true;
    setAuthState((prev) => (prev.status === 'ready' ? prev : INITIAL_AUTH_STATE));

    const syncUser = async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw { status: 401, message: 'Token manquant' };
        }

        const res = await fetch(buildApiUrl('/api/users/me'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const requestId = res.headers.get('x-request-id') || res.headers.get('x-correlation-id');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const apiError = new Error(data?.message || 'Impossible de synchroniser le profil utilisateur');
          apiError.status = res.status;
          apiError.requestId = data?.requestId || requestId || null;
          throw apiError;
        }

        if (isActive) {
          setDbUser(data?.user || null);
          setAuthState({
            status: 'ready',
            reason: null,
            message: null,
            requestId: requestId || data?.requestId || null,
          });
          syncRef.current.lastKey = syncKey;
          syncRef.current.lastErrorKey = null;
          syncRef.current.lastErrorAt = 0;
        }
      } catch (err) {
        if (isActive) {
          setDbUser(null);
          setAuthState(classifyAuthSyncError(err));
          syncRef.current.lastErrorKey = syncKey;
          syncRef.current.lastErrorAt = Date.now();
          console.warn('[client/auth] user sync failed', {
            status: err?.status || 0,
            message: err?.message,
            requestId: err?.requestId || null,
          });
        }
      } finally {
        syncRef.current.inFlight = false;
      }
    };

    syncUser();

    const syncState = syncRef.current;
    return () => {
      isActive = false;
      syncState.inFlight = false;
    };
  }, [clerkUserId, getToken, isSignedIn, isUserLoaded]);

  const value = useMemo(
    () => ({
      clerkUser,
      dbUser,
      authState,
    }),
    [authState, clerkUser, dbUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useAuthUser = () => useContext(UserContext);
