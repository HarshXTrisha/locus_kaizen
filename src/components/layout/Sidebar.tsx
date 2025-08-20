'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { 
  Home, 
  Plus, 
  Upload, 
  BarChart3, 
  Settings, 
  Archive,
  Users,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, sidebarOpen, toggleSidebar } = useAppStore();

  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Create Quiz', href: '/create', icon: Plus },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Results', href: '/results', icon: BarChart3 },
    { name: 'Archive', href: '/archive', icon: Archive },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-100 lg:shadow-sm transition-all duration-300 ${
      sidebarOpen ? 'lg:w-64' : 'lg:w-16'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 bg-white">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 text-xl font-bold text-[#212529] hover:text-[#20C997] transition-colors ${
            !sidebarOpen && 'justify-center w-full'
          }`}
        >
          <div className="h-8 w-8 bg-gradient-to-br from-[#20C997] to-[#1BA085] rounded-lg flex items-center justify-center shadow-sm">
            <Target className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex items-center">
              <span className="text-[#20C997]">Quest</span>
              <span className="text-[#212529]">AI</span>
            </div>
          )}
        </Link>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md hover:bg-gray-50 transition-colors ${
            !sidebarOpen && 'absolute right-1 top-1/2 transform -translate-y-1/2'
          }`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#20C997]/10 text-[#20C997] border border-[#20C997]/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`p-1.5 rounded-md transition-colors ${
                isActive 
                  ? 'bg-[#20C997] text-white' 
                  : 'text-gray-500 group-hover:text-gray-700'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              {sidebarOpen && (
                <span className="transition-opacity duration-200">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#20C997] to-[#1BA085] flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-semibold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
