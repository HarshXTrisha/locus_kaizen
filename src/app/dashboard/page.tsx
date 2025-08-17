'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getUserQuizzes, getUserQuizResults } from '@/lib/firebase-quiz';
import { getFirebaseAuth } from '@/lib/firebase-utils';
import { showError } from '@/components/common/NotificationSystem';
import { Plus, BookOpen, BarChart3, Clock, Users, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ContentTable } from '@/components/common/ContentTable';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppStore();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(false);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalResults: 0,
    averageScore: 0,
    totalTimeSpent: 0
  });

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
  }, [user]);

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

  // Generate content table after component mounts
  useEffect(() => {
    const items = [
      { id: 'overview', title: 'Overview', level: 1 },
      { id: 'quick-actions', title: 'Quick Actions', level: 1 },
      { id: 'recent-quizzes', title: 'Recent Quizzes', level: 1 },
      { id: 'recent-results', title: 'Recent Results', level: 1 }
    ];
    setContentItems(items);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Show timeout message if auth is taking too long
  if (authTimeout && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Timeout</h2>
          <p className="text-gray-600 mb-4">It&apos;s taking longer than expected to verify your authentication.</p>
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

  // Show loading while checking authentication
  if (isLoading || (!isAuthenticated && !authTimeout)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#20C997] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div id="overview" className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.firstName || 'User'}!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalResults}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
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
            <div id="quick-actions" className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/create"
                  className="flex items-center px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quiz
                </Link>
                <Link
                  href="/upload"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Upload PDF
                </Link>
                <Link
                  href="/results"
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Results
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Quizzes */}
              <div id="recent-quizzes" className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Quizzes</h2>
                  <Link
                    href="/quiz"
                    className="text-[#20C997] hover:text-[#1BA085] text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                {quizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No quizzes created yet</p>
                    <Link
                      href="/create"
                      className="inline-flex items-center px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Quiz
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quizzes.slice(0, 5).map((quiz: any) => (
                      <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                              {quiz.isTemporary && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  Quick Test
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{quiz.subject}</p>
                            <p className="text-xs text-gray-500">
                              {quiz.questions.length} questions • {quiz.timeLimit} minutes
                              {quiz.isTemporary && (
                                <span className="ml-2 text-blue-600">• Temporary</span>
                              )}
                            </p>
                          </div>
                          <Link
                            href={`/quiz/${quiz.id}`}
                            className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                              quiz.isTemporary 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-[#20C997] hover:bg-[#1BA085]'
                            }`}
                          >
                            {quiz.isTemporary ? 'Retake' : 'Start'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Results */}
              <div id="recent-results" className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
                  <Link
                    href="/results"
                    className="text-[#20C997] hover:text-[#1BA085] text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                {results.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No quiz results yet</p>
                    <Link
                      href="/quiz"
                      className="inline-flex items-center px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Take a Quiz
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.slice(0, 5).map((result: any) => (
                      <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">
                                {quizzes.find((q: any) => q.id === result.quizId)?.title || 'Unknown Quiz'}
                              </h3>
                              {quizzes.find((q: any) => q.id === result.quizId)?.isTemporary && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  Quick Test
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {result.correctAnswers}/{result.totalQuestions} correct
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(result.timeTaken)} • {new Date(result.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              result.score >= 70 ? 'text-green-600' : 
                              result.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {result.score}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Content Table */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ContentTable items={contentItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
