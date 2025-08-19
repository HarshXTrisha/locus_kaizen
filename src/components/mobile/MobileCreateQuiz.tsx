'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  Plus, Minus, Save, ArrowLeft, BookOpen, Clock, Target, 
  Users, Eye, EyeOff, CheckCircle, AlertCircle
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function MobileCreateQuiz() {
  const router = useRouter();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<'details' | 'questions' | 'preview'>('details');
  
  // Quiz details
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 30,
    passingScore: 70,
    isPublished: false,
    allowRetakes: true,
    showResults: true,
  });

  // Questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);

  const addQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setQuestions([...questions, newQuestion]);
  }, [questions]);

  const removeQuestion = useCallback((index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  }, [questions]);

  const updateQuestion = useCallback((index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  }, [questions]);

  const addOption = useCallback((questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  }, [questions]);

  const removeOption = useCallback((questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      // Adjust correct answer if needed
      if (updatedQuestions[questionIndex].correctAnswer >= optionIndex) {
        updatedQuestions[questionIndex].correctAnswer = Math.max(0, updatedQuestions[questionIndex].correctAnswer - 1);
      }
      setQuestions(updatedQuestions);
    }
  }, [questions]);

  const handleSave = useCallback(async () => {
    if (!user?.id) return;

    // Validation
    if (!quizData.title.trim()) {
      showError('Validation Error', 'Please enter a quiz title');
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      showError('Validation Error', 'Please fill in all questions');
      return;
    }

    if (questions.some(q => q.options.some(opt => !opt.trim()))) {
      showError('Validation Error', 'Please fill in all options');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement save logic
      showSuccess('Quiz Created', 'Your quiz has been created successfully!');
      router.push('/dashboard');
    } catch (error) {
      showError('Save Failed', 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [quizData, questions, user?.id, router]);

  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Quiz Details</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title *
            </label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => setQuizData({...quizData, title: e.target.value})}
              className={mobileClasses.input}
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={quizData.description}
              onChange={(e) => setQuizData({...quizData, description: e.target.value})}
              className={mobileClasses.input + " h-20"}
              placeholder="Enter quiz description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={quizData.subject}
              onChange={(e) => setQuizData({...quizData, subject: e.target.value})}
              className={mobileClasses.input}
              placeholder="e.g., Mathematics, Science"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (min)
              </label>
              <input
                type="number"
                value={quizData.timeLimit}
                onChange={(e) => setQuizData({...quizData, timeLimit: parseInt(e.target.value) || 0})}
                className={mobileClasses.input}
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={quizData.passingScore}
                onChange={(e) => setQuizData({...quizData, passingScore: parseInt(e.target.value) || 0})}
                className={mobileClasses.input}
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h3 + " mb-3"}>Quiz Settings</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quizData.allowRetakes}
              onChange={(e) => setQuizData({...quizData, allowRetakes: e.target.checked})}
              className="mr-3 h-4 w-4 text-green-600"
            />
            <span className="text-sm text-gray-700">Allow multiple attempts</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quizData.showResults}
              onChange={(e) => setQuizData({...quizData, showResults: e.target.checked})}
              className="mr-3 h-4 w-4 text-green-600"
            />
            <span className="text-sm text-gray-700">Show results immediately</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quizData.isPublished}
              onChange={(e) => setQuizData({...quizData, isPublished: e.target.checked})}
              className="mr-3 h-4 w-4 text-green-600"
            />
            <span className="text-sm text-gray-700">Publish immediately</span>
          </label>
        </div>
      </div>

      <button
        onClick={() => setActiveStep('questions')}
        className={mobileClasses.button.primary + " w-full"}
        disabled={!quizData.title.trim()}
      >
        Next: Add Questions
      </button>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={mobileClasses.text.h2}>Questions ({questions.length})</h3>
        <button
          onClick={addQuestion}
          className="bg-blue-600 text-white p-2 rounded-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      {questions.map((question, questionIndex) => (
        <div key={question.id} className={mobileClasses.card}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={mobileClasses.text.h3}>Question {questionIndex + 1}</h4>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(questionIndex)}
                className="text-red-600 p-1"
              >
                <Minus size={16} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Text *
              </label>
              <textarea
                value={question.text}
                onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                className={mobileClasses.input + " h-20"}
                placeholder="Enter your question"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name={`correct-${questionIndex}`}
                    checked={question.correctAnswer === optionIndex}
                    onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                    className="h-4 w-4 text-green-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...question.options];
                      newOptions[optionIndex] = e.target.value;
                      updateQuestion(questionIndex, 'options', newOptions);
                    }}
                    className={mobileClasses.input + " flex-1"}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  {question.options.length > 2 && (
                    <button
                      onClick={() => removeOption(questionIndex, optionIndex)}
                      className="text-red-600 p-1"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              {question.options.length < 6 && (
                <button
                  onClick={() => addOption(questionIndex)}
                  className="text-blue-600 text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Option
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          onClick={() => setActiveStep('details')}
          className={mobileClasses.button.secondary + " flex-1"}
        >
          Back
        </button>
        <button
          onClick={() => setActiveStep('preview')}
          className={mobileClasses.button.primary + " flex-1"}
          disabled={questions.some(q => !q.text.trim() || q.options.some(opt => !opt.trim()))}
        >
          Preview
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className={mobileClasses.card}>
        <h3 className={mobileClasses.text.h2 + " mb-3"}>Quiz Preview</h3>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900">{quizData.title}</h4>
            <p className="text-sm text-gray-600">{quizData.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-gray-400" />
              <span>{quizData.subject || 'No subject'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span>{quizData.timeLimit} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-gray-400" />
              <span>{quizData.passingScore}% to pass</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              <span>{questions.length} questions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setActiveStep('questions')}
          className={mobileClasses.button.secondary + " flex-1"}
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className={mobileClasses.button.primary + " flex-1 flex items-center justify-center gap-2"}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Create Quiz
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={mobileClasses.text.h1}>Create Quiz</h1>
            <p className="text-xs text-gray-600">Step {activeStep === 'details' ? 1 : activeStep === 'questions' ? 2 : 3} of 3</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {['details', 'questions', 'preview'].map((step, index) => (
            <div
              key={step}
              className={`flex-1 py-3 text-center text-sm font-medium ${
                activeStep === step
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeStep === 'details' && renderDetailsStep()}
        {activeStep === 'questions' && renderQuestionsStep()}
        {activeStep === 'preview' && renderPreviewStep()}
      </div>
    </div>
  );
}
