import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DeliveryPage from '@/pages/DeliveryPage';
import RoleProtected from '@/components/RoleProtected';

const DeliveryHomePage = () => (
  <ProtectedRoute>
    <RoleProtected role="delivery">
      <DeliveryPage />
    </RoleProtected>
  </ProtectedRoute>
);

export default DeliveryHomePage;
