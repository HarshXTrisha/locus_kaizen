'use client';

import React, { useState } from 'react';
import { Upload, FileText, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topic?: string;
}

interface QuizTemplate {
  title: string;
  description: string;
  questions: QuizQuestion[];
  metadata: {
    totalQuestions: number;
    topics: string[];
    difficulty: string;
    estimatedTime: number;
  };
}

export default function PDFTestingPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedJson, setConvertedJson] = useState<QuizTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
      setConvertedJson(null);
      extractTextFromPDF(file);
    } else {
      setError('Please upload a valid PDF file');
    }
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      setIsProcessing(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdf', file);

      // Send to PDF processing endpoint
      const response = await fetch('/api/test-pdf-worker', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from PDF');
      }

      const data = await response.json();
      setPdfText(data.text || '');
      
    } catch (error) {
      setError('Failed to extract text from PDF: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToQuizTemplate = async () => {
    if (!pdfText.trim()) {
      setError('No PDF text available for conversion');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await fetch('/api/pdf-to-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfText: pdfText,
          title: "Generated Quiz from PDF"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to convert PDF to quiz template');
      }

      const data = await response.json();
      setConvertedJson(data.data);
      
    } catch (error) {
      setError('Failed to convert PDF to quiz template: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadJson = () => {
    if (!convertedJson) return;
    
    const jsonString = JSON.stringify(convertedJson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
                     <h1 className="text-3xl font-bold text-gray-900 mb-2">
             PDF to Quiz Template Converter
           </h1>
                       <p className="text-gray-600 mb-8">
              Upload a PDF and test AI-powered conversion to quiz JSON template
            </p>

          {/* File Upload Section */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                Upload PDF File
              </div>
              <p className="text-gray-500 mb-4">
                Select a PDF file to extract text and convert to quiz template
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose PDF File
              </label>
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
                <span className="text-blue-800">Extracting text from PDF...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* PDF Text Display */}
          {pdfText && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Extracted PDF Text
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {pdfText.substring(0, 1000)}
                  {pdfText.length > 1000 && '...'}
                </pre>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {pdfText.length} characters extracted
              </div>
            </div>
          )}

          {/* Convert Button */}
          {pdfText && (
            <div className="mb-8">
              <button
                onClick={convertToQuizTemplate}
                disabled={isAnalyzing}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Converting to Quiz Template...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Convert to Quiz Template
                  </>
                )}
              </button>
            </div>
          )}

          {/* Converted JSON Display */}
          {convertedJson && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Generated Quiz Template
                </h3>
                <button
                  onClick={downloadJson}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(convertedJson, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Success Message */}
          {convertedJson && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">
                  Successfully converted PDF to quiz template! You can now download the JSON file.
                </span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">
              How it works:
            </h4>
                         <ol className="list-decimal list-inside space-y-2 text-blue-800">
               <li>Upload a PDF file containing quiz content</li>
               <li>The system extracts text from the PDF</li>
               <li>AI analyzes the content and identifies topics</li>
               <li>Generates a structured quiz template in JSON format</li>
               <li>Download the template for use in your platform</li>
             </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
