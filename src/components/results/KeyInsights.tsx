import React from 'react';
import { TrendingUp, TrendingDown, Timer } from 'lucide-react'; // Using icons for a premium feel

// A reusable card for a single insight
const InsightCard = ({ icon, title, children, bgColor, iconColor }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  bgColor: string;
  iconColor: string;
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${bgColor} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="mt-1 text-gray-600">{children}</p>
        </div>
      </div>
    </div>
  );
};

// The main component that holds all the insight cards
export function KeyInsights() {
  return (
    <div>
      <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900">Key Insights</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InsightCard
          icon={<TrendingUp size={28} />}
          title="Strongest Areas"
          bgColor="bg-green-100"
          iconColor="text-green-600"
        >
          You excelled in <span className="font-semibold text-gray-800">Mathematics</span> and{' '}
          <span className="font-semibold text-gray-800">History</span>, showing great
          understanding of core concepts.
        </InsightCard>

        <InsightCard
          icon={<TrendingDown size={28} />}
          title="Weakest Areas"
          bgColor="bg-red-100"
          iconColor="text-red-600"
        >
          There is room for improvement in <span className="font-semibold text-gray-800">English</span>,
          particularly in grammar and comprehension sections.
        </InsightCard>

        <InsightCard
          icon={<Timer size={28} />}
          title="Average Time"
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        >
          Your average time per question was <span className="font-semibold text-gray-800">2 minutes</span>.
          Focusing on time management could boost your score.
        </InsightCard>
      </div>
    </div>
  );
}
