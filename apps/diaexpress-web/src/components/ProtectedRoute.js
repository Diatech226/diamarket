// src/components/ProtectedRoute.js
import React from 'react';
import { RedirectToSignIn } from '@clerk/nextjs';
import { useAuthUser } from '../auth/AuthContext';
import { useSafeUser } from '../auth/useSafeClerk';

const ProtectedRoute = ({ children, role }) => {
  const { isLoaded, isSignedIn } = useSafeUser();
  const authUser = useAuthUser();

  // En attente du chargement
  if (!isLoaded) return <div>Chargement...</div>;

  // Si non connecté
  if (!isSignedIn) return <RedirectToSignIn />;

  // Si le rôle est manquant ou incorrect
  const currentRole = authUser?.dbUser?.role;
  if (role && currentRole !== role) {
    return <div>⛔ Accès refusé</div>;
  }


  // Autorisé
  return children;
};

export default ProtectedRoute;
