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
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">Total Quizzes</p>
            <p className="text-2xl font-bold text-white">{totalQuizzes}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl shadow-2xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-white/70">
            <span>Created quizzes</span>
          </div>
        </div>
      </div>

      {/* Total Results */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">Total Results</p>
            <p className="text-2xl font-bold text-white">{totalResults}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl shadow-2xl">
            <Award className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-white/70">
            <span>Completed tests</span>
          </div>
        </div>
      </div>

             {/* Average Score */}
       <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-white/70">Average Score</p>
             <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
               {averageScore}%
             </p>
           </div>
           <div className="p-3 bg-white/10 rounded-2xl shadow-2xl">
             {getScoreIcon(averageScore)}
           </div>
         </div>
         <div className="mt-4">
           <div className="flex items-center text-sm text-white/70">
             <span>Performance</span>
           </div>
         </div>
       </div>
    </div>
  );
}
