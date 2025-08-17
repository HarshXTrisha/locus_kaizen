'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageTransition } from '@/components/common/PageTransition';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, isAuthenticated, sidebarOpen } = useAppStore();

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  // If not authenticated, render children without layout (for public pages)
  if (!isAuthenticated || !user) {
    return <PageTransition>{children}</PageTransition>;
  }

  // If authenticated, render with sidebar and header
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
      }`}>
        <Header />
        <main className="min-h-screen">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
