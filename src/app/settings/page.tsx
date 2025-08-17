'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { User, Shield, Bell, Palette, Database, Key, Save, X, Check } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SettingsPage() {
  const { user } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedName, setLastSavedName] = useState(user?.name || '');

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
      setLastSavedName(user.name);
    }
  }, [user?.name]);

  const handleNameUpdate = async () => {
    if (!name.trim() || name === lastSavedName) {
      setIsEditingName(false);
      return;
    }

    setIsAutoSaving(true);
    try {
      // Get the current user's ID token
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Update in our database
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: user?.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile in database');
      }

      // Update local state
      useAppStore.getState().setUser({
        ...user!,
        name: name.trim()
      });

      // Update Firebase Auth displayName
      if (auth && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }

      setLastSavedName(name.trim());
      setIsEditingName(false);
      showSuccess('Profile Updated', 'Your name has been updated successfully');
    } catch (error) {
      console.error('Error updating name:', error);
      showError('Update Failed', 'Failed to update your name. Please try again.');
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleAutoSave = useCallback(async () => {
    if (!name.trim() || name === lastSavedName) {
      return;
    }

    setIsAutoSaving(true);
    try {
      // Get the current user's ID token
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Update in our database
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: user?.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile in database');
      }

      // Update local state
      useAppStore.getState().setUser({
        ...user!,
        name: name.trim()
      });

      // Update Firebase Auth displayName
      if (auth && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }

      setLastSavedName(name.trim());
      showSuccess('Auto-saved', 'Your name has been automatically updated');
    } catch (error) {
      console.error('Error auto-saving name:', error);
      showError('Auto-save Failed', 'Failed to auto-save your name. Please try saving manually.');
    } finally {
      setIsAutoSaving(false);
    }
  }, [name, lastSavedName, user]);

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (name !== lastSavedName && name.trim()) {
        handleAutoSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [name, lastSavedName, handleAutoSave]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account preferences and security settings.
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="flex items-center gap-3">
                  {isEditingName ? (
                    <>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                        placeholder="Enter your name"
                      />
                      <button
                        onClick={handleNameUpdate}
                        disabled={isAutoSaving}
                        className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors disabled:opacity-50"
                      >
                        {isAutoSaving ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setName(lastSavedName);
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <span className="text-gray-900">{name || 'Not set'}</span>
                      </div>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
                {isAutoSaving && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Auto-saving...
                  </div>
                )}
                {!isAutoSaving && name === lastSavedName && name && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    Saved
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Email address cannot be changed. Contact support if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <button className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors">
                  Configure
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Get instant notifications</p>
                </div>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Appearance</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Theme</h3>
                  <p className="text-sm text-gray-600">Choose your preferred theme</p>
                </div>
                <button className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors">
                  Light
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Font Size</h3>
                  <p className="text-sm text-gray-600">Adjust text size for better readability</p>
                </div>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Medium
                </button>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Data & Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600">Download your quiz data</p>
                </div>
                <button className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors">
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* API & Integrations */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Key className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">API & Integrations</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">API Keys</h3>
                  <p className="text-sm text-gray-600">Manage your API access</p>
                </div>
                <button className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors">
                  Manage
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Third-party Integrations</h3>
                  <p className="text-sm text-gray-600">Connect with other services</p>
                </div>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
