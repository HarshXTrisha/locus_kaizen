'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle,
  Flag, BookOpen, Target, Users, Timer, AlertTriangle, Loader2
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';
import { getQuiz } from '@/lib/firebase-quiz';
import { saveQuizResult } from '@/lib/firebase-quiz';
import { getFirebaseAuth } from '@/lib/firebase-utils';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

export default function MobileQuizTaker() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Get quiz ID from URL
  const quizId = params?.id as string;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (!quizId) {
      showError('Error', 'Quiz ID not found');
      router.push('/quiz');
      return;
    }

    const loadQuiz = async () => {
      try {
        setLoading(true);
        console.log('📱 Loading quiz:', quizId);
        const quiz = await getQuiz(quizId);
        
        if (!quiz) {
          showError('Quiz Not Found', 'The quiz you are looking for does not exist');
          router.push('/quiz');
          return;
        }

        // Convert quiz data to the format expected by the component
        const convertedQuiz: QuizData = {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          questions: quiz.questions.map((q, index) => ({
            id: q.id || `q${index}`,
            text: q.text,
            options: q.options || [],
            correctAnswer: q.options ? q.options.indexOf(q.correctAnswer) : 0
          }))
        };

        setQuizData(convertedQuiz);
        setTimeRemaining(convertedQuiz.timeLimit * 60); // Convert minutes to seconds
        console.log('📱 Quiz loaded:', convertedQuiz.title, convertedQuiz.questions.length, 'questions');
      } catch (error) {
        console.error('❌ Error loading quiz:', error);
        showError('Error', 'Failed to load quiz');
        router.push('/quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, user, isAuthenticated, router]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted && quizData) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isSubmitted, quizData]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = useCallback((questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  }, []);

  const handleFlagQuestion = useCallback((questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (quizData && currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, quizData]);

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleSubmit = useCallback(async () => {
    if (!quizData || !user || isSubmitted) return;

    try {
      setSubmitting(true);
      console.log('📱 Submitting quiz answers...');

      // Calculate results
      let correctAnswers = 0;
      const totalQuestions = quizData.questions.length;
      const timeTaken = (quizData.timeLimit * 60) - timeRemaining;

      quizData.questions.forEach((question, index) => {
        const userAnswer = answers[question.id];
        if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / totalQuestions) * 100);

      // Save result to Firebase
      const resultId = await saveQuizResult({
        quizId: quizData.id,
        userId: user.id,
        score,
        totalQuestions,
        correctAnswers,
        timeTaken,
        completedAt: new Date(),
        answers: Object.entries(answers).map(([questionId, answerIndex]) => ({
          questionId,
          userAnswer: quizData.questions.find(q => q.id === questionId)?.options[answerIndex] || '',
          isCorrect: answerIndex === quizData.questions.find(q => q.id === questionId)?.correctAnswer,
          points: answerIndex === quizData.questions.find(q => q.id === questionId)?.correctAnswer ? 1 : 0
        }))
      });

      console.log('📱 Quiz result saved:', resultId);
      setIsSubmitted(true);
      showSuccess('Quiz Completed!', `You scored ${score}% (${correctAnswers}/${totalQuestions} correct)`);

      // Navigate to results page
      setTimeout(() => {
        router.push(`/results/${resultId}`);
      }, 2000);

    } catch (error) {
      console.error('❌ Error submitting quiz:', error);
      showError('Submission Failed', 'Failed to submit quiz results');
    } finally {
      setSubmitting(false);
    }
  }, [quizData, user, answers, timeRemaining, isSubmitted, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className={`${mobileClasses.container} flex items-center justify-center min-h-screen`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${mobileClasses.container} flex items-center justify-center min-h-screen`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className={`${mobileClasses.container} flex items-center justify-center min-h-screen`}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <p className="text-gray-600">Quiz not found</p>
        </div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQuestion];
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = quizData.questions.length;

  return (
    <div className={`${mobileClasses.container} min-h-screen bg-gray-50`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-semibold text-gray-900">{quizData.title}</h1>
            <p className="text-xs text-gray-500">Question {currentQuestion + 1} of {totalQuestions}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500" />
            <span className="text-sm font-mono text-red-600">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress: {answeredQuestions}/{totalQuestions}</span>
          <span>{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#20C997] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="p-4 space-y-6">
        {/* Question */}
        <div className={mobileClasses.card}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#20C997]" />
              <span className="text-sm font-medium text-gray-600">Question {currentQuestion + 1}</span>
            </div>
            <button
              onClick={() => handleFlagQuestion(currentQ.id)}
              className={`p-2 rounded-full transition-colors ${
                flaggedQuestions.has(currentQ.id) 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-6">{currentQ.text}</h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQ.id, index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQ.id] === index
                    ? 'border-[#20C997] bg-[#20C997] text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQ.id] === index
                      ? 'border-white'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQ.id] === index && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentQuestion === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmSubmit(false)} />
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Submit Quiz?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You have answered {answeredQuestions} out of {totalQuestions} questions. 
                Are you sure you want to submit?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
