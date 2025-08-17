'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getAuth } from 'firebase/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ExtractedQuestion } from '@/lib/pdf-processor';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { createQuiz } from '@/lib/firebase-quiz';
import { Plus, ArrowRight, FileText, CheckCircle, Play } from 'lucide-react';

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
  const auth = getAuth();
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
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
      description: `Quiz created from uploaded file with ${questions.length} questions`
    }));
  };

  const handleCreateQuiz = async () => {
    if (!auth.currentUser) {
      showError('Authentication Required', 'Please sign in to create quizzes');
      return;
    }

    if (extractedQuestions.length === 0) {
      showError('No Questions', 'No questions available to create quiz');
      return;
    }

    if (!quizData.title.trim()) {
      showError('Missing Title', 'Please enter a quiz title');
      return;
    }

    setIsCreatingQuiz(true);
    try {
             const quizId = await createQuiz({
         ...quizData,
         questions: extractedQuestions,
         createdBy: auth.currentUser.uid
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
    if (!auth.currentUser) {
      showError('Authentication Required', 'Please sign in to start tests');
      return;
    }

    if (extractedQuestions.length === 0) {
      showError('No Questions', 'No questions available to start test');
      return;
    }

    setIsCreatingQuiz(true);
    try {
      // Create a temporary quiz for immediate testing
      const tempQuizId = await createQuiz({
        title: quizData.title || `Quick Test - ${extractedQuestions.length} Questions`,
        description: quizData.description || 'Quick test from uploaded file',
        subject: quizData.subject || 'General',
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
                 questions: extractedQuestions,
         createdBy: auth.currentUser.uid,
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload & Create Quiz</h1>
          <p className="text-gray-600 mt-2">
            Upload PDF or JSON files to create quizzes automatically. JSON files should follow the specified format.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📋 Upload Guidelines:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>JSON files:</strong> Maximum 10MB, up to 500 questions</li>
              <li>• <strong>PDF files:</strong> Maximum 50MB, questions extracted automatically</li>
              <li>• <strong>Start Test:</strong> Begin immediately with uploaded questions</li>
              <li>• <strong>Create Quiz:</strong> Save as permanent quiz for future use</li>
            </ul>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Upload File</h2>
          <FileUploadArea 
            onQuestionsExtracted={handleQuestionsExtracted}
            onUploadStart={() => setExtractedQuestions([])}
          />
        </div>

        {/* Quiz Creation Section */}
        {extractedQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Create Quiz</h2>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{extractedQuestions.length} questions ready</span>
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
                {extractedQuestions.slice(0, 5).map((question, index) => (
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
                {extractedQuestions.length > 5 && (
                  <p className="text-sm text-gray-500 italic">
                    ... and {extractedQuestions.length - 5} more questions
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
                disabled={isCreatingQuiz || extractedQuestions.length === 0}
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
