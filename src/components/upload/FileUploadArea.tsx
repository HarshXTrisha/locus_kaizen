'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileJson, X, CheckCircle, AlertCircle, Download, Plus } from 'lucide-react';
import { ExtractedQuestion } from '@/lib/pdf-processor';
import { showSuccess, showError } from '@/components/common/NotificationSystem';

interface FileUploadAreaProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

interface QuizJSON {
  title?: string;
  description?: string;
  subject?: string;
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const downloadJSONTemplate = () => {
    const template = {
      title: "Sample Quiz",
      description: "A comprehensive quiz covering multiple topics",
      subject: "General Knowledge",
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
        },
        {
          id: "q5",
          text: "Which programming language is known as the language of the web?",
          type: "multiple-choice",
          options: ["Python", "Java", "JavaScript", "C++"],
          correctAnswer: "JavaScript",
          points: 2
        },
        {
          id: "q6",
          text: "The sun rises in the east.",
          type: "true-false",
          options: ["True", "False"],
          correctAnswer: "True",
          points: 1
        },
        {
          id: "q7",
          text: "What is the chemical symbol for gold?",
          type: "short-answer",
          correctAnswer: "Au",
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

        // Type-specific validation
        if (q.type === 'multiple-choice') {
          if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
            throw new Error(`Question ${index + 1}: Multiple-choice questions must have at least 2 options`);
          }
          // Validate that correct answer is one of the options
          if (!q.options.includes(q.correctAnswer)) {
            throw new Error(`Question ${index + 1}: Correct answer must be one of the provided options`);
          }
        } else if (q.type === 'true-false') {
          // For true-false, ensure correct answer is either "True" or "False"
          if (!['True', 'False'].includes(q.correctAnswer)) {
            throw new Error(`Question ${index + 1}: True/False questions must have correctAnswer as "True" or "False"`);
          }
          // Set default options for true-false if not provided
          if (!q.options || !Array.isArray(q.options)) {
            q.options = ['True', 'False'];
          }
        } else if (q.type === 'short-answer') {
          // For short answer, no options are needed, just ensure correct answer exists
          if (!q.correctAnswer.trim()) {
            throw new Error(`Question ${index + 1}: Short answer questions must have a correct answer`);
          }
        }

        return {
          id: q.id || `q${index + 1}`,
          text: q.text.trim(),
          type: q.type,
          options: q.type === 'short-answer' ? undefined : (q.options ? q.options.map(opt => opt.trim()) : undefined),
          correctAnswer: q.correctAnswer.trim(),
          points: q.points && q.points > 0 ? q.points : 1
        };
      });

      return validatedQuestions;
    } catch (error) {
      throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Invalid JSON format'}`);
    }
  };

  const handleFileProcess = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setUploadedFiles(files);
    onUploadStart?.();

    try {
      let allQuestions: ExtractedQuestion[] = [];
      let totalQuestions = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingStatus(`Processing file ${i + 1} of ${files.length}: ${file.name}...`);
        
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          const questions = await processJSONFile(file);
          allQuestions = [...allQuestions, ...questions];
          totalQuestions += questions.length;
        } else {
          throw new Error(`Unsupported file type: ${file.name}. Please upload only JSON files.`);
        }
      }

      // Limit total questions across all files
      const maxTotalQuestions = 1000;
      if (totalQuestions > maxTotalQuestions) {
        throw new Error(`Too many questions across all files. Maximum allowed is ${maxTotalQuestions} questions. Total: ${totalQuestions}`);
      }

      setProcessingStatus(`✅ Successfully processed ${files.length} file(s) with ${totalQuestions} total questions`);
      onQuestionsExtracted(allQuestions);
      showSuccess('Files Processed', `Successfully extracted ${totalQuestions} questions from ${files.length} file(s)`);
    } catch (error) {
      console.error('Error processing files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process files';
      setProcessingStatus(`❌ ${errorMessage}`);
      showError('Processing Failed', errorMessage);
    } finally {
      setIsProcessing(false);
      onUploadComplete?.();
    }
  }, [onQuestionsExtracted, onUploadStart, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/json' || file.name.endsWith('.json')
    );
    
    if (files.length > 0) {
      handleFileProcess(files);
    } else {
      showError('Invalid Files', 'Please upload only JSON files');
    }
  }, [handleFileProcess]);

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
      const jsonFiles = Array.from(files).filter(file => 
        file.type === 'application/json' || file.name.endsWith('.json')
      );
      
      if (jsonFiles.length > 0) {
        handleFileProcess(jsonFiles);
      } else {
        showError('Invalid Files', 'Please select only JSON files');
      }
    }
  }, [handleFileProcess]);

  const clearUpload = () => {
    setUploadedFiles([]);
    setProcessingStatus('');
    onQuestionsExtracted([]);
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
          accept=".json"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="p-3 bg-[#20C997]/10 rounded-full w-fit mx-auto">
            <Upload className="h-8 w-8 text-[#20C997]" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload JSON Quiz Files
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop JSON files here, or click to browse. You can upload multiple files at once.
            </p>
            
            {/* Supported Format */}
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-blue-500" />
                <span>JSON Quiz Files (Multiple files supported)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Format Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-blue-900 text-lg">JSON Format Requirements</h4>
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
            Your JSON files must follow this exact structure. Download the template above for a complete example.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border border-blue-200">
              <h6 className="font-medium text-blue-900 mb-1">Multiple Choice</h6>
              <p className="text-blue-700 text-xs">Include options array with correctAnswer matching one option</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <h6 className="font-medium text-blue-900 mb-1">True/False</h6>
              <p className="text-blue-700 text-xs">Use options: [&quot;True&quot;, &quot;False&quot;] with correctAnswer: &quot;True&quot; or &quot;False&quot;</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <h6 className="font-medium text-blue-900 mb-1">Short Answer</h6>
              <p className="text-blue-700 text-xs">No options needed, just correctAnswer text</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h6 className="font-medium text-yellow-900 mb-1 text-sm">Upload Limits:</h6>
            <ul className="text-yellow-800 text-xs space-y-1">
              <li>• Maximum file size: 10MB per file</li>
              <li>• Maximum questions: 500 per file</li>
              <li>• Maximum total questions: 1000 across all files</li>
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

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && !isProcessing && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h5>
            <button
              onClick={clearUpload}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                <FileJson className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-900 flex-1">{file.name}</span>
                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
          
          {processingStatus && (
            <p className={`mt-3 text-sm ${
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