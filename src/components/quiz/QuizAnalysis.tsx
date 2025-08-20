'use client';

import React, { useState } from 'react';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AnalysisResult {
  weak_topics: string[];
  strong_topics: string[];
  score: number;
  recommendation: string;
}

interface QuizAnalysisProps {
  quizAnswers: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export function QuizAnalysis({ quizAnswers, onAnalysisComplete }: QuizAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeQuizResults = async () => {
    if (!quizAnswers.trim()) {
      showError('No Answers', 'Please provide quiz answers for analysis.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-123', // Replace with actual user ID from your auth system
        },
        body: JSON.stringify({
          answers: quizAnswers
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResult(data.data);
        showSuccess('Analysis Complete', 'Quiz results have been analyzed successfully!');
        
        // Call callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(data.data);
        }
      } else {
        setError(data.message || 'Analysis failed');
        showError('Analysis Failed', data.message || 'Failed to analyze quiz results.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      setError(errorMessage);
      showError('Network Error', 'Failed to connect to analysis service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        AI-Powered Quiz Analysis
      </h3>
      
      {/* Quiz Answers Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quiz Answers:
        </label>
        <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
          {quizAnswers || 'No answers provided'}
        </div>
      </div>

      {/* Analysis Button */}
      <button
        onClick={analyzeQuizResults}
        disabled={isAnalyzing || !quizAnswers.trim()}
        className="w-full bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isAnalyzing ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Analyzing...</span>
          </>
        ) : (
          <>
            <span>🤖 Analyze with AI</span>
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Analysis Results</h4>
          
          {/* Score */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Overall Score</span>
              <span className="text-2xl font-bold text-blue-900">{analysisResult.score}%</span>
            </div>
          </div>

          {/* Strong Topics */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-green-700 mb-2">Strong Topics</h5>
            <div className="flex flex-wrap gap-2">
              {analysisResult.strong_topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-orange-700 mb-2">Areas for Improvement</h5>
            <div className="flex flex-wrap gap-2">
              {analysisResult.weak_topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-purple-700 mb-2">AI Recommendation</h5>
            <p className="text-sm text-purple-800 leading-relaxed">
              {analysisResult.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizAnalysis;
