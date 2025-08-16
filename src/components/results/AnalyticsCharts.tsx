import React from 'react';

// This component holds both the Correct/Incorrect and Time Spent charts
export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Correct vs Incorrect Chart */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">Correct vs Incorrect</h3>
        <div className="mt-4 flex h-full items-end justify-center gap-8">
          <div className="flex flex-col items-center">
            <div
              className="w-12 rounded-t-lg bg-green-500"
              style={{ height: '85%' }}
            ></div>
            <p className="mt-2 text-center text-xs text-gray-600">
              Correct
              <br />
              (85)
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-12 rounded-t-lg bg-red-400"
              style={{ height: '15%' }}
            ></div>
            <p className="mt-2 text-center text-xs text-gray-600">
              Incorrect
              <br />
              (15)
            </p>
          </div>
        </div>
      </div>

      {/* Time Spent per Question Chart */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">Time Spent per Question</h3>
        <div className="mt-4 flex-grow flex items-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 150"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="line-chart-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="150"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#22c55e" stopOpacity="0.2"></stop>
                <stop offset="1" stopColor="#22c55e" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path
              d="M0 150V75L50 90L100 60L150 82.5L200 67.5L250 97.5L300 52.5L350 75L400 45V150H0Z"
              fill="url(#line-chart-gradient)"
            ></path>
            <path
              d="M0 75L50 90L100 60L150 82.5L200 67.5L250 97.5L300 52.5L350 75L400 45"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </div>
        <p className="mt-2 text-center text-sm text-gray-600">
          Average: ~2 min / question
        </p>
      </div>
    </div>
  );
}
