'use client';

import React, { useState } from 'react';
import {
  MoreVertical,
  ArrowDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Sample data structure - this would come from your database
const testData = [
  { id: 1, title: 'Algebra II Final', subject: 'Mathematics', questions: 30, timeLimit: '120 minutes', created: 'Oct 10, 2023' },
  { id: 2, title: 'American History Pop Quiz', subject: 'History', questions: 10, timeLimit: '15 minutes', created: 'Oct 12, 2023' },
  { id: 3, title: 'Midterm Physics Exam', subject: 'Physics', questions: 25, timeLimit: '90 minutes', created: 'Oct 15, 2023' },
  { id: 4, title: 'Literary Analysis Essay', subject: 'English', questions: 1, timeLimit: '60 minutes', created: 'Oct 18, 2023' },
  { id: 5, title: 'Calculus I Quiz', subject: 'Mathematics', questions: 5, timeLimit: '20 minutes', created: 'Oct 20, 2023' },
  { id: 6, title: 'Biology Cell Structure Test', subject: 'Science', questions: 40, timeLimit: '50 minutes', created: 'Oct 22, 2023' },
  { id: 7, title: 'World War II Exam', subject: 'History', questions: 50, timeLimit: '75 minutes', created: 'Oct 25, 2023' },
];

// Reusable component for the action menu
const KebabMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setIsOpen(false)}
        className="text-gray-400 hover:text-gray-800"
      >
        <MoreVertical size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-32 min-w-max rounded-md border border-gray-200 bg-white shadow-lg">
          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Start Test</a>
          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
          <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</a>
        </div>
      )}
    </div>
  );
};

export function TestDataTable() {
  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left table-auto">
          {/* Table Head */}
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <div className="flex cursor-pointer items-center gap-1">Title <ArrowDown size={16} /></div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <div className="flex cursor-pointer items-center gap-1">Subject <ChevronsUpDown size={16} /></div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Questions</th>
              <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Time Limit</th>
              <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <div className="flex cursor-pointer items-center gap-1">Created <ChevronsUpDown size={16} /></div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {testData.map((test) => (
              <tr key={test.id} className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-5 text-base font-medium text-gray-800">{test.title}</td>
                <td className="px-6 py-5 text-base text-gray-600">{test.subject}</td>
                <td className="px-6 py-5 text-base text-gray-600">{test.questions}</td>
                <td className="px-6 py-5 text-base text-gray-600">{test.timeLimit}</td>
                <td className="px-6 py-5 text-base text-gray-600">{test.created}</td>
                <td className="px-6 py-5 text-right">
                  <KebabMenu />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">1</span> to <span className="font-medium">7</span> of <span className="font-medium">128</span> results
        </div>
        <nav aria-label="Pagination" className="inline-flex items-center space-x-2 rounded-md shadow-sm">
          <a href="#" className="inline-flex items-center rounded-l-md p-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
            <ChevronLeft size={16} />
          </a>
          <a href="#" aria-current="page" className="inline-flex items-center bg-green-500 px-4 py-2 text-sm font-medium text-white">1</a>
          <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">2</a>
          <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">3</a>
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">...</span>
          <a href="#" className="inline-flex items-center rounded-r-md p-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
            <ChevronRight size={16} />
          </a>
        </nav>
      </div>
    </div>
  );
}
