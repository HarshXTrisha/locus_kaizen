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
    <div className={`lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-black/90 lg:backdrop-blur-2xl lg:border-r lg:border-white/10 lg:shadow-2xl transition-all duration-300 ${
      sidebarOpen ? 'lg:w-72' : 'lg:w-20'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 bg-black/50">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 text-xl font-bold text-white hover:text-white/80 transition-colors ${
            !sidebarOpen && 'justify-center w-full'
          }`}
        >
          <div className="h-8 w-8 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Target className="h-5 w-5 text-black" />
          </div>
          {sidebarOpen && (
            <div className="flex items-center">
              <span className="text-white">Quest</span>
              <span className="text-white/80">AI</span>
            </div>
          )}
        </Link>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5 text-white" />
          ) : (
            <ChevronRight className="h-5 w-5 text-white" />
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
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group ${
                isActive
                  ? 'bg-white text-black shadow-2xl'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-black/20' 
                  : 'bg-white/10 group-hover:bg-white/20'
              }`}>
                <item.icon className={`h-5 w-5 ${
                  isActive ? 'text-black' : 'text-white'
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
      <div className="p-4 border-t border-white/10 bg-black/50">
        <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <span className="text-black text-sm font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
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
