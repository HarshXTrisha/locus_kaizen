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
  Share2,
  Bell,
  Home,
  FolderOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import { useSidebarOpen, useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/create', icon: Plus, label: 'Create Quiz' },
  { href: '/upload', icon: Upload, label: 'Upload PDF' },
  { href: '/quiz', icon: BookOpen, label: 'My Quizzes' },
  { href: '/shared', icon: Share2, label: 'Shared with Me' },
  { href: '/teams', icon: Users, label: 'Teams' },
  { href: '/results', icon: Target, label: 'Results' },
  { href: '/archive', icon: FolderOpen, label: 'Archive' },
  { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const isSidebarOpen = useSidebarOpen();
  const { toggleSidebar } = useAppStore();
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-[#20C997] to-[#1BA085] rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            <span className={`ml-3 font-bold text-xl text-gray-900 transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}>
              Locus
            </span>
          </Link>
          <button 
            onClick={toggleSidebar} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center py-3 px-6 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#20C997]/10 text-[#20C997] border-r-2 border-[#20C997]' 
                    : ''
                }`}
              >
                <item.icon className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-[#20C997]' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className={`ml-4 font-medium transition-all duration-300 ${
                  isSidebarOpen ? 'opacity-100' : 'opacity-0'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className={`ml-auto h-2 w-2 bg-[#20C997] rounded-full transition-opacity duration-300 ${
                    isSidebarOpen ? 'opacity-100' : 'opacity-0'
                  }`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats (when sidebar is open) */}
        {isSidebarOpen && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-[#20C997]/10 to-[#1BA085]/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quizzes</span>
                  <span className="font-medium text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-gray-900">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Score</span>
                  <span className="font-medium text-[#20C997]">85%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="flex items-center w-full py-3 px-6 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg group"
          >
            <LogIn className="h-5 w-5 group-hover:rotate-180 transition-transform duration-200" />
            <span className={`ml-4 font-medium transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
