'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Target, Clock, Award } from 'lucide-react';
import { LiveQuizResult } from '@/lib/live-quiz-types';
import { liveQuizService } from '@/lib/live-quiz-service';

interface ResultsDashboardProps {
  userId?: string;
}

export default function ResultsDashboard({ userId }: ResultsDashboardProps) {
  const [results, setResults] = useState<LiveQuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestRank: 0,
    totalPoints: 0
  });

  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true);
        if (userId) {
          const userResults = await liveQuizService.getUserResults(userId);
          setResults(userResults);
          
          // Calculate stats
          const totalTests = userResults.length;
          const totalPoints = userResults.reduce((sum, result) => sum + result.score, 0);
          const averageScore = totalTests > 0 ? Math.round(totalPoints / totalTests) : 0;
          const bestRank = userResults.length > 0 ? Math.min(...userResults.map(r => r.rank)) : 0;
          
          setStats({
            totalTests,
            averageScore,
            bestRank,
            totalPoints
          });
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [userId]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-600';
    if (rank === 3) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading results...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No completed quizzes yet</p>
        <p className="text-sm text-gray-400 mt-2">Participate in live quizzes to see your results here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Best Rank</p>
              <p className="text-2xl font-semibold text-gray-900">#{stats.bestRank}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Points</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Quiz Results</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {results.map((result) => (
            <div key={result.quizId} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{result.quizTitle}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {result.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(result.date)}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {result.totalParticipants} participants
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {result.duration} minutes
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Score</p>
                    <p className="text-lg font-semibold text-gray-900">{result.score}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Rank</p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-lg font-semibold ${getRankColor(result.rank)}`}>
                        {getRankIcon(result.rank)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Accuracy</p>
                    <p className="text-lg font-semibold text-gray-900">{Math.round(result.accuracy)}%</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Avg Time</p>
                    <p className="text-lg font-semibold text-gray-900">{Math.round(result.averageTimePerQuestion)}s</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
