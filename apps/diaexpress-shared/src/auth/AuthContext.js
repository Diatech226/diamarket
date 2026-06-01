import { useEffect, createContext, useContext, useMemo, useRef, useState } from 'react';
import { buildApiUrl } from '../api/api';
import { useBackendAuth } from './useBackendAuth';
import { useSafeUser } from './useSafeClerk';

export const UserContext = createContext();

export const AuthProvider = ({
  children,
  clerkUser: clerkUserOverride,
  isUserLoaded: isUserLoadedOverride,
  getToken: getTokenOverride,
}) => {
  const { user: hookUser, isLoaded: hookIsLoaded } = useSafeUser();
  const { getToken: hookGetToken } = useBackendAuth();

  const clerkUser = clerkUserOverride ?? hookUser;
  const isUserLoaded = isUserLoadedOverride ?? hookIsLoaded;
  const getToken = getTokenOverride ?? hookGetToken;

  const [dbUser, setDbUser] = useState(null);
  const [syncState, setSyncState] = useState({ status: 'idle', error: null });
  const syncLockRef = useRef(false);
  const retryTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const lastSyncedUserIdRef = useRef(null);
  const lastFailureRef = useRef({ userId: null, status: null, at: 0 });

  useEffect(() => {
    if (!isUserLoaded || !clerkUser || !getToken) {
      return;
    }

    let isActive = true;
    const maxRetries = 2;
    const clearRetry = () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };

    const syncUser = async (allowRetry = true) => {
      const now = Date.now();
      const userId = clerkUser?.id || null;
      const lastFailure = lastFailureRef.current;
      if (lastFailure.userId === userId && Number(lastFailure.status) === 503 && now - lastFailure.at < 10000) return;
      if (syncLockRef.current || !isActive) return;
      syncLockRef.current = true;
      try {
        setSyncState((prev) => (prev.status === 'loading' && prev.error === null ? prev : { status: 'loading', error: null }));
        const token = await getToken();
        if (!token) {
          setSyncState({ status: 'error', error: 'Session non synchronisée.' });
          return;
        }

        const res = await fetch(buildApiUrl('/api/users/me'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          const error = new Error(data?.message || 'Impossible de synchroniser le profil utilisateur');
          error.status = res.status;
          throw error;
        }

        if (isActive) {
          retryCountRef.current = 0;
          lastFailureRef.current = { userId: clerkUser?.id || null, status: null, at: 0 };
          clearRetry();
          const nextUser = data?.user || null;
          setDbUser((prev) => (JSON.stringify(prev) === JSON.stringify(nextUser) ? prev : nextUser));
          lastSyncedUserIdRef.current = clerkUser?.id || null;
          setSyncState({ status: 'synced', error: null });
        }
      } catch (err) {
        if (isActive) {
          const isBackendUnavailable = Number(err?.status) === 503;
          lastFailureRef.current = { userId: clerkUser?.id || null, status: Number(err?.status) || 0, at: Date.now() };
          const canRetry = allowRetry && isBackendUnavailable && retryCountRef.current < maxRetries;
          setSyncState({ status: 'error', error: err?.message || 'Impossible de synchroniser le profil utilisateur' });
          if (canRetry) {
            const delay = 500 * (retryCountRef.current + 1);
            retryCountRef.current += 1;
            clearRetry();
            retryTimeoutRef.current = setTimeout(() => {
              syncUser(false);
            }, delay);
          }
        }
      } finally {
        syncLockRef.current = false;
      }
    };

    if (lastSyncedUserIdRef.current !== clerkUser?.id || syncState.status === 'idle') {
      syncUser();
    }

    return () => {
      isActive = false;
      clearRetry();
    };
  }, [clerkUser, getToken, isUserLoaded]);

  const contextValue = useMemo(() => ({
    clerkUser,
    dbUser,
    syncState,
  }), [clerkUser, dbUser, syncState]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuthUser = () => useContext(UserContext);
