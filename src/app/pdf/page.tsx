'use client';

import React, { useState } from 'react';
import { EnhancedPDFUpload } from '@/components/upload/EnhancedPDFUpload';
import { showSuccess, showError } from '@/components/common/NotificationSystem';

export default function PDFConversionPage() {
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuizGenerated = (quiz: any) => {
    setGeneratedQuiz(quiz);
    showSuccess(`Quiz generated successfully! ${quiz.questions.length} questions created.`);
  };

  const handleUploadStart = () => {
    setIsProcessing(true);
  };

  const handleUploadComplete = () => {
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QuestAI PDF Converter</h1>
                <p className="text-sm text-gray-600">AI-Powered PDF to Quiz Conversion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>OSS GPT 20B Active</span>
              </div>
              <div className="text-xs text-gray-400">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Conversion */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <EnhancedPDFUpload
                onQuizGenerated={handleQuizGenerated}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* Features Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI-Powered Analysis</p>
                    <p className="text-xs text-gray-600">Intelligent content understanding with OSS GPT 20B</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quality Validation</p>
                    <p className="text-xs text-gray-600">Automatic format checking and error correction</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Direct Download</p>
                    <p className="text-xs text-gray-600">Get JSON files ready for QuestAI platform</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Formats</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Textbooks & Study Materials</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Research Papers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Business Documents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Technical Manuals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Lecture Notes</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            {generatedQuiz && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Questions Generated</span>
                    <span className="text-sm font-medium text-gray-900">{generatedQuiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processing Method</span>
                    <span className="text-sm font-medium text-green-600">OSS GPT 20B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Format</span>
                    <span className="text-sm font-medium text-blue-600">QuestAI JSON</span>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Processing PDF</p>
                    <p className="text-xs text-blue-700">Using OSS GPT 20B for intelligent conversion</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Tool</h3>
            <p className="text-sm text-gray-600 mb-4">
              This PDF to Quiz converter uses the powerful OSS GPT 20B model to intelligently analyze your PDF content 
              and generate high-quality multiple-choice questions in QuestAI&apos;s JSON format. Perfect for educators, 
              trainers, and content creators.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <span>• Secure Processing</span>
              <span>• No Data Storage</span>
              <span>• Instant Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
