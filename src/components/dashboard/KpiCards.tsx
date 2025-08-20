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
    if (score >= 80) return 'text-white';
    if (score >= 60) return 'text-white/80';
    return 'text-white/60';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-5 w-5 text-white" />;
    if (score >= 60) return <Target className="h-5 w-5 text-white/80" />;
    return <TrendingDown className="h-5 w-5 text-white/60" />;
  };

    return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Quizzes */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-white/10 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60 mb-2">Total Quizzes</p>
            <p className="text-4xl font-bold text-white mb-1">{totalQuizzes}</p>
            <p className="text-xs text-white/50">Created quizzes</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Total Results */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-white/10 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60 mb-2">Total Results</p>
            <p className="text-4xl font-bold text-white mb-1">{totalResults}</p>
            <p className="text-xs text-white/50">Completed tests</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Average Score */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-white/10 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60 mb-2">Average Score</p>
            <p className={`text-4xl font-bold text-white mb-1`}>
              {averageScore}%
            </p>
            <p className="text-xs text-white/50">Performance</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
            {getScoreIcon(averageScore)}
          </div>
        </div>
      </div>
    </div>
  );
}
