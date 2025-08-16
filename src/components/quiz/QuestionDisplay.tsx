'use client';

import React from 'react';
import { Flag } from '@/lib/icons';

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
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  onAnswerSelect,
  onFlagQuestion
}: QuestionDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {question.points} point{question.points !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onFlagQuestion}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            isFlagged
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Flag className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
          {isFlagged ? 'Flagged' : 'Flag'}
        </button>
      </div>

      {/* Question Text */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options && question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
          const isSelected = selectedAnswer === option;
          
          return (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-[#20C997] bg-[#20C997]/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  isSelected
                    ? 'border-[#20C997] bg-[#20C997] text-white'
                    : 'border-gray-300 text-gray-600'
                }`}>
                  {optionLetter}
                </div>
                <span className="text-gray-900">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Question Navigation Hint */}
      <div className="text-sm text-gray-500 text-center pt-4 border-t border-gray-200">
        <p>Select your answer and use the navigation buttons below to move between questions.</p>
      </div>
    </div>
  );
}
