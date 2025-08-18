'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Play, Settings, BarChart3, Clock, Target, Link as LinkIcon, Copy, Plus, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { IIMSidebar } from '@/components/layout/IIMSidebar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { liveQuizService } from '@/lib/live-quiz-service';
import LiveQuizManager from '@/components/live-quiz/LiveQuizManager';
import LiveQuizCreator from '@/components/live-quiz/LiveQuizCreator';
import ResultsDashboard from '@/components/live-quiz/ResultsDashboard';
import Leaderboard from '@/components/live-quiz/Leaderboard';

export default function IIMBBADBEPage() {
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
