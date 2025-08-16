import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateTestForm } from '@/components/create/CreateTestForm';

export default function CreatePage() {
  return (
    <ProtectedRoute>
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create a New Quiz
            </h2>
          </div>
          <div className="mt-8">
            <CreateTestForm />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
