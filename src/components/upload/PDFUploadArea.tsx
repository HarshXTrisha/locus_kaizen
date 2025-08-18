'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PDFProcessor, ExtractedQuiz } from '@/lib/pdf-processor';

interface PDFUploadAreaProps {
  onQuizExtracted: (quiz: ExtractedQuiz) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

export function PDFUploadArea({ 
  onQuizExtracted, 
  onUploadStart, 
  onUploadComplete 
}: PDFUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [extractedQuiz, setExtractedQuiz] = useState<ExtractedQuiz | null>(null);

  const processPDFFile = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Please select a valid PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    onUploadStart?.();

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Process PDF
      const quiz = await PDFProcessor.processPDF(file);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Validate extracted quiz
      const validation = PDFProcessor.validateQuiz(quiz);
      if (!validation.isValid) {
        setError(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      setExtractedQuiz(quiz);
      onQuizExtracted(quiz);
      onUploadComplete?.();

    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF file');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [onQuizExtracted, onUploadStart, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processPDFFile(files[0]);
    }
  }, [processPDFFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processPDFFile(files[0]);
    }
  }, [processPDFFile]);

  const handleRetry = useCallback(() => {
    setError(null);
    setExtractedQuiz(null);
  }, []);

  const handleSaveQuiz = useCallback(() => {
    if (extractedQuiz) {
      onQuizExtracted(extractedQuiz);
    }
  }, [extractedQuiz, onQuizExtracted]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-[#20C997] bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {isProcessing ? (
              <Loader2 className="h-12 w-12 text-[#20C997] animate-spin" />
            ) : extractedQuiz ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : error ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <div>
            {isProcessing ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Processing PDF...
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#20C997] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Extracting questions and answers...
                </p>
              </div>
            ) : extractedQuiz ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-900">
                  PDF Processed Successfully!
                </h3>
                <p className="text-sm text-green-700">
                  {extractedQuiz.questions.length} questions extracted
                </p>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-900">
                  Processing Failed
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload PDF Quiz
                </h3>
                <p className="text-sm text-gray-600">
                  Drag and drop a PDF file here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF files up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Extracted Quiz Preview */}
      {extractedQuiz && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">
                Quiz Preview: {extractedQuiz.title}
              </h4>
            </div>
            <button
              onClick={handleSaveQuiz}
              className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors text-sm font-medium"
            >
              Use This Quiz
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Subject:</span> {extractedQuiz.subject}</p>
            <p><span className="font-medium">Questions:</span> {extractedQuiz.questions.length}</p>
            <p><span className="font-medium">Description:</span> {extractedQuiz.description}</p>
          </div>

          {/* Sample Questions */}
          <div className="mt-3">
            <p className="text-xs font-medium text-green-700 mb-2">Sample Questions:</p>
            <div className="space-y-1">
              {extractedQuiz.questions.slice(0, 3).map((question, index) => (
                <div key={question.id} className="text-xs text-green-800 bg-green-100 p-2 rounded">
                  <span className="font-medium">Q{index + 1}:</span> {question.text.substring(0, 60)}...
                </div>
              ))}
              {extractedQuiz.questions.length > 3 && (
                <p className="text-xs text-green-600">
                  ... and {extractedQuiz.questions.length - 3} more questions
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
