import React from 'react';
import { ArchiveHeader } from '@/components/archive/ArchiveHeader';
import { DynamicTestDataTable } from '@/lib/dynamic-imports';

export default function ArchivePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ArchiveHeader />
      <main className="flex-grow p-8">
        <div className="w-full max-w-7xl mx-auto">
          <DynamicTestDataTable />
        </div>
      </main>
    </div>
  );
}
