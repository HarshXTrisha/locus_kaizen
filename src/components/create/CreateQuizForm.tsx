'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProcessedContent, useAppStore } from '@/lib/store';
import { createQuiz } from '@/lib/firebase-quiz';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice';
  options: string[];
  correctAnswer: string;
  points: number;
}

interface QuizData {
  title: string;
  description: string;
  subject: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
}

export function CreateQuizForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedContent = useProcessedContent();
  const { user, clearProcessedContent } = useAppStore();
  
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    description: '',
    subject: 'General',
    timeLimit: 60,
    passingScore: 70,
    questions: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Check if we're coming from file upload
  const source = searchParams.get('source');
  const fileId = searchParams.get('fileId');

  useEffect(() => {
    if (processedContent && source === 'file') {
      // Auto-fill title from filename
      const fileName = processedContent.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
      setQuizData(prev => ({
        ...prev,
        title: fileName,
        description: `Quiz created from ${processedContent.fileName}`
      }));

      // Parse questions from content
      const parsedQuestions = parseQuestionsFromContent(processedContent.content);
      setQuizData(prev => ({
        ...prev,
        questions: parsedQuestions
      }));
    }
  }, [processedContent, source]);

  const parseQuestionsFromContent = (content: string): Question[] => {
    const questions: Question[] = [];
    const lines = content.split('\n');
    let currentQuestion: Partial<Question> | null = null;
    let questionNumber = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line starts with a number followed by a dot (question)
      const questionMatch = line.match(/^(\d+)\.\s*(.+)$/);
      if (questionMatch) {
        // Save previous question if exists
        if (currentQuestion && currentQuestion.text && currentQuestion.options && currentQuestion.options.length > 0) {
          questions.push(currentQuestion as Question);
        }
        
        // Start new question
        currentQuestion = {
          id: `q${questionNumber}`,
          text: questionMatch[2],
          type: 'multiple-choice',
          options: [],
          correctAnswer: '',
          points: 1
        };
        questionNumber++;
        continue;
      }

      // Check for answer options (A), B), C), D))
      const optionMatch = line.match(/^([A-D])\)\s*(.+?)(\s*✓)?$/);
      if (optionMatch && currentQuestion) {
        const option = optionMatch[2].trim();
        const isCorrect = line.includes('✓');
        
        currentQuestion.options!.push(option);
        
        if (isCorrect) {
          currentQuestion.correctAnswer = option;
        }
      }
    }

    // Add the last question
    if (currentQuestion && currentQuestion.text && currentQuestion.options && currentQuestion.options.length > 0) {
      questions.push(currentQuestion as Question);
    }

    return questions;
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      text: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    };

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const removeQuestion = (id: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const setCorrectAnswer = (questionId: string, answer: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, correctAnswer: answer } : q
      )
    }));
  };

  const validateQuiz = (): boolean => {
    if (!quizData.title.trim()) {
      showError('Validation Error', 'Please enter a quiz title.');
      return false;
    }

    if (quizData.questions.length === 0) {
      showError('Validation Error', 'Please add at least one question.');
      return false;
    }

    for (const question of quizData.questions) {
      if (!question.text.trim()) {
        showError('Validation Error', 'All questions must have text.');
        return false;
      }

      if (question.options.length < 2) {
        showError('Validation Error', 'Each question must have at least 2 options.');
        return false;
      }

      if (!question.correctAnswer) {
        showError('Validation Error', 'Each question must have a correct answer selected.');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateQuiz()) return;
    if (!user) {
      showError('Authentication Error', 'You must be signed in to create a quiz.');
      return;
    }

    setIsLoading(true);
    try {
      const quizToSave = {
        title: quizData.title,
        description: quizData.description,
        subject: quizData.subject,
        questions: quizData.questions,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        createdBy: user.id
      };

      const quizId = await createQuiz(quizToSave);
      showSuccess('Quiz Created!', 'Your quiz has been saved successfully.');
      
      // Clear processed content after successful creation
      clearProcessedContent();
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Save error:', error);
      showError('Save Failed', 'Failed to save quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
            <p className="text-gray-600 mt-1">
              {processedContent 
                ? `Creating quiz from ${processedContent.fileName}`
                : 'Create a new quiz from scratch'
              }
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <ButtonLoader text="Saving..." />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Quiz Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quiz title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#20C997] focus:border-[#20C997]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={quizData.subject}
                  onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="General"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#20C997] focus:border-[#20C997]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                  placeholder="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#20C997] focus:border-[#20C997]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={quizData.passingScore}
                  onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                  placeholder="70"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#20C997] focus:border-[#20C997]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter quiz description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#20C997] focus:border-[#20C997]"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Questions ({quizData.questions.length})
              </h2>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>

            {quizData.questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {processedContent ? (
                  <div>
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No questions found in the uploaded document.</p>
                    <p className="text-sm">Add questions manually or upload a different file.</p>
                  </div>
                ) : (
                  <div>
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No questions added yet.</p>
                    <p className="text-sm">Click &ldquo;Add Question&rdquo; to get started.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {quizData.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Question {index + 1}
                      </h3>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                          placeholder="Enter your question here..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#20C997] focus:border-[#20C997]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer Options *
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correctAnswer === option}
                                onChange={() => setCorrectAnswer(question.id, option)}
                                className="text-[#20C997] focus:ring-[#20C997]"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={'Option ' + String.fromCharCode(65 + optionIndex)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#20C997] focus:border-[#20C997]"
                              />
                              {question.correctAnswer === option && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#20C997] focus:border-[#20C997]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Preview Mode */
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Preview</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{quizData.title || 'Untitled Quiz'}</h3>
              <p className="text-gray-600 mt-1">{quizData.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Subject: {quizData.subject} | Time Limit: {quizData.timeLimit} minutes | Questions: {quizData.questions.length}
              </p>
            </div>

            {quizData.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {index + 1}. {question.text}
                </h4>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`preview-${question.id}`}
                        disabled
                        className="text-[#20C997]"
                      />
                      <span className={question.correctAnswer === option ? 'text-green-600 font-medium' : 'text-gray-700'}>
                        {String.fromCharCode(65 + optionIndex)}) {option}
                        {question.correctAnswer === option && ' ✓'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
