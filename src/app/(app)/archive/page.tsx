import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DynamicTestDataTable } from '@/lib/dynamic-imports';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import Link from 'next/link';

export default function ArchivePage() {
  return (
    <ProtectedRoute>
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Quiz Archive
            </h2>
            <Link href="/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Quiz
              </Button>
            </Link>
          </div>
          <div className="mt-8">
            <DynamicTestDataTable />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
