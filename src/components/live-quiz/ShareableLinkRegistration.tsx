'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, AlertCircle, CheckCircle, XCircle, Play, UserPlus } from 'lucide-react';
import { LiveQuiz } from '@/lib/live-quiz-types';
import { liveQuizService } from '@/lib/live-quiz-service';

interface ShareableLinkRegistrationProps {
  quizId: string;
  onRegistrationComplete: (participantId: string) => void;
  onError: (error: string) => void;
}

export default function ShareableLinkRegistration({ 
  quizId, 
  onRegistrationComplete, 
  onError 
}: ShareableLinkRegistrationProps) {
  const [quiz, setQuiz] = useState<LiveQuiz | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizData = await liveQuizService.getLiveQuiz(quizId);
        if (!quizData) {
          onError('Quiz not found');
          return;
        }
        setQuiz(quizData);
      } catch (err) {
        onError('Failed to load quiz');
      }
    };

    loadQuiz();
  }, [quizId, onError]);

  useEffect(() => {
    if (!quiz) return;

    const calculateTimeUntilStart = () => {
      const now = new Date().getTime();
      const startTime = quiz.scheduledAt.getTime();
      const timeDiff = startTime - now;
      return Math.max(0, Math.floor(timeDiff / 1000));
    };

    setTimeUntilStart(calculateTimeUntilStart());

    const timer = setInterval(() => {
      const timeLeft = calculateTimeUntilStart();
      setTimeUntilStart(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

  const handleRegistration = async () => {
    if (!participantName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!quiz) {
      setError('Quiz not loaded');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      // Generate a simple user ID for demo purposes
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await liveQuizService.registerParticipant(quizId, userId, participantName.trim());
      onRegistrationComplete(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getQuizStatus = () => {
    if (!quiz) return 'loading';
    
    if (quiz.status === 'completed') return 'completed';
    if (quiz.status === 'live') return 'live';
    if (timeUntilStart <= 0) return 'ready';
    return 'waiting';
  };

  const status = getQuizStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600">The quiz you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
          <p className="text-blue-100 text-sm mt-1">{quiz.category}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Badge */}
          <div className="mb-6">
            {status === 'completed' && (
              <div className="flex items-center justify-center p-3 bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">Quiz Completed</span>
              </div>
            )}
            {status === 'live' && (
              <div className="flex items-center justify-center p-3 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-700 font-medium">Live Now</span>
              </div>
            )}
            {status === 'ready' && (
              <div className="flex items-center justify-center p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-700 font-medium">Ready to Start</span>
              </div>
            )}
            {status === 'waiting' && (
              <div className="flex items-center justify-center p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-700 font-medium">
                  Starts in {formatTime(timeUntilStart)}
                </span>
              </div>
            )}
          </div>

          {/* Quiz Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{quiz.duration} minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Questions</span>
              <span className="font-medium">{quiz.questions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Participants</span>
              <span className="font-medium">
                {quiz.currentParticipants}/{quiz.maxParticipants}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Start Time</span>
              <span className="font-medium">
                {quiz.scheduledAt.toLocaleDateString()} at {quiz.scheduledAt.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Description */}
          {quiz.description && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 text-sm">{quiz.description}</p>
            </div>
          )}

          {/* Registration Form */}
          {status === 'waiting' || status === 'ready' ? (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={50}
                />
              </div>

              <button
                onClick={handleRegistration}
                disabled={isRegistering || !participantName.trim() || quiz.currentParticipants >= quiz.maxParticipants}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Quiz
                  </>
                )}
              </button>

              {quiz.currentParticipants >= quiz.maxParticipants && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-700 text-sm">Quiz is full</span>
                </div>
              )}
            </div>
          ) : status === 'live' ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">This quiz is currently live.</p>
              <button
                onClick={handleRegistration}
                disabled={isRegistering || !participantName.trim() || quiz.currentParticipants >= quiz.maxParticipants}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Join Live Quiz
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">This quiz has been completed.</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              BBA DBE Community Quiz Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
