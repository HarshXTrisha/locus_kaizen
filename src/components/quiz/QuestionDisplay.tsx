'use client';

import React from 'react';
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

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  onAnswerSelect,
  onFlagQuestion,
  onShortAnswerChange
}: QuestionDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Enhanced Question Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-4">
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isFlagged
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <Flag className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
          {isFlagged ? 'Flagged' : 'Flag for Review'}
        </button>
      </div>

      {/* Enhanced Question Text */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* Enhanced Answer Options */}
      <div className="space-y-4">
        {question.type === 'short-answer' ? (
          // Short Answer Input
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
            <label htmlFor="short-answer" className="block text-sm font-medium text-gray-700 mb-3">
              Your Answer:
            </label>
            <textarea
              id="short-answer"
              value={selectedAnswer}
              onChange={(e) => onShortAnswerChange?.(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent resize-none"
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
                className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? 'border-[#20C997] bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                    isSelected
                      ? 'border-[#20C997] bg-[#20C997] text-white shadow-lg'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>
                    {optionLetter}
                  </div>
                  <div className="flex-1">
                    <span className="text-lg text-gray-900 leading-relaxed">{option}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-6 w-6 text-[#20C997] flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Enhanced Navigation Hint */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Select your answer and use the navigation buttons below to move between questions. 
            You can flag questions for review and come back to them later.
          </p>
        </div>
      </div>
    </div>
  );
}
