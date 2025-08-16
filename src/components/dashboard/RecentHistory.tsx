'use client';

import React from 'react';
import { Clock, CheckCircle, BookOpen } from '@/lib/icons';
import Link from 'next/link';

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: any[];
  timeLimit?: number;
  createdAt: Date;
}

interface Result {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: Date;
}

interface RecentHistoryProps {
  recentQuizzes: Quiz[];
  recentResults: Result[];
}

export function RecentHistory({ recentQuizzes, recentResults }: RecentHistoryProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Combine and sort activities by date
  const activities = React.useMemo(() => {
    const quizActivities = recentQuizzes.map(quiz => ({
      type: 'quiz' as const,
      id: quiz.id,
      title: quiz.title,
      date: quiz.createdAt,
      icon: <BookOpen className="h-4 w-4 text-blue-600" />
    }));

    const resultActivities = recentResults.map(result => ({
      type: 'result' as const,
      id: result.id,
      title: `Completed quiz`,
      score: result.score,
      date: result.completedAt,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />
    }));

    return [...quizActivities, ...resultActivities]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [recentQuizzes, recentResults]);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No recent activity</p>
        <p className="text-sm">Start by creating your first quiz!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-shrink-0">
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.title}
            </p>
            {activity.type === 'result' && (
              <p className={`text-sm font-medium ${getScoreColor(activity.score)}`}>
                Score: {activity.score}%
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(activity.date)}</span>
          </div>
        </div>
      ))}
      
      {(recentQuizzes.length > 0 || recentResults.length > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <Link
            href="/archive"
            className="text-sm text-[#20C997] hover:text-[#1BA085] font-medium"
          >
            View all activity →
          </Link>
        </div>
      )}
    </div>
  );
}
