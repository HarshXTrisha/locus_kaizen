'use client';

import { Quiz, QuizResult } from '@/lib/firebase-quiz';
import { Tag } from 'lucide-react';

interface TopicPerformanceCardProps {
  result: QuizResult;
  quiz: Quiz;
}

export function TopicPerformanceCard({ result, quiz }: TopicPerformanceCardProps) {
  // This is a placeholder. In a real application, you would
  // calculate performance per topic based on question metadata.
  const topics = [
    { name: 'Topic 1', score: 80 },
    { name: 'Topic 2', score: 60 },
    { name: 'Topic 3', score: 90 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Topic</h3>
      <div className="space-y-4">
        {topics.map((topic, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                {topic.name}
              </p>
              <p className="font-semibold text-gray-900">{topic.score}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#20C997] h-2.5 rounded-full"
                style={{ width: `${topic.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
