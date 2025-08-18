'use client';

import React, { useState, useCallback } from 'react';
import { ExtractedQuiz, ExtractedQuestion } from '@/lib/pdf-processor';
import { SmartFormatDetector } from '@/lib/smart-format-detector';
import { 
  Edit3, 
  Save, 
  X, 
  GripVertical, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

interface QuizPreviewEditorProps {
  quiz: ExtractedQuiz;
  onQuizUpdated: (quiz: ExtractedQuiz) => void;
  onSave: () => void;
}

export function QuizPreviewEditor({ 
  quiz, 
  onQuizUpdated, 
  onSave 
}: QuizPreviewEditorProps) {
  const [editingQuiz, setEditingQuiz] = useState<ExtractedQuiz>(quiz);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showQualityScores, setShowQualityScores] = useState(false);
  const [previewMode, setPreviewMode] = useState<'preview' | 'edit'>('preview');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Analyze question quality
  const questionAnalysis = SmartFormatDetector.validateQuestions(editingQuiz.questions);

  const handleQuestionUpdate = useCallback((questionId: string, updates: Partial<ExtractedQuestion>) => {
    setEditingQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  }, []);

  const handleQuestionDelete = useCallback((questionId: string) => {
    setEditingQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  }, []);

  const handleQuestionReorder = useCallback((fromIndex: number, toIndex: number) => {
    setEditingQuiz(prev => {
      const newQuestions = [...prev.questions];
      const [movedQuestion] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, movedQuestion);
      return { ...prev, questions: newQuestions };
    });
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      handleQuestionReorder(dragIndex, index);
      setDragIndex(index);
    }
  }, [dragIndex, handleQuestionReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  const handleSave = useCallback(() => {
    onQuizUpdated(editingQuiz);
    onSave();
  }, [editingQuiz, onQuizUpdated, onSave]);

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Quiz Preview & Editor
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode('preview')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                previewMode === 'preview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </button>
            <button
              onClick={() => setPreviewMode('edit')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                previewMode === 'edit'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQualityScores(!showQualityScores)}
            className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200"
          >
            <Star className="h-4 w-4" />
            Quality
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              value={editingQuiz.title}
              onChange={(e) => setEditingQuiz(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={previewMode === 'preview'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={editingQuiz.subject}
              onChange={(e) => setEditingQuiz(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={previewMode === 'preview'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Questions
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
              {editingQuiz.questions.length}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={editingQuiz.description || ''}
            onChange={(e) => setEditingQuiz(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={previewMode === 'preview'}
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Questions ({editingQuiz.questions.length})
          </h4>
          {showQualityScores && (
            <div className="text-sm text-gray-600">
              Average Quality: {Math.round(questionAnalysis.reduce((sum, q) => sum + q.score, 0) / questionAnalysis.length)}%
            </div>
          )}
        </div>

        {editingQuiz.questions.map((question, index) => {
          const analysis = questionAnalysis.find(a => a.questionId === question.id);
          const isEditing = editingQuestionId === question.id;
          const isDragging = dragIndex === index;

          return (
            <div
              key={question.id}
              className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${
                isDragging ? 'opacity-50 shadow-lg' : ''
              }`}
              draggable={previewMode === 'edit'}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-start gap-3">
                {previewMode === 'edit' && (
                  <div className="flex flex-col items-center gap-1">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    {showQualityScores && analysis && (
                      <div className="flex items-center gap-1">
                        {getQualityIcon(analysis.score)}
                        <span className={`text-xs font-medium ${getQualityColor(analysis.score)}`}>
                          {analysis.score}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  {/* Question Text */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Question {index + 1}
                      </label>
                      {previewMode === 'edit' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingQuestionId(isEditing ? null : question.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleQuestionDelete(question.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <textarea
                        value={question.text}
                        onChange={(e) => handleQuestionUpdate(question.id, { text: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{question.text}</p>
                    )}
                  </div>

                  {/* Options */}
                  {question.options && question.options.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 w-6">
                              {String.fromCharCode(65 + optionIndex)})
                            </span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options!];
                                  newOptions[optionIndex] = e.target.value;
                                  handleQuestionUpdate(question.id, { options: newOptions });
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className={`text-sm ${option === question.correctAnswer ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                                {option}
                                {option === question.correctAnswer && ' ✓'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Correct Answer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionUpdate(question.id, { correctAnswer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-green-600 font-medium">{question.correctAnswer}</p>
                    )}
                  </div>

                  {/* Quality Analysis */}
                  {showQualityScores && analysis && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Quality Analysis</span>
                        <div className="flex items-center gap-1">
                          {getQualityIcon(analysis.score)}
                          <span className={`text-sm font-medium ${getQualityColor(analysis.score)}`}>
                            Score: {analysis.score}/100
                          </span>
                        </div>
                      </div>
                      {analysis.suggestions.length > 0 && (
                        <div className="space-y-1">
                          {analysis.suggestions.map((suggestion, idx) => (
                            <p key={idx} className="text-xs text-gray-600">💡 {suggestion}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {editingQuiz.questions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No questions available</p>
        </div>
      )}
    </div>
  );
}
