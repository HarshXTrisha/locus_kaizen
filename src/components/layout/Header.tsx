'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getFirebaseAuth } from '@/lib/firebase-utils';
import { Bell, Search, User, LogOut, Settings, Menu, X } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);

  const loadInvitations = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        // Placeholder for invitations - implement when needed
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // If no user, don't render header
  if (!user) {
    return null;
  }

  return (
    <header className="bg-black/80 backdrop-blur-2xl border-b border-white/10 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 rounded-full hover:bg-white/10"
        >
          {showMobileMenu ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Search quizzes, results..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/30 focus:outline-none backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-white/10">
            <Bell className="h-5 w-5 text-white" />
            {invitations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {invitations.length}
              </span>
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10"
            >
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-2xl">
                <span className="text-black text-sm font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-white">
                {user.name || user.email}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="text-sm font-medium text-white">
                    {user.name || 'User'}
                  </div>
                  <div className="text-sm text-white/60 truncate">
                    {user.email}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden mt-4 pb-4 border-t border-white/10">
          <div className="flex flex-col gap-2 pt-4">
            <button
              onClick={() => {
                router.push('/dashboard');
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-2xl"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                router.push('/create');
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-2xl"
            >
              Create Quiz
            </button>
            <button
              onClick={() => {
                router.push('/upload');
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-2xl"
            >
              Upload
            </button>
            <button
              onClick={() => {
                router.push('/settings');
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-2xl"
            >
              Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
