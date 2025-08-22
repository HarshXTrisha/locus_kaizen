'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { 
  getUserQuizzesWithControls, 
  getUserQuizResults, 
  deleteQuiz, 
  deleteQuizResult,
  publishQuiz,
  unpublishQuiz,
  QuizWithControls,
  ALLOWED_SUBJECTS
} from '@/lib/firebase-quiz';
import { getFirebaseAuth } from '@/lib/firebase-utils';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { Plus, BookOpen, BarChart3, Clock, Users, TrendingUp, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
// import { QuizAdminControls } from '@/components/dashboard/QuizAdminControls';
import { 
  NoQuizzesEmptyState, 
  NoResultsEmptyState, 
  ErrorState, 
  LoadingState 
} from '@/components/common/EmptyState';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppStore();
  const [quizzes, setQuizzes] = useState<QuizWithControls[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authTimeout, setAuthTimeout] = useState(false);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalResults: 0,
    averageScore: 0,
    totalTimeSpent: 0
  });
  const [deletingQuiz, setDeletingQuiz] = useState<string | null>(null);
  const [deletingResult, setDeletingResult] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    kind: 'quiz' | 'result' | null;
    id: string | null;
    title: string;
  }>({ open: false, kind: null, id: null, title: '' });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      // Load real data from Firebase
      const [quizzesData, resultsData] = await Promise.all([
        getUserQuizzesWithControls(user.id),
        getUserQuizResults(user.id)
      ]);

      setQuizzes(quizzesData);
      setResults(resultsData);

      // Calculate stats from real data
      const totalQuizzes = quizzesData.length;
      const totalResults = resultsData.length;
      const averageScore = totalResults > 0 
        ? Math.round(resultsData.reduce((sum: number, result: any) => sum + result.score, 0) / totalResults)
        : 0;
      const totalTimeSpent = resultsData.reduce((sum: number, result: any) => sum + (result.timeTaken || 0), 0);
      
      setStats({
        totalQuizzes,
        totalResults,
        averageScore,
        totalTimeSpent
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('🏠 Dashboard: Auth state:', { isAuthenticated, user: !!user, isLoading });
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('🏠 Dashboard: Auth timeout reached');
      setAuthTimeout(true);
    }, 5000); // 5 seconds timeout

    if (!isLoading && !isAuthenticated) {
      console.log('🏠 Dashboard: Not authenticated, redirecting to login');
      clearTimeout(timeoutId);
      router.replace('/login');
      return;
    }

    if (isAuthenticated && user) {
      console.log('🏠 Dashboard: Authenticated, loading data');
      clearTimeout(timeoutId);
      loadDashboardData();
    }

    return () => clearTimeout(timeoutId);
  }, [user, isAuthenticated, isLoading, router, loadDashboardData]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handlePublishQuiz = async (quizId: string) => {
    try {
      if (!user?.id) {
        showError('Authentication Required', 'Please sign in to publish quizzes');
        return;
      }
      await publishQuiz(quizId, user.id);
      showSuccess('Success', 'Quiz published successfully!');
      loadDashboardData(); // Reload data to get updated state
    } catch (error) {
      showError('Publish Failed', 'Failed to publish quiz');
    }
  };

  const handleUnpublishQuiz = async (quizId: string) => {
    try {
      if (!user?.id) {
        showError('Authentication Required', 'Please sign in to unpublish quizzes');
        return;
      }
      await unpublishQuiz(quizId, user.id);
      showSuccess('Success', 'Quiz unpublished successfully!');
      loadDashboardData(); // Reload data to get updated state
    } catch (error) {
      showError('Unpublish Failed', 'Failed to unpublish quiz');
    }
  };

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    setConfirmDelete({ open: true, kind: 'quiz', id: quizId, title: quizTitle });
  };

  const handleDeleteResult = (resultId: string, quizTitle: string) => {
    setConfirmDelete({ open: true, kind: 'result', id: resultId, title: quizTitle });
  };

  const closeConfirmModal = () => {
    setConfirmDelete({ open: false, kind: null, id: null, title: '' });
  };

  const confirmDeletion = async () => {
    if (!confirmDelete.open || !confirmDelete.id || !confirmDelete.kind || !user?.id) return;

    if (confirmDelete.kind === 'quiz') {
      try {
        setDeletingQuiz(confirmDelete.id);
        await deleteQuiz(confirmDelete.id);
        showSuccess('Quiz deleted', `"${confirmDelete.title}" has been permanently removed.`);
        loadDashboardData(); // Reload data to get updated state
      } catch (error) {
        console.error('Error deleting quiz:', error);
        showError('Failed to delete quiz', 'An error occurred while deleting the quiz.');
      } finally {
        setDeletingQuiz(null);
        closeConfirmModal();
      }
    } else if (confirmDelete.kind === 'result') {
      try {
        setDeletingResult(confirmDelete.id);
        await deleteQuizResult(confirmDelete.id);
        showSuccess('Result deleted', `Result for "${confirmDelete.title}" has been permanently removed.`);
        loadDashboardData(); // Reload data to get updated state
      } catch (error) {
        console.error('Error deleting result:', error);
        showError('Failed to delete result', 'An error occurred while deleting the result.');
      } finally {
        setDeletingResult(null);
        closeConfirmModal();
      }
    }
  };

  const handleEditQuiz = (quizId: string) => {
    router.push(`/create?edit=${quizId}`);
  };

  const handleViewAnalytics = (quizId: string) => {
    router.push(`/results/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading dashboard..." />
      </div>
    );
  }

  if (authTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Timeout</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page or logging in again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here&apos;s what&apos;s happening with your quizzes and results.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResults}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(stats.totalTimeSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/create"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white rounded-xl hover:from-[#1BA085] hover:to-[#20C997] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-3" />
              Create New Quiz
            </Link>
            <Link
              href="/upload"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <BookOpen className="h-5 w-5 mr-3" />
              Upload PDF/JSON
            </Link>
            <Link
              href="/results"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              View All Results
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Quizzes */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Recent Quizzes</h2>
              <Link
                href="/quiz"
                className="text-[#20C997] hover:text-[#1BA085] text-sm font-medium hover:underline"
              >
                View All →
              </Link>
            </div>
            
            {quizzes.length === 0 ? (
              <NoQuizzesEmptyState />
            ) : (
              <div className="space-y-4">
                {quizzes.slice(0, 5).map((quiz: QuizWithControls) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{quiz.title}</h3>
                          {quiz.isTemporary && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              Quick Test
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{quiz.description || quiz.subject}</p>
                        <p className="text-sm text-gray-500">
                          {quiz.questions.length} questions • {quiz.timeLimit} minutes
                          {quiz.isTemporary && (
                            <span className="ml-2 text-blue-600">• Temporary</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className={`px-6 py-2 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                            quiz.isTemporary 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                              : 'bg-gradient-to-r from-[#20C997] to-[#1BA085] hover:from-[#1BA085] hover:to-[#20C997]'
                          }`}
                        >
                          {quiz.isTemporary ? 'Retake' : 'Start Quiz'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Recent Results</h2>
              <Link
                href="/results"
                className="text-[#20C997] hover:text-[#1BA085] text-sm font-medium hover:underline"
              >
                View All →
              </Link>
            </div>
            
            {results.length === 0 ? (
              <NoResultsEmptyState />
            ) : (
              <div className="space-y-4">
                {results.slice(0, 5).map((result: any) => {
                  const quiz = quizzes.find((q: QuizWithControls) => q.id === result.quizId);
                  return (
                    <div key={result.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {quiz?.title || 'Unknown Quiz'}
                            </h3>
                            {quiz?.isTemporary && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                Quick Test
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">
                            {result.correctAnswers}/{result.totalQuestions} questions correct
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(result.timeTaken)} • {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            result.score >= 70 ? 'text-green-600' : 
                            result.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {result.score}%
                          </div>
                          <div className="flex items-center gap-2 justify-end mt-2">
                            <Link
                              href={`/results/${result.id}`}
                              className="text-sm text-[#20C997] hover:text-[#1BA085] hover:underline"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => handleDeleteResult(result.id, quiz?.title || 'Unknown Quiz')}
                              disabled={deletingResult === result.id}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete result"
                            >
                              {deletingResult === result.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>


      </div>
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeConfirmModal} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md mx-4 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {confirmDelete.kind === 'quiz' ? 'Delete quiz?' : 'Delete result?'}
                </h3>
                <p className="text-sm text-gray-700 mb-2">{confirmDelete.title}</p>
                <p className="text-sm text-gray-600">
                  This action is permanent. Once deleted, you will no longer be able to access this {confirmDelete.kind === 'quiz' ? 'quiz' : 'result'}. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletion}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                disabled={
                  (confirmDelete.kind === 'quiz' && deletingQuiz === confirmDelete.id) ||
                  (confirmDelete.kind === 'result' && deletingResult === confirmDelete.id)
                }
              >
                {((confirmDelete.kind === 'quiz' && deletingQuiz === confirmDelete.id) ||
                  (confirmDelete.kind === 'result' && deletingResult === confirmDelete.id)) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Delete
              </button>
            </div>
            </div>
          </div>
        )}
    </div>
  );
}
