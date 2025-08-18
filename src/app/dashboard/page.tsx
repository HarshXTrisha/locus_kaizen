'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getUserQuizzes, getUserQuizResults, deleteQuiz, deleteQuizResult } from '@/lib/firebase-quiz';
import { getFirebaseAuth } from '@/lib/firebase-utils';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { Plus, BookOpen, BarChart3, Clock, Users, TrendingUp, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppStore();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(false);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalResults: 0,
    averageScore: 0,
    totalTimeSpent: 0
  });
  const [deletingQuiz, setDeletingQuiz] = useState<string | null>(null);
  const [deletingResult, setDeletingResult] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      console.log('🏠 Dashboard: Loading dashboard data...');
      setLoading(true);
      
      // Load user's quizzes
      const auth = getFirebaseAuth();
      const userQuizzes = await getUserQuizzes(auth.currentUser!.uid);
      setQuizzes(userQuizzes);
      
      // Load user's results
      const userResults = await getUserQuizResults(auth.currentUser!.uid);
      setResults(userResults);
      
      // Calculate stats
      const totalQuizzes = userQuizzes.length;
      const totalResults = userResults.length;
      const averageScore = totalResults > 0 
        ? Math.round(userResults.reduce((sum: number, result: any) => sum + result.score, 0) / totalResults)
        : 0;
      const totalTimeSpent = userResults.reduce((sum: number, result: any) => sum + result.timeTaken, 0);
      
      setStats({
        totalQuizzes,
        totalResults,
        averageScore,
        totalTimeSpent
      });
      
      console.log('🏠 Dashboard: Data loaded successfully');
      
    } catch (error) {
      console.error('🏠 Dashboard: Error loading dashboard data:', error);
      showError('Loading Failed', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingQuiz(quizId);
      await deleteQuiz(quizId);
      
      // Remove from local state
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      
      showSuccess('Quiz Deleted', `"${quizTitle}" has been successfully deleted.`);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showError('Failed to delete quiz', 'An error occurred while deleting the quiz.');
    } finally {
      setDeletingQuiz(null);
    }
  };

  const handleDeleteResult = async (resultId: string, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete the result for "${quizTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingResult(resultId);
      await deleteQuizResult(resultId);
      
      // Remove from local state
      setResults(prev => prev.filter(result => result.id !== resultId));
      
      showSuccess('Result Deleted', `Result for "${quizTitle}" has been successfully deleted.`);
    } catch (error) {
      console.error('Error deleting result:', error);
      showError('Failed to delete result', 'An error occurred while deleting the result.');
    } finally {
      setDeletingResult(null);
    }
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
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6 text-lg">No quizzes created yet</p>
                <Link
                  href="/create"
                  className="inline-flex items-center px-6 py-3 bg-[#20C997] text-white rounded-xl hover:bg-[#1BA085] transition-colors shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Quiz
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.slice(0, 5).map((quiz: any) => (
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
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          disabled={deletingQuiz === quiz.id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete quiz"
                        >
                          {deletingQuiz === quiz.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
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
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6 text-lg">No quiz results yet</p>
                <Link
                  href="/quiz"
                  className="inline-flex items-center px-6 py-3 bg-[#20C997] text-white rounded-xl hover:bg-[#1BA085] transition-colors shadow-lg"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Take a Quiz
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {results.slice(0, 5).map((result: any) => {
                  const quiz = quizzes.find((q: any) => q.id === result.quizId);
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
    </div>
  );
}
