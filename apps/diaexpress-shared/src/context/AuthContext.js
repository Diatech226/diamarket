import { createContext, useContext, useState, useEffect } from 'react';
import { useBackendAuth } from '../auth/useBackendAuth';
import { buildApiUrl } from '../api/api';
import { useSafeUser } from '../auth/useSafeClerk';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { getToken } = useBackendAuth();
  const { user, isLoaded } = useSafeUser();
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      try {
        if (!isLoaded || !user) return;
        const token = await getToken();
        if (!token) {
          return;
        }
        const syncResponse = await fetch(buildApiUrl('/api/auth/sync'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!syncResponse.ok && syncResponse.status !== 409) {
          throw new Error(`Sync failed (${syncResponse.status})`);
        }

        const res = await fetch(buildApiUrl('/api/users/me'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || `User fetch failed (${res.status})`);
        }
        setBackendUser(data.user || null);
      } catch (err) {
        console.error('Sync error:', err);
        setBackendUser(null);
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [isLoaded, user, getToken]);

  return (
    <AuthContext.Provider value={{ user, backendUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => useContext(AuthContext);
