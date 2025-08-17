'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ContentTable } from '@/components/common/ContentTable';
import { User, Shield, Bell, Palette, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppStore();
  const [contentItems, setContentItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Set content table items
    const items = [
      { id: 'profile-settings', title: 'Profile Settings', level: 1 },
      { id: 'security-settings', title: 'Security Settings', level: 1 },
      { id: 'notification-settings', title: 'Notification Settings', level: 1 },
      { id: 'appearance-settings', title: 'Appearance Settings', level: 1 },
      { id: 'data-settings', title: 'Data & Privacy', level: 1 },
      { id: 'api-settings', title: 'API & Integrations', level: 1 }
    ];
    setContentItems(items);
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div id="profile-settings" className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account preferences and security settings.</p>
            </div>

            {/* Profile Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-[#20C997] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
                  />
                </div>
                <button className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors">
                  Update Profile
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div id="security-settings" className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-[#20C997] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
                  />
                </div>
                <button className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors">
                  Change Password
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div id="notification-settings" className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Bell className="h-6 w-6 text-[#20C997] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-[#20C997] focus:ring-[#20C997]" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-[#20C997] focus:ring-[#20C997]" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Quiz Reminders</h3>
                    <p className="text-sm text-gray-500">Get reminded about upcoming quizzes</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-[#20C997] focus:ring-[#20C997]" />
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div id="appearance-settings" className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Palette className="h-6 w-6 text-[#20C997] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Appearance Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]">
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div id="data-settings" className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Database className="h-6 w-6 text-[#20C997] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Data & Privacy</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Data Analytics</h3>
                    <p className="text-sm text-gray-500">Allow us to collect usage data to improve the service</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-[#20C997] focus:ring-[#20C997]" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Personalized Content</h3>
                    <p className="text-sm text-gray-500">Show personalized quiz recommendations</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-[#20C997] focus:ring-[#20C997]" defaultChecked />
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Export My Data
                </button>
              </div>
            </div>

            {/* API & Integrations */}
            <div id="api-settings" className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Key className="h-6 w-6 text-[#20C997] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">API & Integrations</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <div className="flex">
                    <input
                      type="text"
                      value="sk-...1234567890abcdef"
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                    />
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 transition-colors">
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://your-domain.com/webhook"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
                  />
                </div>
                <button className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors">
                  Regenerate API Key
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Content Table */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ContentTable items={contentItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
