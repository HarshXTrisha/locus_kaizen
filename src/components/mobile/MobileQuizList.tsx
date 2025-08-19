'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getUserQuizzes, deleteQuiz } from '@/lib/firebase-quiz';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  BookOpen, Clock, Target, Plus, Trash2, AlertCircle, Loader2,
  ArrowLeft, Play, Settings
} from 'lucide-react';
import Link from 'next/link';
import { mobileClasses } from '@/lib/mobile-detection';

export default function MobileQuizList() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingQuiz, setDeletingQuiz] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    quizId: string | null;
    quizTitle: string;
  }>({ open: false, quizId: null, quizTitle: '' });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    const loadQuizzes = async () => {
      try {
        setLoading(true);
        console.log('📱 Loading quizzes for user:', user.id);
        const userQuizzes = await getUserQuizzes(user.id);
        console.log('📱 Quizzes loaded:', userQuizzes.length, 'quizzes');
        setQuizzes(userQuizzes);
      } catch (error) {
        console.error('❌ Error loading quizzes:', error);
        showError('Error', 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [user, isAuthenticated, router]);

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    console.log('🖱️ Delete button clicked:', { quizId, quizTitle });
    setConfirmDelete({ open: true, quizId, quizTitle });
  };

  const closeConfirmModal = () => {
    setConfirmDelete({ open: false, quizId: null, quizTitle: '' });
  };

  const confirmDeletion = async () => {
    if (!confirmDelete.open || !confirmDelete.quizId) {
      console.log('❌ Delete validation failed:', { open: confirmDelete.open, quizId: confirmDelete.quizId });
      return;
    }

    console.log('🗑️ Starting quiz deletion:', confirmDelete.quizId, confirmDelete.quizTitle);

    try {
      setDeletingQuiz(confirmDelete.quizId);
      console.log('🔄 Calling deleteQuiz function...');
      await deleteQuiz(confirmDelete.quizId);
      console.log('✅ Quiz deleted successfully from Firebase');
      
      showSuccess('Quiz deleted', `"${confirmDelete.quizTitle}" has been removed.`);
      
      // Remove the quiz from the local state
      setQuizzes(prev => {
        const filtered = prev.filter(quiz => quiz.id !== confirmDelete.quizId);
        console.log('🔄 Updated local state:', { before: prev.length, after: filtered.length });
        return filtered;
      });
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      showError('Failed to delete quiz', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingQuiz(null);
      closeConfirmModal();
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className={`${mobileClasses.container} flex items-center justify-center min-h-screen`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${mobileClasses.container} flex items-center justify-center min-h-screen`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${mobileClasses.container} min-h-screen bg-gray-50`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">My Quizzes</h1>
          <Link
            href="/create"
            className="p-2 text-[#20C997] hover:text-[#1BA085]"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mt-8">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Yet</h2>
            <p className="text-gray-600 mb-6">Create your first quiz to get started</p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 bg-[#20C997] text-white rounded-xl hover:bg-[#1BA085] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-600">{quiz.subject}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    disabled={deletingQuiz === quiz.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 ml-2"
                    title="Delete quiz"
                  >
                    {deletingQuiz === quiz.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    {quiz.questions.length} questions
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {quiz.timeLimit} min
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="flex-1 bg-[#20C997] text-white text-center py-3 px-4 rounded-xl hover:bg-[#1BA085] transition-colors flex items-center justify-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Link>
                  <Link
                    href={`/create?edit=${quiz.id}`}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Edit quiz"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeConfirmModal} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-sm p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Delete quiz?
                </h3>
                <p className="text-sm text-gray-700 mb-2">{confirmDelete.quizTitle}</p>
                <p className="text-sm text-gray-600">
                  This action is permanent and cannot be undone.
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
                disabled={deletingQuiz === confirmDelete.quizId}
              >
                {deletingQuiz === confirmDelete.quizId && (
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
