import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import heavy components with loading fallbacks
export const DynamicPerformanceChart = dynamic(
  () => import('@/components/dashboard/PerformanceChart').then(mod => ({ default: mod.PerformanceChart })),
  {
    loading: () => (
      <div className="rounded-lg border border-[#E9ECEF] bg-white p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for charts to avoid hydration issues
  }
);

export const DynamicAnalyticsCharts = dynamic(
  () => import('@/components/results/AnalyticsCharts').then(mod => ({ default: mod.AnalyticsCharts })),
  {
    loading: () => (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export const DynamicTestDataTable = dynamic(
  () => import('@/components/archive/TestDataTable').then(mod => ({ default: mod.TestDataTable })),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

// Firebase components with loading states
export const DynamicFirebaseAuth = dynamic(
  () => import('@/components/auth/LoginFormWithFirebase').then(mod => ({ default: mod.LoginFormWithFirebase })),
  {
    loading: () => (
      <div className="w-full max-w-md rounded-lg border border-[#E9ECEF] bg-white p-8 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ),
  }
);
