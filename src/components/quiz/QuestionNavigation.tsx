'use client'; // This component will have interactive states

import React from 'react';

// Sample data for question statuses. In a real app, this would be managed by state.
const questions = [
  { number: 1, status: 'unanswered' as const },
  { number: 2, status: 'answered' as const },
  { number: 3, status: 'flagged' as const },
  // ...add all 40 questions here or generate them
].concat(Array.from({ length: 37 }, (_, i) => ({ number: i + 4, status: 'unanswered' as const })));

// A single question indicator button
const QuestionIndicator = ({ number, status }: { number: number; status: 'unanswered' | 'answered' | 'flagged' }) => {
  const baseClasses = "flex items-center justify-center size-10 rounded-full font-bold text-sm transition-all duration-300 ease-in-out shadow-sm hover:scale-110 hover:shadow-md";
  
  const statusClasses = {
    unanswered: 'bg-white text-gray-400 border border-slate-200 hover:bg-gray-100',
    answered: 'bg-green-500 text-white hover:bg-green-600',
    flagged: 'bg-yellow-400 text-yellow-800 hover:bg-yellow-500',
  };

  return (
    <a href={`#question-${number}`} className={`${baseClasses} ${statusClasses[status]}`}>
      {number}
    </a>
  );
};

export function QuestionNavigation() {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 sticky top-0 h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Question Navigation</h1>
      
      {/* Question Grid */}
      <div className="flex-grow overflow-y-auto pr-4 -mr-4">
        <div className="grid grid-cols-5 gap-3">
          {questions.map(q => (
            <QuestionIndicator key={q.number} number={q.number} status={q.status} />
          ))}
        </div>
      </div>

      {/* Legend and Submit Button */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <span className="size-4 rounded-full bg-green-500 mr-3"></span>
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center">
            <span className="size-4 rounded-full bg-white border border-slate-200 mr-3"></span>
            <span className="text-gray-600">Unanswered</span>
          </div>
          <div className="flex items-center">
            <span className="size-4 rounded-full bg-yellow-400 mr-3"></span>
            <span className="text-gray-600">Flagged for Review</span>
          </div>
        </div>
        <button className="w-full mt-6 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200">
          Submit Test
        </button>
      </div>
    </aside>
  );
}
