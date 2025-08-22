'use client';

import React, { useState } from 'react';
import { EnhancedPDFUpload } from '@/components/upload/EnhancedPDFUpload';
import { AIChatbot } from '@/components/chat/AIChatbot';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { aiConfig } from '@/lib/config';

export default function PDFConversionPage() {
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');

  const handleQuizGenerated = (quiz: any) => {
    setGeneratedQuiz(quiz);
    showSuccess('Quiz Generated Successfully', `${quiz.questions.length} questions created from your PDF.`);
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
                <span>
                  {selectedModel === 'auto' ? 'Auto Select' : 
                   selectedModel === 'oss-gpt' ? 'OSS GPT 20B' : 
                   selectedModel === 'gemini' ? 'Gemini AI' : 'Hugging Face'} Active
                </span>
              </div>
              <div className="text-xs text-gray-400">
                v2.0.0
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
            {/* AI Model Selector */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose AI Model</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiConfig.availableModels.map((model) => (
                  <div
                    key={model.id}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    {selectedModel === model.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{model.name}</h4>
                          <p className="text-xs text-gray-500">{model.provider}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{model.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {model.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <EnhancedPDFUpload
                onQuizGenerated={handleQuizGenerated}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
                selectedModel={selectedModel}
              />
            </div>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* AI Chatbot */}
            <AIChatbot className="mb-6" />
            
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
                    <span className="text-sm font-medium text-green-600">
                      {generatedQuiz.metadata?.processingMethod === 'oss-gpt-20b' ? 'OSS GPT 20B' :
                       generatedQuiz.metadata?.processingMethod === 'gemini' ? 'Gemini AI' :
                       generatedQuiz.metadata?.processingMethod === 'fallback-pattern-matching' ? 'Pattern Matching' :
                       'Unknown'}
                    </span>
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
                    <p className="text-xs text-blue-700">
                      Using {selectedModel === 'auto' ? 'Auto Select' : 
                             selectedModel === 'oss-gpt' ? 'OSS GPT 20B' : 
                             selectedModel === 'gemini' ? 'Gemini AI' : 'Hugging Face'} for intelligent conversion
                    </p>
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
