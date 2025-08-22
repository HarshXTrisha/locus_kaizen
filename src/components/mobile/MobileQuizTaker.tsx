'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle,
  Flag, BookOpen, Target, Users, Timer, AlertTriangle, Loader2,
  Menu, X, ChevronLeft, ChevronRight
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
  source?: 'main' | 'iimb-bba-dbe' | 'personal';
}

interface Answer {
  questionId: string;
  selectedOption: string;
  isFlagged: boolean;
}

export default function MobileQuizTaker() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

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
          source: quiz.source,
          questions: quiz.questions.map((q, index) => ({
            id: q.id || `q${index}`,
            text: q.text,
            options: q.options || [],
            correctAnswer: q.options ? q.options.indexOf(q.correctAnswer) : 0
          }))
        };

        setQuizData(convertedQuiz);
        setTimeRemaining(convertedQuiz.timeLimit * 60); // Convert minutes to seconds
        
        // Initialize answers array
        const initialAnswers = convertedQuiz.questions.map((question) => ({
          questionId: question.id,
          selectedOption: '',
          isFlagged: false
        }));
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error loading quiz:', error);
        showError('Error', 'Failed to load quiz');
        router.push('/quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, isAuthenticated, user, router]);

  const handleSubmit = useCallback(async () => {
    if (submitting || isSubmitted) return;

    try {
      setSubmitting(true);
      const auth = getFirebaseAuth();
      
      if (!auth?.currentUser || !quizData) {
        showError('Error', 'Authentication or quiz data not available');
        return;
      }

      // Convert answers to the correct format
      const formattedAnswers = answers.map(answer => {
        const question = quizData.questions.find(q => q.id === answer.questionId);
        const isCorrect = question && answer.selectedOption === question.options[question.correctAnswer];
        return {
          questionId: answer.questionId,
          userAnswer: answer.selectedOption,
          isCorrect: isCorrect || false,
          points: isCorrect ? 1 : 0
        };
      });

      // Calculate score
      const correctAnswers = formattedAnswers.filter(a => a.isCorrect).length;
      const score = quizData.questions.length > 0 ? Math.round((correctAnswers / quizData.questions.length) * 100) : 0;

      const resultId = await saveQuizResult({
        quizId: quizData.id,
        userId: auth.currentUser.uid,
        score,
        totalQuestions: quizData.questions.length,
        correctAnswers,
        timeTaken: (quizData.timeLimit * 60) - timeRemaining,
        completedAt: new Date(),
        source: quizData.source || 'main',
        answers: formattedAnswers
      }, auth.currentUser.displayName || auth.currentUser.email || 'Anonymous User');

      setIsSubmitted(true);
      showSuccess('Success', 'Quiz submitted successfully!');
      
      // Redirect to results page
      router.push(`/results/${resultId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showError('Error', 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  }, [submitting, isSubmitted, quizData, answers, timeRemaining, router]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = useCallback((questionId: string, option: string) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, selectedOption: option }
          : answer
      )
    );
  }, []);

  const handleFlagQuestion = useCallback((questionId: string) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, isFlagged: !answer.isFlagged }
          : answer
      )
    );
  }, []);

  const handleQuestionNavigation = useCallback((index: number) => {
    if (index >= 0 && index < (quizData?.questions?.length || 0)) {
      setCurrentQuestion(index);
      setShowMobileNav(false); // Close mobile nav when navigating
    }
  }, [quizData?.questions?.length]);

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

  // Question Navigation Component
  const QuestionNavigation = () => {
    const questionStatuses = quizData?.questions.map((question, index) => {
      const answer = answers.find(a => a.questionId === question.id);
      const hasBeenVisited = index <= currentQuestion; // Track if question has been visited
      
      if (!answer || answer.selectedOption === '') {
        return hasBeenVisited ? 'visited-unanswered' : 'unanswered';
      }
      if (answer.isFlagged) return 'flagged';
      return 'answered';
    }) || [];

    const statusCounts = {
      answered: questionStatuses.filter(s => s === 'answered').length,
      flagged: questionStatuses.filter(s => s === 'flagged').length,
      unanswered: questionStatuses.filter(s => s === 'unanswered').length,
      visitedUnanswered: questionStatuses.filter(s => s === 'visited-unanswered').length
    };

    return (
      <div className="space-y-4">
        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Answered ({statusCounts.answered})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Flagged ({statusCounts.flagged})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Unanswered ({statusCounts.unanswered})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Visited ({statusCounts.visitedUnanswered})</span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-2">
          {quizData?.questions.map((question, index) => {
            const answer = answers.find(a => a.questionId === question.id);
            const isAnswered = answer && answer.selectedOption !== '';
            const isFlagged = answer?.isFlagged || false;
            const isCurrent = index === currentQuestion;
            const hasBeenVisited = index <= currentQuestion;

            let statusClass = 'bg-gray-200 text-gray-600';
            
            // Priority order: Current > Answered > Flagged > Visited > Unanswered
            if (isCurrent) {
              statusClass = 'bg-blue-500 text-white ring-2 ring-blue-300';
            } else if (isAnswered) {
              // Answered questions should be green, even if flagged
              statusClass = 'bg-green-500 text-white';
            } else if (isFlagged) {
              // Only show red for flagged questions that aren't answered
              statusClass = 'bg-red-500 text-white';
            } else if (hasBeenVisited) {
              // Visited but unanswered questions
              statusClass = 'bg-yellow-500 text-white';
            } else {
              // Not visited questions
              statusClass = 'bg-gray-200 text-gray-600';
            }

            return (
              <button
                key={question.id}
                onClick={() => handleQuestionNavigation(index)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${statusClass} hover:scale-105`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Quick Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const nextUnanswered = answers.findIndex(a => !a.selectedOption);
              if (nextUnanswered !== -1) handleQuestionNavigation(nextUnanswered);
            }}
            className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Next Unanswered
          </button>
          <button
            onClick={() => {
              const flagged = answers.findIndex(a => a.isFlagged);
              if (flagged !== -1) handleQuestionNavigation(flagged);
            }}
            className="flex-1 px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Next Flagged
          </button>
        </div>
      </div>
    );
  };

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
  const currentAnswer = answers.find(a => a.questionId === currentQ.id);
  const answeredQuestions = answers.filter(a => a.selectedOption !== '').length;
  const flaggedQuestions = answers.filter(a => a.isFlagged).length;
  const totalQuestions = quizData.questions.length;

  return (
    <div className={`${mobileClasses.container} min-h-screen bg-gray-50 pb-24`}>
      {/* Header with Timer */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-sm font-semibold text-gray-900 truncate">{quizData.title}</h1>
          </div>
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        
        {/* Timer and Progress Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500" />
            <span className="text-sm font-mono text-red-600 font-semibold">{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Question {currentQuestion + 1} of {totalQuestions}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{answeredQuestions}/{totalQuestions}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#20C997] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {showMobileNav && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileNav(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Question Navigation</h3>
              <button onClick={() => setShowMobileNav(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <QuestionNavigation />
          </div>
        </div>
      )}

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
                currentAnswer?.isFlagged 
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
                onClick={() => handleAnswerSelect(currentQ.id, option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  currentAnswer?.selectedOption === option
                    ? 'border-[#20C997] bg-[#20C997] text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    currentAnswer?.selectedOption === option
                      ? 'border-white'
                      : 'border-gray-300'
                  }`}>
                    {currentAnswer?.selectedOption === option && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              currentQuestion === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-4 py-3 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-20"></div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileNav(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-4 w-4" />
              <span className="text-sm">Navigation</span>
            </button>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="text-sm font-mono text-red-600">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowConfirmSubmit(true)}
            disabled={submitting || isSubmitted}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Submit
              </>
            )}
          </button>
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
