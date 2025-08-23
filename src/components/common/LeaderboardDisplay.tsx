'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Clock, TrendingUp } from 'lucide-react';
import { QuizLeaderboard, LeaderboardEntry, subscribeToLeaderboard, getUserRank } from '@/lib/leaderboard';
import { useAppStore } from '@/lib/store';

interface LeaderboardDisplayProps {
  quizId: string;
  userScore?: number;
  className?: string;
}

export function LeaderboardDisplay({ quizId, userScore, className = '' }: LeaderboardDisplayProps) {
  const { user } = useAppStore();
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!quizId) return;

    console.log('🔍 LeaderboardDisplay: Subscribing to leaderboard for quiz:', quizId);
    setIsLoading(true);
    
    // Subscribe to real-time leaderboard updates
    const unsubscribe = subscribeToLeaderboard(quizId, (data) => {
      console.log('📊 LeaderboardDisplay: Received leaderboard data:', data);
      setLeaderboard(data);
      setIsLoading(false);
      
      // Calculate user's rank if user is logged in
      if (user?.id && data) {
        const rank = getUserRank(data, user.id);
        console.log('👤 LeaderboardDisplay: User rank:', rank);
        setUserRank(rank);
      }
    });

    return () => unsubscribe();
  }, [quizId, user?.id]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.scores.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Leaderboard Yet</h3>
          <p className="text-gray-500">Be the first to take this quiz and claim the top spot!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Top 20 Leaderboard</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Updated {leaderboard.lastUpdated && !isNaN(leaderboard.lastUpdated.getTime()) ? leaderboard.lastUpdated.toLocaleTimeString() : 'Unknown'}</span>
          </div>
        </div>
        
        {/* User's current position */}
        {userRank && userScore !== undefined && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-700">Your Position:</span>
                <span className="text-lg font-bold text-blue-800">#{userRank}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600">Score:</span>
                <span className="text-lg font-bold text-blue-800">{userScore}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-100">
        {leaderboard.scores.map((entry) => (
          <div
            key={`${entry.userId}-${entry.timestamp && !isNaN(entry.timestamp.getTime()) ? entry.timestamp.getTime() : Date.now()}`}
            className={`px-6 py-4 transition-colors duration-200 ${getRankColor(entry.rank)} ${
              entry.userId === user?.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {entry.userName}
                    </span>
                    {entry.userId === user?.id && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Completed {entry.timestamp && !isNaN(entry.timestamp.getTime()) ? entry.timestamp.toLocaleDateString() : 'Unknown'}</span>
                    <span>•</span>
                    <span>{entry.timestamp && !isNaN(entry.timestamp.getTime()) ? entry.timestamp.toLocaleTimeString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold text-gray-900">{entry.score}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing top {leaderboard.scores.length} scores</span>
          <span>Real-time updates enabled</span>
        </div>
      </div>
    </div>
  );
}
