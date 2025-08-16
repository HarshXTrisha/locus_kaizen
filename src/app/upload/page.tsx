import React from 'react';
import { FileUploadArea } from '@/components/upload/FileUploadArea';

export default function UploadPage() {
  return (
    <main className="flex-grow min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <FileUploadArea />
    </main>
  );
}
