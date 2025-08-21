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

  console.log('Sidebar Debug:', { user, sidebarOpen, pathname });

  if (!user) {
    console.log('Sidebar: No user, returning null');
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
    <div className={`lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-lg transition-all duration-300 ${
      sidebarOpen ? 'lg:w-72' : 'lg:w-20'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 text-xl font-bold text-[#212529] hover:text-[#20C997] transition-colors ${
            !sidebarOpen && 'justify-center w-full'
          }`}
        >
                                 <img 
              src="/logo.png" 
              alt="QuestAI Logo" 
              className="h-8 w-8 object-contain"
            />
          {sidebarOpen && (
            <div className="flex items-center">
              <span className="text-[#212529]">Quest</span>
              <span className="text-[#20C997]">AI</span>
            </div>
          )}
        </Link>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <item.icon className={`h-5 w-5 ${
                  isActive ? 'text-white' : 'text-gray-600'
                }`} />
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
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#20C997] to-[#1BA085] flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
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
