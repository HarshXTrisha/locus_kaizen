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
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  Globe,
  Target,
  Calendar,
  Award,
  Clock,
  Trophy,
  GraduationCap,
  Building2
} from 'lucide-react';

export function IIMSidebar() {
  const pathname = usePathname();
  const { user, sidebarOpen, toggleSidebar } = useAppStore();

  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/iim-bba-dbe', icon: Home, description: 'Overview & Analytics' },
    { name: 'Create Quiz', href: '/create', icon: Plus, description: 'Build New Quizzes' },
    { name: 'Upload Files', href: '/upload', icon: Upload, description: 'Import Quiz Content' },
    { name: 'Live Quiz', href: '/live-quiz', icon: Target, description: 'Real-time Sessions' },
    { name: 'Schedule Quiz', href: '/schedule', icon: Calendar, description: 'Plan Future Quizzes' },
    { name: 'Take Quiz', href: '/quiz', icon: Play, description: 'Participate in Quizzes' },
    { name: 'Results', href: '/results', icon: BarChart3, description: 'Performance Analytics' },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, description: 'Top Performers' },
    { name: 'Archive', href: '/archive', icon: Archive, description: 'Past Quizzes' },
    { name: 'Teams', href: '/teams', icon: Users, description: 'Group Management' },
    { name: 'Settings', href: '/settings', icon: Settings, description: 'Account & Preferences' },
  ];

  return (
    <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 lg:border-r lg:border-slate-700 lg:shadow-2xl transition-all duration-300 ${
      sidebarOpen ? 'lg:w-80' : 'lg:w-20'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <Link
          href="/iim-bba-dbe"
          className={`flex items-center gap-4 text-2xl font-bold text-white hover:text-blue-300 transition-colors ${
            !sidebarOpen && 'justify-center w-full'
          }`}
        >
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-400/20">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-white font-bold">IIM BBA DBE</span>
              <span className="text-xs text-slate-400 font-medium">Learning Portal</span>
            </div>
          )}
        </Link>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-r-full" />
              )}
              
              <div className={`p-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <item.icon className={`h-5 w-5 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`} />
              </div>
              
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <span className="transition-opacity duration-200 font-semibold">
                    {item.name}
                  </span>
                  <p className={`text-xs transition-opacity duration-200 ${
                    isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {item.description}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-6 border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className={`flex items-center gap-4 ${!sidebarOpen && 'justify-center'}`}>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-blue-400/20">
            <span className="text-white text-sm font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Online</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Institution Badge */}
      {sidebarOpen && (
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg p-3 border border-slate-600/50">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-white">IIM Bangalore</span>
            </div>
            <p className="text-xs text-slate-300">BBA Digital Business Excellence</p>
          </div>
        </div>
      )}
    </div>
  );
}
