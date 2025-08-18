'use client';

import React, { useState } from 'react';
import { Edit3, Save, X, Move, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { ExtractedQuestion } from '@/lib/pdf-processor';

interface QuizPreviewEditorProps {
  quiz: {
    title: string;
    description?: string;
    subject: string;
    questions: ExtractedQuestion[];
  };
  onSave: (updatedQuiz: any) => void;
  onCancel: () => void;
}

export function QuizPreviewEditor({ quiz, onSave, onCancel }: QuizPreviewEditorProps) {
  const [editedQuiz, setEditedQuiz] = useState(quiz);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleTitleChange = (newTitle: string) => {
    setEditedQuiz(prev => ({ ...prev, title: newTitle }));
  };

  const handleDescriptionChange = (newDescription: string) => {
    setEditedQuiz(prev => ({ ...prev, description: newDescription }));
  };

  const handleSubjectChange = (newSubject: string) => {
    setEditedQuiz(prev => ({ ...prev, subject: newSubject }));
  };

  const handleQuestionTextChange = (questionId: string, newText: string) => {
    setEditedQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, text: newText } : q
      )
    }));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, newOption: string) => {
    setEditedQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.map((opt, idx) =>
                idx === optionIndex ? newOption : opt
              )
            }
          : q
      )
    }));
  };

  const handleCorrectAnswerChange = (questionId: string, newAnswer: string) => {
    setEditedQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, correctAnswer: newAnswer } : q
      )
    }));
  };

  const handleAddOption = (questionId: string) => {
    setEditedQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: [...(q.options || []), 'New Option']
            }
          : q
      )
    }));
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setEditedQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.filter((_, idx) => idx !== optionIndex)
            }
          : q
      )
    }));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setEditedQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleMoveQuestion = (questionId: string, direction: 'up' | 'down') => {
    setEditedQuiz(prev => {
      const questions = [...prev.questions];
      const index = questions.findIndex(q => q.id === questionId);
      
      if (direction === 'up' && index > 0) {
        [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
      } else if (direction === 'down' && index < questions.length - 1) {
        [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
      }
      
      return { ...prev, questions };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedQuiz);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Edit3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Quiz Preview & Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Quiz Details</h3>
          
          {/* Quiz Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                value={editedQuiz.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={editedQuiz.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={editedQuiz.subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Questions Editor */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Edit Questions</h4>
            <div className="space-y-4">
              {editedQuiz.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      Question {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveQuestion(question.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200"
                      >
                        <Move className="h-4 w-4 rotate-90" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(question.id, 'down')}
                        disabled={index === editedQuiz.questions.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200"
                      >
                        <Move className="h-4 w-4 -rotate-90" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Options */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options
                      </label>
                      <button
                        onClick={() => handleAddOption(question.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        <Plus className="h-3 w-3" />
                        Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(question.id, optionIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          />
                          <button
                            onClick={() => handleRemoveOption(question.id, optionIndex)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {editedQuiz.title}
              </h2>
              {editedQuiz.description && (
                <p className="text-gray-600 mb-4">{editedQuiz.description}</p>
              )}
              <p className="text-sm text-gray-500 mb-6">Subject: {editedQuiz.subject}</p>

              <div className="space-y-6">
                {editedQuiz.questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Question {index + 1}: {question.text}
                    </h4>
                    
                    {question.options && question.options.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded border ${
                              option === question.correctAnswer
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)})
                            </span>{' '}
                            {option}
                            {option === question.correctAnswer && (
                              <span className="ml-2 text-green-600">✓ Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
