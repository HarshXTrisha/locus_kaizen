'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { showSuccess, showError, showInfo } from '@/components/common/NotificationSystem';
import { useAppStore } from '@/lib/store';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}

export function FileUploadArea() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (!supportedTypes.includes(file.type)) {
        showError('Unsupported File Type', `${file.name} is not a supported file type. Please upload PDF, DOCX, or TXT files.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showError('File Too Large', `${file.name} is too large. Please upload files smaller than 10MB.`);
        continue;
      }

      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading'
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setIsUploading(true);

    try {
      // Simulate file upload to Firebase Storage
      await simulateFileUpload(file);
      
      // Update status to processing
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'processing' } : f)
      );

      // Extract content from the file
      const content = await extractContentFromFile(file);
      
      // Update file with extracted content
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId 
          ? { ...f, content, status: 'completed' } 
          : f
        )
      );

      showSuccess('File Uploaded Successfully', `${file.name} has been uploaded and processed. You can now create quizzes from this content.`);
      
      // Store the processed content in global state for quiz creation
      useAppStore.getState().setProcessedContent({
        fileName: file.name,
        content: content,
        fileId: fileId
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
      );
      showError('Upload Failed', `Failed to upload ${file.name}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const simulateFileUpload = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000 + Math.random() * 2000); // 2-4 seconds
    });
  };

  const extractContentFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let content = '';
          
          if (file.type === 'text/plain') {
            content = e.target?.result as string;
          } else if (file.type === 'application/pdf') {
            // For PDF, we'll simulate text extraction with questions
            content = `Sample Questions from ${file.name}:

1. What is the capital of France?
   A) London
   B) Paris ✓
   C) Berlin
   D) Madrid

2. Which planet is closest to the Sun?
   A) Venus
   B) Earth
   C) Mercury ✓
   D) Mars

3. What is 2 + 2?
   A) 3
   B) 4 ✓
   C) 5
   D) 6

4. Who wrote "Romeo and Juliet"?
   A) Charles Dickens
   B) William Shakespeare ✓
   C) Jane Austen
   D) Mark Twain

5. What is the chemical symbol for gold?
   A) Ag
   B) Au ✓
   C) Fe
   D) Cu`;
          } else if (file.type.includes('word')) {
            // For Word documents, simulate text extraction with questions
            content = `Sample Questions from ${file.name}:

1. What is the largest ocean on Earth?
   A) Atlantic Ocean
   B) Indian Ocean
   C) Pacific Ocean ✓
   D) Arctic Ocean

2. Which year did World War II end?
   A) 1943
   B) 1944
   C) 1945 ✓
   D) 1946

3. What is the square root of 16?
   A) 2
   B) 4 ✓
   C) 8
   D) 16

4. Who painted the Mona Lisa?
   A) Vincent van Gogh
   B) Leonardo da Vinci ✓
   C) Pablo Picasso
   D) Michelangelo

5. What is the main component of the Sun?
   A) Liquid lava
   B) Molten iron
   C) Hot plasma ✓
   D) Solid rock`;
          }
          
          resolve(content);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const createQuizFromFile = (file: UploadedFile) => {
    if (file.content) {
      // Navigate to create quiz page with pre-filled content
      window.location.href = `/create?source=file&fileId=${file.id}`;
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <h2 className="text-3xl font-bold text-[#121a0f] mb-4">Upload Documents</h2>
      <p className="text-gray-600 mb-8">Upload your documents to extract content and create quizzes automatically.</p>
      
      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
          dragActive 
            ? 'border-[#20C997] bg-[#20C997]/5' 
            : 'border-gray-300 hover:border-[#20C997] hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <UploadCloud className={`size-16 ${dragActive ? 'text-[#20C997]' : 'text-gray-400'}`} strokeWidth={1.5} />
          <p className="text-lg font-medium text-gray-700">Drag and drop your files here</p>
          <p className="text-gray-500">or</p>
          <button 
            type="button" 
            className="px-6 py-3 bg-[#20C997] text-white font-semibold rounded-lg hover:bg-[#1BA085] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-sm text-gray-500 mt-4 text-center">
        Supported formats: PDF, DOCX, DOC, TXT (Max 10MB per file)
      </p>
      
      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Files</h3>
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-[#20C997]" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {file.status === 'uploading' && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                  
                  {file.status === 'processing' && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                  
                  {file.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Ready</span>
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Error</span>
                    </div>
                  )}
                  
                  {file.status === 'completed' && (
                    <button
                      onClick={() => createQuizFromFile(file)}
                      className="px-4 py-2 bg-[#20C997] text-white text-sm font-medium rounded-lg hover:bg-[#1BA085] transition-colors"
                    >
                      Create Quiz
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
