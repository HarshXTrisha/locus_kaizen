'use client'; // This component requires client-side state for the tabs

import React, { useState } from 'react';
import { UploadCloud, Plus } from 'lucide-react';

export function AddQuestionsCard() {
  const [activeTab, setActiveTab] = useState('manual');

  return (
    <div className="rounded-lg border border-[#E9ECEF] bg-white">
      {/* Tab Headers */}
      <div className="border-b border-[#E9ECEF]">
        <nav className="-mb-px flex gap-6 px-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'manual'
                ? 'border-[#20C997] text-[#20C997]'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Add Manually
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'bulk'
                ? 'border-[#20C997] text-[#20C997]'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Bulk Upload
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'manual' && (
          <div className="space-y-6">
            {/* Manual Question Entry Form */}
            <div>
              <label htmlFor="questionText" className="block text-sm font-medium text-[#495057]">
                Question
              </label>
              <textarea
                id="questionText"
                rows={3}
                placeholder="Enter the question text here..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#495057]">Answer Options</label>
              {/* This would be a dynamic list in a real app */}
              <input type="text" placeholder="Option 1 (Correct Answer)" className="mt-1 block w-full rounded-md border-green-500 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm" />
              <input type="text" placeholder="Option 2" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm" />
            </div>
            <button className="flex items-center justify-center rounded-md border border-[#20C997] bg-white px-4 py-2 text-sm font-semibold text-[#20C997] transition-colors hover:bg-green-50">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
            </button>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div>
            {/* Bulk Upload View */}
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-[#20C997] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#20C997] focus-within:ring-offset-2 hover:text-green-600">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV, XLS up to 10MB</p>
                </div>
            </div>
            <a href="#" className="mt-4 inline-block text-sm font-semibold text-[#20C997] hover:underline">
                Download .csv template &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
