'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Clock, TrendingUp, Crown, Star } from 'lucide-react';
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
        return <Crown className="h-6 w-6 text-yellow-400 drop-shadow-lg" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300 drop-shadow-md" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-500 drop-shadow-md" />;
      default:
        return <span className="text-sm font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    const baseStyle = "px-6 py-4 transition-all duration-300 hover:shadow-md ";
    
    if (isCurrentUser) {
      return baseStyle + "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-sm";
    }

    switch (rank) {
      case 1:
        return baseStyle + "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 shadow-sm";
      case 2:
        return baseStyle + "bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-300 shadow-sm";
      case 3:
        return baseStyle + "bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 shadow-sm";
      default:
        return baseStyle + "bg-white hover:bg-gray-50";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 font-bold";
    if (score >= 80) return "text-blue-600 font-bold";
    if (score >= 70) return "text-amber-600 font-bold";
    if (score >= 60) return "text-orange-600 font-bold";
    return "text-red-600 font-bold";
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
          <span className="ml-4 text-gray-600 font-medium">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.scores.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-3">No Leaderboard Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Be the first to take this quiz and claim the top spot! 🏆</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Top 20 Leaderboard</h3>
              <p className="text-blue-100 text-sm">Real-time rankings</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-blue-100">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Updated {leaderboard.lastUpdated && !isNaN(leaderboard.lastUpdated.getTime()) ? leaderboard.lastUpdated.toLocaleTimeString() : 'Unknown'}
            </span>
          </div>
        </div>
        
        {/* User's current position */}
        {userRank && userScore !== undefined && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm text-blue-100">Your Position</span>
                  <div className="text-2xl font-bold">#{userRank}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-blue-100">Your Score</span>
                <div className={`text-2xl font-bold ${getScoreColor(userScore)}`}>{userScore}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-100">
        {leaderboard.scores.map((entry, index) => (
          <div
            key={`${entry.userId}-${entry.timestamp && !isNaN(entry.timestamp.getTime()) ? entry.timestamp.getTime() : Date.now()}`}
            className={getRankStyle(entry.rank, entry.userId === user?.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900 text-lg">
                      {entry.userName}
                    </span>
                    {entry.userId === user?.id && (
                      <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                        YOU
                      </span>
                    )}
                    {entry.rank <= 3 && (
                      <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">
                        TOP {entry.rank}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <span>Completed {entry.timestamp && !isNaN(entry.timestamp.getTime()) ? entry.timestamp.toLocaleDateString() : 'Unknown'}</span>
                    <span>•</span>
                    <span>{entry.timestamp && !isNaN(entry.timestamp.getTime()) ? entry.timestamp.toLocaleTimeString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(entry.score)}`}>
                    {entry.score}%
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    Score
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Live Updates</span>
          </div>
          <span className="font-medium">Showing top {leaderboard.scores.length} scores</span>
        </div>
      </div>
    </div>
  );
}
