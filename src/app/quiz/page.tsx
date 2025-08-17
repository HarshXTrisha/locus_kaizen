'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getUserQuizzes } from '@/lib/firebase-quiz';
import { BookOpen, Clock, Target, Plus } from 'lucide-react';
import Link from 'next/link';

export default function QuizPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    const loadQuizzes = async () => {
      try {
        setLoading(true);
        const userQuizzes = await getUserQuizzes(user.id);
        setQuizzes(userQuizzes);
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading quizzes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
              <p className="text-gray-600 mt-2">Take quizzes and track your progress</p>
            </div>
            <Link
              href="/create"
              className="flex items-center px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Link>
          </div>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Yet</h2>
            <p className="text-gray-600 mb-6">Create your first quiz to get started</p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">{quiz.subject}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Target className="h-4 w-4 mr-2" />
                    {quiz.questions.length} questions
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {quiz.timeLimit} minutes
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="flex-1 bg-[#20C997] text-white text-center py-2 px-4 rounded-lg hover:bg-[#1BA085] transition-colors"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
