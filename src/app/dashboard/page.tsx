import React from 'react';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { RecentHistory } from '@/components/dashboard/RecentHistory';
import { DynamicPerformanceChart } from '@/lib/dynamic-imports';

// This is our new main Dashboard page
export default function DashboardPage() {
  return (
    <main className="flex-grow bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          
          {/* Use the new WelcomeHeader component here */}
          <WelcomeHeader userName="Sanjay" />

          {/* 2. Use the new KpiCards component here */}
          <KpiCards />

          {/* 3. Use the dynamic PerformanceChart component here */}
          <DynamicPerformanceChart />

          {/* 4. Use the final component here */}
          <RecentHistory />

        </div>
      </div>
    </main>
  );
}
