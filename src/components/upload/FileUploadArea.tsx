'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, FileJson, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { processPDFFile, ExtractedQuestion } from '@/lib/pdf-processor';
import { showSuccess, showError } from '@/components/common/NotificationSystem';

interface FileUploadAreaProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

interface QuizJSON {
  title?: string;
  description?: string;
  questions: {
    id?: string;
    text: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string;
    points?: number;
  }[];
}

export function FileUploadArea({ 
  onQuestionsExtracted, 
  onUploadStart, 
  onUploadComplete 
}: FileUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const downloadJSONTemplate = () => {
    const template = {
      title: "Sample Quiz",
      description: "A sample quiz for testing purposes",
      questions: [
        {
          id: "q1",
          text: "What is the capital of France?",
          type: "multiple-choice",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: "Paris",
          points: 1
        },
        {
          id: "q2",
          text: "Which planet is known as the Red Planet?",
          type: "multiple-choice",
          options: ["Earth", "Mars", "Jupiter", "Venus"],
          correctAnswer: "Mars",
          points: 1
        },
        {
          id: "q3",
          text: "Is the Earth round?",
          type: "true-false",
          options: ["True", "False"],
          correctAnswer: "True",
          points: 1
        },
        {
          id: "q4",
          text: "What is 2 + 2?",
          type: "short-answer",
          correctAnswer: "4",
          points: 1
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Template Downloaded', 'JSON template has been downloaded successfully');
  };

  const processJSONFile = async (file: File): Promise<ExtractedQuestion[]> => {
    try {
      // Check file size first (limit to 10MB for JSON files)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 10MB for JSON files.');
      }

      const text = await file.text();
      const quizData: QuizJSON = JSON.parse(text);
      
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid JSON format: questions array is required');
      }

      // Limit number of questions to prevent performance issues
      const maxQuestions = 500;
      if (quizData.questions.length > maxQuestions) {
        throw new Error(`Too many questions. Maximum allowed is ${maxQuestions} questions. Your file contains ${quizData.questions.length} questions.`);
      }

      // Validate each question to prevent malformed data
      const validatedQuestions = quizData.questions.map((q, index) => {
        if (!q.text || typeof q.text !== 'string') {
          throw new Error(`Question ${index + 1}: Missing or invalid question text`);
        }
        if (!q.type || !['multiple-choice', 'true-false', 'short-answer'].includes(q.type)) {
          throw new Error(`Question ${index + 1}: Invalid question type. Must be 'multiple-choice', 'true-false', or 'short-answer'`);
        }
        if (!q.correctAnswer || typeof q.correctAnswer !== 'string') {
          throw new Error(`Question ${index + 1}: Missing or invalid correct answer`);
        }
        if (q.type === 'multiple-choice' && (!q.options || !Array.isArray(q.options) || q.options.length < 2)) {
          throw new Error(`Question ${index + 1}: Multiple-choice questions must have at least 2 options`);
        }

        return {
          id: q.id || `q${index + 1}`,
          text: q.text.trim(),
          type: q.type,
          options: q.options ? q.options.map(opt => opt.trim()) : undefined,
          correctAnswer: q.correctAnswer.trim(),
          points: q.points && q.points > 0 ? q.points : 1
        };
      });

      return validatedQuestions;
    } catch (error) {
      throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Invalid JSON format'}`);
    }
  };

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);
    onUploadStart?.();

    try {
      let questions: ExtractedQuestion[] = [];

      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setProcessingStatus('Processing JSON file...');
        questions = await processJSONFile(file);
        setProcessingStatus(`✅ Extracted ${questions.length} questions from JSON`);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setProcessingStatus('Processing PDF file...');
        const result = await processPDFFile(file);
        if (result.success) {
          questions = result.questions;
          setProcessingStatus(`✅ Extracted ${questions.length} questions from PDF`);
        } else {
          throw new Error(result.error || 'Failed to process PDF');
        }
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or JSON file.');
      }

      onQuestionsExtracted(questions);
      showSuccess('File Processed', `Successfully extracted ${questions.length} questions`);
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setProcessingStatus(`❌ ${errorMessage}`);
      showError('Processing Failed', errorMessage);
    } finally {
      setIsProcessing(false);
      onUploadComplete?.();
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  }, []);

  const clearUpload = () => {
    setUploadedFile(null);
    setProcessingStatus('');
    onQuestionsExtracted([]);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.json')) {
      return <FileJson className="h-6 w-6 text-blue-500" />;
    } else if (fileName.endsWith('.pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const getFileTypeText = (fileName: string) => {
    if (fileName.endsWith('.json')) {
      return 'JSON Quiz File';
    } else if (fileName.endsWith('.pdf')) {
      return 'PDF Document';
    }
    return 'Unknown File Type';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-[#20C997] bg-[#20C997]/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".pdf,.json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="p-3 bg-[#20C997]/10 rounded-full w-fit mx-auto">
            <Upload className="h-8 w-8 text-[#20C997]" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Quiz File
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            
            {/* Supported Formats */}
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" />
                <span>PDF Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-blue-500" />
                <span>JSON Quiz Files</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Format Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-blue-900 text-lg">JSON Format Instructions</h4>
          <button
            onClick={downloadJSONTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Download Template
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-blue-800 text-sm">
            Your JSON file should follow this structure. Click the download button above to get a complete template.
          </p>
          
          <div className="bg-blue-100 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 text-sm">Required Structure:</h5>
            <pre className="text-xs text-blue-800 overflow-x-auto">
{`{
  "title": "Your Quiz Title",
  "description": "Quiz description (optional)",
  "questions": [
    {
      "id": "q1",                    // Optional unique ID
      "text": "Your question text",
      "type": "multiple-choice",     // "multiple-choice", "true-false", or "short-answer"
      "options": ["A", "B", "C", "D"], // Required for multiple-choice
      "correctAnswer": "A",          // Must match one of the options
      "points": 1                    // Optional, defaults to 1
    }
  ]
}`}
            </pre>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border border-blue-200">
              <h6 className="font-medium text-blue-900 mb-1">Multiple Choice</h6>
              <p className="text-blue-700 text-xs">Include options array with correctAnswer matching one option</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <h6 className="font-medium text-blue-900 mb-1">True/False</h6>
              <p className="text-blue-700 text-xs">Use options: ["True", "False"] with correctAnswer: "True" or "False"</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <h6 className="font-medium text-blue-900 mb-1">Short Answer</h6>
              <p className="text-blue-700 text-xs">No options needed, just correctAnswer text</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h6 className="font-medium text-yellow-900 mb-1 text-sm">Important Notes:</h6>
            <ul className="text-yellow-800 text-xs space-y-1">
              <li>• Maximum file size: 10MB</li>
              <li>• Maximum questions: 500</li>
              <li>• All question types must have a correctAnswer</li>
              <li>• Multiple-choice questions must have at least 2 options</li>
              <li>• Points are optional and default to 1</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#20C997]"></div>
            <span className="text-blue-800">{processingStatus}</span>
          </div>
        </div>
      )}

      {/* Uploaded File Display */}
      {uploadedFile && !isProcessing && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(uploadedFile.name)}
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">{getFileTypeText(uploadedFile.name)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {processingStatus.includes('✅') ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : processingStatus.includes('❌') ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : null}
              
              <button
                onClick={clearUpload}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {processingStatus && (
            <p className={`mt-2 text-sm ${
              processingStatus.includes('✅') ? 'text-green-600' : 
              processingStatus.includes('❌') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {processingStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
