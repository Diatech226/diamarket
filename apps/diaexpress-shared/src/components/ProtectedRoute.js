import React from 'react';
import { RedirectToSignIn } from '@clerk/nextjs';
import { useSafeUser } from '../auth/useSafeClerk';
import { useAuthUser } from '../auth/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isLoaded, isSignedIn } = useSafeUser();
  const authUser = useAuthUser();

  if (!isLoaded) return <div>Chargement...</div>;
  if (!isSignedIn) return <RedirectToSignIn />;

  const currentRole = String(authUser?.dbUser?.role || 'client').toLowerCase();
  const requiredRole = role ? String(role).toLowerCase() : null;

  if (requiredRole && currentRole !== 'admin' && currentRole !== requiredRole) {
    return <div>⛔ Accès refusé</div>;
  }

  return children;
};

export default ProtectedRoute;
