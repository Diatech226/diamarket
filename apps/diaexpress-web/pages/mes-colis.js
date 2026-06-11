import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserShipments from '@/pages/UserShipments';

const UserShipmentsPage = () => (
  <ProtectedRoute>
    <UserShipments />
  </ProtectedRoute>
);

export default UserShipmentsPage;
