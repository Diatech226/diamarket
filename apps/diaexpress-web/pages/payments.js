import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Payments from '@/pages/Payments';
import RoleProtected from '@/components/RoleProtected';

const PaymentsPage = () => (
  <ProtectedRoute>
    <RoleProtected role="client">
      <Payments />
    </RoleProtected>
  </ProtectedRoute>
);

export default PaymentsPage;
