'use client';

import React, { memo } from 'react';
import { Flag, CheckCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string;
  isFlagged: boolean;
  onAnswerSelect: (option: string) => void;
  onFlagQuestion: () => void;
  onShortAnswerChange?: (answer: string) => void;
}

export const QuestionDisplay = memo(({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  onAnswerSelect,
  onFlagQuestion,
  onShortAnswerChange
}: QuestionDisplayProps) => {
  return (
    <div className="space-y-4">
      {/* Enhanced Question Header - Reduced spacing */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
            <span className="text-sm font-semibold text-blue-700">
              Question {questionNumber} of {totalQuestions}
            </span>
          </div>
          <div className="bg-white px-3 py-1 rounded-full border border-green-200">
            <span className="text-sm font-semibold text-green-700">
              {question.points} point{question.points !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button
          onClick={onFlagQuestion}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-100 ${
            isFlagged
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <Flag className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
          {isFlagged ? 'Flagged' : 'Flag for Review'}
        </button>
      </div>

      {/* Enhanced Question Text - Reduced padding */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* Enhanced Answer Options - Reduced spacing */}
      <div className="space-y-3">
        {question.type === 'short-answer' ? (
          // Short Answer Input
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
            <label htmlFor="short-answer" className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer:
            </label>
            <textarea
              id="short-answer"
              value={selectedAnswer}
              onChange={(e) => onShortAnswerChange?.(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent resize-none"
              rows={4}
              style={{ minHeight: '120px' }}
            />
            <p className="text-sm text-gray-500 mt-2">
              Provide a clear and concise answer. Spelling and capitalization matter.
            </p>
          </div>
        ) : (
          // Multiple Choice and True/False Options
          question.options && question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
            const isSelected = selectedAnswer === option;
            
            return (
              <button
                key={index}
                onClick={() => onAnswerSelect(option)}
                className={`
                  w-full p-4 rounded-xl border-2 text-left transition-all duration-100
                  ${isSelected
                    ? 'border-[#20C997] bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                    ${isSelected
                      ? 'border-[#20C997] bg-[#20C997] text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-600'
                    }
                  `}>
                    {optionLetter}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium leading-relaxed">
                      {option}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-[#20C997] flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Question Type Indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <AlertCircle className="h-4 w-4" />
        <span className="capitalize">
          {question.type === 'multiple-choice' ? 'Multiple Choice' : 
           question.type === 'true-false' ? 'True/False' : 'Short Answer'}
        </span>
      </div>
    </div>
  );
});

QuestionDisplay.displayName = 'QuestionDisplay';
