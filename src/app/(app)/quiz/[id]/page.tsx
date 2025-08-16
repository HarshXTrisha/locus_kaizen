import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainQuestionArea } from '@/components/quiz/MainQuestionArea';
import { QuestionNavigation } from '@/components/quiz/QuestionNavigation';
import { Timer } from '@/components/quiz/Timer';
import { TopBar } from '@/components/quiz/TopBar';

interface QuizPageProps {
  params: {
    id: string;
  };
}

export default function QuizPage({ params }: QuizPageProps) {
  return (
    <ProtectedRoute>
      <main className="flex-grow bg-gray-50">
        <TopBar quizId={params.id} />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MainQuestionArea />
            </div>
            <div>
              <Timer />
              <QuestionNavigation />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
