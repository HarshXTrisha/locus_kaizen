'use client';

import React from 'react';
import { useUser } from '@/lib/store';
import { Calendar, Clock } from '@/lib/icons';

export function WelcomeHeader() {
  const user = useUser();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 17) {
    greeting = 'Good evening';
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user ? `${user.firstName} ${user.lastName}` : 'User'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back to your learning dashboard. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
