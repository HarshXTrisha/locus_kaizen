'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Users, Clock, Calendar, Settings, Eye, ChevronLeft, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { LiveQuiz } from '@/lib/live-quiz-types';
import { liveQuizService } from '@/lib/live-quiz-service';

interface LiveQuizManagerProps {
  onQuizAction: (action: string, quizId: string) => void;
}

export default function LiveQuizManager({ onQuizAction }: LiveQuizManagerProps) {
  const [liveQuizzes, setLiveQuizzes] = useState<LiveQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<string>('');

  useEffect(() => {
    const loadLiveQuizzes = async () => {
      try {
        setIsLoading(true);
        const quizzes = await liveQuizService.getLiveQuizzes();
        setLiveQuizzes(quizzes);
      } catch (error) {
        console.error('Error loading live quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveQuizzes();

    // Set up real-time listener
    const unsubscribe = liveQuizService.onLiveQuizzesUpdate((quizzes) => {
      setLiveQuizzes(quizzes);
    });

    return unsubscribe;
  }, []);

  const handleQuizAction = async (action: string, quizId: string) => {
    try {
      switch (action) {
        case 'publish':
          await liveQuizService.publishQuiz(quizId);
          break;
        case 'start':
          await liveQuizService.startQuiz(quizId);
          break;
        case 'stop':
          await liveQuizService.stopQuiz(quizId);
          break;
        case 'pause':
          await liveQuizService.pauseQuiz(quizId);
          break;
        case 'resume':
          await liveQuizService.resumeQuiz(quizId);
          break;
      }
      onQuizAction(action, quizId);
    } catch (error) {
      console.error(`Error ${action}ing quiz:`, error);
    }
  };

  const handleQuestionChange = async (quiz: LiveQuiz, direction: 'prev' | 'next') => {
    try {
      const current = quiz.currentQuestionIndex || 0;
      const maxIndex = quiz.questions.length - 1;
      const nextIndex = direction === 'next' ? Math.min(maxIndex, current + 1) : Math.max(0, current - 1);
      await liveQuizService.setCurrentQuestion(quiz.id, nextIndex);
    } catch (error) {
      console.error('Error changing question:', error);
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

  const getShareLink = (quizId: string) => {
    if (typeof window === 'undefined') return `/live-quiz/${quizId}`;
    return `${window.location.origin}/live-quiz/${quizId}`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading live quizzes...</span>
      </div>
    );
  }

  if (liveQuizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No live quizzes at the moment</p>
        <p className="text-sm text-gray-400 mt-2">Create a quiz to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {liveQuizzes.map((quiz) => (
        <div key={quiz.id} className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
                  {quiz.status.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatTime(quiz.scheduledAt)}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {quiz.currentParticipants}/{quiz.maxParticipants} participants
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {quiz.duration} minutes
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Quiz */}
              <a
                href={getShareLink(quiz.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="View Quiz"
              >
                <Eye className="h-4 w-4" />
              </a>

              {/* Share Link */}
              <button
                onClick={() => copyToClipboard(getShareLink(quiz.id))}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Copy Share Link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>

                             {/* Quiz Actions */}
               {quiz.status === 'draft' && (
                 <>
                   <button
                     onClick={() => handleQuizAction('publish', quiz.id)}
                     className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                   >
                     <Settings className="h-4 w-4 mr-1" />
                     Publish
                   </button>
                   <button
                     onClick={() => handleQuizAction('start', quiz.id)}
                     className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                   >
                     <Play className="h-4 w-4 mr-1" />
                     Start
                   </button>
                 </>
               )}

              {quiz.status === 'live' && (
                <>
                  <button
                    onClick={() => handleQuizAction('pause', quiz.id)}
                    className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </button>
                  <div className="flex items-center space-x-2 mx-2">
                    <button
                      onClick={() => handleQuestionChange(quiz, 'prev')}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      title="Previous Question"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-600">Q{(quiz.currentQuestionIndex || 0) + 1} / {quiz.questions.length}</span>
                    <button
                      onClick={() => handleQuestionChange(quiz, 'next')}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      title="Next Question"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleQuizAction('stop', quiz.id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </button>
                </>
              )}

              {quiz.status === 'paused' && (
                <>
                  <button
                    onClick={() => handleQuizAction('resume', quiz.id)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </button>
                  <button
                    onClick={() => handleQuizAction('stop', quiz.id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {copyStatus && (
            <p className="text-xs text-green-700 mt-2">{copyStatus}</p>
          )}
        </div>
      ))}
    </div>
  );
}
