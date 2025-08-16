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
          className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#20C997]/10 rounded-lg group-hover:bg-[#20C997]/20 transition-colors">
              <Plus className="h-6 w-6 text-[#20C997]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Quiz</h3>
              <p className="text-sm text-gray-600">Build a new quiz</p>
            </div>
          </div>
        </Link>

        <Link
          href="/upload"
          className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload Document</h3>
              <p className="text-sm text-gray-600">Create from file</p>
            </div>
          </div>
        </Link>

        <Link
          href="/results"
          className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Results</h3>
              <p className="text-sm text-gray-600">Check performance</p>
            </div>
          </div>
        </Link>

        <Link
          href="/archive"
          className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quiz Archive</h3>
              <p className="text-sm text-gray-600">Manage quizzes</p>
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
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <PerformanceChart results={results} />
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <RecentHistory 
            recentQuizzes={recentQuizzes}
            recentResults={recentResults}
          />
        </div>
      </div>

      {/* Recent Quizzes */}
      {recentQuizzes.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Quizzes</h3>
            <Link
              href="/archive"
              className="text-[#20C997] hover:text-[#1BA085] text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#20C997] transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">{quiz.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{quiz.questions.length} questions</span>
                  <span>{quiz.timeLimit} min</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="flex-1 bg-[#20C997] text-white text-center py-2 px-3 rounded-lg text-sm hover:bg-[#1BA085] transition-colors"
                  >
                    Take Quiz
                  </Link>
                  <Link
                    href={`/results?quiz=${quiz.id}`}
                    className="flex-1 border border-[#20C997] text-[#20C997] text-center py-2 px-3 rounded-lg text-sm hover:bg-[#20C997] hover:text-white transition-colors"
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
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#20C997]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-[#20C997]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Started with Your First Quiz</h3>
            <p className="text-gray-600 mb-6">
              Create your first quiz to start testing knowledge and tracking performance.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/create"
                className="bg-[#20C997] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1BA085] transition-colors"
              >
                Create Quiz
              </Link>
              <Link
                href="/upload"
                className="border border-[#20C997] text-[#20C997] px-6 py-3 rounded-lg font-medium hover:bg-[#20C997] hover:text-white transition-colors"
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
