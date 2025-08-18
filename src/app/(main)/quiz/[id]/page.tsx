'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { QuizInterface } from '@/components/quiz/QuizInterface';

interface QuizPageProps {
  params: {
    id: string;
  };
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizInterface quizId={params.id} />
    </div>
  );
}
