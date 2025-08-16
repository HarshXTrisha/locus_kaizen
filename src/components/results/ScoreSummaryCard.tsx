import React from 'react';

// This component shows the main score and percentage.
// We can make the score and total dynamic later by passing them as props.
export function ScoreSummaryCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Total Score</p>
          <p className="text-4xl font-bold text-gray-900">
            85
            <span className="text-2xl text-gray-400">/100</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Percentage</p>
          <p className="text-4xl font-bold text-green-600">85%</p>
        </div>
      </div>
    </div>
  );
}
