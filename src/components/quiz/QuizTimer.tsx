'use client';

import React from 'react';
import { Clock } from '@/lib/icons';

interface QuizTimerProps {
  timeRemaining: number;
}

export function QuizTimer({ timeRemaining }: QuizTimerProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 300) return 'text-red-600'; // 5 minutes or less
    if (seconds <= 600) return 'text-yellow-600'; // 10 minutes or less
    return 'text-gray-600';
  };

  const getTimeBgColor = (seconds: number) => {
    if (seconds <= 300) return 'bg-red-100'; // 5 minutes or less
    if (seconds <= 600) return 'bg-yellow-100'; // 10 minutes or less
    return 'bg-gray-100';
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getTimeBgColor(timeRemaining)}`}>
      <Clock className={`h-4 w-4 ${getTimeColor(timeRemaining)}`} />
      <span className={`font-mono font-semibold ${getTimeColor(timeRemaining)}`}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
