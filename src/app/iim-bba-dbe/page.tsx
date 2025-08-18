'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Play, Settings, BarChart3, Clock, Target, Link as LinkIcon, Copy } from 'lucide-react';
import Link from 'next/link';
import LiveQuizCreator from '@/components/live-quiz/LiveQuizCreator';
import LiveQuizManager from '@/components/live-quiz/LiveQuizManager';
import ResultsDashboard from '@/components/live-quiz/ResultsDashboard';
import Leaderboard from '@/components/live-quiz/Leaderboard';
import { liveQuizService } from '@/lib/live-quiz-service';

export default function IIMBBADBEPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreator, setShowCreator] = useState(false);
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
      // Update stats when live quizzes change
      const activeParticipants = quizzes.reduce((sum, quiz) => sum + quiz.currentParticipants, 0);
      setStats(prev => ({ ...prev, activeParticipants }));
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

  const recentResults = [
    {
      id: '1',
      title: 'Operations Management Quiz',
      date: '2024-03-15',
      score: 850,
      rank: 5,
      totalParticipants: 127
    },
    {
      id: '2',
      title: 'Business Analytics Challenge',
      date: '2024-03-12',
      score: 720,
      rank: 12,
      totalParticipants: 89
    }
  ];

  const getShareLink = (quizId: string) => {
    if (typeof window === 'undefined') return `/live-quiz/${quizId}`;
    return `${window.location.origin}/live-quiz/${quizId}`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  🎓 IIM(BBA DBE) Live Quiz Platform
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Back to Personal Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'create', name: 'Create Quiz', icon: Settings },
              { id: 'upcoming', name: 'Upcoming Quizzes', icon: Calendar },
              { id: 'live', name: 'Live Quizzes', icon: Play },
              { id: 'results', name: 'My Results', icon: Trophy },
              { id: 'leaderboard', name: 'Leaderboard', icon: Target }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalQuizzes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Participants</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeParticipants}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Participants</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalParticipants}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Average Score</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {lastCreatedQuiz && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-medium">Live quiz created successfully!</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <LinkIcon className="h-4 w-4 text-green-700" />
                    <Link href={lastCreatedQuiz.link} className="text-green-700 underline text-sm">
                      {lastCreatedQuiz.link}
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(lastCreatedQuiz.link)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy Link
                </button>
              </div>
            )}

            {/* Upcoming Quizzes */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Live Quizzes</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingQuizzes.map((quiz) => (
                  <div key={quiz.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{quiz.title}</h4>
                        <p className="text-sm text-gray-500">{quiz.category}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {quiz.date} at {quiz.time}
                          </span>
                          <span className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            {quiz.participants}/{quiz.maxParticipants} registered
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/live-quiz/${quiz.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Register
                        </Link>
                        <button
                          onClick={() => copyToClipboard(getShareLink(quiz.id))}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Share Link
                        </button>
                      </div>
                    </div>
                    {copyStatus && (
                      <p className="text-xs text-green-700 mt-2">{copyStatus}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Your Recent Results</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentResults.map((result) => (
                  <div key={result.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{result.title}</h4>
                        <p className="text-sm text-gray-500">Completed on {result.date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Score</p>
                          <p className="text-lg font-semibold text-gray-900">{result.score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Rank</p>
                          <p className="text-lg font-semibold text-gray-900">#{result.rank}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Participants</p>
                          <p className="text-lg font-semibold text-gray-900">{result.totalParticipants}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow p-6">
            {!showCreator ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Live Quiz</h2>
                <p className="text-gray-600 mb-6">
                  Create a new live quiz for the BBA DBE community. Upload your questions in JSON format and schedule the quiz.
                </p>
                <button
                  onClick={() => setShowCreator(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Start Quiz Creator
                </button>
              </>
            ) : (
              <LiveQuizCreator
                onQuizCreated={(quizId) => {
                  const link = getShareLink(quizId);
                  setLastCreatedQuiz({ id: quizId, link });
                  setShowCreator(false);
                  setActiveTab('dashboard');
                }}
                onCancel={() => setShowCreator(false)}
              />
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Quizzes</h2>
            <div className="space-y-4">
              {upcomingQuizzes.map((quiz) => (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-500">{quiz.category}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {quiz.date} at {quiz.time}
                        </span>
                        <span className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {quiz.participants}/{quiz.maxParticipants} registered
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/live-quiz/${quiz.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Register
                      </Link>
                      <button
                        onClick={() => copyToClipboard(getShareLink(quiz.id))}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center"
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Share Link
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Quizzes</h2>
            <LiveQuizManager 
              onQuizAction={(action, quizId) => {
                console.log(`Quiz ${action}ed:`, quizId);
              }}
            />
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Results</h2>
            <ResultsDashboard userId={localStorage.getItem('liveQuizUserId') || undefined} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All-Time Leaderboard</h2>
            <Leaderboard />
          </div>
        )}
      </div>
    </div>
  );
}
