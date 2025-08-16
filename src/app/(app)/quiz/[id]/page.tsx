import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { QuizInterface } from '@/components/quiz/QuizInterface';

interface QuizPageProps {
  params: {
    id: string;
  };
}

export default function QuizPage({ params }: QuizPageProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <QuizInterface quizId={params.id} />
      </div>
    </ProtectedRoute>
  );
}
