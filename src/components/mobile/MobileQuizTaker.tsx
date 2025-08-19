'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle,
  Flag, BookOpen, Target, Users, Timer, AlertTriangle
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';

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
  const { user } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Mock quiz data
  const quizData: QuizData = {
    id: '1',
    title: 'Mathematics Quiz',
    description: 'Test your knowledge in mathematics',
    timeLimit: 30,
    questions: [
      {
        id: '1',
        text: 'What is the formula for calculating the area of a circle?',
        options: ['A = πr²', 'A = 2πr', 'A = πd', 'A = r²'],
        correctAnswer: 0
      },
      {
        id: '2',
        text: 'Solve for x: 2x + 5 = 13',
        options: ['x = 4', 'x = 8', 'x = 6', 'x = 3'],
        correctAnswer: 0
      },
      {
        id: '3',
        text: 'What is the square root of 144?',
        options: ['12', '14', '10', '16'],
        correctAnswer: 0
      },
      {
        id: '4',
        text: 'If a triangle has angles of 45°, 45°, and 90°, what type of triangle is it?',
        options: ['Equilateral', 'Isosceles', 'Scalene', 'Right'],
        correctAnswer: 1
      },
      {
        id: '5',
        text: 'What is the value of π (pi) to two decimal places?',
        options: ['3.12', '3.14', '3.16', '3.18'],
        correctAnswer: 1
      }
    ]
  };

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
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
  }, [timeRemaining, isSubmitted]);

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
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, quizData.questions.length]);

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quizData.questions.length;
    
    showSuccess(
      'Quiz Submitted', 
      `You answered ${answeredCount} out of ${totalQuestions} questions.`
    );
    
    // Navigate to results after a delay
    setTimeout(() => {
      router.push('/results');
    }, 2000);
  }, [answers, quizData.questions.length, router]);

  const currentQuestionData = quizData.questions[currentQuestion];
  const isAnswered = answers[currentQuestionData.id] !== undefined;
  const isFlagged = flaggedQuestions.has(currentQuestionData.id);

  const renderQuestion = () => (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {quizData.questions.length}
        </span>
        <button
          onClick={() => handleFlagQuestion(currentQuestionData.id)}
          className={`p-2 rounded-lg ${
            isFlagged ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Flag size={16} />
        </button>
      </div>

      {/* Question Text */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-4"}>
          {currentQuestionData.text}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestionData.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                answers[currentQuestionData.id] === index
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionData.id}`}
                checked={answers[currentQuestionData.id] === index}
                onChange={() => handleAnswerSelect(currentQuestionData.id, index)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                answers[currentQuestionData.id] === index
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300'
              }`}>
                {answers[currentQuestionData.id] === index && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span className="text-sm text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft size={16} className="inline mr-2" />
          Previous
        </button>
        
        {currentQuestion === quizData.questions.length - 1 ? (
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Next
            <ArrowRight size={16} className="inline ml-2" />
          </button>
        )}
      </div>
    </div>
  );

  const renderQuestionNavigation = () => (
    <div className={mobileClasses.card}>
      <h3 className={mobileClasses.text.h3 + " mb-3"}>Question Navigation</h3>
      
      <div className="grid grid-cols-5 gap-2">
        {quizData.questions.map((question, index) => {
          const isAnswered = answers[question.id] !== undefined;
          const isFlagged = flaggedQuestions.has(question.id);
          const isCurrent = index === currentQuestion;
          
          return (
            <button
              key={question.id}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-blue-600 text-white'
                  : isAnswered
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              } ${isFlagged ? 'ring-2 ring-yellow-400' : ''}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 rounded ring-1 ring-yellow-400"></div>
          <span>Flagged</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={mobileClasses.text.h1}>{quizData.title}</h1>
              <p className="text-xs text-gray-600">{quizData.description}</p>
            </div>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <Clock size={16} />
            <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-green-500 h-1 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {renderQuestion()}
        {renderQuestionNavigation()}
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
              <h3 className={mobileClasses.text.h2 + " mb-2"}>Submit Quiz?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to submit your quiz? You cannot change your answers after submission.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className={mobileClasses.button.secondary + " flex-1"}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmSubmit(false);
                    handleSubmit();
                  }}
                  className={mobileClasses.button.primary + " flex-1"}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
