'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  ArrowLeft, User, Settings, Bell, Shield, Palette, 
  Download, Upload, LogOut, Edit, Camera, Save, X
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';

export default function MobileProfile() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    avatar: user?.avatar || '',
    bio: 'Quiz enthusiast and lifelong learner',
    notifications: {
      email: true,
      push: true,
      results: true,
      reminders: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      privacy: 'public'
    }
  });

  const handleSave = useCallback(() => {
    // TODO: Implement save logic
    showSuccess('Profile Updated', 'Your profile has been updated successfully!');
    setIsEditing(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  const renderProfile = () => (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className={mobileClasses.card + " text-center"}>
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
            {profileData.avatar ? (
              <Image 
                src={profileData.avatar} 
                alt="Profile" 
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-gray-400" />
            )}
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full">
              <Camera size={16} />
            </button>
          )}
        </div>
        
        <h2 className={mobileClasses.text.h2 + " mb-2"}>{profileData.name}</h2>
        <p className="text-sm text-gray-600 mb-4">{profileData.email}</p>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={mobileClasses.button.secondary + " flex items-center gap-2 mx-auto"}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Form */}
      {isEditing && (
        <div className={mobileClasses.card}>
          <h3 className={mobileClasses.text.h3 + " mb-3"}>Edit Profile</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className={mobileClasses.input}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className={mobileClasses.input}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className={mobileClasses.input + " h-20"}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className={mobileClasses.button.secondary + " flex-1"}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={mobileClasses.button.primary + " flex-1 flex items-center justify-center gap-2"}
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Your Stats</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">25</p>
            <p className="text-xs text-gray-600">Quizzes Taken</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">85%</p>
            <p className="text-xs text-gray-600">Average Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-600">Quizzes Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">8h</p>
            <p className="text-xs text-gray-600">Total Time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4">
      {/* Notifications */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Notifications</h3>
        
        <div className="space-y-3">
          {Object.entries(profileData.notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {key} notifications
                </p>
                <p className="text-xs text-gray-600">
                  {key === 'email' && 'Receive email notifications'}
                  {key === 'push' && 'Receive push notifications'}
                  {key === 'results' && 'Get notified when results are ready'}
                  {key === 'reminders' && 'Receive quiz reminders'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setProfileData({
                  ...profileData,
                  notifications: {
                    ...profileData.notifications,
                    [key]: e.target.checked
                  }
                })}
                className="h-4 w-4 text-green-600"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Privacy</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={profileData.preferences.privacy}
              onChange={(e) => setProfileData({
                ...profileData,
                preferences: {
                  ...profileData.preferences,
                  privacy: e.target.value
                }
              })}
              className={mobileClasses.input}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={profileData.preferences.timezone}
              onChange={(e) => setProfileData({
                ...profileData,
                preferences: {
                  ...profileData.preferences,
                  timezone: e.target.value
                }
              })}
              className={mobileClasses.input}
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">GMT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Data Management</h3>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Download size={20} className="text-blue-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Export Data</p>
                <p className="text-xs text-gray-600">Download your quiz data</p>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Upload size={20} className="text-green-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Import Data</p>
                <p className="text-xs text-gray-600">Import quiz data from file</p>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50 text-red-600">
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <div className="text-left">
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs">Permanently delete your account</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-4">
      {/* Theme */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Appearance</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'auto'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => setProfileData({
                    ...profileData,
                    preferences: {
                      ...profileData.preferences,
                      theme
                    }
                  })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium capitalize ${
                    profileData.preferences.theme === theme
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={profileData.preferences.language}
              onChange={(e) => setProfileData({
                ...profileData,
                preferences: {
                  ...profileData.preferences,
                  language: e.target.value
                }
              })}
              className={mobileClasses.input}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Accessibility</h3>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">High Contrast</p>
              <p className="text-xs text-gray-600">Increase contrast for better visibility</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-green-600" />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Large Text</p>
              <p className="text-xs text-gray-600">Increase text size for better readability</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-green-600" />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Screen Reader</p>
              <p className="text-xs text-gray-600">Enable screen reader support</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-green-600" />
          </label>
        </div>
      </div>

      {/* Logout */}
      <div className={mobileClasses.card}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={mobileClasses.text.h1}>Profile</h1>
            <p className="text-xs text-gray-600">Manage your account</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'preferences', label: 'Preferences', icon: Palette }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'preferences' && renderPreferences()}
      </div>
    </div>
  );
}
