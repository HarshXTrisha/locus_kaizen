'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  Upload, FileText, File, ArrowLeft, CheckCircle, AlertCircle,
  Trash2, Download, Eye, Clock, Loader2, X
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  questions?: number;
}

export default function MobileUpload() {
  const router = useRouter();
  const { user } = useAppStore();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    // Simulate upload process
    newFiles.forEach((file, index) => {
      simulateUpload(file.id, index);
    });
  }, []);

  const simulateUpload = useCallback((fileId: string, delay: number) => {
    setTimeout(() => {
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'processing', progress: 50 }
            : file
        )
      );

      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { 
                  ...file, 
                  status: 'completed', 
                  progress: 100,
                  questions: Math.floor(Math.random() * 20) + 5
                }
              : file
          )
        );

        if (uploadedFiles.every(f => f.status === 'completed')) {
          setIsUploading(false);
        }
      }, 2000);
    }, delay * 1000);
  }, [uploadedFiles]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const retryUpload = useCallback((fileId: string) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, status: 'uploading', progress: 0, error: undefined }
          : file
      )
    );
    simulateUpload(fileId, 0);
  }, []);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" size={24} />;
    if (type.includes('text') || type.includes('json')) return <File className="text-blue-500" size={24} />;
    return <File className="text-gray-500" size={24} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderUploadTab = () => (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className={mobileClasses.card}>
        <div className="text-center py-8">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className={mobileClasses.text.h3 + " mb-2"}>Upload Files</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload PDF, TXT, or JSON files to extract questions
          </p>
          
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className={mobileClasses.button.primary + " inline-flex items-center gap-2"}>
              <Upload size={16} />
              Choose Files
            </div>
          </label>
          
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: PDF, TXT, JSON (max 10MB each)
          </p>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className={mobileClasses.card}>
          <h3 className={mobileClasses.text.h3 + " mb-3"}>Uploaded Files</h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>
                      {file.status === 'uploading' && 'Uploading...'}
                      {file.status === 'processing' && 'Processing...'}
                      {file.status === 'completed' && 'Completed'}
                      {file.status === 'error' && 'Error'}
                    </span>
                    <span>{file.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        file.status === 'error' ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Icons */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' && (
                      <Loader2 size={14} className="animate-spin text-blue-500" />
                    )}
                    {file.status === 'processing' && (
                      <Clock size={14} className="text-yellow-500" />
                    )}
                    {file.status === 'completed' && (
                      <CheckCircle size={14} className="text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle size={14} className="text-red-500" />
                    )}
                    
                    <span className="text-xs text-gray-600">
                      {file.status === 'completed' && file.questions && 
                        `${file.questions} questions extracted`
                      }
                      {file.status === 'error' && file.error}
                    </span>
                  </div>

                  {file.status === 'error' && (
                    <button
                      onClick={() => retryUpload(file.id)}
                      className="text-blue-600 text-xs font-medium"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Actions */}
      {uploadedFiles.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={() => setUploadedFiles([])}
            className={mobileClasses.button.secondary + " flex-1"}
            disabled={isUploading}
          >
            Clear All
          </button>
          <button
            onClick={() => {
              showSuccess('Upload Complete', 'All files have been processed successfully!');
              router.push('/dashboard');
            }}
            className={mobileClasses.button.primary + " flex-1"}
            disabled={isUploading || uploadedFiles.some(f => f.status !== 'completed')}
          >
            {isUploading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Upload History</h3>
        
        <div className="space-y-3">
          {[
            { id: '1', name: 'Math_Quiz_Questions.pdf', date: '2024-01-15', questions: 25, status: 'completed' },
            { id: '2', name: 'Science_Test.txt', date: '2024-01-14', questions: 18, status: 'completed' },
            { id: '3', name: 'History_Questions.json', date: '2024-01-13', questions: 30, status: 'completed' },
          ].map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <p className="font-medium text-sm text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.date} • {file.questions} questions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Eye size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={mobileClasses.text.h1}>Upload Questions</h1>
            <p className="text-xs text-gray-600">Extract questions from files</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'upload', label: 'Upload' },
            { id: 'history', label: 'History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>
    </div>
  );
}
