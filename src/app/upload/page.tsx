'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FileUploadArea } from '@/components/upload/FileUploadArea';

export default function UploadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Files</h1>
          <p className="text-gray-600 mt-2">Upload PDF files to create quizzes automatically</p>
        </div>
        <FileUploadArea />
      </div>
    </div>
  );
}
