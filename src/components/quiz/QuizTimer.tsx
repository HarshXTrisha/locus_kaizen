'use client';

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface QuizTimerProps {
  timeRemaining: number;
  totalTime?: number;
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
    if (seconds <= 1800) return 'text-orange-600'; // 30 minutes or less
    return 'text-green-600';
  };

  const getTimeBgColor = (seconds: number) => {
    if (seconds <= 300) return 'bg-red-50 border-red-200'; // 5 minutes or less
    if (seconds <= 600) return 'bg-yellow-50 border-yellow-200'; // 10 minutes or less
    if (seconds <= 1800) return 'bg-orange-50 border-orange-200'; // 30 minutes or less
    return 'bg-green-50 border-green-200';
  };

  const getProgressColor = (seconds: number) => {
    if (seconds <= 300) return 'bg-red-500'; // 5 minutes or less
    if (seconds <= 600) return 'bg-yellow-500'; // 10 minutes or less
    if (seconds <= 1800) return 'bg-orange-500'; // 30 minutes or less
    return 'bg-green-500';
  };

  const getTimeIcon = (seconds: number) => {
    if (seconds <= 300) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-current" />;
  };

  const progressPercentage = totalTime ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  return (
    <div className={`flex flex-col gap-2 p-4 rounded-xl border-2 ${getTimeBgColor(timeRemaining)} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getTimeIcon(timeRemaining)}
          <div>
            <p className="text-xs font-medium text-gray-600">Time Remaining</p>
            <p className={`text-xl font-bold font-mono ${getTimeColor(timeRemaining)}`}>
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
        {timeRemaining <= 300 && (
          <div className="bg-red-100 px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-red-700">URGENT</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {totalTime && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(timeRemaining)}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      )}
      
      {/* Time Status */}
      <div className="text-xs text-gray-600">
        {timeRemaining <= 300 && (
          <p className="text-red-600 font-medium">⚠️ Time is running out!</p>
        )}
        {timeRemaining > 300 && timeRemaining <= 600 && (
          <p className="text-yellow-600 font-medium">⏰ Less than 10 minutes remaining</p>
        )}
        {timeRemaining > 600 && timeRemaining <= 1800 && (
          <p className="text-orange-600 font-medium">⏱️ Less than 30 minutes remaining</p>
        )}
        {timeRemaining > 1800 && (
          <p className="text-green-600 font-medium">✅ Plenty of time remaining</p>
        )}
      </div>
    </div>
  );
}
