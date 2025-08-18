'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ExtractedQuestion, ExtractedQuiz } from '@/lib/pdf-processor';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { createQuiz } from '@/lib/firebase-quiz';
import { getFirebaseAuth } from '@/lib/firebase-utils';
import { Plus, ArrowRight, FileJson, CheckCircle, Play, FileText } from 'lucide-react';

// Dynamically import FileUploadArea to prevent SSR issues
const FileUploadArea = dynamic(
  () => import('@/components/upload/FileUploadArea').then(mod => ({ default: mod.FileUploadArea })),
  { 
    ssr: false,
    loading: () => <LoadingSpinner size="xl" text="Loading upload component..." />
  }
);

// Dynamically import PDFUploadArea to prevent SSR issues
const PDFUploadArea = dynamic(
  () => import('@/components/upload/PDFUploadArea').then(mod => ({ default: mod.PDFUploadArea })),
  { 
    ssr: false,
    loading: () => <LoadingSpinner size="xl" text="Loading PDF component..." />
  }
);

export default function UploadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [extractedQuiz, setExtractedQuiz] = useState<ExtractedQuiz | null>(null);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'pdf'>('json');
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 30,
    passingScore: 70
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
      description: `Quiz created from uploaded JSON file(s) with ${questions.length} questions`
    }));
  };

  const handlePDFQuizExtracted = (quiz: ExtractedQuiz) => {
    setExtractedQuiz(quiz);
    setExtractedQuestions(quiz.questions);
    setQuizData(prev => ({
      ...prev,
      title: quiz.title,
      description: quiz.description || `Quiz extracted from PDF with ${quiz.questions.length} questions`,
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

      showSuccess('Quiz Created!', 'Your quiz has been created successfully');
      
      // Navigate to the quiz
      router.push(`/quiz/${quizId}`);
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      showError('Quiz Creation Failed', 'Failed to create quiz. Please try again.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleStartTest = async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth?.currentUser) {
        showError('Authentication Required', 'Please sign in to start tests');
        return;
      }

      const questionsToUse = extractedQuiz ? extractedQuiz.questions : extractedQuestions;
      
      if (questionsToUse.length === 0) {
        showError('No Questions', 'No questions available to start test');
        return;
      }

      setIsCreatingQuiz(true);
      
      // Create a temporary quiz for immediate testing
      const tempQuizId = await createQuiz({
        title: quizData.title || `Quick Test - ${questionsToUse.length} Questions`,
        description: quizData.description || 'Quick test from uploaded file(s)',
        subject: quizData.subject || 'General',
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        questions: questionsToUse,
        createdBy: auth?.currentUser?.uid,
        isTemporary: true // Mark as temporary
      });

      showSuccess('Test Started!', 'Your test is ready to begin');
      
      // Navigate directly to the quiz
      router.push(`/quiz/${tempQuizId}`);
      
    } catch (error) {
      console.error('Error starting test:', error);
      showError('Test Start Failed', 'Failed to start test. Please try again.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleReset = () => {
    setExtractedQuestions([]);
    setExtractedQuiz(null);
    setQuizData({
      title: '',
      description: '',
      subject: '',
      timeLimit: 30,
      passingScore: 70
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  const hasQuestions = extractedQuestions.length > 0 || extractedQuiz;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload & Create Quiz</h1>
          <p className="text-gray-600 mt-2">
            Upload JSON files or PDF documents to create quizzes automatically.
          </p>
          
          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex gap-8">
              <button
                onClick={() => setActiveTab('json')}
                className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
                  activeTab === 'json'
                    ? 'border-[#20C997] text-[#20C997]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON Upload
                </div>
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
                  activeTab === 'pdf'
                    ? 'border-[#20C997] text-[#20C997]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF Upload
                </div>
              </button>
            </nav>
          </div>

          {/* Upload Guidelines */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📋 Upload Guidelines:</h3>
            {activeTab === 'json' ? (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>JSON files only:</strong> Maximum 10MB per file, up to 500 questions per file</li>
                <li>• <strong>Bulk upload:</strong> Upload multiple JSON files at once (max 1000 total questions)</li>
                <li>• <strong>Required format:</strong> Download the template for exact JSON structure</li>
                <li>• <strong>Start Test:</strong> Begin immediately with uploaded questions</li>
                <li>• <strong>Create Quiz:</strong> Save as permanent quiz for future use</li>
              </ul>
            ) : (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>PDF files only:</strong> Maximum 10MB per file</li>
                <li>• <strong>Supported format:</strong> Questions with Q1, A), B), C), D) pattern</li>
                <li>• <strong>Automatic extraction:</strong> Questions and options are automatically detected</li>
                <li>• <strong>Client-side processing:</strong> PDF never leaves your device</li>
                <li>• <strong>Preview available:</strong> Review extracted questions before creating quiz</li>
              </ul>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 1: Upload {activeTab === 'json' ? 'JSON Files' : 'PDF Document'}
          </h2>
          
          {activeTab === 'json' ? (
            <FileUploadArea 
              onQuestionsExtracted={handleQuestionsExtracted}
              onUploadStart={() => setExtractedQuestions([])}
            />
          ) : (
            <PDFUploadArea
              onQuizExtracted={handlePDFQuizExtracted}
              onUploadStart={() => {
                setExtractedQuestions([]);
                setExtractedQuiz(null);
              }}
            />
          )}
        </div>

        {/* Quiz Creation Section */}
        {hasQuestions && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Create Quiz</h2>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {extractedQuiz ? extractedQuiz.questions.length : extractedQuestions.length} questions ready
                </span>
              </div>
            </div>

            {/* Quiz Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                  placeholder="Enter quiz title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={quizData.subject}
                  onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                  placeholder="e.g., Mathematics, Science"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                  rows={3}
                  placeholder="Enter quiz description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                  min="1"
                  max="480"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={quizData.passingScore}
                  onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Questions Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Questions Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {(extractedQuiz ? extractedQuiz.questions : extractedQuestions).slice(0, 5).map((question, index) => (
                  <div key={question.id} className="mb-3 last:mb-0">
                    <p className="text-sm font-medium text-gray-900">
                      Q{index + 1}: {question.text}
                    </p>
                    {question.options && (
                      <p className="text-xs text-gray-600 mt-1">
                        Options: {question.options.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
                {(extractedQuiz ? extractedQuiz.questions : extractedQuestions).length > 5 && (
                  <p className="text-sm text-gray-500 italic">
                    ... and {(extractedQuiz ? extractedQuiz.questions : extractedQuestions).length - 5} more questions
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              
              {/* Start Test Button - For immediate testing */}
              <button
                onClick={handleStartTest}
                disabled={isCreatingQuiz || !hasQuestions}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingQuiz ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Test
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              
              {/* Create Quiz Button - For permanent quiz */}
              <button
                onClick={handleCreateQuiz}
                disabled={isCreatingQuiz || !quizData.title.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingQuiz ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Quiz
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
