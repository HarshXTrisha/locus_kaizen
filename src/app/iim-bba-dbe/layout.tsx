'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { IIMSidebar } from '@/components/layout/IIMSidebar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageTransition } from '@/components/common/PageTransition';

interface IIMBBADBELayoutProps {
  children: React.ReactNode;
}

export default function IIMBBADBELayout({ children }: IIMBBADBELayoutProps) {
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

  // If authenticated, render with IIM sidebar only
  return (
    <div className="min-h-screen bg-gray-50">
      <IIMSidebar />
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:pl-80' : 'lg:pl-20'
      }`}>
        <main className="min-h-screen">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
