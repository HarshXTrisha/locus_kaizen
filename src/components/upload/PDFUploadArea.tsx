'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { PDFProcessor, ExtractedQuiz } from '@/lib/pdf-processor';
import { TextProcessor } from '@/lib/text-processor';
import { SmartFormatDetector } from '@/lib/smart-format-detector';
import { BulkProcessor } from '@/lib/bulk-processor';
import { QuestionAnalyzer } from '@/lib/question-analyzer';

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
  const [formatAnalysis, setFormatAnalysis] = useState<any>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [bulkResult, setBulkResult] = useState<any>(null);

  const processPDFFile = useCallback(async (file: File) => {
    // Check file type
    const isPDF = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    const isTXT = file.type.includes('text/plain') || file.name.toLowerCase().endsWith('.txt');
    
    if (!isPDF && !isTXT) {
      setError('Please select a valid PDF or TXT file');
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

      // Process file based on type
      let quiz: ExtractedQuiz;
      if (isPDF) {
        quiz = await PDFProcessor.processPDF(file);
      } else {
        quiz = await TextProcessor.processTextFile(file);
      }
      
      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Smart format detection and analysis
      const formatResult = SmartFormatDetector.detectFormat(quiz.description || '');
      setFormatAnalysis(formatResult);

      // Auto-correct if needed
      if (formatResult.issues.length > 0) {
        const correctedText = SmartFormatDetector.autoCorrect(quiz.description || '');
        console.log('Auto-corrections applied:', correctedText.corrections.length);
      }

      // Question quality analysis
      const questionAnalysis = QuestionAnalyzer.analyzeQuiz(quiz.questions);
      console.log('Question analysis:', questionAnalysis);

      // Validate extracted quiz
      const validation = isPDF ? PDFProcessor.validateQuiz(quiz) : TextProcessor.validateQuiz(quiz);
      if (!validation.isValid) {
        setError(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      setExtractedQuiz(quiz);
      onQuizExtracted(quiz);
      onUploadComplete?.();

    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
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
      if (bulkMode) {
        setSelectedFiles(Array.from(files));
      } else {
        processPDFFile(files[0]);
      }
    }
  }, [processPDFFile, bulkMode]);

  const handleBulkProcess = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    onUploadStart?.();

    try {
      const result = await BulkProcessor.processMultipleFiles(selectedFiles);
      setBulkResult(result);
      setExtractedQuiz(result.mergedQuiz);
      onQuizExtracted(result.mergedQuiz);
      onUploadComplete?.();
    } catch (err) {
      console.error('Error processing bulk files:', err);
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [selectedFiles, onQuizExtracted, onUploadStart, onUploadComplete]);

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
      {/* Advanced Features Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">🚀 Advanced Features</h3>
            <p className="text-sm text-purple-700">Enable smart detection, bulk upload, and quality analysis</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                bulkMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Upload className="h-4 w-4" />
              {bulkMode ? 'Bulk Mode ON' : 'Bulk Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Format Guides */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">📋 Need Help with File Format?</h3>
            <p className="text-sm text-blue-700">Download our format guides and sample files to get started</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/pdf-format-guide.md"
              download
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              PDF Guide
            </a>
            <a
              href="/sample-quiz.pdf"
              download
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Sample PDF
            </a>
            <a
              href="/sample-quiz.txt"
              download
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Sample TXT
            </a>
          </div>
        </div>
      </div>

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
          accept=".pdf,.txt"
          multiple={bulkMode}
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
                  Processing File...
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
                  File Processed Successfully!
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
                  {bulkMode ? 'Upload Multiple Files' : 'Upload Quiz File'}
                </h3>
                <p className="text-sm text-gray-600">
                  {bulkMode 
                    ? 'Drag and drop multiple PDF or TXT files here, or click to browse'
                    : 'Drag and drop a PDF or TXT file here, or click to browse'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF and TXT files up to 10MB each
                  {bulkMode && ' • Duplicates will be automatically removed'}
                </p>
                {bulkMode && selectedFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-purple-600 font-medium">
                      {selectedFiles.length} file(s) selected
                    </p>
                    <button
                      onClick={handleBulkProcess}
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Process {selectedFiles.length} Files
                    </button>
                  </div>
                )}
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

      {/* Format Analysis */}
      {formatAnalysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="font-semibold text-blue-900">Smart Analysis</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-800">Detected Format:</p>
              <p className="text-blue-700 capitalize">{formatAnalysis.detectedFormat}</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Confidence:</p>
              <p className="text-blue-700">{Math.round(formatAnalysis.confidence * 100)}%</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Issues Found:</p>
              <p className="text-blue-700">{formatAnalysis.issues.length}</p>
            </div>
          </div>

          {formatAnalysis.suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-blue-700 mb-2">Suggestions:</p>
              <div className="space-y-1">
                {formatAnalysis.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                  <p key={index} className="text-xs text-blue-600">💡 {suggestion}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Processing Result */}
      {bulkResult && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h4 className="font-semibold text-purple-900">Bulk Processing Complete</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-purple-800">Files Processed:</p>
              <p className="text-purple-700">{bulkResult.totalFiles}</p>
            </div>
            <div>
              <p className="font-medium text-purple-800">Successful:</p>
              <p className="text-purple-700">{bulkResult.successfulFiles}</p>
            </div>
            <div>
              <p className="font-medium text-purple-800">Total Questions:</p>
              <p className="text-purple-700">{bulkResult.totalQuestions}</p>
            </div>
            <div>
              <p className="font-medium text-purple-800">Duplicates Removed:</p>
              <p className="text-purple-700">{bulkResult.duplicatesRemoved}</p>
            </div>
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
