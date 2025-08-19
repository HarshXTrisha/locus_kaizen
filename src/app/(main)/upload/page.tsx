'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { AppHeader } from '@/components/common/AppHeader';
import { ExtractedQuestion, ExtractedQuiz } from '@/lib/pdf-processor';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { createQuiz, ALLOWED_SUBJECTS } from '@/lib/firebase-quiz';
import { getFirebaseAuth } from '@/lib/firebase-utils';
import { Plus, ArrowRight, FileJson, CheckCircle, Play, FileText, Download } from 'lucide-react';

// Dynamically import FileUploadArea to prevent SSR issues
const FileUploadArea = dynamic(
  () => import('@/components/upload/FileUploadArea').then(mod => ({ default: mod.FileUploadArea })),
  { 
    ssr: false,
    loading: () => <LoadingSpinner size="xl" text="Loading upload component..." />
  }
);

export default function UploadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [extractedQuiz, setExtractedQuiz] = useState<ExtractedQuiz | null>(null);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'txt'>('json');
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 30,
    passingScore: 0
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleQuestionsExtracted = (questions: ExtractedQuestion[]) => {
    setExtractedQuestions(questions);
    // Auto-fill quiz title based on number of questions
    setQuizData(prev => ({
      ...prev,
      title: `Quiz with ${questions.length} Questions`,
      description: `Quiz created from uploaded ${activeTab.toUpperCase()} file(s) with ${questions.length} questions`
    }));
  };

  const handleTXTQuizExtracted = (quiz: ExtractedQuiz) => {
    setExtractedQuiz(quiz);
    setExtractedQuestions(quiz.questions);
    setQuizData(prev => ({
      ...prev,
      title: quiz.title || `Quiz with ${quiz.questions.length} Questions`,
      description: quiz.description || `Quiz extracted from TXT with ${quiz.questions.length} questions`,
      subject: quiz.subject
    }));
  };

  const handleCreateQuiz = async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth?.currentUser) {
        showError('Authentication Required', 'Please sign in to create quizzes');
        return;
      }

      const questionsToUse = extractedQuiz ? extractedQuiz.questions : extractedQuestions;
      
      if (questionsToUse.length === 0) {
        showError('No Questions', 'No questions available to create quiz');
        return;
      }

      if (!quizData.title.trim()) {
        showError('Missing Title', 'Please enter a quiz title');
        return;
      }

      setIsCreatingQuiz(true);
      
      const quizId = await createQuiz({
        ...quizData,
        questions: questionsToUse,
        createdBy: auth?.currentUser?.uid
      });

      showSuccess('Success', 'Quiz created successfully!');
      router.push(`/quiz/${quizId}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      showError('Creation Failed', 'Failed to create quiz. Please try again.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Quiz</h1>
          <p className="text-gray-600">Upload JSON or TXT files to create quizzes</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Area - Moved to Top */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>
            
            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'json'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileJson className="inline-block w-4 h-4 mr-2" />
                    JSON Upload
                  </button>

                  <button
                    onClick={() => setActiveTab('txt')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'txt'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="inline-block w-4 h-4 mr-2" />
                    TXT Upload
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Upload Component - Pass file type based on active tab */}
            <FileUploadArea 
              onQuestionsExtracted={handleQuestionsExtracted}
              accept={activeTab === 'json' ? '.json' : '.txt'}
              fileType={activeTab}
            />
          </div>

          {/* Quiz Details - Moved to Bottom */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quiz title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={quizData.subject}
                  onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a subject</option>
                  {ALLOWED_SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                  placeholder="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="180"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={quizData.passingScore}
                  onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter quiz description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Questions Preview and Create Button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions Preview</h2>
            
            {extractedQuestions.length === 0 ? (
              <EmptyState
                type="upload"
                title="No Questions Yet"
                description="Upload files to see extracted questions here"
                showIcon={true}
              />
            ) : (
              <div className="space-y-4">
                {/* Questions Summary */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Questions ({extractedQuestions.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {extractedQuestions.slice(0, 5).map((question, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900">
                          {index + 1}. {question.text.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: {question.type} | Points: {question.points || 1}
                        </p>
                      </div>
                    ))}
                    {extractedQuestions.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        ... and {extractedQuestions.length - 5} more questions
                      </p>
                    )}
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateQuiz}
                  disabled={isCreatingQuiz || extractedQuestions.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreatingQuiz ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating Quiz...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quiz
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
