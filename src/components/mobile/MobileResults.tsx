'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  ArrowLeft, Share2, Download, Eye, Trophy, Target,
  Clock, Calendar, CheckCircle, XCircle, TrendingUp, BarChart3
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';

interface QuizResult {
  id: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: Date;
  passingScore: number;
  isPassed: boolean;
}

export default function MobileResults() {
  const router = useRouter();
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'history'>('overview');

  // Mock result data
  const result: QuizResult = {
    id: '1',
    quizTitle: 'Mathematics Quiz',
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    timeTaken: 1200, // 20 minutes
    completedAt: new Date(),
    passingScore: 70,
    isPassed: true
  };

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
    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Result',
        text: `I scored ${result.score}% on ${result.quizTitle}!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`I scored ${result.score}% on ${result.quizTitle}!`);
      showSuccess('Copied!', 'Result copied to clipboard');
    }
  }, [result]);

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Score Card */}
      <div className={mobileClasses.card + " text-center"}>
        <div className="flex justify-center mb-4">
          {getScoreIcon(result.score)}
        </div>
        
        <h2 className={mobileClasses.text.h1 + " mb-2"}>{result.quizTitle}</h2>
        
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-4 ${getScoreColor(result.score)}`}>
          {result.score}%
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
          <CheckCircle size={16} />
          <span>{result.correctAnswers} out of {result.totalQuestions} correct</span>
        </div>
        
        <div className={`text-sm font-medium ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
          {result.isPassed ? 'PASSED' : 'FAILED'} (Passing: {result.passingScore}%)
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className={mobileClasses.card + " text-center"}>
          <Clock size={20} className="mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-600">Time Taken</p>
          <p className="font-semibold text-gray-900">{formatTime(result.timeTaken)}</p>
        </div>
        
        <div className={mobileClasses.card + " text-center"}>
          <Calendar size={20} className="mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-600">Completed</p>
          <p className="font-semibold text-gray-900">
            {result.completedAt.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Performance Breakdown</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Correct Answers</span>
              <span>{result.correctAnswers}/{result.totalQuestions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(result.correctAnswers / result.totalQuestions) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Score</span>
              <span>{result.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  result.score >= 90 ? 'bg-green-500' :
                  result.score >= 80 ? 'bg-blue-500' :
                  result.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className={mobileClasses.button.secondary + " flex-1 flex items-center justify-center gap-2"}
        >
          <Share2 size={16} />
          Share Result
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={mobileClasses.button.primary + " flex-1 flex items-center justify-center gap-2"}
        >
          <Eye size={16} />
          View Details
        </button>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-4">
      {/* Question Analysis */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Question Analysis</h3>
        
        <div className="space-y-3">
          {[
            { question: 'What is the formula for calculating the area of a circle?', correct: true, time: 45 },
            { question: 'Solve for x: 2x + 5 = 13', correct: true, time: 30 },
            { question: 'What is the square root of 144?', correct: false, time: 60 },
            { question: 'If a triangle has angles of 45°, 45°, and 90°, what type of triangle is it?', correct: true, time: 35 },
            { question: 'What is the value of π (pi) to two decimal places?', correct: true, time: 25 }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                item.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {item.correct ? <CheckCircle size={14} /> : <XCircle size={14} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 mb-1">{item.question}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className={`font-medium ${item.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {item.correct ? 'Correct' : 'Incorrect'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {item.time}s
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Analysis */}
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Time Analysis</h3>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(result.timeTaken / result.totalQuestions)}
            </p>
            <p className="text-xs text-gray-600">Avg. seconds per question</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(result.timeTaken)}
            </p>
            <p className="text-xs text-gray-600">Total time taken</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setActiveTab('overview')}
        className={mobileClasses.button.secondary + " w-full"}
      >
        Back to Overview
      </button>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Recent Results</h3>
        
        <div className="space-y-3">
          {[
            { id: '1', title: 'Mathematics Quiz', score: 85, date: '2024-01-15', questions: 20 },
            { id: '2', title: 'Science Test', score: 92, date: '2024-01-14', questions: 15 },
            { id: '3', title: 'History Quiz', score: 78, date: '2024-01-13', questions: 25 },
            { id: '4', title: 'English Grammar', score: 88, date: '2024-01-12', questions: 18 },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{item.date} • {item.questions} questions</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getScoreColor(item.score)}`}>
                  {item.score}%
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setActiveTab('overview')}
        className={mobileClasses.button.secondary + " w-full"}
      >
        Back to Overview
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={mobileClasses.text.h1}>Quiz Results</h1>
            <p className="text-xs text-gray-600">Your performance summary</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'details', label: 'Details', icon: Eye },
            { id: 'history', label: 'History', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
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
