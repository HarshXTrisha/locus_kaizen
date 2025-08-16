'use client';

import React from 'react';
import { TrendingUp, TrendingDown, BookOpen, Target, Award } from '@/lib/icons';

interface KpiCardsProps {
  totalQuizzes: number;
  totalResults: number;
  averageScore: number;
}

export function KpiCards({ totalQuizzes, totalResults, averageScore }: KpiCardsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <Target className="h-5 w-5 text-yellow-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Quizzes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
            <p className="text-2xl font-bold text-gray-900">{totalQuizzes}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-600">
            <span>Created quizzes</span>
          </div>
        </div>
      </div>

      {/* Total Results */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Results</p>
            <p className="text-2xl font-bold text-gray-900">{totalResults}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Award className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-600">
            <span>Completed tests</span>
          </div>
        </div>
      </div>

      {/* Average Score */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Score</p>
            <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}%
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            {getScoreIcon(averageScore)}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-600">
            <span>Performance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
