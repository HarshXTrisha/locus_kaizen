import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { FileUploadArea } from '@/components/upload/FileUploadArea';
import { UploadHistory } from '@/components/upload/UploadHistory';

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Upload Files
              </h2>
              <p className="mt-2 text-gray-600">
                Upload your quiz files here to get started.
              </p>
              <div className="mt-8">
                <FileUploadArea />
              </div>
            </div>
            <div>
              <UploadHistory />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
