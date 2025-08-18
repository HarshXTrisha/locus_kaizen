'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ResultsDisplay } from '@/components/results/ResultsDisplay';

interface ResultPageProps {
  params: {
    id: string;
  };
}

export default function ResultPage({ params }: ResultPageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();

  if (!isAuthenticated || !user) {
    router.replace('/login');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Redirecting to login..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <ResultsDisplay resultId={params.id} />
      </div>
    </div>
  );
}
