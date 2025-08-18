import React from 'react';
import { User } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function AppHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Replace with your SVG logo if you have it */}
            <h1 className="text-2xl font-bold text-gray-900">Locus</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Dashboard</a>
            <a href="/create" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Create Quiz</a>
            <a href="/upload" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Upload</a>
            <a href="/archive" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Quiz Management</a>
            <a href="/results" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Results</a>
            <a href="/settings" className="text-sm font-medium text-green-600 border-b-2 border-green-600 pb-1">Profile</a>
          </nav>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={20} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
