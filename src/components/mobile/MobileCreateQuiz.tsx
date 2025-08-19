'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { showError, showSuccess } from '@/components/common/NotificationSystem';
import { 
  Plus, Minus, Save, ArrowLeft, BookOpen, Clock, Target, 
  Users, Eye, EyeOff, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { mobileClasses } from '@/lib/mobile-detection';
import { createQuiz, ALLOWED_SUBJECTS } from '@/lib/firebase-quiz';
import { getFirebaseAuth } from '@/lib/firebase-utils';
import { ExtractedQuestion } from '@/lib/pdf-processor';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function MobileCreateQuiz() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

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

    try {
      setLoading(true);
      console.log('📱 Creating quiz...');

      // Convert questions to ExtractedQuestion format
      const extractedQuestions: ExtractedQuestion[] = questions.map(q => ({
        id: q.id,
        text: q.text,
        type: 'multiple-choice',
        options: q.options,
        correctAnswer: q.options[q.correctAnswer],
        points: 1
      }));

      const quizId = await createQuiz({
        title: quizData.title,
        description: quizData.description,
        subject: quizData.subject || 'General',
        questions: extractedQuestions,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        createdBy: user.id
      });

      console.log('📱 Quiz created successfully:', quizId);
      showSuccess('Quiz Created', 'Your quiz has been created successfully!');
      
      // Navigate to the quiz
      router.push(`/quiz/${quizId}`);
    } catch (error) {
      console.error('❌ Error creating quiz:', error);
      showError('Failed to Create Quiz', 'An error occurred while creating the quiz');
    } finally {
      setLoading(false);
    }
  }, [quizData, questions, user, router]);

  const canProceedToQuestions = quizData.title.trim() && quizData.description.trim();
  const canProceedToPreview = questions.every(q => q.text.trim() && q.options.every(opt => opt.trim()));

  if (!isAuthenticated || !user) {
    return (
      <div className={`${mobileClasses.container} flex items-center justify-center min-h-screen`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${mobileClasses.container} min-h-screen bg-gray-50`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Create Quiz</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {[
            { id: 'details', label: 'Details', icon: BookOpen },
            { id: 'questions', label: 'Questions', icon: Target },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                activeStep === step.id
                  ? 'bg-[#20C997] text-white'
                  : index < ['details', 'questions', 'preview'].indexOf(activeStep)
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                activeStep === step.id ? 'text-[#20C997]' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < 2 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  index < ['details', 'questions', 'preview'].indexOf(activeStep)
                    ? 'bg-green-200'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeStep === 'details' && (
          <div className="space-y-4">
            <div className={mobileClasses.card}>
              <h3 className={mobileClasses.text.h3 + " mb-4"}>Quiz Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quizData.title}
                    onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={quizData.description}
                    onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                    rows={3}
                    placeholder="Enter quiz description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={quizData.subject}
                    onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                  >
                    <option value="">Select subject</option>
                    {ALLOWED_SUBJECTS.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Limit (min)
                    </label>
                    <input
                      type="number"
                      value={quizData.timeLimit}
                      onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                      min="1"
                      max="180"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={quizData.passingScore}
                      onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveStep('questions')}
              disabled={!canProceedToQuestions}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                canProceedToQuestions
                  ? 'bg-[#20C997] text-white hover:bg-[#1BA085]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next: Add Questions
            </button>
          </div>
        )}

        {activeStep === 'questions' && (
          <div className="space-y-4">
            <div className={mobileClasses.card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={mobileClasses.text.h3}>Questions ({questions.length})</h3>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-3 py-1 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((question, questionIndex) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Question {questionIndex + 1}</h4>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(questionIndex)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                          rows={2}
                          placeholder="Enter your question"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options *
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                                className="text-[#20C997] focus:ring-[#20C997]"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(questionIndex, 'options', newOptions);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20C997] focus:border-transparent"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              {question.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(questionIndex)}
                            className="flex items-center gap-2 text-sm text-[#20C997] hover:text-[#1BA085]"
                          >
                            <Plus className="h-4 w-4" />
                            Add Option
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveStep('details')}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setActiveStep('preview')}
                disabled={!canProceedToPreview}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  canProceedToPreview
                    ? 'bg-[#20C997] text-white hover:bg-[#1BA085]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        )}

        {activeStep === 'preview' && (
          <div className="space-y-4">
            <div className={mobileClasses.card}>
              <h3 className={mobileClasses.text.h3 + " mb-4"}>Quiz Preview</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{quizData.title}</h4>
                  <p className="text-sm text-gray-600">{quizData.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {quizData.timeLimit} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {questions.length} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {quizData.subject || 'General'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-3">Questions Preview</h5>
                  <div className="space-y-3">
                    {questions.slice(0, 3).map((question, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {index + 1}. {question.text}
                        </p>
                        <div className="space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2 text-sm">
                              <div className={`w-3 h-3 rounded-full ${
                                question.correctAnswer === optionIndex
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                              }`} />
                              <span className={question.correctAnswer === optionIndex ? 'font-medium text-green-700' : 'text-gray-600'}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {questions.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        ... and {questions.length - 3} more questions
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveStep('questions')}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#20C997] text-white hover:bg-[#1BA085]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Quiz...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Quiz
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
