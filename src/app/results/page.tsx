'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { getUserQuizResults, QuizResult, deleteQuizResult } from '@/lib/firebase-quiz';
import { getQuiz } from '@/lib/firebase-quiz';
import { Calendar, Clock, CheckCircle, AlertCircle, Trash2, X } from 'lucide-react';
import Link from 'next/link';

export default function ResultsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingResult, setDeletingResult] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const userResults = await getUserQuizResults(user.id);
        setResults(userResults);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load your quiz results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [isAuthenticated, user, router]);

  const handleDeleteResult = async (resultId: string) => {
    try {
      setDeletingResult(resultId);
      await deleteQuizResult(resultId);
      
      // Remove the deleted result from the list
      setResults(prev => prev.filter(result => result.id !== resultId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting result:', err);
      setError('Failed to delete the quiz result');
    } finally {
      setDeletingResult(null);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="xl" text="Checking authentication..." />
        </div>
      </ResponsiveLayout>
    );
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="xl" text="Loading your results..." />
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            type="error"
            title="Error Loading Results"
            description={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p className="text-gray-600">View your quiz performance and analytics</p>
        </div>
        
        {results.length === 0 ? (
          <EmptyState
            type="result"
            title="No Results Yet"
            description="Complete some quizzes to see your results here"
            actionLabel="Take a Quiz"
            onAction={() => router.push('/dashboard')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div key={result.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Quiz #{result.quizId.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {result.totalQuestions} questions • {Math.round(result.timeTaken / 60)} min
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.score >= 70 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(result.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      disabled={deletingResult === result.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className={`text-lg font-semibold ${
                      result.score >= 90 ? 'text-green-600' :
                      result.score >= 70 ? 'text-blue-600' :
                      result.score >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {result.score}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Correct</span>
                    <span className="text-sm font-medium text-gray-900">
                      {result.correctAnswers}/{result.totalQuestions}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time</span>
                    <span className="text-sm text-gray-900">
                      {Math.round(result.timeTaken / 60)}m {result.timeTaken % 60}s
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {result.completedAt.toLocaleDateString()}
                    </div>
                    <Link
                      href={`/results/${result.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm === result.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                      <h3 className="text-lg font-semibold mb-2">Delete Result</h3>
                      <p className="text-gray-600 mb-4">
                        Are you sure you want to delete this quiz result? This action cannot be undone.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteResult(result.id)}
                          disabled={deletingResult === result.id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingResult === result.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
