'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  BookOpen,
  Upload,
  Settings,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Target,
  Plus,
} from '@/lib/icons';
import { useSidebarOpen, useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/create', icon: Plus, label: 'Create Quiz' },
  { href: '/quiz', icon: BookOpen, label: 'Start Quiz' },
  { href: '/results', icon: Target, label: 'Results' },
  { href: '/upload', icon: Upload, label: 'Upload' },
  { href: '/archive', icon: Users, label: 'Archive' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const isSidebarOpen = useSidebarOpen();
  const { toggleSidebar } = useAppStore();
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-width duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard">
            <span className={`font-bold text-xl text-[#20C997] ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Locus</span>
          </Link>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center py-3 px-6 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                pathname.startsWith(item.href) ? 'bg-gray-100 text-gray-900 font-semibold' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className={`ml-4 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="flex items-center w-full py-3 px-6 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogIn className="h-5 w-5" />
            <span className={`ml-4 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
