import React from 'react';
import { QuestionNavigation } from '@/components/quiz/QuestionNavigation';
import { MainQuestionArea } from '@/components/quiz/MainQuestionArea'; // 1. Import the new component

export default function QuizPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <QuestionNavigation />
      <MainQuestionArea /> {/* 2. Use the new component here */}
    </div>
  );
}
