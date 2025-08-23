'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Play, Settings, BarChart3, Clock, Target, Link as LinkIcon, Copy, Plus, CheckCircle, Upload, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { createQuiz, getUserQuizzesWithControls, getUserQuizResults, getUserTakenQuizzes, deleteQuiz, deleteQuizResult } from '@/lib/firebase-quiz';
import { useAppStore } from '@/lib/store';
import { FileUploadArea } from '@/components/upload/FileUploadArea';
import { PDFUploadArea } from '@/components/upload/PDFUploadArea';
import { getLeaderboard } from '@/lib/leaderboard';
import { LeaderboardDisplay } from '@/components/common/LeaderboardDisplay';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

export default function IIMBBBADBEPage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastCreatedQuiz, setLastCreatedQuiz] = useState<{ id: string; link: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalResults: 0,
    averageScore: 0
  });
  
  // Upload state
  const [activeUploadTab, setActiveUploadTab] = useState<'json' | 'pdf' | 'txt'>('json');
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 30,
    passingScore: 0
  });

  // Quiz and results data
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [takenQuizzes, setTakenQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // IIMB BBA DBE specific subjects
  const iimSubjects = [
    'Spreadsheets for Business Decisions',
    'Understanding Indian Culture: Theatre and its Presence in Daily Life',
    'Exploring Sustainability in the Indian Context',
    'Social Media for Marketing',
    'Design Your Thinking',
    'Entrepreneurial Mindset and Methods',
    'Management Accounting'
  ];

  // Custom subject state
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomSubjectInput, setShowCustomSubjectInput] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'quiz' | 'result';
    itemId: string;
    itemName: string;
  }>({
    isOpen: false,
    type: 'quiz',
    itemId: '',
    itemName: ''
  });

  // Load portal data
  useEffect(() => {
    const loadPortalData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load quizzes and results for IIMB portal
        const [userQuizzes, userTakenQuizzes, userResults] = await Promise.all([
          getUserQuizzesWithControls(user.id),
          getUserTakenQuizzes(user.id),
          getUserQuizResults(user.id)
        ]);

        // Filter for IIMB portal data
        const iimbQuizzes = userQuizzes.filter(quiz => quiz.source === 'iimb-bba-dbe');
        const iimbTakenQuizzes = userTakenQuizzes.filter(quiz => quiz.source === 'iimb-bba-dbe');
        const iimbResults = userResults.filter(result => result.source === 'iimb-bba-dbe');

        setQuizzes(iimbQuizzes);
        setTakenQuizzes(iimbTakenQuizzes);
        setResults(iimbResults);

        // Calculate stats
        const averageScore = iimbResults.length > 0 
          ? Math.round(iimbResults.reduce((sum, result) => sum + result.score, 0) / iimbResults.length)
          : 0;

        setStats({
          totalQuizzes: iimbQuizzes.length + iimbTakenQuizzes.length,
          totalResults: iimbResults.length,
          averageScore
        });

      } catch (error) {
        console.error('Error loading portal data:', error);
        showError('Loading Error', 'Failed to load portal data');
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, [user?.id]);

  // Upload handlers
  const handleQuestionsExtracted = (questions: any[]) => {
    setExtractedQuestions(questions);
    showSuccess('Questions Extracted', `Successfully extracted ${questions.length} questions from the file.`);
  };

  const handlePDFQuizExtracted = (quizData: any) => {
    setQuizData(prev => ({
      ...prev,
      title: quizData.title || prev.title,
      description: quizData.description || prev.description,
      subject: quizData.subject || prev.subject
    }));
    setExtractedQuestions(quizData.questions || []);
    showSuccess('PDF Processed', 'Successfully extracted quiz data from PDF.');
  };

  const handleTXTQuizExtracted = (questions: any[]) => {
    setExtractedQuestions(questions);
    showSuccess('TXT Processed', `Successfully extracted ${questions.length} questions from TXT file.`);
  };

  const handleCreateQuiz = async () => {
    if (!user?.id) {
      showError('Authentication Required', 'Please sign in to create quizzes.');
      return;
    }

    if (extractedQuestions.length === 0) {
      showError('No Questions', 'Please upload a file with questions first.');
      return;
    }

    if (!quizData.title.trim()) {
      showError('Missing Title', 'Please enter a quiz title.');
      return;
    }

    setIsCreatingQuiz(true);
    try {
      const quizToSave = {
        title: quizData.title,
        description: quizData.description,
        subject: quizData.subject,
        questions: extractedQuestions,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        createdBy: user.id,
        source: 'iimb-bba-dbe' as const
      };

      const quizId = await createQuiz(quizToSave);
      showSuccess('Quiz Created', 'Quiz created successfully from uploaded file!');
      
      // Reload portal data
      const [userQuizzes] = await Promise.all([
        getUserQuizzesWithControls(user.id)
      ]);
      const iimbQuizzes = userQuizzes.filter(quiz => quiz.source === 'iimb-bba-dbe');
      setQuizzes(iimbQuizzes);
      setStats(prev => ({ ...prev, totalQuizzes: iimbQuizzes.length }));
      
      // Reset form
      setQuizData({
        title: '',
        description: '',
        subject: '',
        timeLimit: 30,
        passingScore: 0
      });
      setExtractedQuestions([]);
      setCustomSubject('');
      setShowCustomSubjectInput(false);
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      showError('Creation Failed', 'Failed to create quiz. Please try again.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Link copied!');
      setTimeout(() => setCopyStatus(''), 1500);
    } catch (e) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(''), 1500);
    }
  };

  // Show delete quiz confirmation
  const showDeleteQuizConfirmation = (quizId: string, quizTitle: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'quiz',
      itemId: quizId,
      itemName: quizTitle
    });
  };

  // Delete quiz function
  const handleDeleteQuiz = async (quizId: string) => {
    if (!user?.id) {
      showError('Authentication Required', 'Please sign in to delete quizzes.');
      return;
    }

    try {
      await deleteQuiz(quizId);
      showSuccess('Quiz Deleted', 'Quiz deleted successfully!');
      
      // Reload portal data
      const [userQuizzes, userTakenQuizzes, userResults] = await Promise.all([
        getUserQuizzesWithControls(user.id),
        getUserTakenQuizzes(user.id),
        getUserQuizResults(user.id)
      ]);

      // Filter for IIMB portal data
      const iimbQuizzes = userQuizzes.filter(quiz => quiz.source === 'iimb-bba-dbe');
      const iimbTakenQuizzes = userTakenQuizzes.filter(quiz => quiz.source === 'iimb-bba-dbe');
      const iimbResults = userResults.filter(result => result.source === 'iimb-bba-dbe');

      setQuizzes(iimbQuizzes);
      setTakenQuizzes(iimbTakenQuizzes);
      setResults(iimbResults);

      // Update stats
      const averageScore = iimbResults.length > 0 
        ? Math.round(iimbResults.reduce((sum, result) => sum + result.score, 0) / iimbResults.length)
        : 0;

      setStats({
        totalQuizzes: iimbQuizzes.length + iimbTakenQuizzes.length,
        totalResults: iimbResults.length,
        averageScore
      });
      
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showError('Delete Failed', 'Failed to delete quiz. Please try again.');
    }
  };

  // Show delete result confirmation
  const showDeleteResultConfirmation = (resultId: string, resultScore: number) => {
    setConfirmationModal({
      isOpen: true,
      type: 'result',
      itemId: resultId,
      itemName: `Result (${resultScore}%)`
    });
  };

  // Delete result function
  const handleDeleteResult = async (resultId: string) => {
    if (!user?.id) {
      showError('Authentication Required', 'Please sign in to delete results.');
      return;
    }

    try {
      await deleteQuizResult(resultId);
      showSuccess('Result Deleted', 'Result deleted successfully!');
      
      // Reload portal data
      const [userQuizzes, userTakenQuizzes, userResults] = await Promise.all([
        getUserQuizzesWithControls(user.id),
        getUserTakenQuizzes(user.id),
        getUserQuizResults(user.id)
      ]);

      // Filter for IIMB portal data
      const iimbQuizzes = userQuizzes.filter(quiz => quiz.source === 'iimb-bba-dbe');
      const iimbTakenQuizzes = userTakenQuizzes.filter(quiz => quiz.source === 'iimb-bba-dbe');
      const iimbResults = userResults.filter(result => result.source === 'iimb-bba-dbe');

      setQuizzes(iimbQuizzes);
      setTakenQuizzes(iimbTakenQuizzes);
      setResults(iimbResults);

      // Update stats
      const averageScore = iimbResults.length > 0 
        ? Math.round(iimbResults.reduce((sum, result) => sum + result.score, 0) / iimbResults.length)
        : 0;

      setStats({
        totalQuizzes: iimbQuizzes.length + iimbTakenQuizzes.length,
        totalResults: iimbResults.length,
        averageScore
      });
      
    } catch (error) {
      console.error('Error deleting result:', error);
      showError('Delete Failed', 'Failed to delete result. Please try again.');
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'upload', name: 'Upload Files', icon: Upload },
    { id: 'quizzes', name: 'My Quizzes', icon: FileText },
    { id: 'results', name: 'Results', icon: Trophy },
    { id: 'leaderboard', name: 'Leaderboards', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading IIMB-BBA-DBE Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Stats - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">IIMB-BBA-DBE Portal</h1>
              <p className="text-gray-600 mt-1">Quiz Management & Leaderboards</p>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Total Quizzes</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalQuizzes}</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Quiz Results</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.totalResults}</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Average Score</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.averageScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-8 min-w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Quiz Results</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalResults}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Quizzes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Quizzes</h2>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quiz
                </button>
              </div>
              
              {quizzes.length === 0 ? (
                <EmptyState
                  type="quiz"
                  title="No Quizzes Yet"
                  description="Create your first IIMB-BBA-DBE quiz to get started"
                  actionLabel="Create Quiz"
                  onAction={() => setActiveTab('upload')}
                />
              ) : (
                <div className="space-y-4">
                  {quizzes.slice(0, 5).map((quiz) => (
                    <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{quiz.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{quiz.subject || 'No subject'}</p>
                          <p className="text-xs text-gray-500">
                            {quiz.questions?.length || 0} questions • {quiz.timeLimit} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                        >
                          Take Quiz
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Files Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Files</h2>
              <p className="text-gray-600">Upload JSON, PDF, or TXT files to create quizzes automatically.</p>
            </div>

            {/* Tab Navigation - Mobile Responsive */}
            <div className="flex overflow-x-auto scrollbar-hide mb-6 bg-gray-100 p-1 rounded-lg">
              <div className="flex space-x-1 min-w-full">
                <button
                  onClick={() => setActiveUploadTab('json')}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeUploadTab === 'json'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => setActiveUploadTab('pdf')}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeUploadTab === 'pdf'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => setActiveUploadTab('txt')}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeUploadTab === 'txt'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>TXT</span>
                </button>
              </div>
            </div>

            {/* Upload Areas */}
            <div className="space-y-6">
              {activeUploadTab === 'json' && (
                <FileUploadArea onQuestionsExtracted={handleQuestionsExtracted} />
              )}
              {activeUploadTab === 'pdf' && (
                <PDFUploadArea onQuizExtracted={handlePDFQuizExtracted} />
              )}
              {activeUploadTab === 'txt' && (
                <FileUploadArea onQuestionsExtracted={handleTXTQuizExtracted} accept=".txt" />
              )}
            </div>

            {/* Quiz Creation Form */}
            {extractedQuestions.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Quiz from Extracted Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      value={quizData.title}
                      onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={quizData.subject}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'custom') {
                          setShowCustomSubjectInput(true);
                          setQuizData(prev => ({ ...prev, subject: '' }));
                        } else if (value === 'none') {
                          setShowCustomSubjectInput(false);
                          setQuizData(prev => ({ ...prev, subject: '' }));
                        } else {
                          setShowCustomSubjectInput(false);
                          setQuizData(prev => ({ ...prev, subject: value }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="none">No Subject</option>
                      <option value="custom">+ Add Custom Subject</option>
                      {iimSubjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Custom Subject Input */}
                  {showCustomSubjectInput && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Subject
                      </label>
                      <input
                        type="text"
                        value={customSubject}
                        onChange={(e) => {
                          setCustomSubject(e.target.value);
                          setQuizData(prev => ({ ...prev, subject: e.target.value }));
                        }}
                        placeholder="Enter your custom subject"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={quizData.timeLimit}
                      onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={quizData.description}
                    onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter quiz description"
                  />
                </div>
                <button
                  onClick={handleCreateQuiz}
                  disabled={isCreatingQuiz || !quizData.title.trim()}
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
                      Create Quiz from {extractedQuestions.length} Questions
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* My Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My IIMB-BBA-DBE Quizzes</h2>
              <button
                onClick={() => setActiveTab('upload')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Quiz
              </button>
            </div>
            
            {/* Created Quizzes Section */}
            {quizzes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Quizzes I Created ({quizzes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Created</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base truncate">{quiz.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 truncate">{quiz.subject || 'No subject'}</p>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                        <span>{quiz.questions?.length || 0} questions</span>
                        <span>{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-xs sm:text-sm"
                        >
                          Take Quiz
                        </Link>
                        <button
                          onClick={() => showDeleteQuizConfirmation(quiz.id, quiz.title)}
                          className="px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
                          title="Delete Quiz"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Taken Quizzes Section */}
            {takenQuizzes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Play className="h-5 w-5 mr-2 text-green-600" />
                  Quizzes I&apos;ve Taken ({takenQuizzes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {takenQuizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <Play className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Taken</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base truncate">{quiz.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 truncate">{quiz.subject || 'No subject'}</p>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                        <span>{quiz.questions?.length || 0} questions</span>
                        <span>{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center text-xs sm:text-sm"
                        >
                          Retake Quiz
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {quizzes.length === 0 && takenQuizzes.length === 0 && (
              <EmptyState
                type="quiz"
                title="No Quizzes Yet"
                description="Create your first IIMB-BBA-DBE quiz or take a shared quiz to see it here"
                actionLabel="Create Quiz"
                onAction={() => setActiveTab('upload')}
              />
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Quiz Results</h2>
            
            {results.length === 0 ? (
              <EmptyState
                type="result"
                title="No Results Yet"
                description="Take some quizzes to see your results here"
                actionLabel="Browse Quizzes"
                onAction={() => setActiveTab('quizzes')}
              />
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Quiz Result</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Score: {result.score}% • {result.correctAnswers}/{result.totalQuestions} correct
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        result.score >= 80 ? 'bg-green-100 text-green-800' :
                        result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.score}%
                      </span>
                      <Link
                        href={`/results/${result.id}`}
                        className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => showDeleteResultConfirmation(result.id, result.score)}
                        className="px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
                        title="Delete Result"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaderboards Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">IIMB-BBA-DBE Leaderboards</h2>
              
              {/* Combine created and taken quizzes, removing duplicates */}
              {(() => {
                const allQuizzes = [...quizzes, ...takenQuizzes];
                const uniqueQuizzes = allQuizzes.filter((quiz, index, self) => 
                  index === self.findIndex(q => q.id === quiz.id)
                );
                
                if (uniqueQuizzes.length === 0) {
                  return (
                    <EmptyState
                      type="analytics"
                      title="No Leaderboards Available"
                      description="Create and take quizzes to see leaderboards"
                      actionLabel="Create Quiz"
                      onAction={() => setActiveTab('upload')}
                    />
                  );
                }
                
                return (
                  <div className="space-y-6">
                    {uniqueQuizzes.map((quiz) => {
                      const isCreated = quizzes.some(q => q.id === quiz.id);
                      const isTaken = takenQuizzes.some(q => q.id === quiz.id);
                      const userScore = results.find(r => r.quizId === quiz.id)?.score;
                      
                      return (
                        <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0 truncate">{quiz.title}</h3>
                            <div className="flex items-center space-x-2">
                              {isCreated && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Created</span>
                              )}
                              {isTaken && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Taken</span>
                              )}
                            </div>
                          </div>
                          <LeaderboardDisplay 
                            quizId={quiz.id} 
                            userScore={userScore}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
                 )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={() => {
            if (confirmationModal.type === 'quiz') {
              handleDeleteQuiz(confirmationModal.itemId);
            } else {
              handleDeleteResult(confirmationModal.itemId);
            }
          }}
          title={confirmationModal.type === 'quiz' ? 'Delete Quiz' : 'Delete Result'}
          message={
            confirmationModal.type === 'quiz'
              ? 'Are you sure you want to delete this quiz? This action cannot be undone and will remove all associated data.'
              : 'Are you sure you want to delete this result? This action cannot be undone.'
          }
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          itemName={confirmationModal.itemName}
        />
       </div>
     </div>
   );
 }
