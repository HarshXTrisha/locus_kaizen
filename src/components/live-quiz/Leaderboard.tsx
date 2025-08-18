'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, Target, Users } from 'lucide-react';
import { liveQuizService } from '@/lib/live-quiz-service';

interface LeaderboardEntry {
  name: string;
  score: number;
  tests: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        const data = await liveQuizService.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getScoreColor = (score: number) => {
    if (score >= 2000) return 'text-green-600';
    if (score >= 1500) return 'text-blue-600';
    if (score >= 1000) return 'text-purple-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading leaderboard...</span>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No leaderboard data available</p>
        <p className="text-sm text-gray-400 mt-2">Complete some quizzes to see rankings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">🏆 Top Performers</h3>
          <div className="flex items-end justify-center space-x-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                2
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">{leaderboard[1]?.name}</p>
                <p className="text-sm text-gray-500">{leaderboard[1]?.score} pts</p>
                <p className="text-xs text-gray-400">{leaderboard[1]?.tests} tests</p>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-2">
                1
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">{leaderboard[0]?.name}</p>
                <p className="text-sm text-gray-500">{leaderboard[0]?.score} pts</p>
                <p className="text-xs text-gray-400">{leaderboard[0]?.tests} tests</p>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                3
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">{leaderboard[2]?.name}</p>
                <p className="text-sm text-gray-500">{leaderboard[2]?.score} pts</p>
                <p className="text-xs text-gray-400">{leaderboard[2]?.tests} tests</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All-Time Leaderboard</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {leaderboard.map((entry, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getRankColor(index + 1)}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{entry.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        {entry.tests} tests taken
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${getScoreColor(entry.score)}`}>
                    {entry.score} pts
                  </p>
                  <p className="text-sm text-gray-500">
                    Avg: {Math.round(entry.score / entry.tests)} pts/test
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Participants</p>
              <p className="text-2xl font-semibold text-gray-900">{leaderboard.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Highest Score</p>
              <p className="text-2xl font-semibold text-gray-900">{leaderboard[0]?.score || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {leaderboard.reduce((sum, entry) => sum + entry.tests, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
