'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { 
  getOptimizedDashboardData,
  getUserStats,
  clearAllCaches,
  getCacheStats
} from '@/lib/optimized-firebase';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { Plus, BookOpen, BarChart3, Clock, Users, TrendingUp, Loader2, AlertCircle, Trash2, RefreshCw, Database } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  NoQuizzesEmptyState, 
  NoResultsEmptyState, 
  ErrorState, 
  LoadingState 
} from '@/components/common/EmptyState';

// Optimized Stats Card Component
const StatCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  trend 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color?: string;
  trend?: { value: number; isPositive: boolean };
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
              {trend.value}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-white/50`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

// Optimized Quiz Card Component
const QuizCard = React.memo(({ 
  quiz, 
  onDelete, 
  onPublish, 
  onUnpublish,
  isDeleting = false 
}: {
  quiz: any;
  onDelete: (id: string, title: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  isDeleting?: boolean;
}) => {
  const formatTime = useCallback((minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  const handleAction = useCallback((action: 'publish' | 'unpublish' | 'delete') => {
    switch (action) {
      case 'publish':
        onPublish(quiz.id);
        break;
      case 'unpublish':
        onUnpublish(quiz.id);
        break;
      case 'delete':
        onDelete(quiz.id, quiz.title);
        break;
    }
  }, [quiz.id, quiz.title, onPublish, onUnpublish, onDelete]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quiz.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              {quiz.questions?.length || 0} questions
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(quiz.timeLimit)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              quiz.isPublished 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {quiz.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {!isDeleting ? (
            <>
              {quiz.isPublished ? (
                <button
                  onClick={() => handleAction('unpublish')}
                  className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                  title="Unpublish"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleAction('publish')}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Publish"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleAction('delete')}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
});

QuizCard.displayName = 'QuizCard';

// Optimized Result Card Component
const ResultCard = React.memo(({ 
  result, 
  onDelete, 
  isDeleting = false 
}: {
  result: any;
  onDelete: (id: string, title: string) => void;
  isDeleting?: boolean;
}) => {
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">Quiz Result</h4>
          <p className="text-sm text-gray-600 mb-2">
            {result.correctAnswers}/{result.totalQuestions} correct
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(result.timeTaken)}
            </span>
            <span className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-1" />
              {formatDate(result.completedAt)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
            {result.score}%
          </span>
          
          {!isDeleting ? (
            <button
              onClick={() => onDelete(result.id, 'Quiz Result')}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete Result"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
});

ResultCard.displayName = 'ResultCard';

// Main Optimized Dashboard Component
export default function OptimizedDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!dashboardData) return null;

    const { quizzes, results, stats } = dashboardData;
    
    return {
      quizzes: quizzes || [],
      results: results || [],
      stats: {
        totalQuizzes: stats?.totalQuizzes || 0,
        totalResults: stats?.totalResults || 0,
        averageScore: stats?.averageScore || 0,
        totalTimeSpent: stats?.totalTimeSpent || 0
      }
    };
  }, [dashboardData]);

  // Memoized stats cards data
  const statsCards = useMemo(() => {
    if (!processedData) return [];

    const { stats } = processedData;
    
    return [
      {
        title: 'Total Quizzes',
        value: stats.totalQuizzes.toLocaleString(),
        icon: BookOpen,
        color: 'blue' as const
      },
      {
        title: 'Total Results',
        value: stats.totalResults.toLocaleString(),
        icon: BarChart3,
        color: 'green' as const
      },
      {
        title: 'Average Score',
        value: `${stats.averageScore}%`,
        icon: TrendingUp,
        color: 'purple' as const
      },
      {
        title: 'Time Spent',
        value: formatTime(stats.totalTimeSpent),
        icon: Clock,
        color: 'orange' as const
      }
    ];
  }, [processedData, formatTime]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      const data = await getOptimizedDashboardData(user.id);
      setDashboardData(data);
      
      // Get cache stats for debugging
      const stats = getCacheStats();
      setCacheStats(stats);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const handleClearCache = useCallback(() => {
    clearAllCaches();
    showSuccess('Cache Cleared', 'All cached data has been cleared');
    loadDashboardData();
  }, [loadDashboardData]);

  const handleDeleteQuiz = useCallback((quizId: string, quizTitle: string) => {
    // Implementation for quiz deletion
    console.log('Delete quiz:', quizId, quizTitle);
  }, []);

  const handleDeleteResult = useCallback((resultId: string, resultTitle: string) => {
    // Implementation for result deletion
    console.log('Delete result:', resultId, resultTitle);
  }, []);

  const handlePublishQuiz = useCallback((quizId: string) => {
    // Implementation for quiz publishing
    console.log('Publish quiz:', quizId);
  }, []);

  const handleUnpublishQuiz = useCallback((quizId: string) => {
    // Implementation for quiz unpublishing
    console.log('Unpublish quiz:', quizId);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [user, isAuthenticated, isLoading, router, loadDashboardData]);

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorState title="Dashboard Error" description={error} onRetry={loadDashboardData} />;
  }

  if (!processedData) {
    return <ErrorState title="No Data" description="No data available" onRetry={loadDashboardData} />;
  }

  const { quizzes, results } = processedData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your quiz overview.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleClearCache}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              title={`Cache entries: ${cacheStats?.totalEntries || 0}`}
            >
              <Database className="w-4 h-4" />
              Clear Cache
            </button>
            
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Quiz
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Quizzes */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Quizzes</h2>
              <Link
                href="/quizzes"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {quizzes.length === 0 ? (
              <NoQuizzesEmptyState />
            ) : (
              <div className="space-y-4">
                {quizzes.slice(0, 5).map((quiz: any) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onDelete={handleDeleteQuiz}
                    onPublish={handlePublishQuiz}
                    onUnpublish={handleUnpublishQuiz}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
              <Link
                href="/results"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {results.length === 0 ? (
              <NoResultsEmptyState />
            ) : (
              <div className="space-y-4">
                {results.slice(0, 5).map((result: any) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onDelete={handleDeleteResult}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        {cacheStats && (
          <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h3>
            <div className="text-xs text-gray-600">
              Cache entries: {cacheStats.totalEntries} | 
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
