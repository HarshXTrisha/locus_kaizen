'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Result {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: Date;
}

interface PerformanceChartProps {
  results: Result[];
}

export function PerformanceChart({ results }: PerformanceChartProps) {
  // Process results for chart data
  const chartData = React.useMemo(() => {
    if (results.length === 0) {
      return [
        { name: 'No Data', score: 0 }
      ];
    }

    // Group results by month for the last 6 months
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthResults = results.filter(result => {
        const resultDate = new Date(result.completedAt);
        return resultDate.getMonth() === date.getMonth() && 
               resultDate.getFullYear() === date.getFullYear();
      });
      
      const averageScore = monthResults.length > 0 
        ? Math.round(monthResults.reduce((sum, r) => sum + r.score, 0) / monthResults.length)
        : 0;
      
      months.push({
        name: monthName,
        score: averageScore,
        count: monthResults.length
      });
    }
    
    return months;
  }, [results]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: any, name: string) => [
              `${value}%`, 
              name === 'score' ? 'Average Score' : name
            ]}
            labelFormatter={(label) => `${label}`}
          />
          <Bar 
            dataKey="score" 
            fill="#20C997" 
            radius={[4, 4, 0, 0]}
            name="Average Score"
          />
        </BarChart>
      </ResponsiveContainer>
      
      {results.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No performance data available yet</p>
        </div>
      )}
    </div>
  );
}
