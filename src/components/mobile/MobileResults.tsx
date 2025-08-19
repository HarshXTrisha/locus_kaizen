'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  ArrowLeft, Share2, Download, Eye, Trophy, Target,
  Clock, Calendar, CheckCircle, XCircle, TrendingUp, BarChart3, Loader2
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';
import { getQuizResult } from '@/lib/firebase-quiz';
import { getQuiz } from '@/lib/firebase-quiz';

import { QuizResult as FirebaseQuizResult, Answer } from '@/lib/firebase-quiz';

interface ComponentQuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: Date;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
  }>;
}

import { Quiz as FirebaseQuiz } from '@/lib/firebase-quiz';

interface ComponentQuiz {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
  }>;
}

export default function MobileResults() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'history'>('overview');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ComponentQuizResult | null>(null);
  const [quiz, setQuiz] = useState<ComponentQuiz | null>(null);

  // Get result ID from URL
  const resultId = params?.id as string;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (!resultId) {
      showError('Error', 'Result ID not found');
      router.push('/results');
      return;
    }

    const loadResult = async () => {
      try {
        setLoading(true);
        console.log('📱 Loading result:', resultId);
        
        // Load result data
        const resultData = await getQuizResult(resultId);
        if (!resultData) {
          showError('Result Not Found', 'The result you are looking for does not exist');
          router.push('/results');
          return;
        }

        // Convert Firebase result to component format
        const convertedResult: ComponentQuizResult = {
          ...resultData,
          answers: resultData.answers.map(answer => ({
            questionId: answer.questionId,
            selectedOption: answer.userAnswer,
            isCorrect: answer.isCorrect
          }))
        };
        setResult(convertedResult);

        // Load quiz data
        const quizData = await getQuiz(resultData.quizId);
        if (quizData) {
          // Convert Firebase quiz to component format
          const convertedQuiz: ComponentQuiz = {
            ...quizData,
            questions: quizData.questions.map(q => ({
              id: q.id || '',
              text: q.text,
              options: q.options || [],
              correctAnswer: q.correctAnswer
            }))
          };
          setQuiz(convertedQuiz);
        }

        console.log('📱 Result loaded:', resultData.score, '%');
      } catch (error) {
        console.error('❌ Error loading result:', error);
        showError('Error', 'Failed to load result');
        router.push('/results');
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [resultId, user, isAuthenticated, router]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Trophy className="text-yellow-500" size={24} />;
    if (score >= 80) return <TrendingUp className="text-green-500" size={24} />;
    if (score >= 70) return <Target className="text-blue-500" size={24} />;
    return <XCircle className="text-red-500" size={24} />;
  };

  const handleShare = useCallback(() => {
    if (!result || !quiz) return;

    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Result',
        text: `I scored ${result.score}% on ${quiz.title}!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`I scored ${result.score}% on ${quiz.title}!`);
      showSuccess('Copied!', 'Result copied to clipboard');
    }
  }, [result, quiz]);

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
          <p className="text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className={`${mobileClasses.container} flex items-center justify-center min-h-screen`}>
        <div className="text-center">
          <XCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <p className="text-gray-600">Result not found</p>
        </div>
      </div>
    );
  }

  const isPassed = result.score >= quiz.passingScore;

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Score Card */}
      <div className={mobileClasses.card + " text-center"}>
        <div className="flex justify-center mb-4">
          {getScoreIcon(result.score)}
        </div>
        
        <h2 className={mobileClasses.text.h1 + " mb-2"}>{quiz.title}</h2>
        
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-4 ${getScoreColor(result.score)}`}>
          {result.score}%
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
          <CheckCircle size={16} />
          <span>{result.correctAnswers} out of {result.totalQuestions} correct</span>
        </div>
        
        <div className={`text-sm font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
          {isPassed ? 'PASSED' : 'FAILED'} (Passing: {quiz.passingScore}%)
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className={mobileClasses.card + " text-center"}>
          <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Time Taken</p>
          <p className="text-lg font-semibold text-gray-900">{formatTime(result.timeTaken)}</p>
        </div>
        
        <div className={mobileClasses.card + " text-center"}>
          <Calendar className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(result.completedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className={`${mobileClasses.button.primary} w-full flex items-center justify-center gap-2`}
      >
        <Share2 size={16} />
        Share Result
      </button>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-4">
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-4"}>Question Details</h3>
        
        <div className="space-y-3">
          {result.answers.map((answer, index) => {
            const question = quiz.questions.find(q => q.id === answer.questionId);
            if (!question) return null;

            return (
              <div key={answer.questionId} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Question {index + 1}
                  </span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    answer.isCorrect 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {answer.isCorrect ? (
                      <>
                        <CheckCircle size={12} />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle size={12} />
                        Incorrect
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{question.text}</p>
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Your answer: {answer.selectedOption}</p>
                  <p className="text-xs text-gray-500">Correct answer: {question.correctAnswer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className={mobileClasses.card}>
      <h3 className={mobileClasses.text.h3 + " mb-4"}>Performance History</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Accuracy</p>
              <p className="text-xs text-gray-600">
                {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {result.correctAnswers}/{result.totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Speed</p>
              <p className="text-xs text-gray-600">
                {Math.round(result.timeTaken / result.totalQuestions)}s per question
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatTime(result.timeTaken)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-lg font-semibold text-gray-900">Quiz Results</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'details', label: 'Details', icon: BarChart3 },
            { id: 'history', label: 'History', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'details' | 'history')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#20C997] text-[#20C997]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'details' && renderDetails()}
        {activeTab === 'history' && renderHistory()}
      </div>
    </div>
  );
}
