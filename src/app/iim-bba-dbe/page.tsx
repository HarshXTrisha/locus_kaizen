'use client';

import React, { useState } from 'react';
import { Calendar, Users, Trophy, Play, Settings, BarChart3, Clock, Target } from 'lucide-react';
import Link from 'next/link';

export default function IIMBBADBEPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = {
    totalQuizzes: 24,
    activeParticipants: 156,
    totalParticipants: 1247,
    averageScore: 78
  };

  const upcomingQuizzes = [
    {
      id: '1',
      title: 'BBA DBE Finance Quiz',
      category: 'Finance & Accounting',
      date: '2024-03-20',
      time: '20:00',
      participants: 89,
      maxParticipants: 150
    },
    {
      id: '2',
      title: 'Marketing Strategy Challenge',
      category: 'Marketing & Sales',
      date: '2024-03-22',
      time: '19:30',
      participants: 67,
      maxParticipants: 100
    }
  ];

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
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                          Register
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
                          Share Link
                        </button>
                      </div>
                    </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Live Quiz</h2>
            <p className="text-gray-600 mb-4">
              Create a new live quiz for the BBA DBE community. Upload your questions in JSON format and schedule the quiz.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">JSON Format Example:</h3>
              <pre className="text-sm text-blue-800 bg-blue-100 p-3 rounded overflow-x-auto">
{`{
  "title": "BBA DBE Finance Quiz",
  "description": "Live competitive quiz on finance concepts",
  "category": "Finance & Accounting",
  "questions": [
    {
      "id": "q1",
      "text": "What is the primary function of a central bank?",
      "options": [
        "Issue currency",
        "Regulate banks", 
        "Control inflation",
        "All of the above"
      ],
      "correctAnswer": "All of the above"
    }
  ]
}`}
              </pre>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
              Create New Quiz
            </button>
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
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                        Register
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
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
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No live quizzes at the moment</p>
              <p className="text-sm text-gray-400 mt-2">Check back later for upcoming live competitions</p>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Results</h2>
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{result.title}</h3>
                      <p className="text-sm text-gray-500">Completed on {result.date}</p>
                    </div>
                    <div className="flex items-center space-x-6">
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
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All-Time Leaderboard</h2>
            <div className="space-y-4">
              {[
                { rank: 1, name: 'Rahul Sharma', score: 2850, tests: 15 },
                { rank: 2, name: 'Priya Patel', score: 2720, tests: 14 },
                { rank: 3, name: 'Amit Kumar', score: 2695, tests: 16 },
                { rank: 4, name: 'Neha Singh', score: 2580, tests: 12 },
                { rank: 5, name: 'Raj Malhotra', score: 2450, tests: 13 }
              ].map((participant) => (
                <div key={participant.rank} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      participant.rank === 1 ? 'bg-yellow-500' :
                      participant.rank === 2 ? 'bg-gray-400' :
                      participant.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {participant.rank}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{participant.name}</h3>
                      <p className="text-sm text-gray-500">{participant.tests} tests taken</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{participant.score} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
