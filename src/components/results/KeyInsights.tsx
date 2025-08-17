'use client';

import { Quiz, QuizResult } from '@/lib/firebase-quiz';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

interface KeyInsightsProps {
  result: QuizResult;
  quiz: Quiz;
}

export function KeyInsights({ result, quiz }: KeyInsightsProps) {
  const isPassed = result.score >= quiz.passingScore;
  const timePerQuestion = result.timeTaken / result.totalQuestions;

  const insights = [
    {
      icon: isPassed ? <TrendingUp className="h-6 w-6 text-green-600" /> : <AlertCircle className="h-6 w-6 text-red-600" />,
      title: isPassed ? 'Great Job!' : 'Needs Improvement',
      description: `You ${isPassed ? 'passed' : 'failed'} this quiz with a score of ${result.score}%. The passing score was ${quiz.passingScore}%.`,
      color: isPassed ? 'bg-green-50' : 'bg-red-50',
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-blue-600" />,
      title: 'Time Management',
      description: `You spent an average of ${timePerQuestion.toFixed(1)} seconds per question.`,
      color: 'bg-blue-50',
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
      title: 'Strongest Area',
      description: 'You performed well on questions related to [Topic].', // Placeholder
      color: 'bg-yellow-50',
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
      title: 'Area for Improvement',
      description: 'You struggled with questions about [Topic].', // Placeholder
      color: 'bg-orange-50',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg ${insight.color}`}>
            <div className="flex items-start gap-4">
              <div>{insight.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
