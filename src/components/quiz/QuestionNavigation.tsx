'use client';

import React from 'react';
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

export function QuestionNavigation({
  questions,
  answers,
  currentQuestionIndex,
  onQuestionSelect
}: QuestionNavigationProps) {
  const getQuestionStatus = (index: number) => {
    const answer = answers.find(a => a.questionId === questions[index].id);
    if (!answer || answer.selectedOption === '') return 'unanswered';
    if (answer.isFlagged) return 'flagged';
    return 'answered';
  };

  const getStatusCounts = () => {
    let answered = 0;
    let flagged = 0;
    let unanswered = 0;

    questions.forEach((_, index) => {
      const status = getQuestionStatus(index);
      if (status === 'answered') answered++;
      else if (status === 'flagged') flagged++;
      else unanswered++;
    });

    return { answered, flagged, unanswered };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-4">
      {/* Status Legend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
          <span>Question Status</span>
          <span className="text-gray-500">
            {statusCounts.answered} / {questions.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-700" />
            <span className="font-bold text-green-800">Answered</span>
            <span className="text-green-600 font-semibold">({statusCounts.answered})</span>
          </div>
          <div className="flex items-center gap-1">
            <Flag className="h-4 w-4 text-yellow-700" />
            <span className="font-bold text-yellow-800">Flagged</span>
            <span className="text-yellow-600 font-semibold">({statusCounts.flagged})</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-4 w-4 text-gray-500" />
            <span className="font-bold text-gray-700">Unanswered</span>
            <span className="text-gray-600 font-semibold">({statusCounts.unanswered})</span>
          </div>
        </div>
      </div>
      {/* Scrollable Question Grid */}
      <div className="max-h-[28rem] min-h-[10rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 p-2 bg-white rounded-xl border border-gray-200 shadow-md">
        <div className="grid grid-cols-5 gap-2 p-1">
          {questions.map((question, index) => {
            const status = getQuestionStatus(index);
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(index)}
                className={`
                  relative w-12 h-12 rounded-xl text-base font-bold transition-all duration-200
                  ${isCurrent 
                    ? 'bg-[#20C997] text-white ring-2 ring-[#20C997] ring-offset-1 shadow-lg' 
                    : status === 'answered'
                    ? 'bg-green-500 text-white hover:bg-green-600 border-2 border-green-600'
                    : status === 'flagged'
                    ? 'bg-yellow-400 text-white hover:bg-yellow-500 border-2 border-yellow-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400 border-2 border-gray-400'
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

      {/* Quick Navigation */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600">Quick Navigation</div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const firstUnanswered = questions.findIndex((_, index) => getQuestionStatus(index) === 'unanswered');
              if (firstUnanswered !== -1) onQuestionSelect(firstUnanswered);
            }}
            disabled={statusCounts.unanswered === 0}
            className="flex-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Unanswered
          </button>
          <button
            onClick={() => {
              const firstFlagged = questions.findIndex((_, index) => getQuestionStatus(index) === 'flagged');
              if (firstFlagged !== -1) onQuestionSelect(firstFlagged);
            }}
            disabled={statusCounts.flagged === 0}
            className="flex-1 px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Flagged
          </button>
        </div>
      </div>
    </div>
  );
}
