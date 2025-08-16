import React from 'react';
import { ScoreSummaryCard } from '@/components/results/ScoreSummaryCard';
import { TopicPerformanceCard } from '@/components/results/TopicPerformanceCard';
import { KeyInsights } from '@/components/results/KeyInsights';
import { DynamicAnalyticsCharts } from '@/lib/dynamic-imports';

// This will be our main page for the Results Dashboard
export default function ResultsPage() {
  return (
    <main className="flex-grow bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          
          {/* Header section of the results page */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Results Dashboard
            </h2>
            {/* We will turn the buttons into a component later */}
          </div>

          {/* Use the new component here */}
          <ScoreSummaryCard />

          {/* 2. Use the new component here */}
          <TopicPerformanceCard />
          <DynamicAnalyticsCharts />
          <KeyInsights />

        </div>
      </div>
    </main>
  );
}
