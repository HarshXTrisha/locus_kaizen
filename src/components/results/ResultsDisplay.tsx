'use client';

import React, { useState, useEffect } from 'react';
import { getQuizResult, getQuiz, Quiz, QuizResult } from '@/lib/firebase-quiz';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertTriangle, Check, X } from 'lucide-react';
import { ScoreSummaryCard } from './ScoreSummaryCard';
import { KeyInsights } from './KeyInsights';
import { AnalyticsCharts } from './AnalyticsCharts';
import { TopicPerformanceCard } from './TopicPerformanceCard';

interface ResultsDisplayProps {
  resultId: string;
}

export function ResultsDisplay({ resultId }: ResultsDisplayProps) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const resultData = await getQuizResult(resultId);
        if (resultData) {
          setResult(resultData);
          const quizData = await getQuiz(resultData.quizId);
          setQuiz(quizData);
        } else {
          setError("Sorry, we couldn&apos;t find the results for this quiz. Please check the ID and try again.");
        }
      } catch (err) {
        setError('An unexpected error occurred while loading the results. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="xl" text="Loading results..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">An Error Occurred</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Results Not Found</h2>
          <p className="text-gray-600">We couldn&apos;t find the results for this quiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Quiz Results</h1>
        <p className="text-xl text-gray-600 mt-2">Here&apos;s how you performed on the &quot;{quiz.title}&quot; quiz.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ScoreSummaryCard result={result} quiz={quiz} />
        </div>
        <div className="lg:col-span-2">
          <KeyInsights result={result} quiz={quiz} />
        </div>
      </div>

      <AnalyticsCharts result={result} quiz={quiz} />
      
      <TopicPerformanceCard result={result} quiz={quiz} />

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Answer Review</h2>
        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const userAnswer = result.answers.find(a => a.questionId === question.id);
            const isCorrect = userAnswer?.isCorrect || false;

            return (
              <div key={question.id} className={`p-6 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Question {index + 1}: {question.text}
                  </h3>
                  {isCorrect ? (
                    <Check className="h-6 w-6 text-green-600" />
                  ) : (
                    <X className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="space-y-3">
                  {question.options?.map(option => (
                    <div
                      key={option}
                      className={`p-3 rounded-md border-2 ${
                        option === question.correctAnswer
                          ? 'border-green-500 bg-green-100' // Correct answer
                          : option === userAnswer?.userAnswer
                          ? 'border-red-500 bg-red-100' // Incorrect user answer
                          : 'border-gray-200 bg-white' // Default
                      }`}
                    >
                      <p className="font-medium">{option}</p>
                    </div>
                  ))}
                </div>
                {userAnswer && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold">Your Answer: <span className="font-normal">{userAnswer.userAnswer || 'Not Answered'}</span></p>
                    <p className="text-sm font-semibold">Correct Answer: <span className="font-normal">{question.correctAnswer}</span></p>
                  </div>
                )}
                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800"><span className="font-semibold">Explanation:</span> {question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
