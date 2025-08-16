import React from 'react';

// Sample data - this would come from your Firebase database
const recentTests = [
  { id: 1, title: 'Calculus I Quiz', score: '91%' },
  { id: 2, title: 'Biology Cell Structure Test', score: '88%' },
  { id: 3, title: 'World War II Exam', score: '80%' },
];

export function RecentHistory() {
  return (
    <div className="rounded-lg border border-[#E9ECEF] bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6C757D]">
        Recent History
      </h3>
      <div className="space-y-4">
        {recentTests.map((test) => (
          <div key={test.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#212529]">{test.title}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold text-[#212529]">{test.score}</p>
              <a
                href={`/results/${test.id}`} // This would link to the specific result page
                className="text-sm font-semibold text-[#20C997] hover:underline"
              >
                View Analysis &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
