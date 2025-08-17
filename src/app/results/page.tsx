'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading your results..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Results</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
          <p className="text-gray-600 mt-2">View your quiz performance and analytics</p>
        </div>
        
        {results.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Yet</h2>
            <p className="text-gray-600 mb-6">Complete some quizzes to see your results and analytics here.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#20C997] text-white px-6 py-3 rounded-lg hover:bg-[#1BA085] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <ResultCard 
                key={result.id} 
                result={result} 
                onDelete={() => setShowDeleteConfirm(result.id)}
                isDeleting={deletingResult === result.id}
                showDeleteConfirm={showDeleteConfirm === result.id}
                onConfirmDelete={() => handleDeleteResult(result.id)}
                onCancelDelete={() => setShowDeleteConfirm(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ResultCardProps {
  result: QuizResult;
  onDelete: () => void;
  isDeleting: boolean;
  showDeleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function ResultCard({ 
  result, 
  onDelete, 
  isDeleting, 
  showDeleteConfirm, 
  onConfirmDelete, 
  onCancelDelete 
}: ResultCardProps) {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getQuiz(result.quizId);
        setQuiz(quizData);
      } catch (err) {
        console.error('Error fetching quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [result.quizId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <LoadingSpinner size="md" text="Loading quiz details..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {showDeleteConfirm ? (
        // Delete confirmation view
        <div className="text-center">
          <div className="mb-4">
            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Quiz Result?</h3>
            <p className="text-gray-600">
              Are you sure you want to delete your result for &quot;{quiz?.title || 'Unknown Quiz'}&quot;? 
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancelDelete}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Normal result card view
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <Link href={`/results/${result.id}`}>
                <div className="cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-[#20C997] transition-colors">
                    {quiz?.title || 'Unknown Quiz'}
                  </h3>
                  <p className="text-sm text-gray-600">{quiz?.subject || 'No subject'}</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBg(result.score)} ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete this result"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <Link href={`/results/${result.id}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm cursor-pointer">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{result.correctAnswers}/{result.totalQuestions} correct</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{formatTime(result.timeTaken)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(result.completedAt)}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500">View Details →</span>
              </div>
            </div>
          </Link>
        </>
      )}
    </div>
  );
}
