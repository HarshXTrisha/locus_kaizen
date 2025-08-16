import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ScoreSummaryCard } from '@/components/results/ScoreSummaryCard';
import { TopicPerformanceCard } from '@/components/results/TopicPerformanceCard';
import { KeyInsights } from '@/components/results/KeyInsights';
import { DynamicAnalyticsCharts } from '@/lib/dynamic-imports';
import { Plus, BarChart3, TrendingUp } from '@/lib/icons';
import Link from 'next/link';

export default function ResultsPage() {
  const recentResults = [
    { id: '1', title: 'JavaScript Fundamentals', score: 85, date: '2024-01-15' },
    { id: '2', title: 'React Basics', score: 92, date: '2024-01-14' },
    { id: '3', title: 'TypeScript Advanced', score: 78, date: '2024-01-13' },
    { id: '4', title: 'Next.js Framework', score: 88, date: '2024-01-12' },
  ];

  return (
    <ProtectedRoute>
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Results Dashboard
              </h2>
              <Link
                href="/create"
                className="flex items-center gap-2 bg-[#20C997] text-white px-4 py-2 rounded-lg hover:bg-[#1BA085] transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create New Quiz
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Results</h3>
                <Link
                  href="/archive"
                  className="text-[#20C997] hover:text-[#1BA085] transition-colors"
                >
                  View All Results
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/results/${result.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-[#20C997] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="h-5 w-5 text-[#20C997]" />
                      <span className="text-sm text-gray-500">{result.date}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{result.title}</h4>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#20C997]" />
                      <span className="text-lg font-bold text-[#20C997]">{result.score}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <ScoreSummaryCard />
            <TopicPerformanceCard />
            <DynamicAnalyticsCharts />
            <KeyInsights />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
