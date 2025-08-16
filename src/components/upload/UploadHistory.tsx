'use client';

import React from 'react';
import { FileText, CheckCircle, AlertCircle, Clock } from '@/lib/icons';

interface UploadRecord {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'completed' | 'processing' | 'failed';
  quizCreated?: string;
}

export function UploadHistory() {
  const uploads: UploadRecord[] = [
    {
      id: '1',
      fileName: 'Mathematics_Quiz.pdf',
      fileSize: '2.4 MB',
      uploadDate: '2 hours ago',
      status: 'completed',
      quizCreated: 'Math Quiz 2024'
    },
    {
      id: '2',
      fileName: 'Science_Questions.docx',
      fileSize: '1.8 MB',
      uploadDate: '1 day ago',
      status: 'completed',
      quizCreated: 'Science Assessment'
    },
    {
      id: '3',
      fileName: 'History_Exam.txt',
      fileSize: '456 KB',
      uploadDate: '3 days ago',
      status: 'failed'
    }
  ];

  const getStatusIcon = (status: UploadRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: UploadRecord['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload History</h3>
      
      <div className="space-y-4">
        {uploads.map((upload) => (
          <div key={upload.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{upload.fileName}</p>
                <p className="text-sm text-gray-600">
                  {upload.fileSize} • {upload.uploadDate}
                </p>
                {upload.quizCreated && (
                  <p className="text-sm text-[#20C997]">
                    Quiz created: {upload.quizCreated}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.status)}`}>
                {upload.status}
              </span>
              {getStatusIcon(upload.status)}
            </div>
          </div>
        ))}
      </div>

      {uploads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No upload history yet</p>
          <p className="text-sm">Upload your first document to get started!</p>
        </div>
      )}
    </div>
  );
}
