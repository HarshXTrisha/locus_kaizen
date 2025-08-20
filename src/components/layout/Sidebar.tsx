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
    <div className={`lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-gradient-to-b from-black/95 to-black/90 lg:backdrop-blur-3xl lg:border-r lg:border-white/20 lg:shadow-2xl transition-all duration-500 ${
      sidebarOpen ? 'lg:w-80' : 'lg:w-24'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
        <Link
          href="/dashboard"
          className={`flex items-center gap-4 text-2xl font-bold text-white hover:text-white/80 transition-all duration-300 ${
            !sidebarOpen && 'justify-center w-full'
          }`}
        >
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
            <Target className="h-6 w-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex items-center">
              <span className="text-white font-bold">Quest</span>
              <span className="text-white/80 font-light">AI</span>
            </div>
          )}
        </Link>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-3 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-110"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-6 w-6 text-white" />
          ) : (
            <ChevronRight className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-4 px-4 py-4 rounded-3xl text-base font-medium transition-all duration-500 ${
                isActive
                  ? 'bg-gradient-to-r from-white to-white/90 text-black shadow-2xl scale-105'
                  : 'text-white/80 hover:bg-white/10 hover:text-white hover:scale-105'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all duration-500 ${
                isActive 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl' 
                  : 'bg-white/10 group-hover:bg-white/20 group-hover:scale-110'
              }`}>
                <item.icon className={`h-6 w-6 ${
                  isActive ? 'text-white' : 'text-white'
                }`} />
              </div>
              {sidebarOpen && (
                <span className="transition-all duration-300 font-medium">
                  {item.name}
                </span>
              )}
              {isActive && (
                <div className="absolute right-2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-6 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10">
        <div className={`flex items-center gap-4 ${!sidebarOpen && 'justify-center'}`}>
          <div className="h-12 w-12 rounded-3xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
            <span className="text-white text-sm font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-white/60 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
