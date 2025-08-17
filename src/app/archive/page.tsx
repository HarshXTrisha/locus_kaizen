'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getUserQuizzes, deleteQuiz } from '@/lib/firebase-quiz';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { 
  BookOpen, 
  Trash2, 
  Edit, 
  Eye, 
  Clock, 
  Users, 
  AlertTriangle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questions: any[];
  timeLimit: number;
  passingScore: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  isTemporary?: boolean;
}

export default function ArchivePage() {
  const router = useRouter();
  const { user, isAuthenticated, addNotification } = useAppStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingQuiz, setDeletingQuiz] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'published' | 'draft' | 'temporary'>('all');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    loadQuizzes();
  }, [isAuthenticated, user, router]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const userQuizzes = await getUserQuizzes(user.id);
      setQuizzes(userQuizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      showError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
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
      
      // Add notification
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Quiz Deleted',
        message: `"${quizTitle}" has been removed from your quiz library.`,
        createdAt: new Date(),
        read: false
      });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showError('Failed to delete quiz');
    } finally {
      setDeletingQuiz(null);
    }
  };

  const getFilteredQuizzes = () => {
    let filtered = quizzes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'published':
        filtered = filtered.filter(quiz => quiz.isPublished && !quiz.isTemporary);
        break;
      case 'draft':
        filtered = filtered.filter(quiz => !quiz.isPublished && !quiz.isTemporary);
        break;
      case 'temporary':
        filtered = filtered.filter(quiz => quiz.isTemporary);
        break;
      default:
        break;
    }

    return filtered;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  const filteredQuizzes = getFilteredQuizzes();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
              <p className="text-gray-600 mt-2">Manage and organize your quiz library</p>
            </div>
            <Link
              href="/create"
              className="flex items-center px-6 py-3 bg-[#20C997] text-white rounded-xl hover:bg-[#1BA085] transition-colors shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Quiz
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes by title, description, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
              >
                <option value="all">All Quizzes</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="xl" text="Loading quizzes..." />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'No quizzes found' : 'No quizzes yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first quiz to get started with your learning journey.'
              }
            </p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 bg-[#20C997] text-white rounded-xl hover:bg-[#1BA085] transition-colors shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {quiz.description || `Quiz on ${quiz.subject}`}
                    </p>
                  </div>
                  {quiz.isTemporary && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full ml-2">
                      Quick Test
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="h-4 w-4" />
                    <span>{quiz.questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.timeLimit} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{quiz.passingScore}% passing score</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Created {formatDate(quiz.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-[#20C997] text-white text-sm font-medium rounded-lg hover:bg-[#1BA085] transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {quiz.isTemporary ? 'Retake' : 'Start Quiz'}
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    disabled={deletingQuiz === quiz.id}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete quiz"
                  >
                    {deletingQuiz === quiz.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {quizzes.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#20C997]">{quizzes.length}</div>
                <div className="text-sm text-gray-600">Total Quizzes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {quizzes.filter(q => q.isPublished && !q.isTemporary).length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {quizzes.filter(q => !q.isPublished && !q.isTemporary).length}
                </div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {quizzes.filter(q => q.isTemporary).length}
                </div>
                <div className="text-sm text-gray-600">Temporary</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
