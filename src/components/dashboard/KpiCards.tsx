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
    if (score >= 80) return 'text-primary-1';
    if (score >= 60) return 'text-accent';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-5 w-5 text-primary-1" />;
    if (score >= 60) return <Target className="h-5 w-5 text-accent" />;
    return <TrendingDown className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Quizzes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-dark/70">Total Quizzes</p>
            <p className="text-2xl font-bold text-neutral-dark">{totalQuizzes}</p>
          </div>
          <div className="p-3 bg-primary-1/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary-1" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-neutral-dark/70">
            <span>Created quizzes</span>
          </div>
        </div>
      </div>

      {/* Total Results */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-dark/70">Total Results</p>
            <p className="text-2xl font-bold text-neutral-dark">{totalResults}</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg">
            <Award className="h-6 w-6 text-accent" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-neutral-dark/70">
            <span>Completed tests</span>
          </div>
        </div>
      </div>

      {/* Average Score */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-dark/70">Average Score</p>
            <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}%
            </p>
          </div>
          <div className="p-3 bg-primary-2/10 rounded-lg">
            {getScoreIcon(averageScore)}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-neutral-dark/70">
            <span>Performance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
