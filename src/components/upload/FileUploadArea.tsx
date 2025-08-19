'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileJson, X, CheckCircle, AlertCircle, Download, Plus, FileText } from 'lucide-react';
import { ExtractedQuestion } from '@/lib/pdf-processor';
import { showSuccess, showError } from '@/components/common/NotificationSystem';

interface FileUploadAreaProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
  accept?: string;
  fileType?: 'json' | 'txt';
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
  onUploadComplete,
  accept = ".json",
  fileType = "json"
}: FileUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const downloadJSONTemplate = () => {
    const template = {
      title: "Sample MCQ Quiz",
      description: "A comprehensive MCQ quiz covering multiple topics (MCQ only - test portal requirement)",
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
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: "Mars",
          points: 1
        },
        {
          id: "q3",
          text: "What is the chemical symbol for gold?",
          type: "multiple-choice",
          options: ["Ag", "Au", "Fe", "Cu"],
          correctAnswer: "Au",
          points: 1
        },
        {
          id: "q4",
          text: "What is the largest ocean on Earth?",
          type: "multiple-choice",
          options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
          correctAnswer: "Pacific Ocean",
          points: 1
        },
        {
          id: "q5",
          text: "Who wrote 'Romeo and Juliet'?",
          type: "multiple-choice",
          options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
          correctAnswer: "William Shakespeare",
          points: 1
        },
        {
          id: "q6",
          text: "Which programming language is known as the 'language of the web'?",
          type: "multiple-choice",
          options: ["Python", "Java", "JavaScript", "C++"],
          correctAnswer: "JavaScript",
          points: 1
        },
        {
          id: "q7",
          text: "What is the main component of the sun?",
          type: "multiple-choice",
          options: ["Liquid Lava", "Molten Iron", "Hot Gases", "Solid Rock"],
          correctAnswer: "Hot Gases",
          points: 1
        },
        {
          id: "q8",
          text: "Which of the following is NOT a primary color?",
          type: "multiple-choice",
          options: ["Red", "Blue", "Green", "Yellow"],
          correctAnswer: "Yellow",
          points: 1
        },
        {
          id: "q9",
          text: "What is the largest mammal in the world?",
          type: "multiple-choice",
          options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
          correctAnswer: "Blue Whale",
          points: 1
        },
        {
          id: "q10",
          text: "Which year did World War II end?",
          type: "multiple-choice",
          options: ["1943", "1944", "1945", "1946"],
          correctAnswer: "1945",
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

  const downloadTXTTemplate = () => {
    const template = `Quiz Title: Sample MCQ Quiz
Subject: General Knowledge
Description: A comprehensive MCQ quiz covering multiple topics (MCQ only - test portal requirement)

Q1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Correct Answer: C

Q2. Which planet is known as the Red Planet?
A) Venus
B) Mars
C) Jupiter
D) Saturn
Correct Answer: B

Q3. What is the chemical symbol for gold?
A) Ag
B) Au
C) Fe
D) Cu
Correct Answer: B

Q4. What is the largest ocean on Earth?
A) Atlantic Ocean
B) Indian Ocean
C) Arctic Ocean
D) Pacific Ocean
Correct Answer: D

Q5. Who wrote 'Romeo and Juliet'?
A) Charles Dickens
B) William Shakespeare
C) Jane Austen
D) Mark Twain
Correct Answer: B

Q6. Which programming language is known as the 'language of the web'?
A) Python
B) Java
C) JavaScript
D) C++
Correct Answer: C

Q7. What is the main component of the sun?
A) Liquid Lava
B) Molten Iron
C) Hot Gases
D) Solid Rock
Correct Answer: C

Q8. Which of the following is NOT a primary color?
A) Red
B) Blue
C) Green
D) Yellow
Correct Answer: D

Q9. What is the largest mammal in the world?
A) African Elephant
B) Blue Whale
C) Giraffe
D) Polar Bear
Correct Answer: B

Q10. Which year did World War II end?
A) 1943
B) 1944
C) 1945
D) 1946
Correct Answer: C`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-template.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Template Downloaded', 'TXT template has been downloaded successfully');
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

  const processTXTFile = async (file: File): Promise<ExtractedQuestion[]> => {
    try {
      // Check file size first (limit to 5MB for TXT files)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB for TXT files.');
      }

      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      const questions: ExtractedQuestion[] = [];
      let currentQuestion: any = null;
      let questionNumber = 1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this is a question line (starts with Q followed by number)
        if (line.match(/^Q\d+\./)) {
          // Save previous question if exists
          if (currentQuestion && currentQuestion.text) {
            questions.push(currentQuestion);
          }
          
          // Start new question
          const questionText = line.replace(/^Q\d+\.\s*/, '').trim();
          currentQuestion = {
            id: `q${questionNumber}`,
            text: questionText,
            type: 'multiple-choice' as const,
            options: [],
            correctAnswer: '',
            points: 1
          };
          questionNumber++;
        }
        // Check if this is an option line (starts with A), B), C), D), etc.)
        else if (line.match(/^[A-Z]\)/)) {
          if (currentQuestion) {
            const option = line.replace(/^[A-Z]\)\s*/, '').trim();
            currentQuestion.options!.push(option);
          }
        }
        // Check if this is a correct answer line
        else if (line.toLowerCase().includes('correct answer:')) {
          if (currentQuestion) {
            const answer = line.replace(/correct answer:\s*/i, '').trim();
            currentQuestion.correctAnswer = answer;
            
            // If no options were found, this might be a short answer question
            if (currentQuestion.options!.length === 0) {
              currentQuestion.type = 'short-answer';
              delete currentQuestion.options;
            }
            // If only True/False options, mark as true-false
            else if (currentQuestion.options!.length === 2 && 
                     currentQuestion.options!.every((opt: string) => ['True', 'False'].includes(opt))) {
              currentQuestion.type = 'true-false';
            }
          }
        }
        // If it's just text without special formatting, it might be a short answer question
        else if (currentQuestion && !currentQuestion.correctAnswer && !line.match(/^[A-Z]\)/)) {
          currentQuestion.text += ' ' + line;
        }
      }

      // Add the last question if exists
      if (currentQuestion && currentQuestion.text) {
        questions.push(currentQuestion);
      }

      // Validate questions
      if (questions.length === 0) {
        throw new Error('No valid questions found in the TXT file. Please check the format.');
      }

      // Limit number of questions
      const maxQuestions = 500;
      if (questions.length > maxQuestions) {
        throw new Error(`Too many questions. Maximum allowed is ${maxQuestions} questions. Your file contains ${questions.length} questions.`);
      }

      return questions;
    } catch (error) {
      throw new Error(`TXT parsing error: ${error instanceof Error ? error.message : 'Invalid TXT format'}`);
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
        
        if (fileType === 'json' && (file.type === 'application/json' || file.name.endsWith('.json'))) {
          const questions = await processJSONFile(file);
          allQuestions = [...allQuestions, ...questions];
          totalQuestions += questions.length;
        } else if (fileType === 'txt' && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
          const questions = await processTXTFile(file);
          allQuestions = [...allQuestions, ...questions];
          totalQuestions += questions.length;
        } else {
          throw new Error(`Unsupported file type: ${file.name}. Please upload only ${fileType.toUpperCase()} files.`);
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
  }, [onQuestionsExtracted, onUploadStart, onUploadComplete, fileType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => {
      if (fileType === 'json') {
        return file.type === 'application/json' || file.name.endsWith('.json');
      } else if (fileType === 'txt') {
        return file.type === 'text/plain' || file.name.endsWith('.txt');
      }
      return false;
    });
    
    if (files.length > 0) {
      handleFileProcess(files);
    } else {
      showError('Invalid Files', `Please upload only ${fileType.toUpperCase()} files`);
    }
  }, [handleFileProcess, fileType]);

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
      const validFiles = Array.from(files).filter(file => {
        if (fileType === 'json') {
          return file.type === 'application/json' || file.name.endsWith('.json');
        } else if (fileType === 'txt') {
          return file.type === 'text/plain' || file.name.endsWith('.txt');
        }
        return false;
      });
      
      if (validFiles.length > 0) {
        handleFileProcess(validFiles);
      } else {
        showError('Invalid Files', `Please select only ${fileType.toUpperCase()} files`);
      }
    }
  }, [handleFileProcess, fileType]);

  const clearUpload = () => {
    setUploadedFiles([]);
    setProcessingStatus('');
    onQuestionsExtracted([]);
  };

  const isJSON = fileType === 'json';
  const isTXT = fileType === 'txt';

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
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="p-3 bg-[#20C997]/10 rounded-full w-fit mx-auto">
            {isJSON ? (
              <FileJson className="h-8 w-8 text-[#20C997]" />
            ) : (
              <FileText className="h-8 w-8 text-[#20C997]" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload {fileType.toUpperCase()} Quiz Files
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop {fileType.toUpperCase()} files here, or click to browse. You can upload multiple files at once.
            </p>
            
            {/* MCQ Only Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Important: Test Portal Only Supports MCQ</span>
              </div>
              <p className="text-yellow-700 text-xs mt-1">
                Only Multiple Choice Questions (MCQ) are supported in the test portal. True/False and Short Answer questions will not work properly.
              </p>
            </div>
            
            {/* Supported Format */}
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                {isJSON ? (
                  <FileJson className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileText className="h-4 w-4 text-green-500" />
                )}
                <span>{fileType.toUpperCase()} Quiz Files (Multiple files supported)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Format Instructions */}
      <div className={`border rounded-lg p-6 ${isJSON ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`font-medium text-lg ${isJSON ? 'text-blue-900' : 'text-green-900'}`}>
            {fileType.toUpperCase()} Format Requirements
          </h4>
          <button
            onClick={isJSON ? downloadJSONTemplate : downloadTXTTemplate}
            className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
              isJSON ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <Download className="h-4 w-4" />
            Download Template
          </button>
        </div>
        
        <div className="space-y-4">
          <p className={`text-sm ${isJSON ? 'text-blue-800' : 'text-green-800'}`}>
            Your {fileType.toUpperCase()} files must follow the exact structure. Download the template above for a complete example.
          </p>
          
          {isJSON ? (
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="bg-white p-3 rounded border border-blue-200">
                <h6 className="font-medium text-blue-900 mb-1">Multiple Choice Questions (MCQ) Only</h6>
                <p className="text-blue-700 text-xs">Include options array with correctAnswer matching one option. <strong>Test portal only supports MCQ format.</strong></p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="bg-white p-3 rounded border border-green-200">
                <h6 className="font-medium text-green-900 mb-1">Multiple Choice Questions (MCQ) Only</h6>
                <p className="text-green-700 text-xs">Q1. Question text<br/>A) Option 1<br/>B) Option 2<br/>C) Option 3<br/>D) Option 4<br/>Correct Answer: A<br/><strong>Test portal only supports MCQ format.</strong></p>
              </div>
            </div>
          )}
                
          <div className={`border rounded-lg p-3 ${isJSON ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <h6 className="font-medium text-yellow-900 mb-1 text-sm">Upload Limits:</h6>
            <ul className="text-yellow-800 text-xs space-y-1">
              <li>• Maximum file size: {isJSON ? '10MB' : '5MB'} per file</li>
              <li>• Maximum questions: 500 per file</li>
              <li>• Maximum total questions: 1000 across all files</li>
              <li>• All question types must have a correctAnswer</li>
              {isJSON && <li>• Multiple-choice questions must have at least 2 options</li>}
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
                {isJSON ? (
                  <FileJson className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileText className="h-4 w-4 text-green-500" />
                )}
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
