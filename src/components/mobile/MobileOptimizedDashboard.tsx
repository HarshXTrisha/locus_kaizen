'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { 
  getOptimizedDashboardData,
  getUserStats,
  clearAllCaches,
  getCacheStats
} from '@/lib/optimized-firebase';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  Plus, BookOpen, BarChart3, Clock, Users, TrendingUp, 
  Loader2, AlertCircle, Trash2, RefreshCw, Database,
  ChevronRight, Star, Calendar, Target
} from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  NoQuizzesEmptyState, 
  NoResultsEmptyState, 
  ErrorState, 
  LoadingState 
} from '@/components/common/EmptyState';

// Mobile-optimized stat card with touch-friendly design
const MobileStatCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  onClick 
}: {
  title: string;
  value: string;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700'
  };

  return (
    <div 
      className={`p-4 rounded-xl border-2 ${colorClasses[color]} ${onClick ? 'active:scale-95 transition-transform cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium opacity-80">{title}</p>
          <p className="text-lg font-bold mt-1">{value}</p>
        </div>
        <Icon size={24} className="opacity-70" />
      </div>
    </div>
  );
});
MobileStatCard.displayName = 'MobileStatCard';

// Mobile-optimized quiz card with swipe gestures
const MobileQuizCard = React.memo(({ 
  quiz, 
  onDelete, 
  onPublish, 
  onUnpublish 
}: {
  quiz: any;
  onDelete: (id: string, title: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-gray-400" />
            <span className="text-xs text-gray-500">{quiz.subject}</span>
            {quiz.isPublished && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Published
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {quiz.title}
          </h3>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {quiz.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Target size={12} />
              {quiz.questions?.length || 0} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {quiz.timeLimit || 'No limit'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ChevronRight size={16} className={`transition-transform ${showActions ? 'rotate-90' : ''}`} />
        </button>
      </div>
      
      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <Link
              href={`/quiz/${quiz.id}`}
              className="flex-1 bg-blue-50 text-blue-700 text-xs font-medium py-2 px-3 rounded-lg text-center"
            >
              Take Quiz
            </Link>
            <button
              onClick={() => onPublish(quiz.id)}
              className="flex-1 bg-green-50 text-green-700 text-xs font-medium py-2 px-3 rounded-lg"
            >
              Publish
            </button>
            <button
              onClick={() => onDelete(quiz.id, quiz.title)}
              className="bg-red-50 text-red-700 text-xs font-medium py-2 px-3 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
MobileQuizCard.displayName = 'MobileQuizCard';

// Mobile-optimized result card
const MobileResultCard = React.memo(({ result }: { result: any }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm truncate">
          {result.quizTitle}
        </h3>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getScoreColor(result.score)}`}>
          {result.score}%
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(result.completedAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {Math.round(result.timeTaken / 60)}m
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${result.score}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">
          {result.correctAnswers}/{result.totalQuestions}
        </span>
      </div>
    </div>
  );
});
MobileResultCard.displayName = 'MobileResultCard';

export default function MobileOptimizedDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'results'>('overview');

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

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getOptimizedDashboardData(user.id);
      setDashboardData(data);
      setError(null);
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
    if (confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
      // Implement delete logic
      showSuccess('Quiz Deleted', `${quizTitle} has been deleted`);
      loadDashboardData();
    }
  }, [loadDashboardData]);

  const handlePublishQuiz = useCallback((quizId: string) => {
    // Implement publish logic
    showSuccess('Quiz Published', 'Quiz has been published successfully');
    loadDashboardData();
  }, [loadDashboardData]);

  const handleUnpublishQuiz = useCallback((quizId: string) => {
    // Implement unpublish logic
    showSuccess('Quiz Unpublished', 'Quiz has been unpublished');
    loadDashboardData();
  }, [loadDashboardData]);

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
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState title="Dashboard Error" description={error} onRetry={loadDashboardData} />;
  }

  if (!processedData) {
    return <ErrorState title="No Data" description="No data available" onRetry={loadDashboardData} />;
  }

  const { quizzes, results, stats } = processedData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-600">Welcome back! Here&apos;s your quiz overview.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
            { id: 'results', label: 'Results', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <MobileStatCard
                title="Total Quizzes"
                value={stats.totalQuizzes.toLocaleString()}
                icon={BookOpen}
                color="blue"
              />
              <MobileStatCard
                title="Total Results"
                value={stats.totalResults.toLocaleString()}
                icon={BarChart3}
                color="green"
              />
              <MobileStatCard
                title="Average Score"
                value={`${stats.averageScore}%`}
                icon={TrendingUp}
                color="purple"
              />
              <MobileStatCard
                title="Time Spent"
                value={formatTime(stats.totalTimeSpent)}
                icon={Clock}
                color="orange"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/create"
                  className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg"
                >
                  <span className="font-medium">Create New Quiz</span>
                  <Plus size={16} />
                </Link>
                <Link
                  href="/upload"
                  className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg"
                >
                  <span className="font-medium">Upload Questions</span>
                  <ChevronRight size={16} />
                </Link>
                <button
                  onClick={handleClearCache}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 text-gray-700 rounded-lg"
                >
                  <span className="font-medium">Clear Cache</span>
                  <Database size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div>
            {quizzes.length === 0 ? (
              <NoQuizzesEmptyState onCreateQuiz={() => router.push('/create')} />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Your Quizzes</h2>
                  <Link
                    href="/create"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create Quiz
                  </Link>
                </div>
                {quizzes.map((quiz: any) => (
                  <MobileQuizCard
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
        )}

        {activeTab === 'results' && (
          <div>
            {results.length === 0 ? (
              <NoResultsEmptyState onTakeQuiz={() => router.push('/dashboard')} />
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h2>
                {results.slice(0, 10).map((result: any) => (
                  <MobileResultCard key={result.id} result={result} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
