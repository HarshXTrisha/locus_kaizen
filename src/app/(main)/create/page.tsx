'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { CreateQuizForm } from '@/components/create/CreateQuizForm';

export default function CreatePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="xl" text="Checking authentication..." />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Quiz</h1>
          <p className="text-gray-600">Upload a PDF or create a quiz from scratch</p>
        </div>
        <CreateQuizForm />
      </div>
    </ResponsiveLayout>
  );
}
