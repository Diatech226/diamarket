import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileAddresses from '@/pages/ProfileAddresses';

const ProfileAddressesPage = () => (
  <ProtectedRoute>
    <ProfileAddresses />
  </ProtectedRoute>
);

export default ProfileAddressesPage;
