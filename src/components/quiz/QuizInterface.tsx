'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getQuiz, saveQuizResult } from '@/lib/firebase-quiz';
import { QuestionDisplay } from './QuestionDisplay';
import { QuestionNavigation } from './QuestionNavigation';
import { QuizTimer } from './QuizTimer';
import { QuizProgress } from './QuizProgress';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { CheckCircle, AlertTriangle, Clock, Flag, Loader2 } from '@/lib/icons';

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
  const { user } = useAppStore();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

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
  }, [quizId]);

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
  }, [quiz, timeRemaining, answers, calculateScore, user, router]);

  // Handle submit quiz function
  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz) return;
    
    const answeredQuestions = answers.filter(a => a.selectedOption !== '').length;
    if (answeredQuestions < quiz.questions.length) {
      setShowConfirmSubmit(true);
      return;
    }
    
    await submitQuiz();
  }, [quiz, answers, submitQuiz]);

  useEffect(() => {
    if (timeRemaining <= 0 && quiz) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, quiz, handleSubmitQuiz]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
      <div className="flex items-center justify-center min-h-screen">
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

  const handleAnswerSelect = (questionId: string, selectedOption: string) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, selectedOption }
          : answer
      )
    );
  };

  const handleFlagQuestion = (questionId: string) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, isFlagged: !answer.isFlagged }
          : answer
      )
    );
  };

  const handleQuestionNavigation = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">{quiz.description}</p>
            <p className="text-sm text-gray-500 mt-1">Subject: {quiz.subject}</p>
          </div>
          <div className="flex items-center gap-4">
            <QuizTimer timeRemaining={timeRemaining} />
            <QuizProgress 
              current={currentQuestionIndex + 1} 
              total={totalQuestions}
              answered={answeredQuestions}
              flagged={flaggedQuestions}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Quiz Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              selectedAnswer={answers[currentQuestionIndex]?.selectedOption || ''}
              isFlagged={answers[currentQuestionIndex]?.isFlagged || false}
              onAnswerSelect={(option) => handleAnswerSelect(currentQuestion.id, option)}
              onFlagQuestion={() => handleFlagQuestion(currentQuestion.id)}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-3">
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                  className="px-6 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <ButtonLoader text="Submitting..." />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Submit Quiz
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Question Navigation</h3>
            <QuestionNavigation
              questions={quiz.questions}
              answers={answers}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionNavigation}
            />
          </div>
        </div>
      </div>

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
