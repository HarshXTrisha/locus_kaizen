'use client'; // Required for user interactions like selecting an answer

import React from 'react';

// Sample data for a single question
const questionData = {
  number: 8,
  total: 20,
  text: 'In physics, what is the formula for calculating force?',
  options: [
    'E = mc²',
    'F = ma (Force = mass × acceleration)',
    'PV = nRT',
    'a² + b² = c²',
  ],
};

export function QuestionView() {
  const progressPercentage = (questionData.number / questionData.total) * 100;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200">
        <div
          className="h-1.5 bg-[#20C997]" // Signal Green
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="flex-grow p-6 sm:p-8 md:p-12">
        <div className="mx-auto max-w-3xl">
          {/* Question Header */}
          <p className="font-medium text-[#6C757D]">
            Question {questionData.number} of {questionData.total}
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#212529]">
            {questionData.text}
          </p>

          {/* Answer Options */}
          <div className="mt-8 space-y-4">
            {questionData.options.map((option, index) => (
              <label
                key={index}
                className="flex cursor-pointer items-center rounded-lg border border-[#E9ECEF] bg-white p-4 text-lg transition-colors hover:border-[#20C997] has-[:checked]:border-[#20C997] has-[:checked]:bg-green-50 has-[:checked]:ring-2 has-[:checked]:ring-[#20C997]"
              >
                <input type="radio" name="answer" className="h-4 w-4 border-gray-300 text-[#20C997] focus:ring-[#20C997]" />
                <span className="ml-4 text-[#495057]">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-auto border-t border-[#E9ECEF] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl justify-between">
          <button className="rounded-md border border-gray-300 bg-white px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          <button className="rounded-md bg-[#20C997] px-6 py-2 font-semibold text-white hover:opacity-90">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
