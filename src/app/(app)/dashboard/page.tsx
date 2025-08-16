import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
