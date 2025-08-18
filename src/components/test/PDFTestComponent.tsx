'use client';

import React, { useState } from 'react';
import { PDFUploadArea } from '@/components/upload/PDFUploadArea';
import { ExtractedQuiz } from '@/lib/pdf-processor';

export function PDFTestComponent() {
  const [extractedQuiz, setExtractedQuiz] = useState<ExtractedQuiz | null>(null);

  const handleQuizExtracted = (quiz: ExtractedQuiz) => {
    setExtractedQuiz(quiz);
    console.log('✅ PDF Processing Test - Extracted Quiz:', quiz);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          PDF Processing Test
        </h1>
        <p className="text-gray-600">
          Test the PDF to JSON conversion functionality
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <PDFUploadArea
          onQuizExtracted={handleQuizExtracted}
          onUploadStart={() => console.log('🚀 PDF upload started')}
          onUploadComplete={() => console.log('✅ PDF upload completed')}
        />
      </div>

      {extractedQuiz && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-4">
            ✅ Test Results - Extracted Quiz Data
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-green-800">Quiz Details:</h3>
              <p><strong>Title:</strong> {extractedQuiz.title}</p>
              <p><strong>Subject:</strong> {extractedQuiz.subject}</p>
              <p><strong>Questions:</strong> {extractedQuiz.questions.length}</p>
              <p><strong>Description:</strong> {extractedQuiz.description}</p>
            </div>

            <div>
              <h3 className="font-medium text-green-800">Sample Questions:</h3>
              <div className="space-y-2">
                {extractedQuiz.questions.slice(0, 3).map((question, index) => (
                  <div key={question.id} className="bg-white p-3 rounded border">
                    <p><strong>Q{index + 1}:</strong> {question.text}</p>
                    <p><strong>Type:</strong> {question.type}</p>
                    {question.options && (
                      <div>
                        <strong>Options:</strong>
                        <ul className="ml-4">
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex}>• {option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-medium text-gray-800 mb-2">JSON Output:</h4>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(extractedQuiz, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
