'use client';

import { Quiz, QuizResult } from '@/lib/firebase-quiz';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsChartsProps {
  result: QuizResult;
  quiz: Quiz;
}

export function AnalyticsCharts({ result, quiz }: AnalyticsChartsProps) {
  const data = [
    { name: 'Your Score', score: result.score },
    { name: 'Passing Score', score: quiz.passingScore },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#20C997" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
