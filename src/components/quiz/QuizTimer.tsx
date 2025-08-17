'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface QuizTimerProps {
  timeRemaining: number;
  totalTime: number;
}

export function QuizTimer({ timeRemaining, totalTime }: QuizTimerProps) {
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
    return 'text-gray-700';
  };

  const progressPercentage = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
      <Clock className="h-5 w-5 text-gray-500" />
      <div className="flex items-center gap-2">
        <span className={`text-lg font-mono font-bold ${getTimeColor(timeRemaining)}`}>
          {formatTime(timeRemaining)}
        </span>
        <span className="text-gray-500 text-sm">/</span>
        <span className="text-gray-600 text-sm">{formatTime(totalTime)}</span>
      </div>
      {timeRemaining <= 300 && (
        <div className="bg-red-100 px-2 py-1 rounded text-xs font-semibold text-red-700">
          URGENT
        </div>
      )}
    </div>
  );
}
