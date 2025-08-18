'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Download, Search, Edit3, FileDown, Settings, Zap, BarChart3, Filter } from 'lucide-react';
import { PDFProcessor, ExtractedQuiz } from '@/lib/pdf-processor';
import { TextProcessor } from '@/lib/text-processor';
import { SmartFormatDetector } from '@/lib/smart-format-detector';
import { BulkProcessor } from '@/lib/bulk-processor';
import { QuestionAnalyzer } from '@/lib/question-analyzer';
import { EnhancedBulkProcessor } from '@/lib/enhanced-bulk-processor';
import { AdvancedSearchReplace } from '@/lib/advanced-search-replace';
import { ExportProcessor } from '@/lib/export-processor';
import { EnhancedSmartDetector } from '@/lib/enhanced-smart-detector';
import { QuizPreviewEditor } from './QuizPreviewEditor';

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
  
  // Advanced Features States
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt' | 'html' | 'markdown'>('json');
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<any>(null);
  const [mergeStrategy, setMergeStrategy] = useState<'append' | 'replace' | 'merge-by-topic' | 'smart-merge'>('smart-merge');
  const [questionAnalysis, setQuestionAnalysis] = useState<any>(null);
  const [showPreviewEditor, setShowPreviewEditor] = useState(false);

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

      // Enhanced Smart Detection
      const enhancedResult = EnhancedSmartDetector.detectFormat(quiz.description || '');
      setEnhancedAnalysis(enhancedResult);

      // Smart format detection and analysis
      const formatResult = SmartFormatDetector.detectFormat(quiz.description || '');
      setFormatAnalysis(formatResult);

      // Auto-correct if needed
      if (formatResult.issues.length > 0) {
        const correctedText = SmartFormatDetector.autoCorrect(quiz.description || '');
        console.log('Auto-corrections applied:', correctedText.corrections.length);
      }

      // Question quality analysis
      const analysis = QuestionAnalyzer.analyzeQuiz(quiz.questions);
      setQuestionAnalysis(analysis);
      console.log('Question analysis:', analysis);

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
      if (bulkMode) {
        setSelectedFiles(files);
      } else {
        processPDFFile(files[0]);
      }
    }
  }, [processPDFFile, bulkMode]);

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
      // Use Enhanced Bulk Processor
      const result = await EnhancedBulkProcessor.processMultipleFiles(selectedFiles, mergeStrategy);
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
  }, [selectedFiles, mergeStrategy, onQuizExtracted, onUploadStart, onUploadComplete]);

  const handleSearch = useCallback(() => {
    if (!extractedQuiz || !searchQuery.trim()) return;

    const searchResults = AdvancedSearchReplace.searchInQuiz(extractedQuiz.questions, searchQuery);
    setSearchResults(searchResults);
  }, [extractedQuiz, searchQuery]);

  const handleExport = useCallback(async () => {
    if (!extractedQuiz) return;

    try {
      const exportResult = await ExportProcessor.exportQuiz(extractedQuiz, { format: exportFormat });
      
      // Create download link
      const blob = new Blob([exportResult.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${extractedQuiz.title.toLowerCase().replace(/\s+/g, '-')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export quiz');
    }
  }, [extractedQuiz, exportFormat]);

  const handleRetry = useCallback(() => {
    setError(null);
    setExtractedQuiz(null);
  }, []);

  const handleSaveQuiz = useCallback(() => {
    if (extractedQuiz) {
      onQuizExtracted(extractedQuiz);
    }
  }, [extractedQuiz, onQuizExtracted]);

  const handlePreviewEditorSave = useCallback((updatedQuiz: any) => {
    setExtractedQuiz(updatedQuiz);
    setShowPreviewEditor(false);
    onQuizExtracted(updatedQuiz);
  }, [onQuizExtracted]);

  const handlePreviewEditorCancel = useCallback(() => {
    setShowPreviewEditor(false);
  }, []);

  // Show preview editor if enabled
  if (showPreviewEditor && extractedQuiz) {
    return (
      <QuizPreviewEditor
        quiz={extractedQuiz}
        onSave={handlePreviewEditorSave}
        onCancel={handlePreviewEditorCancel}
      />
    );
  }

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
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                showAdvancedFeatures
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Settings className="h-4 w-4" />
              {showAdvancedFeatures ? 'Advanced ON' : 'Advanced'}
            </button>
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

      {/* Advanced Features Panel */}
      {showAdvancedFeatures && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Advanced Features Panel
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search & Replace */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800 flex items-center gap-1">
                <Search className="h-3 w-3" />
                Search & Replace
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Search in quiz..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded"
                />
                <button
                  onClick={handleSearch}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800 flex items-center gap-1">
                <FileDown className="h-3 w-3" />
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'txt' | 'html' | 'markdown')}
                className="w-full px-2 py-1 text-xs border border-blue-300 rounded"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="txt">TXT</option>
                <option value="html">HTML</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            {/* Merge Strategy */}
            {bulkMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Merge Strategy
                </label>
                <select
                  value={mergeStrategy}
                  onChange={(e) => setMergeStrategy(e.target.value as 'append' | 'replace' | 'merge-by-topic' | 'smart-merge')}
                  className="w-full px-2 py-1 text-xs border border-blue-300 rounded"
                >
                  <option value="smart-merge">Smart Merge</option>
                  <option value="append">Append All</option>
                  <option value="replace">Replace Duplicates</option>
                  <option value="merge-by-topic">Merge by Topic</option>
                </select>
              </div>
            )}

            {/* Export Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800 flex items-center gap-1">
                <Download className="h-3 w-3" />
                Export Quiz
              </label>
              <button
                onClick={handleExport}
                disabled={!extractedQuiz}
                className="w-full px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Export {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-yellow-600" />
            <h4 className="font-semibold text-yellow-900">Search Results</h4>
          </div>
          <div className="space-y-2">
            {searchResults.slice(0, 5).map((result, index) => (
              <div key={index} className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded">
                <span className="font-medium">Found in:</span> {result.context}
              </div>
            ))}
            {searchResults.length > 5 && (
              <p className="text-xs text-yellow-600">
                ... and {searchResults.length - 5} more results
              </p>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Analysis */}
      {enhancedAnalysis && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-indigo-600" />
            <h4 className="font-semibold text-indigo-900">Enhanced Analysis</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-indigo-800">Detection Strategy:</p>
              <p className="text-indigo-700">{enhancedAnalysis.detectionStrategy}</p>
            </div>
            <div>
              <p className="font-medium text-indigo-800">Confidence Score:</p>
              <p className="text-indigo-700">{Math.round(enhancedAnalysis.confidence * 100)}%</p>
            </div>
            <div>
              <p className="font-medium text-indigo-800">Format Quality:</p>
              <p className="text-indigo-700">{enhancedAnalysis.formatQuality}</p>
            </div>
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

      {/* Question Analysis */}
      {questionAnalysis && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-green-600" />
            <h4 className="font-semibold text-green-900">Question Quality Analysis</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-green-800">Average Quality:</p>
              <p className="text-green-700">{Math.round(questionAnalysis.averageQuality * 100)}%</p>
            </div>
            <div>
              <p className="font-medium text-green-800">Difficulty Level:</p>
              <p className="text-green-700 capitalize">{questionAnalysis.difficultyLevel}</p>
            </div>
            <div>
              <p className="font-medium text-green-800">Readability Score:</p>
              <p className="text-green-700">{Math.round(questionAnalysis.readabilityScore * 100)}%</p>
            </div>
            <div>
              <p className="font-medium text-green-800">Suggestions:</p>
              <p className="text-green-700">{questionAnalysis.suggestions.length}</p>
            </div>
          </div>

          {questionAnalysis.suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-green-700 mb-2">Improvement Suggestions:</p>
              <div className="space-y-1">
                {questionAnalysis.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                  <p key={index} className="text-xs text-green-600">💡 {suggestion}</p>
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
            <h4 className="font-semibold text-purple-900">Enhanced Bulk Processing Complete</h4>
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

          {bulkResult.conflicts && bulkResult.conflicts.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-purple-700 mb-2">Resolved Conflicts:</p>
              <div className="space-y-1">
                {bulkResult.conflicts.slice(0, 3).map((conflict: any, index: number) => (
                  <p key={index} className="text-xs text-purple-600">
                    🔄 {conflict.type}: {conflict.description}
                  </p>
                ))}
              </div>
            </div>
          )}
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
            <div className="flex gap-2">
              <button
                onClick={handleSaveQuiz}
                className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors text-sm font-medium"
              >
                Use This Quiz
              </button>
              <button
                onClick={() => setShowPreviewEditor(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Preview & Edit
              </button>
            </div>
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
