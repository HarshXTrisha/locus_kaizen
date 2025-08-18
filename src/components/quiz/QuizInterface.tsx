'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getQuiz, saveQuizResult } from '@/lib/firebase-quiz';
import { QuestionDisplay } from './QuestionDisplay';
import { QuestionNavigation } from './QuestionNavigation';
import { QuizTimer } from './QuizTimer';
import { QuizProgress } from './QuizProgress';
import { TimeExpirationModal } from './TimeExpirationModal';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { CheckCircle, AlertTriangle, Clock, Flag, Loader2, Menu, X } from 'lucide-react';

interface QuizInterfaceProps {
  quizId: string;
}

interface Answer {
  questionId: string;
  selectedOption: string;
  isFlagged: boolean;
}

export function QuizInterface({ quizId }: QuizInterfaceProps) {
  const router = useRouter();
  const { user, addNotification } = useAppStore();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showTimeExpirationModal, setShowTimeExpirationModal] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  const showSuccess = useCallback((title: string, message: string) => {
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title,
      message,
      duration: 5000,
      createdAt: new Date(),
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string) => {
    addNotification({
      id: Date.now().toString(),
      type: 'error',
      title,
      message,
      duration: 5000,
      createdAt: new Date(),
    });
  }, [addNotification]);

  // Load quiz from Firebase
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const quizData = await getQuiz(quizId);
        
        if (quizData) {
          setQuiz(quizData);
          setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
          
          // Initialize answers array
          const initialAnswers = quizData.questions.map((question: any) => ({
            questionId: question.id,
            selectedOption: '',
            isFlagged: false
          }));
          setAnswers(initialAnswers);
        } else {
          showError('Quiz Not Found', 'The quiz you\'re looking for doesn\'t exist.');
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
        showError('Loading Failed', 'Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, showError]);

  // Calculate score function
  const calculateScore = useCallback(() => {
    if (!quiz) return 0;
    let correctAnswers = 0;
    answers.forEach(answer => {
      const question = quiz.questions.find((q: any) => q.id === answer.questionId);
      if (question && answer.selectedOption === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / quiz.questions.length) * 100);
  }, [quiz, answers]);

  // Optimized handlers - moved before early returns
  const handleAnswerSelect = useCallback((questionId: string, selectedOption: string) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, selectedOption }
          : answer
      )
    );
  }, []);

  const handleShortAnswerChange = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => 
      prev.map(ans => 
        ans.questionId === questionId 
          ? { ...ans, selectedOption: answer }
          : ans
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
    if (index >= 0 && index < (quiz?.questions?.length || 0)) {
      // Immediate state update for instant navigation
      setCurrentQuestionIndex(index);
      setShowMobileNav(false); // Close mobile nav when navigating
    }
  }, [quiz?.questions?.length]);

  // Submit quiz function
  const submitQuiz = useCallback(async () => {
    if (!quiz || !user) return;
    
    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const timeSpent = (quiz.timeLimit * 60) - timeRemaining;
      const correctAnswers = answers.filter(answer => {
        const question = quiz.questions.find((q: any) => q.id === answer.questionId);
        return question && answer.selectedOption === question.correctAnswer;
      }).length;

      const result = {
        quizId: quiz.id,
        userId: user.id,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        timeTaken: timeSpent,
        completedAt: new Date(),
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          userAnswer: answer.selectedOption,
          isCorrect: quiz.questions.find((q: any) => q.id === answer.questionId)?.correctAnswer === answer.selectedOption || false,
          points: 1
        }))
      };

      const resultId = await saveQuizResult(result);
      showSuccess('Quiz Submitted!', `Your score: ${score}%`);
      router.push(`/results/${resultId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showError('Submission Failed', 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, timeRemaining, answers, calculateScore, user, router, showError, showSuccess]);

  // Handle submit quiz function
  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz) return;
    
    const answeredQuestions = answers.filter(a => a.selectedOption !== '').length;
    if (answeredQuestions < quiz.questions.length && !timeExpired) {
      setShowConfirmSubmit(true);
      return;
    }
    
    await submitQuiz();
  }, [quiz, answers, submitQuiz, timeExpired]);

  // Handle time expiration
  const handleTimeExpiration = useCallback(async () => {
    setTimeExpired(true);
    setShowTimeExpirationModal(true);
    
    // Auto-submit after a short delay to show the modal
    setTimeout(async () => {
      await submitQuiz();
    }, 2000);
  }, [submitQuiz]);

  // Timer effect with automatic submission
  useEffect(() => {
    if (timeRemaining <= 0 && quiz && !timeExpired) {
      handleTimeExpiration();
      return;
    }

    // Show warning when less than 5 minutes remaining
    if (timeRemaining <= 300 && timeRemaining > 0 && !hasShownWarning && quiz) {
      setHasShownWarning(true);
      setShowTimeExpirationModal(true);
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, quiz, timeExpired, hasShownWarning, handleTimeExpiration]);

  // Handle time expiration modal actions
  const handleTimeModalClose = () => {
    if (!timeExpired) {
      setShowTimeExpirationModal(false);
    }
  };

  const handleTimeModalContinue = async () => {
    if (timeExpired) {
      setShowTimeExpirationModal(false);
    } else {
      setShowTimeExpirationModal(false);
      await handleSubmitQuiz();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#20C997] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Quiz...</h2>
          <p className="text-gray-600">Please wait while we load your quiz.</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600">The quiz you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredQuestions = answers.filter(a => a.selectedOption !== '').length;
  const flaggedQuestions = answers.filter(a => a.isFlagged).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowMobileNav(!showMobileNav)}
          className="bg-white p-3 rounded-lg shadow-lg border border-gray-200"
        >
          {showMobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {showMobileNav && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowMobileNav(false)}>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Question Navigation</h3>
              <button onClick={() => setShowMobileNav(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <QuestionNavigation
              questions={quiz.questions}
              answers={answers}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionNavigation}
            />
          </div>
        </div>
      )}

      {/* Full Screen Container */}
      <div className="w-full min-h-screen">
        {/* Quiz Header - Compact */}
        <div className="w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-600 text-sm lg:text-base">{quiz.description}</p>
                <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                  <span>Subject: {quiz.subject}</span>
                  <span>Questions: {totalQuestions}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <QuizTimer timeRemaining={timeRemaining} totalTime={quiz.timeLimit * 60} />
                <QuizProgress 
                  current={currentQuestionIndex + 1} 
                  total={totalQuestions}
                  answered={answeredQuestions}
                  flagged={flaggedQuestions}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Compact */}
        <div className="w-full bg-gray-50 min-h-[calc(100vh-100px)]">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Main Quiz Area */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4 shadow-sm">
                  <QuestionDisplay
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={totalQuestions}
                    selectedAnswer={answers[currentQuestionIndex]?.selectedOption || ''}
                    isFlagged={answers[currentQuestionIndex]?.isFlagged || false}
                    onAnswerSelect={(option) => handleAnswerSelect(currentQuestion.id, option)}
                    onFlagQuestion={() => handleFlagQuestion(currentQuestion.id)}
                    onShortAnswerChange={(answer) => handleShortAnswerChange(currentQuestion.id, answer)}
                  />
                </div>

                {/* Compact Navigation Buttons */}
                <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                      {currentQuestionIndex + 1} of {totalQuestions}
                    </div>
                    
                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <button
                        onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                        className="flex items-center gap-2 px-6 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-all duration-200 font-medium text-sm"
                      >
                        Next →
                      </button>
                    ) : (
                      <div className="w-16"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Question Navigation Sidebar - Larger size */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm sticky top-4 w-full">
                  <QuestionNavigation
                    questions={quiz.questions}
                    answers={answers}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuestionSelect={handleQuestionNavigation}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Persistent Submit Button */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting || timeExpired}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium disabled:opacity-50 hover:shadow-xl"
          >
            {isSubmitting ? (
              <ButtonLoader text="Submitting..." />
            ) : timeExpired ? (
              <>
                <Clock className="h-5 w-5" />
                Time Expired
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Submit Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {/* Time Expiration Modal */}
      <TimeExpirationModal
        isOpen={showTimeExpirationModal}
        onClose={handleTimeModalClose}
        onContinue={handleTimeModalContinue}
        timeExpired={timeExpired}
      />

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-6">
              You have {totalQuestions - answeredQuestions} unanswered questions. 
              Are you sure you want to submit?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Continue Quiz
              </button>
              <button
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <ButtonLoader text="Submitting..." />
                ) : (
                  'Submit Anyway'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
