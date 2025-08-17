'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isAuthenticated, isLoading } = useAppStore();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  // If not authenticated, just show children without header/sidebar
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If authenticated, show the full layout with header and sidebar
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-20 xl:ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
