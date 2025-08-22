'use client';

import React, { useState, useEffect } from 'react';
import { getQuizResult, getQuiz, Quiz, QuizResult } from '@/lib/firebase-quiz';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertTriangle, Check, X, ArrowUp, Filter } from 'lucide-react';
import { ScoreSummaryCard } from './ScoreSummaryCard';
import { KeyInsights } from './KeyInsights';
import { AnalyticsCharts } from './AnalyticsCharts';
import { QuestionTypeAnalysis } from './TopicPerformanceCard';
import { LeaderboardDisplay } from '@/components/common/LeaderboardDisplay';

interface ResultsDisplayProps {
  resultId: string;
}

export function ResultsDisplay({ resultId }: ResultsDisplayProps) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [answerFilter, setAnswerFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');

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

  // Handle scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 200); // Reduced threshold for earlier appearance
    };

    // Add event listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check in case page is already scrolled
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Filter questions based on user's answer status
  const getFilteredQuestions = () => {
    if (!quiz || !result) return [];
    
    return quiz.questions.filter((question, index) => {
      const userAnswer = result.answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer?.isCorrect || false;
      const isAnswered = userAnswer?.userAnswer && userAnswer.userAnswer.trim() !== '';
      
      switch (answerFilter) {
        case 'correct':
          return isCorrect;
        case 'incorrect':
          return !isCorrect && isAnswered;
        case 'skipped':
          return !isAnswered;
        default:
          return true; // 'all'
      }
    });
  };

  const getFilterCounts = () => {
    if (!quiz || !result) return { all: 0, correct: 0, incorrect: 0, skipped: 0 };
    
    let correct = 0, incorrect = 0, skipped = 0;
    
    quiz.questions.forEach((question) => {
      const userAnswer = result.answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer?.isCorrect || false;
      const isAnswered = userAnswer?.userAnswer && userAnswer.userAnswer.trim() !== '';
      
      if (isCorrect) {
        correct++;
      } else if (isAnswered) {
        incorrect++;
      } else {
        skipped++;
      }
    });
    
    return {
      all: quiz.questions.length,
      correct,
      incorrect,
      skipped
    };
  };

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
    <>
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
        
        <QuestionTypeAnalysis result={result} quiz={quiz} />

        {/* Leaderboard for IIMB-BBA-DBE quizzes */}
        {result.source === 'iimb-bba-dbe' && (
          <LeaderboardDisplay 
            quizId={result.quizId} 
            userScore={result.score}
            className="mt-8"
          />
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Detailed Answer Review</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Filter:</span>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(() => {
              const counts = getFilterCounts();
              const filters = [
                { key: 'all', label: 'All Questions', count: counts.all, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                { key: 'correct', label: 'Correct', count: counts.correct, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                { key: 'incorrect', label: 'Incorrect', count: counts.incorrect, color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                { key: 'skipped', label: 'Skipped', count: counts.skipped, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' }
              ] as const;
              
              return filters.map(({ key, label, count, color }) => (
                <button
                  key={key}
                  onClick={() => setAnswerFilter(key)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    answerFilter === key 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : color
                  }`}
                >
                  {label} ({count})
                </button>
              ));
            })()}
          </div>
          
          <div className="space-y-6">
            {getFilteredQuestions().map((question, index) => {
              const userAnswer = result.answers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect || false;
              const isAnswered = userAnswer?.userAnswer && userAnswer.userAnswer.trim() !== '';
              
              // Find the original question index for proper numbering
              const originalIndex = quiz.questions.findIndex(q => q.id === question.id);

              return (
                <div key={question.id} className={`p-6 rounded-lg border ${
                  isCorrect ? 'border-green-200 bg-green-50' : 
                  isAnswered ? 'border-red-200 bg-red-50' : 
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Question {originalIndex + 1}: {question.text}
                    </h3>
                    {isCorrect ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : isAnswered ? (
                      <X className="h-6 w-6 text-red-600" />
                    ) : (
                      <span className="text-yellow-600 font-medium text-sm">SKIPPED</span>
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
          
          {/* No results message */}
          {getFilteredQuestions().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No questions match the selected filter.</p>
            </div>
          )}
        </div>
      </div>

             {/* Floating Scroll to Top Button - Outside main content */}
       {showScrollToTop && (
         <button
           onClick={scrollToTop}
           className="fixed bottom-6 right-6 z-50 p-3 bg-[#20C997] text-white rounded-full shadow-lg hover:bg-[#1BA085] transition-all duration-200 hover:shadow-xl group"
           title="Go to top"
         >
           <ArrowUp className="h-5 w-5 group-hover:animate-bounce" />
         </button>
       )}
     </>
   );
 }
