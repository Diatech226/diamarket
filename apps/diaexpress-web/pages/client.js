import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientPage from '@/pages/ClientPage';
import RoleProtected from '@/components/RoleProtected';

const ClientHomePage = () => (
  <ProtectedRoute>
    <RoleProtected role="client">
      <ClientPage />
    </RoleProtected>
  </ProtectedRoute>
);

export default ClientHomePage;
