'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Settings, LogOut, Users, Share2, Plus, Home, Menu } from 'lucide-react';
import { useUser, useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { getUserInvitations } from '@/lib/firebase-collaboration';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  const user = useUser();
  const { signOut } = useAuth();
  const { toggleSidebar } = useAppStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadInvitations = async () => {
      if (!user) return;
      
      try {
        const userInvitations = await getUserInvitations(user.id);
        setInvitations(userInvitations);
      } catch (error) {
        console.error('Error loading invitations:', error);
      }
    };

    loadInvitations();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess('Signed Out', 'You have been successfully signed out');
    } catch (error) {
      showError('Sign Out Failed', 'Failed to sign out. Please try again.');
    }
  };

  const totalNotifications = notifications.length + invitations.length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Left Side - Home Button and Mobile Menu */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Locus Home Button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white rounded-lg hover:from-[#1BA085] hover:to-[#20C997] transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <div className="h-6 w-6 bg-white rounded flex items-center justify-center">
            <Home className="h-4 w-4 text-[#20C997]" />
          </div>
          <span className="font-bold text-lg">Locus</span>
        </Link>
      </div>

      {/* Center - Search Bar */}
      <div className="flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes, results, teams..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-[#20C997] focus:ring-2 focus:ring-[#20C997] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/create"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#20C997] hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </Link>
          <Link
            href="/teams"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#20C997] hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Teams</span>
          </Link>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {totalNotifications > 9 ? '9+' : totalNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {invitations.length > 0 ? (
                  <div className="p-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Invitations ({invitations.length})
                    </h4>
                    {invitations.slice(0, 3).map((invite) => (
                      <div key={invite.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-[#20C997] rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {invite.type === 'team' ? 'Team Invitation' : 'Quiz Collaboration'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {invite.message || 'You have been invited to collaborate'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {invitations.length > 3 && (
                      <Link
                        href="/invitations"
                        className="block text-center text-sm text-[#20C997] hover:text-[#1BA085] py-2"
                      >
                        View all {invitations.length} invitations
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <Link
                  href="/notifications"
                  className="text-sm text-[#20C997] hover:text-[#1BA085] font-medium"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#20C997] to-[#1BA085] flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              
              <div className="py-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/teams"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>My Teams</span>
                </Link>
                <Link
                  href="/shared"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Shared with me</span>
                </Link>
              </div>
              
              <div className="border-t border-gray-200 py-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
