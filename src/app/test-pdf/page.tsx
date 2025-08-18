'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const PDFTestComponent = dynamic(
  () => import('@/components/test/PDFTestComponent').then(mod => ({ default: mod.PDFTestComponent })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading PDF test component...</span>
      </div>
    )
  }
);

export default function PDFTestPage() {
  const [showTest, setShowTest] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PDF Processing Test
          </h1>
          <p className="text-gray-600">
            Test the PDF to JSON conversion functionality
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Test</h2>
          <button
            onClick={() => setShowTest(!showTest)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showTest ? 'Hide Test' : 'Show PDF Test'}
          </button>
          
          {showTest && (
            <div className="mt-4">
              <PDFTestComponent />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Test Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900">1. Go to Upload Page</h3>
              <p className="text-gray-600">Navigate to <code className="bg-gray-100 px-1 rounded">/upload</code> and select the PDF tab</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">2. Download Sample PDF</h3>
              <p className="text-gray-600">Click the "Sample PDF" download button to get a test file</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">3. Upload and Test</h3>
              <p className="text-gray-600">Upload the sample PDF and check if it processes correctly</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">4. Check Console</h3>
              <p className="text-gray-600">Open browser console (F12) to see detailed processing logs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
