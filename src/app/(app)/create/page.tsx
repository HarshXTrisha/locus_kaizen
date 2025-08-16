import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateQuizForm } from '@/components/create/CreateQuizForm';

export default function CreatePage() {
  return (
    <ProtectedRoute>
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <CreateQuizForm />
        </div>
      </main>
    </ProtectedRoute>
  );
}
