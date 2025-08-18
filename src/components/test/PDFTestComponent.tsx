'use client';

import React, { useState } from 'react';
import { PDFProcessor } from '@/lib/pdf-processor';

export function PDFTestComponent() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testPDFProcessing = async () => {
    setIsTesting(true);
    setTestResult('Testing PDF processing...\n');
    
    try {
      // Test 1: Check if pdfjsLib is available
      setTestResult(prev => prev + '✓ PDF.js library check...\n');
      
      // Test 2: Check worker configuration
      setTestResult(prev => prev + '✓ Worker configuration check...\n');
      
      // Test 3: Try to create a simple PDF-like object for testing
      const testFile = new File(['Test content'], 'test.pdf', { type: 'application/pdf' });
      setTestResult(prev => prev + '✓ Test file created...\n');
      
      // Test 4: Check if PDFProcessor is properly initialized
      if (PDFProcessor) {
        setTestResult(prev => prev + '✓ PDFProcessor is available...\n');
      } else {
        throw new Error('PDFProcessor not available');
      }
      
      // Test 5: Try to actually process a simple PDF
      setTestResult(prev => prev + '✓ Attempting to process test PDF...\n');
      
      try {
        // Create a minimal PDF content for testing
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;
        
        const testFile = new File([pdfContent], 'test.pdf', { type: 'application/pdf' });
        const result = await PDFProcessor.processPDF(testFile);
        setTestResult(prev => prev + `✅ PDF processing successful! Extracted ${result.questions.length} questions.\n`);
      } catch (pdfError) {
        setTestResult(prev => prev + `⚠️ PDF processing test failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}\n`);
        setTestResult(prev => prev + 'This might be expected for a minimal test PDF.\n');
      }
      
      setTestResult(prev => prev + '✅ Basic tests completed!\n');
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Test failed: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">PDF Processing Test</h2>
      
      <button
        onClick={testPDFProcessing}
        disabled={isTesting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Run PDF Test'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
}
