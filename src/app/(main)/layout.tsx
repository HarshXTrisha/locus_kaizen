'use client';

import React from 'react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}
