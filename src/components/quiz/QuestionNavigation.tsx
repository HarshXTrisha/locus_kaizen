'use client';

import React, { useMemo, useCallback } from 'react';
import { CheckCircle, Flag, Circle, Clock } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

interface Answer {
  questionId: string;
  selectedOption: string;
  isFlagged: boolean;
}

interface QuestionNavigationProps {
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
}

export const QuestionNavigation = React.memo(({
  questions,
  answers,
  currentQuestionIndex,
  onQuestionSelect
}: QuestionNavigationProps) => {
  // Memoize question status calculations for better performance
  const questionStatuses = useMemo(() => {
    return questions.map((question, index) => {
      const answer = answers.find(a => a.questionId === question.id);
      if (!answer || answer.selectedOption === '') {
        return 'visited-unanswered';
      }
      if (answer.isFlagged) return 'flagged';
      return 'answered';
    });
  }, [questions, answers]);

  // Memoize status counts
  const statusCounts = useMemo(() => {
    let answered = 0;
    let flagged = 0;
    let unanswered = 0;
    let visitedUnanswered = 0;

    questionStatuses.forEach(status => {
      if (status === 'answered') answered++;
      else if (status === 'flagged') flagged++;
      else if (status === 'visited-unanswered') visitedUnanswered++;
      else unanswered++;
    });

    return { answered, flagged, unanswered, visitedUnanswered };
  }, [questionStatuses]);

  // Optimized question selection handler
  const handleQuestionSelect = useCallback((index: number) => {
    onQuestionSelect(index);
  }, [onQuestionSelect]);

  // Optimized quick navigation handlers
  const handleNextUnanswered = useCallback(() => {
    const firstUnanswered = questionStatuses.findIndex(status => status === 'visited-unanswered');
    if (firstUnanswered !== -1) onQuestionSelect(firstUnanswered);
  }, [questionStatuses, onQuestionSelect]);

  const handleNextFlagged = useCallback(() => {
    const firstFlagged = questionStatuses.findIndex(status => status === 'flagged');
    if (firstFlagged !== -1) onQuestionSelect(firstFlagged);
  }, [questionStatuses, onQuestionSelect]);

  return (
    <div className="space-y-5 w-full">
      {/* Status Legend - Increased spacing and size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-base font-semibold text-gray-700">
          <span>Question Status</span>
          <span className="text-gray-500 text-lg">
            {statusCounts.answered} / {questions.length}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-medium">Answered</span>
            <span className="text-gray-500 ml-auto">({statusCounts.answered})</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-700 font-medium">Flagged</span>
            <span className="text-gray-500 ml-auto">({statusCounts.flagged})</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 font-medium">Unanswered</span>
            <span className="text-gray-500 ml-auto">({statusCounts.unanswered})</span>
          </div>
        </div>
      </div>

      {/* Scrollable Question Grid - Optimized for instant rendering */}
      <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="grid grid-cols-4 gap-3 p-2">
          {questions.map((question, index) => {
            const status = questionStatuses[index];
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={question.id}
                onClick={() => handleQuestionSelect(index)}
                className={`
                  relative w-12 h-12 rounded-lg text-sm font-medium transition-all duration-150
                  ${isCurrent 
                    ? 'bg-[#20C997] text-white ring-2 ring-[#20C997] ring-offset-1 shadow-lg' 
                    : status === 'answered'
                    ? 'bg-green-500 text-white hover:bg-green-600 border border-green-600'
                    : status === 'flagged'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200'
                    : status === 'visited-unanswered'
                    ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }
                `}
                title={`Question ${index + 1}: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
              >
                {index + 1}
                {status === 'flagged' && (
                  <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-600 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation - Optimized handlers */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-600">Quick Navigation</div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleNextUnanswered}
            disabled={statusCounts.visitedUnanswered === 0}
            className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Next Unanswered
          </button>
          <button
            onClick={handleNextFlagged}
            disabled={statusCounts.flagged === 0}
            className="w-full px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Next Flagged
          </button>
        </div>
      </div>
    </div>
  );
});

QuestionNavigation.displayName = 'QuestionNavigation';
