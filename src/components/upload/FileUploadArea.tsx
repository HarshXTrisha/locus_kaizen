'use client'; // This component requires client-side state and interaction

import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

export function FileUploadArea() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // This function simulates the upload progress from your script
  const startUpload = () => {
    setIsUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
      <h2 className="text-3xl font-bold text-[#121a0f] mb-4">Upload Your Submission</h2>
      <p className="text-gray-500 mb-8">For &ldquo;Quantum Physics Final Exam&rdquo;</p>
      
      <div 
        onClick={startUpload} 
        className="border-2 border-dashed border-green-200 rounded-xl p-10 cursor-pointer hover:bg-green-50 transition-colors"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <UploadCloud className="size-16 text-gray-400" strokeWidth={1.5} />
          <p className="text-lg font-medium text-gray-700">Drag and drop your file here</p>
          <p className="text-gray-500">or</p>
          <button 
            type="button" 
            className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
          >
            Browse Files
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4">Supported formats: PDF, DOCX, TXT</p>
      
      {/* Progress Section */}
      {isUploading && (
        <div className="mt-8 text-left">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-[#121a0f]">
              {progress < 100 ? 'Uploading...' : 'Complete!'}
            </p>
            <p className="text-sm font-medium text-gray-600">{progress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
