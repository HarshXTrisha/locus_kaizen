'use client';

import { Quiz, QuizResult } from '@/lib/firebase-quiz';
import { Target, CheckCircle, Clock, Award } from 'lucide-react';

interface ScoreSummaryCardProps {
  result: QuizResult;
  quiz: Quiz;
}

export function ScoreSummaryCard({ result, quiz }: ScoreSummaryCardProps) {
  const isPassed = result.score >= quiz.passingScore;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Summary</h3>
      <div className="text-center">
        <div className={`text-6xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
          {result.score}%
        </div>
        <p className={`font-semibold text-lg ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
          {isPassed ? 'Passed' : 'Failed'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Passing Score: {quiz.passingScore}%
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-gray-400" />
            Correct Answers
          </span>
          <span className="font-semibold text-gray-900">
            {result.correctAnswers} / {result.totalQuestions}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-2">
            <Target className="h-5 w-5 text-gray-400" />
            Accuracy
          </span>
          <span className="font-semibold text-gray-900">{result.score}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Time Taken
          </span>
          <span className="font-semibold text-gray-900">
            {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-400" />
            Points Earned
          </span>
          <span className="font-semibold text-gray-900">
            {result.answers.reduce((acc, a) => acc + (a.isCorrect ? a.points : 0), 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
