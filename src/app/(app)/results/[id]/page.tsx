import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ScoreSummaryCard } from '@/components/results/ScoreSummaryCard';
import { TopicPerformanceCard } from '@/components/results/TopicPerformanceCard';
import { KeyInsights } from '@/components/results/KeyInsights';
import { DynamicAnalyticsCharts } from '@/lib/dynamic-imports';
import { ArrowLeft } from '@/lib/icons';
import Link from 'next/link';

interface ResultPageProps {
  params: {
    id: string;
  };
}

export default function IndividualResultPage({ params }: ResultPageProps) {
  const resultId = params.id;

  return (
    <ProtectedRoute>
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/results"
                  className="flex items-center gap-2 text-[#20C997] hover:text-[#1BA085] transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Results
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Result #{resultId}
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                Quiz completed on {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quiz Result Details</h3>
                  <p className="text-sm text-gray-600">Result ID: {resultId}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#20C997]">85%</div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
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
