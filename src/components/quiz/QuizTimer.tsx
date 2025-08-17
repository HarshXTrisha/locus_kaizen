'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface QuizTimerProps {
  timeRemaining: number;
  totalTime: number;
}

export function QuizTimer({ timeRemaining, totalTime }: QuizTimerProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 300) return 'text-red-600'; // 5 minutes or less
    if (seconds <= 600) return 'text-orange-600'; // 10 minutes or less
    return 'text-gray-700';
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      <Clock className="h-3 w-3 text-gray-500" />
      <span className={`font-mono font-medium ${getTimeColor(timeRemaining)}`}>
        {formatTime(timeRemaining)}
      </span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600">{formatTime(totalTime)}</span>
    </div>
  );
}
