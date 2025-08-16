import React from 'react';
import { Plus } from 'lucide-react';

export function WelcomeHeader({ userName }: { userName?: string }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold text-[#212529]">
          Welcome back{userName ? `, ${userName}` : ''}
        </h1>
        <p className="mt-1 text-md text-[#6C757D]">
          Let&apos;s see your progress and plan your next session.
        </p>
      </div>
      <button className="flex w-full items-center justify-center rounded-md bg-[#20C997] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Create New Test
      </button>
    </div>
  );
}
