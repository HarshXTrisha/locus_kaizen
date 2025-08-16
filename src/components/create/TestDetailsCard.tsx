import React from 'react';

export function TestDetailsCard() {
  return (
    <div className="rounded-lg border border-[#E9ECEF] bg-white">
      <div className="border-b border-[#E9ECEF] p-6">
        <h3 className="text-lg font-semibold text-[#212529]">
          Test Details
        </h3>
        <p className="mt-1 text-sm text-[#6C757D]">
          Start by giving your test a title and setting the basic rules.
        </p>
      </div>
      <div className="space-y-6 p-6">
        <div>
          <label htmlFor="testTitle" className="block text-sm font-medium text-[#495057]">
            Test Title
          </label>
          <input
            type="text"
            id="testTitle"
            placeholder="e.g., Algebra II Final Exam"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-[#495057]">
            Subject / Topic
          </label>
          <input
            type="text"
            id="subject"
            placeholder="e.g., Mathematics"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="timeLimit" className="block text-sm font-medium text-[#495057]">
            Time Limit (in minutes)
          </label>
          <input
            type="number"
            id="timeLimit"
            placeholder="e.g., 120"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
