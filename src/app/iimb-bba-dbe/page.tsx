'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Play, Settings, BarChart3, Clock, Target, Link as LinkIcon, Copy, Plus, CheckCircle, Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { createQuiz, getUserQuizzesWithControls, getUserQuizResults, getUserTakenQuizzes } from '@/lib/firebase-quiz';
import { useAppStore } from '@/lib/store';
import { FileUploadArea } from '@/components/upload/FileUploadArea';
import { PDFUploadArea } from '@/components/upload/PDFUploadArea';
import { getLeaderboard } from '@/lib/leaderboard';
import { LeaderboardDisplay } from '@/components/common/LeaderboardDisplay';

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IIMB-BBA-DBE Portal</h1>
              <p className="text-gray-600 mt-1">Quiz Management & Leaderboards</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Quizzes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalQuizzes}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Quiz Results</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalResults}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageScore}%</p>
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
                    <div key={quiz.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">{quiz.subject || 'No subject'}</p>
                          <p className="text-xs text-gray-500">
                            {quiz.questions?.length || 0} questions • {quiz.timeLimit} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Created</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{quiz.subject || 'No subject'}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{quiz.questions?.length || 0} questions</span>
                        <span>{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                        >
                          Take Quiz
                        </Link>
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
                  Quizzes I've Taken ({takenQuizzes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {takenQuizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Play className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Taken</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{quiz.subject || 'No subject'}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{quiz.questions?.length || 0} questions</span>
                        <span>{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center text-sm"
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
                  <div key={result.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Trophy className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quiz Result</h3>
                        <p className="text-sm text-gray-600">
                          Score: {result.score}% • {result.correctAnswers}/{result.totalQuestions} correct
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.score >= 80 ? 'bg-green-100 text-green-800' :
                        result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.score}%
                      </span>
                      <Link
                        href={`/results/${result.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </Link>
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
              
                             {quizzes.length === 0 ? (
                 <EmptyState
                   type="analytics"
                   title="No Leaderboards Available"
                   description="Create and take quizzes to see leaderboards"
                   actionLabel="Create Quiz"
                   onAction={() => setActiveTab('upload')}
                 />
              ) : (
                <div className="space-y-6">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{quiz.title}</h3>
                      <LeaderboardDisplay 
                        quizId={quiz.id} 
                        userScore={results.find(r => r.quizId === quiz.id)?.score}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
