'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Users, Trophy, CheckCircle, XCircle, AlertCircle, Play, Pause } from 'lucide-react';
import { LiveQuiz, LiveQuizParticipant, ParticipantAnswer } from '@/lib/live-quiz-types';
import { liveQuizService } from '@/lib/live-quiz-service';

interface LiveQuizInterfaceProps {
  quiz: LiveQuiz;
  participant: LiveQuizParticipant;
  onAnswerSubmit: (questionId: string, answer: string, timeTaken: number) => void;
  onQuizComplete: () => void;
}

export default function LiveQuizInterface({ 
  quiz, 
  participant, 
  onAnswerSubmit, 
  onQuizComplete 
}: LiveQuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(quiz.currentQuestionIndex || 0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60); // Convert to seconds
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  

  // Start quiz when component mounts
  useEffect(() => {
    const startQuiz = () => {
      setIsQuizActive(true);
      setQuestionStartTime(Date.now());
    };

    // Start quiz after 3 seconds countdown
    const timer = setTimeout(startQuiz, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Real-time quiz updates
  useEffect(() => {
    const unsubscribe = liveQuizService.onQuizUpdate(quiz.id, (updatedQuiz) => {
      // Update local quiz state with real-time changes
      if (typeof updatedQuiz.currentQuestionIndex === 'number') {
        setCurrentQuestionIndex(updatedQuiz.currentQuestionIndex);
      }
      if (updatedQuiz.status === 'completed') {
        onQuizComplete();
      }
    });

    return unsubscribe;
  }, [quiz.id, onQuizComplete]);

  const handleAnswerSelect = (answer: string) => {
    if (!isQuizActive || answeredQuestions.has(currentQuestion.id)) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedAnswer || answeredQuestions.has(currentQuestion.id) || isSubmitting) return;

    setIsSubmitting(true);
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      await onAnswerSubmit(currentQuestion.id, selectedAnswer, timeTaken);
      
      // Mark question as answered
      setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));
      
      // Move to next question or complete quiz
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
        setQuestionStartTime(Date.now());
      } else {
        // Quiz completed
        onQuizComplete();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAnswer, currentQuestion, answeredQuestions, isSubmitting, questionStartTime, currentQuestionIndex, totalQuestions, onAnswerSubmit, onQuizComplete]);

  // Timer effect (placed after handleSubmitAnswer to satisfy dependencies)
  useEffect(() => {
    if (!isQuizActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit current question and move to next or complete quiz
          if (selectedAnswer && !answeredQuestions.has(currentQuestion.id)) {
            handleSubmitAnswer();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuizActive, timeRemaining, selectedAnswer, currentQuestion, answeredQuestions, handleSubmitAnswer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  const isOptionSelected = (option: string) => selectedAnswer === option;
  const isQuestionAnswered = answeredQuestions.has(currentQuestion.id);

  if (!isQuizActive && timeRemaining > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {Math.ceil(timeRemaining / 60)}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Starting Soon</h2>
          <p className="text-gray-600">Get ready! The quiz will begin in a few seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {quiz.category}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-500" />
                <span className={`text-lg font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Participants */}
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {quiz.currentParticipants} participants
                </span>
              </div>

              {/* Leaderboard Toggle */}
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Trophy className="h-4 w-4" />
                <span className="text-sm">Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Quiz Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}% complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {currentQuestion.text}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isQuestionAnswered || !isQuizActive}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                        isOptionSelected(option)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        isQuestionAnswered || !isQuizActive
                          ? 'cursor-not-allowed opacity-60'
                          : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isOptionSelected(option)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {getOptionLetter(index)}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || isQuestionAnswered || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : currentQuestionIndex === totalQuestions - 1 ? (
                    'Finish Quiz'
                  ) : (
                    'Next Question'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Score */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Score</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {participant.score}
                </div>
                <div className="text-sm text-gray-500">
                  Rank #{participant.rank}
                </div>
              </div>
            </div>

            {/* Live Leaderboard */}
            {showLeaderboard && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Leaderboard</h3>
                <div className="space-y-3">
                  {quiz.participants
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
                    .map((p, index) => (
                      <div 
                        key={p.userId} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          p.userId === participant.userId 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <span className={`font-medium ${
                            p.userId === participant.userId ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {p.name}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">{p.score}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Question Navigation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    disabled={!isQuizActive}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answeredQuestions.has(question.id)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
