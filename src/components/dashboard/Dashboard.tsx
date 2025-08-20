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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/create"
          className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2">Create Quiz</h3>
              <p className="text-sm text-white/70">Build a new quiz</p>
            </div>
          </div>
        </Link>

        <Link
          href="/upload"
          className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2">Upload JSON</h3>
              <p className="text-sm text-white/70">Create from JSON files</p>
            </div>
          </div>
        </Link>

        <Link
          href="/results"
          className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2">View Results</h3>
              <p className="text-sm text-white/70">Check performance</p>
            </div>
          </div>
        </Link>

        <Link
          href="/archive"
          className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2">Quiz Archive</h3>
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
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:bg-white/15 hover:border-white/40 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <h4 className="font-bold text-white text-lg mb-3">{quiz.title}</h4>
                    <p className="text-sm text-white/70 mb-4 leading-relaxed">{quiz.description}</p>
                    <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                        {quiz.questions.length} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-full"></div>
                        {quiz.timeLimit} min
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/quiz/${quiz.id}`}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 px-4 rounded-2xl text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        Take Quiz
                      </Link>
                      <Link
                        href={`/results?quiz=${quiz.id}`}
                        className="flex-1 border border-white/30 text-white text-center py-3 px-4 rounded-2xl text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-medium"
                      >
                        Results
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
         </div>
       )}

             {/* Empty State */}
               {quizzes.length === 0 && (
          <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-16 rounded-3xl border border-white/20 shadow-2xl text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Plus className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Get Started with Your First Quiz</h3>
              <p className="text-white/70 mb-8 text-lg leading-relaxed">
                Create your first quiz to start testing knowledge and tracking performance.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/create"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-xl hover:scale-105"
                >
                  Create Quiz
                </Link>
                <Link
                  href="/upload"
                  className="border border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
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
