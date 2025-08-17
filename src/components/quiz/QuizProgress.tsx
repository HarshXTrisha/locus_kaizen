'use client';

import React from 'react';
import { CheckCircle, Flag, Clock, Target } from 'lucide-react';

interface QuizProgressProps {
  current: number;
  total: number;
  answered: number;
  flagged: number;
}

export function QuizProgress({ current, total, answered, flagged }: QuizProgressProps) {
  const progressPercentage = (answered / total) * 100;
  const remaining = total - answered;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quiz Progress</h3>
        <div className="text-sm text-gray-600">
          Question {current} of {total}
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Completion</span>
          <span className="font-semibold">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Answered</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{answered}</div>
          <div className="text-xs text-green-600">questions completed</div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Flagged</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">{flagged}</div>
          <div className="text-xs text-yellow-600">for review</div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">{remaining}</div>
          <div className="text-xs text-gray-600">questions left</div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Current</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{current}</div>
          <div className="text-xs text-blue-600">question active</div>
        </div>
      </div>

      {/* Progress Status */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-800">
            {progressPercentage >= 100 ? '🎉 Quiz completed!' : 
             progressPercentage >= 75 ? '🚀 Almost there!' :
             progressPercentage >= 50 ? '📈 Halfway through!' :
             progressPercentage >= 25 ? '💪 Getting started!' : '🎯 Let\'s begin!'}
          </span>
        </div>
      </div>
    </div>
  );
}
