'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Play, Settings, BarChart3, Clock, Target, Link as LinkIcon, Copy, Plus, CheckCircle, Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { IIMSidebar } from '@/components/layout/IIMSidebar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { liveQuizService } from '@/lib/live-quiz-service';
import { createQuiz } from '@/lib/firebase-quiz';
import { useAppStore } from '@/lib/store';
import LiveQuizManager from '@/components/live-quiz/LiveQuizManager';
import LiveQuizCreator from '@/components/live-quiz/LiveQuizCreator';
import ResultsDashboard from '@/components/live-quiz/ResultsDashboard';
import Leaderboard from '@/components/live-quiz/Leaderboard';
import { FileUploadArea } from '@/components/upload/FileUploadArea';
import { PDFUploadArea } from '@/components/upload/PDFUploadArea';

export default function IIMBBADBEPage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [lastCreatedQuiz, setLastCreatedQuiz] = useState<{ id: string; link: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeParticipants: 0,
    totalParticipants: 0,
    averageScore: 0
  });
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<any[]>([]);
  
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

  // Load initial data and initialize schedule checking
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [statsData, upcomingData] = await Promise.all([
          liveQuizService.getLiveQuizStats(),
          liveQuizService.getUpcomingQuizzes()
        ]);
        
        setStats(statsData);
        setUpcomingQuizzes(upcomingData.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          category: quiz.category,
          date: quiz.scheduledAt.toISOString().split('T')[0],
          time: quiz.scheduledAt.toTimeString().slice(0, 5),
          participants: quiz.currentParticipants,
          maxParticipants: quiz.maxParticipants
        })));
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
    
    // Initialize auto start/stop schedule checking
    liveQuizService.initializeScheduleChecking();
    
    // Cleanup on unmount
    return () => {
      liveQuizService.stopScheduleChecking();
    };
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    const unsubscribeStats = liveQuizService.onLiveQuizzesUpdate((quizzes) => {
      // Update stats when quizzes change
      const totalQuizzes = quizzes.length;
      const activeParticipants = quizzes.reduce((sum, quiz) => sum + (quiz.currentParticipants || 0), 0);
      const totalParticipants = quizzes.reduce((sum, quiz) => sum + (quiz.participants?.length || 0), 0);
      // Calculate average score from participants
      const allParticipants = quizzes.flatMap(quiz => quiz.participants || []);
      const averageScore = allParticipants.length > 0 
        ? Math.round(allParticipants.reduce((sum, participant) => sum + (participant.score || 0), 0) / allParticipants.length)
        : 0;
      
      setStats({
        totalQuizzes,
        activeParticipants,
        totalParticipants,
        averageScore
      });
    });

    const unsubscribeUpcoming = liveQuizService.onUpcomingQuizzesUpdate((quizzes) => {
      setUpcomingQuizzes(quizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        category: quiz.category,
        date: quiz.scheduledAt.toISOString().split('T')[0],
        time: quiz.scheduledAt.toTimeString().slice(0, 5),
        participants: quiz.currentParticipants,
        maxParticipants: quiz.maxParticipants
      })));
    });

    return () => {
      unsubscribeStats();
      unsubscribeUpcoming();
    };
  }, []);

  const handleQuizAction = (action: string, quizId: string) => {
    showSuccess('Quiz Action', `Quiz ${action}ed successfully!`);
  };

  const handleQuizCreated = (quizId: string) => {
    setShowQuizCreator(false);
    setLastCreatedQuiz({
      id: quizId,
      link: `${window.location.origin}/live-quiz/${quizId}`
    });
    showSuccess('Quiz Created', 'Live quiz created successfully!');
  };

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
        createdBy: user.id
      };

      const quizId = await createQuiz(quizToSave);
      showSuccess('Quiz Created', 'Quiz created successfully from uploaded file!');
      
      // Reset form
      setQuizData({
        title: '',
        description: '',
        subject: '',
        timeLimit: 30,
        passingScore: 0
      });
      setExtractedQuestions([]);
      
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

  const getTabIcon = (tabName: string) => {
    switch (tabName) {
      case 'dashboard':
        return <BarChart3 className="h-5 w-5" />;
      case 'create':
        return <Plus className="h-5 w-5" />;
      case 'manage':
        return <Settings className="h-5 w-5" />;
      case 'results':
        return <Trophy className="h-5 w-5" />;
      case 'leaderboard':
        return <Users className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'upload', name: 'Upload Files', icon: Upload },
    { id: 'create', name: 'Create Quiz', icon: Plus },
    { id: 'manage', name: 'Manage Quizzes', icon: Settings },
    { id: 'results', name: 'Results', icon: Trophy },
    { id: 'leaderboard', name: 'Leaderboard', icon: Users }
  ];

  return (
    <ResponsiveLayout sidebar={<IIMSidebar />}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">IIM BBA DBE Portal</h1>
                <p className="text-gray-600 mt-1">Live Quiz Management & Analytics</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Active Participants</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeParticipants}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Quizzes</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalQuizzes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
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
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Participants</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeParticipants}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Participants</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
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

              {/* Upcoming Quizzes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Quizzes</h2>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Quiz
                  </button>
                </div>
                
                {upcomingQuizzes.length === 0 ? (
                  <EmptyState
                    type="quiz"
                    title="No Upcoming Quizzes"
                    description="Create your first live quiz to get started"
                    actionLabel="Create Quiz"
                    onAction={() => setActiveTab('create')}
                  />
                ) : (
                  <div className="space-y-4">
                    {upcomingQuizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                            <p className="text-sm text-gray-600">{quiz.category}</p>
                            <p className="text-xs text-gray-500">
                              {quiz.date} at {quiz.time} • {quiz.participants}/{quiz.maxParticipants} participants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/live-quiz/${quiz.id}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Join Quiz
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Quiz Files</h2>
                <p className="text-gray-600">Upload JSON, PDF, or TXT files to create quizzes automatically.</p>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveUploadTab('json')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeUploadTab === 'json'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>JSON Upload</span>
                </button>
                <button
                  onClick={() => setActiveUploadTab('pdf')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeUploadTab === 'pdf'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>PDF Upload</span>
                </button>
                <button
                  onClick={() => setActiveUploadTab('txt')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeUploadTab === 'txt'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>TXT Upload</span>
                </button>
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
                      <input
                        type="text"
                        value={quizData.subject}
                        onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter subject"
                      />
                    </div>
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

          {/* Create Quiz Tab */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {showQuizCreator ? (
                <LiveQuizCreator
                  onQuizCreated={handleQuizCreated}
                  onCancel={() => setShowQuizCreator(false)}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create Live Quiz</h2>
                  <p className="text-gray-600 mb-6">Set up a new live quiz with scheduling and participant management</p>
                  <button
                    onClick={() => setShowQuizCreator(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Creating Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Manage Quizzes Tab */}
          {activeTab === 'manage' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <LiveQuizManager onQuizAction={handleQuizAction} />
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ResultsDashboard />
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Leaderboard />
            </div>
          )}
        </div>

        {/* Success Modal for Created Quiz */}
        {lastCreatedQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setLastCreatedQuiz(null)} />
            <div className="relative bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Created Successfully!</h3>
                <p className="text-gray-600 mb-4">Share this link with participants to join the quiz:</p>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="text"
                    value={lastCreatedQuiz.link}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(lastCreatedQuiz.link)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copyStatus && (
                  <p className="text-sm text-green-600 mb-4">{copyStatus}</p>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setLastCreatedQuiz(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    href={`/live-quiz/${lastCreatedQuiz.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    View Quiz
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
