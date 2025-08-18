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
    if (seconds <= 60) return 'text-red-600'; // 1 minute or less
    if (seconds <= 300) return 'text-orange-600'; // 5 minutes or less
    if (seconds <= 600) return 'text-yellow-600'; // 10 minutes or less
    return 'text-gray-700';
  };

  const getTimeBackground = (seconds: number) => {
    if (seconds <= 60) return 'bg-red-100'; // 1 minute or less
    if (seconds <= 300) return 'bg-orange-100'; // 5 minutes or less
    if (seconds <= 600) return 'bg-yellow-100'; // 10 minutes or less
    return 'bg-gray-100';
  };

  const getProgressColor = (seconds: number) => {
    if (seconds <= 60) return 'bg-red-500'; // 1 minute or less
    if (seconds <= 300) return 'bg-orange-500'; // 5 minutes or less
    if (seconds <= 600) return 'bg-yellow-500'; // 10 minutes or less
    return 'bg-green-500';
  };

  const progressPercentage = (timeRemaining / totalTime) * 100;
  const isCritical = timeRemaining <= 300; // 5 minutes or less
  const isVeryCritical = timeRemaining <= 60; // 1 minute or less

  return (
    <div className={`flex flex-col gap-2 p-3 rounded-lg border ${getTimeBackground(timeRemaining)} transition-all duration-300 ${isCritical ? 'animate-pulse' : ''}`}>
      {/* Timer Display */}
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 ${getTimeColor(timeRemaining)} ${isVeryCritical ? 'animate-pulse' : ''}`} />
        <div className="flex items-center gap-1">
          <span className={`font-mono font-bold text-lg ${getTimeColor(timeRemaining)} ${isVeryCritical ? 'animate-pulse' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
          <span className="text-gray-400 text-sm">/</span>
          <span className="text-gray-600 text-sm">{formatTime(totalTime)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(timeRemaining)}`}
          style={{ width: `${Math.max(0, progressPercentage)}%` }}
        />
      </div>

      {/* Status Text */}
      {isVeryCritical && (
        <div className="text-xs text-red-600 font-medium text-center animate-pulse">
          ⚠️ Time Critical!
        </div>
      )}
      {isCritical && !isVeryCritical && (
        <div className="text-xs text-orange-600 font-medium text-center">
          ⏰ Time Running Out
        </div>
      )}
    </div>
  );
}
