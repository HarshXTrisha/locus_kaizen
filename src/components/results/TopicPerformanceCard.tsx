import React from 'react';

// A single row in the performance list
const PerformanceItem = ({ subject, color, percentage }: { subject: string; color: string; percentage: number }) => {
  return (
    <a href="#" className="block rounded-lg border border-transparent p-4 transition-all hover:border-gray-200 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-800">{subject}</p>
        <div className="flex items-center gap-4">
          <div className="h-2 w-32 rounded-full bg-gray-200">
            <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
          </div>
          <p className={`text-sm font-semibold ${color.replace('bg-', 'text-')}-600`}>{percentage}%</p>
          {/* We can replace this with a proper icon later */}
          <span className="material-icons-outlined text-gray-400">chevron_right</span>
        </div>
      </div>
    </a>
  );
};

// The main card component that holds the list of items
export function TopicPerformanceCard() {
  const topics = [
    { subject: 'Mathematics', color: 'bg-blue-500', percentage: 90 },
    { subject: 'Science', color: 'bg-green-500', percentage: 75 },
    { subject: 'English', color: 'bg-yellow-500', percentage: 60 },
    { subject: 'History', color: 'bg-purple-500', percentage: 82 },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900">Topic Performance</h3>
      <div className="mt-4 space-y-4">
        {topics.map((topic) => (
          <PerformanceItem key={topic.subject} {...topic} />
        ))}
      </div>
    </div>
  );
}
