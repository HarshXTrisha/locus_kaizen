'use client';

import React from 'react';
import { useQuizzes, useQuizResults, useUser } from '@/lib/store';
import { WelcomeHeader } from './WelcomeHeader';
import { KpiCards } from './KpiCards';
import { PerformanceChart } from './PerformanceChart';
import { RecentHistory } from './RecentHistory';
import { Plus, BookOpen, TrendingUp, Target } from '@/lib/icons';
import Link from 'next/link';

export function Dashboard() {
  const quizzes = useQuizzes();
  const results = useQuizResults();
  const user = useUser();

  // Calculate dashboard statistics
  const totalQuizzes = quizzes.length;
  const totalResults = results.length;
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
    : 0;
  const recentQuizzes = quizzes.slice(0, 5);
  const recentResults = results.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/create"
          className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors shadow-2xl">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Create Quiz</h3>
              <p className="text-sm text-white/70">Build a new quiz</p>
            </div>
          </div>
        </Link>

        <Link
          href="/upload"
          className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors shadow-2xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Upload JSON</h3>
              <p className="text-sm text-white/70">Create from JSON files</p>
            </div>
          </div>
        </Link>

        <Link
          href="/results"
          className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors shadow-2xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">View Results</h3>
              <p className="text-sm text-white/70">Check performance</p>
            </div>
          </div>
        </Link>

        <Link
          href="/archive"
          className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors shadow-2xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Quiz Archive</h3>
              <p className="text-sm text-white/70">Manage quizzes</p>
            </div>
          </div>
        </Link>
      </div>

      {/* KPI Cards */}
      <KpiCards 
        totalQuizzes={totalQuizzes}
        totalResults={totalResults}
        averageScore={averageScore}
      />

             {/* Charts and Analytics */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
           <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
           <PerformanceChart results={results} />
         </div>

         <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
           <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
           <RecentHistory 
             recentQuizzes={recentQuizzes}
             recentResults={recentResults}
           />
         </div>
       </div>

             {/* Recent Quizzes */}
       {recentQuizzes.length > 0 && (
         <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-white">Recent Quizzes</h3>
             <Link
               href="/archive"
               className="text-white/80 hover:text-white text-sm font-medium"
             >
               View All
             </Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {recentQuizzes.map((quiz) => (
               <div key={quiz.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                 <h4 className="font-medium text-white mb-2">{quiz.title}</h4>
                 <p className="text-sm text-white/70 mb-3">{quiz.description}</p>
                 <div className="flex items-center justify-between text-sm text-white/60">
                   <span>{quiz.questions.length} questions</span>
                   <span>{quiz.timeLimit} min</span>
                 </div>
                 <div className="mt-3 flex gap-2">
                   <Link
                     href={`/quiz/${quiz.id}`}
                     className="flex-1 bg-white text-black text-center py-2 px-3 rounded-full text-sm hover:bg-white/90 transition-all duration-300 font-medium"
                   >
                     Take Quiz
                   </Link>
                   <Link
                     href={`/results?quiz=${quiz.id}`}
                     className="flex-1 border border-white/30 text-white text-center py-2 px-3 rounded-full text-sm hover:bg-white/10 transition-all duration-300"
                   >
                     Results
                   </Link>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

             {/* Empty State */}
       {quizzes.length === 0 && (
         <div className="bg-white/5 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl text-center">
           <div className="max-w-md mx-auto">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
               <Plus className="h-8 w-8 text-white" />
             </div>
             <h3 className="text-lg font-semibold text-white mb-2">Get Started with Your First Quiz</h3>
             <p className="text-white/70 mb-6">
               Create your first quiz to start testing knowledge and tracking performance.
             </p>
             <div className="flex gap-3 justify-center">
               <Link
                 href="/create"
                 className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-white/90 transition-all duration-300 shadow-2xl"
               >
                 Create Quiz
               </Link>
               <Link
                 href="/upload"
                 className="border border-white/30 text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-all duration-300"
               >
                 Upload Document
               </Link>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
