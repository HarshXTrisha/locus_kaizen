'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, Zap, Settings, CheckCircle, AlertCircle, Download, Sparkles } from 'lucide-react';
import { PDFProcessor } from '@/lib/pdf-processor';
import { showSuccess, showError, showInfo } from '@/components/common/NotificationSystem';

interface EnhancedPDFUploadProps {
  onQuizGenerated: (quiz: any) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

interface ConversionSettings {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'multiple-choice' | 'true-false' | 'mixed';
  subject: string;
  includeExplanations: boolean;
}

export function EnhancedPDFUpload({ 
  onQuizGenerated, 
  onUploadStart, 
  onUploadComplete 
}: EnhancedPDFUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [settings, setSettings] = useState<ConversionSettings>({
    questionCount: 10,
    difficulty: 'medium',
    questionType: 'multiple-choice',
    subject: '',
    includeExplanations: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

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
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setUploadedFile(pdfFile);
      showInfo(`PDF "${pdfFile.name}" ready for conversion. Click "Generate Quiz" to start.`);
    } else {
      showError('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      showInfo(`PDF "${file.name}" ready for conversion. Click "Generate Quiz" to start.`);
    } else {
      showError('Please select a PDF file');
    }
  }, []);

  const processWithOSSGPT = async (file: File) => {
    try {
      setProcessingStatus('Extracting text from PDF...');
      
      // First extract text using existing PDF processor
      const extractedQuiz = await PDFProcessor.processPDF(file);
      const pdfText = extractedQuiz.questions.map(q => 
        `${q.text} ${q.options ? q.options.join(' ') : ''}`
      ).join(' ');

      setProcessingStatus('Analyzing content with OSS GPT 20B...');
      
      // Send to OSS GPT API for enhanced processing
      const response = await fetch('/api/pdf-to-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfText,
          fileName: file.name,
          questionCount: settings.questionCount,
          subject: settings.subject || undefined,
          includeExplanations: settings.includeExplanations
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to convert PDF');
      }

      const result = await response.json();
      
      if (result.success) {
        setProcessingStatus('Quiz generated successfully!');
        return { quiz: result.data, metadata: result.metadata };
      } else {
        throw new Error(result.message || 'Conversion failed');
      }
    } catch (error) {
      console.error('OSS GPT processing failed:', error);
      throw error;
    }
  };

  const handleGenerateQuiz = async () => {
    if (!uploadedFile) {
      showError('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    onUploadStart?.();

    try {
      const result = await processWithOSSGPT(uploadedFile);
      const { quiz, metadata } = result;
      
      showSuccess(`✨ Quiz generated successfully! ${quiz.questions.length} questions created with ${metadata.confidence}% confidence.`);
      
      // Show summary
      const summary = `
📊 Quiz Summary:
• Title: ${quiz.title}
• Questions: ${quiz.questions.length}
• Processing Method: ${metadata.processingMethod}
• Confidence: ${metadata.confidence}%
• Original File: ${metadata.originalFileName}
${metadata.warnings.length > 0 ? `⚠️ Warnings: ${metadata.warnings.length}` : ''}
      `;
      
      console.log(summary);
      onQuizGenerated(quiz);
      
      // Store the generated quiz for download
      setGeneratedQuiz(quiz);
      
    } catch (error) {
      console.error('Quiz generation failed:', error);
      showError(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      onUploadComplete?.();
    }
  };

  const downloadGeneratedJSON = (quiz: any) => {
    try {
      const jsonString = JSON.stringify(quiz, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quiz.title.replace(/[^a-zA-Z0-9]/g, '_')}_quiz.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('JSON file downloaded successfully!');
    } catch (error) {
      showError('Failed to download JSON file');
    }
  };

  const downloadSamplePDF = () => {
    showInfo('Sample PDF download feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">AI-Powered PDF to Quiz</h3>
        </div>
        <p className="text-gray-600">Convert your PDF content into intelligent quizzes using OSS GPT 20B</p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-purple-400 bg-purple-50'
            : uploadedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          {uploadedFile ? (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <div>
                <p className="text-lg font-medium text-green-800">{uploadedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for conversion
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your PDF here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports educational PDFs, textbooks, lecture notes, and study materials
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="border rounded-lg p-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Conversion Settings</span>
          </div>
          <span className="text-sm text-gray-500">
            {showSettings ? 'Hide' : 'Show'} settings
          </span>
        </button>

        {showSettings && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <select
                value={settings.questionCount}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  questionCount: parseInt(e.target.value)
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {[5, 10, 15, 20, 25, 30].map(count => (
                  <option key={count} value={count}>{count} questions</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type
              </label>
              <select
                value={settings.questionType}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  questionType: e.target.value as 'multiple-choice' | 'true-false' | 'mixed'
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="mixed">Mixed Types</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={settings.subject}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  subject: e.target.value
                }))}
                placeholder="e.g., Mathematics, History"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.includeExplanations}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    includeExplanations: e.target.checked
                  }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Include answer explanations
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGenerateQuiz}
          disabled={!uploadedFile || isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Zap className="h-4 w-4" />
          {isProcessing ? 'Generating Quiz...' : 'Generate Quiz with AI'}
        </button>
        
        {generatedQuiz && (
          <button
            onClick={() => downloadGeneratedJSON(generatedQuiz)}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download JSON
          </button>
        )}
        
        <button
          onClick={downloadSamplePDF}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-900">Processing with OSS GPT 20B</p>
              <p className="text-sm text-blue-700">{processingStatus}</p>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span>AI-powered content analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span>Intelligent question generation</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Quality validation & explanations</span>
        </div>
      </div>
    </div>
  );
}
