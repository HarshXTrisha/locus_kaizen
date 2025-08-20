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
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {greeting}, {user ? (user.firstName || user.name || 'User') : 'User'}! 👋
          </h1>
          <p className="text-white/70 text-lg">
            Welcome back to your learning dashboard. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-6 mt-6 md:mt-0">
          <div className="flex items-center gap-3 text-sm text-white/60 bg-white/10 px-4 py-2 rounded-full">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60 bg-white/10 px-4 py-2 rounded-full">
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
