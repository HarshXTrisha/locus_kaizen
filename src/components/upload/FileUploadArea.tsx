'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Eye, Edit } from 'lucide-react';
import { showSuccess, showError, showInfo } from '@/components/common/NotificationSystem';
import { useAppStore } from '@/lib/store';
import { processPDFText, validateQuestions, ExtractedQuestion } from '@/lib/pdf-processor';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  extractedQuestions?: ExtractedQuestion[];
  error?: string;
}

export function FileUploadArea() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useAppStore();

  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/msword'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!supportedTypes.includes(file.type)) {
        showError('Unsupported File Type', `${file.name} is not a supported file type.`);
        continue;
      }

      const fileId = Date.now().toString() + i;
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'uploading'
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        // Read file content
        const content = await readFileContent(file);
        
        // Update file with content
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, content, status: 'processing' } : f
        ));

        // Process PDF content
        if (file.type === 'application/pdf') {
          const result = await processPDFText(content);
          
          if (result.success) {
            // Validate extracted questions
            const validation = validateQuestions(result.questions);
            
            if (validation.valid) {
              setUploadedFiles(prev => prev.map(f => 
                f.id === fileId ? { 
                  ...f, 
                  extractedQuestions: result.questions,
                  status: 'completed' 
                } : f
              ));
              
              showSuccess(
                'PDF Processed Successfully', 
                `Extracted ${result.questions.length} questions from ${file.name}`
              );
            } else {
              setUploadedFiles(prev => prev.map(f => 
                f.id === fileId ? { 
                  ...f, 
                  status: 'error',
                  error: `Validation failed: ${validation.errors.join(', ')}`
                } : f
              ));
              
              showError('PDF Processing Failed', validation.errors.join(', '));
            }
          } else {
            setUploadedFiles(prev => prev.map(f => 
              f.id === fileId ? { 
                ...f, 
                status: 'error',
                error: result.error || 'Failed to process PDF'
              } : f
            ));
            
            showError('PDF Processing Failed', result.error || 'Failed to extract questions from PDF');
          }
        } else {
          // For non-PDF files, just mark as completed
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'completed' } : f
          ));
          
          showSuccess('File Uploaded', `${file.name} uploaded successfully`);
        }

      } catch (error) {
        console.error('Error processing file:', error);
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          } : f
        ));
        
        showError('Upload Failed', `Failed to process ${file.name}`);
      }
    }
    
    setIsUploading(false);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      if (file.type === 'application/pdf') {
        // For PDFs, we'll need to extract text
        // This is a simplified version - in a real app, you'd use a PDF parsing library
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handlePreview = (fileId: string) => {
    setShowPreview(showPreview === fileId ? null : fileId);
  };

  const handleEditQuestions = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file?.extractedQuestions) {
      // Navigate to quiz creation with pre-filled questions
      // This would integrate with your quiz creation flow
      showInfo('Edit Questions', 'Redirecting to quiz creation with extracted questions...');
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (showPreview === fileId) {
      setShowPreview(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#20C997] bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-lg font-medium text-[#20C997] hover:text-green-600">
              Click to upload
            </span>
            <span className="text-gray-500"> or drag and drop</span>
          </label>
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          PDF, DOC, DOCX, or TXT files up to 10MB
        </p>
        {isUploading && (
          <div className="mt-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#20C997]" />
            <span className="ml-2 text-sm text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {file.status === 'processing' && (
                      <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                    )}
                    {file.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    
                    {file.extractedQuestions && (
                      <button
                        onClick={() => handlePreview(file.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Preview questions"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    
                    {file.extractedQuestions && (
                      <button
                        onClick={() => handleEditQuestions(file.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit questions"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                {file.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {file.error}
                  </div>
                )}
                
                {file.extractedQuestions && showPreview === file.id && (
                  <div className="mt-4 border-t pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Extracted Questions ({file.extractedQuestions.length})
                    </h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {file.extractedQuestions.map((question, index) => (
                        <div key={question.id} className="text-sm bg-gray-50 p-2 rounded">
                          <p className="font-medium">Q{index + 1}: {question.text}</p>
                          {question.options && (
                            <div className="mt-1 text-xs text-gray-600">
                              Options: {question.options.join(', ')}
                            </div>
                          )}
                          {question.correctAnswer && (
                            <div className="mt-1 text-xs text-green-600">
                              Answer: {question.correctAnswer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
