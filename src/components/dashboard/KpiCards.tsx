import React from 'react';
import { Target, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

// A single, reusable KPI card
const KpiCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => {
  return (
    <div className="rounded-lg border border-[#E9ECEF] bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-[#6C757D]">{title}</p>
          <p className="text-2xl font-semibold text-[#212529]">{value}</p>
        </div>
      </div>
    </div>
  );
};

// The main component that arranges all the KPI cards in a grid
export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Average Score" value="84%" icon={<Target size={24} />} />
      <KpiCard title="Tests Completed" value="12" icon={<CheckCircle size={24} />} />
      <KpiCard title="Strongest Subject" value="Maths" icon={<TrendingUp size={24} />} />
      <KpiCard title="Weakest Subject" value="English" icon={<TrendingDown size={24} />} />
    </div>
  );
}
