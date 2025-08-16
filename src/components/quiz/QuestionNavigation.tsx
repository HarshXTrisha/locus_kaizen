'use client';

import React from 'react';

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
    if (!answer) return 'unanswered';
    if (answer.isFlagged) return 'flagged';
    return 'answered';
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((question, index) => {
        const status = getQuestionStatus(index);
        const isCurrent = index === currentQuestionIndex;
        
        return (
          <button
            key={question.id}
            onClick={() => onQuestionSelect(index)}
            className={`
              w-10 h-10 rounded-lg text-sm font-medium transition-all
              ${isCurrent 
                ? 'bg-[#20C997] text-white ring-2 ring-[#20C997] ring-offset-2' 
                : status === 'answered'
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : status === 'flagged'
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
