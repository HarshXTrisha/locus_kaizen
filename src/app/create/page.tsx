import React from 'react';
import { TestDetailsCard } from '@/components/create/TestDetailsCard';
import { AddQuestionsCard } from '@/components/create/AddQuestionsCard'; // 1. Import the new component

export default function CreateTestPage() {
  return (
    <main className="flex-grow bg-[#F8F9FA]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-[#212529]">Create a New Test</h1>
            <p className="mt-1 text-md text-[#6C757D]">
              Follow the steps below to build your test.
            </p>
          </div>

          <TestDetailsCard />
          <AddQuestionsCard /> {/* 2. Use the new component here */}

          {/* Final Action Button */}
          <div className="flex justify-end">
            <button className="flex w-full items-center justify-center rounded-md bg-[#20C997] px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto">
              Save Test
            </button>
          </div>
          
        </div>
      </div>
    </main>
  );
}
