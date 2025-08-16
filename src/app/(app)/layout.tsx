'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useSidebarOpen } from '@/lib/store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isSidebarOpen = useSidebarOpen();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
