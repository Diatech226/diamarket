import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Quotes from '@/pages/Quotes';

const QuotesPage = () => (
  <ProtectedRoute>
    <Quotes />
  </ProtectedRoute>
);

export default QuotesPage;
