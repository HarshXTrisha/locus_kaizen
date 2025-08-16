'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Sample data - in a real app, you would fetch this from Firebase
const chartData = [
  { name: 'Test 1', score: 65 },
  { name: 'Test 2', score: 78 },
  { name: 'Test 3', score: 75 },
  { name: 'Test 4', score: 82 },
  { name: 'Test 5', score: 80 },
  { name: 'Test 6', score: 88 },
  { name: 'Test 7', score: 91 },
];

export function PerformanceChart() {
  return (
    <div className="rounded-lg border border-[#E9ECEF] bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6C757D]">
        Score Over Time
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
            <XAxis dataKey="name" stroke="#6C757D" fontSize={12} />
            <YAxis stroke="#6C757D" fontSize={12} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #E9ECEF',
                borderRadius: '0.5rem',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#20C997" // Signal Green
              strokeWidth={2}
              dot={{ r: 4, fill: '#20C997' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
