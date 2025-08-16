'use client';

import React from 'react';

interface QuizProgressProps {
  current: number;
  total: number;
  answered: number;
  flagged: number;
}

export function QuizProgress({ current, total, answered, flagged }: QuizProgressProps) {
  const progressPercentage = (answered / total) * 100;

  return (
    <div className="flex items-center gap-4">
      {/* Progress Bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{answered}/{total} answered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#20C997] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#20C997] rounded-full"></div>
          <span className="text-gray-600">{answered} answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-gray-600">{flagged} flagged</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <span className="text-gray-600">{total - answered} remaining</span>
        </div>
      </div>
    </div>
  );
}
