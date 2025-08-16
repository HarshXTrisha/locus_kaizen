'use client';

import React from 'react';
import { Search, Bell, User } from '@/lib/icons';
import { useUser } from '@/lib/store';
import Image from 'next/image';

export function Header() {
  const user = useUser();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes, results..."
            className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-[#20C997] focus:ring-[#20C997]"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
