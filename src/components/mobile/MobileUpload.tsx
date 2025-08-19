'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  Upload, FileText, File, ArrowLeft, CheckCircle, AlertCircle,
  Trash2, Download, Eye, Clock, Loader2, X, Plus, Play
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';
import { ExtractedQuestion, ExtractedQuiz } from '@/lib/pdf-processor';
import { createQuiz, ALLOWED_SUBJECTS } from '@/lib/firebase-quiz';
import { getFirebaseAuth } from '@/lib/firebase-utils';
import dynamic from 'next/dynamic';
import { PDFUploadArea } from '../upload/PDFUploadArea';

// Dynamically import upload components to prevent SSR issues
const FileUploadArea = dynamic(
  () => import('@/components/upload/FileUploadArea').then(mod => ({ default: mod.FileUploadArea })),
  { ssr: false }
);



export default function MobileUpload() {
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
    console.log('📱 JSON questions extracted:', questions.length);
    setExtractedQuestions(questions);
    setQuizData(prev => ({
      ...prev,
      title: `Quiz with ${questions.length} Questions`,
      description: `Quiz created from uploaded JSON file(s) with ${questions.length} questions`
    }));
  };



  const handleTXTQuizExtracted = (quiz: ExtractedQuiz) => {
    console.log('📱 TXT quiz extracted:', quiz.title, quiz.questions.length);
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
      console.log('📱 Creating quiz from extracted data...');
      const auth = getFirebaseAuth();
      if (!auth?.currentUser || !user) {
        showError('Authentication Required', 'Please sign in to create quizzes');
        return;
      }

      const questionsToUse = extractedQuiz ? extractedQuiz.questions : extractedQuestions;
      
      if (questionsToUse.length === 0) {
        showError('No Questions', 'No questions available to create quiz');
        return;
      }

      setIsCreatingQuiz(true);

      const quizId = await createQuiz({
        title: quizData.title,
        description: quizData.description,
        subject: quizData.subject || 'General',
        questions: questionsToUse,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        createdBy: user.id
      });

      console.log('📱 Quiz created successfully:', quizId);
      showSuccess('Quiz Created', 'Your quiz has been created successfully!');
      
      // Reset form
      setExtractedQuestions([]);
      setExtractedQuiz(null);
      setQuizData({
        title: '',
        description: '',
        subject: '',
        timeLimit: 30,
        passingScore: 0
      });

      // Navigate to quiz
      router.push(`/quiz/${quizId}`);
    } catch (error) {
      console.error('❌ Error creating quiz:', error);
      showError('Failed to Create Quiz', 'An error occurred while creating the quiz');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const hasQuestions = extractedQuestions.length > 0 || extractedQuiz;

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
          <h1 className="text-lg font-semibold text-gray-900">Upload Files</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'json', label: 'JSON', icon: FileText },
            { id: 'txt', label: 'TXT', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'json' | 'txt')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#20C997] text-[#20C997]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Upload Area */}
        <div className={mobileClasses.card}>
          {activeTab === 'json' && (
            <FileUploadArea
              onQuestionsExtracted={handleQuestionsExtracted}
              accept=".json"
            />
          )}

          {activeTab === 'txt' && (
            <PDFUploadArea
              onQuizExtracted={handleTXTQuizExtracted}
            />
          )}
        </div>

        {/* Quiz Creation Form */}
        {hasQuestions && (
          <div className={mobileClasses.card}>
            <h3 className={mobileClasses.text.h3 + " mb-4"}>Create Quiz</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                  placeholder="Enter quiz title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                  rows={3}
                  placeholder="Enter quiz description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={quizData.subject}
                  onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                >
                  <option value="">Select subject</option>
                  {ALLOWED_SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (min)
                  </label>
                  <input
                    type="number"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                    min="1"
                    max="180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {extractedQuestions.length} questions ready
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateQuiz}
                disabled={isCreatingQuiz || !quizData.title}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isCreatingQuiz || !quizData.title
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#20C997] text-white hover:bg-[#1BA085]'
                }`}
              >
                {isCreatingQuiz ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Quiz...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Quiz
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={mobileClasses.card}>
          <h3 className={mobileClasses.text.h3 + " mb-3"}>How to Upload</h3>
          
          {/* MCQ Only Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Important: Test Portal Only Supports MCQ</span>
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              Only Multiple Choice Questions (MCQ) are supported in the test portal. True/False and Short Answer questions will not work properly.
            </p>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-[#20C997] rounded-full mt-2 flex-shrink-0" />
              <p><strong>JSON:</strong> Upload structured quiz data in JSON format (MCQ only)</p>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-[#20C997] rounded-full mt-2 flex-shrink-0" />
              <p><strong>TXT:</strong> Upload text files for question extraction (MCQ only)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
