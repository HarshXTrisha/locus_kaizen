'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Calendar, Settings, Users, Clock, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { liveQuizService } from '@/lib/live-quiz-service';
import { QuizJSONFormat, QUIZ_CATEGORIES, validateQuizJSON } from '@/lib/live-quiz-types';

interface LiveQuizCreatorProps {
  onQuizCreated: (quizId: string) => void;
  onCancel: () => void;
}

export default function LiveQuizCreator({ onQuizCreated, onCancel }: LiveQuizCreatorProps) {
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState<Partial<QuizJSONFormat>>({});
  const [scheduling, setScheduling] = useState({
    scheduledAt: '',
    scheduledTime: '',
    duration: 30,
    maxParticipants: 500
  });
  const [scoring, setScoring] = useState({
    correctPoints: 10,
    incorrectPoints: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        if (validateQuizJSON(jsonData)) {
          setQuizData(jsonData);
          setError('');
          setSuccess('Quiz data loaded successfully!');
        } else {
          setError('Invalid quiz format. Please check the JSON structure.');
          setSuccess('');
        }
      } catch (err) {
        setError('Invalid JSON file. Please check the format.');
        setSuccess('');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleManualInput = useCallback((field: keyof QuizJSONFormat, value: string) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleQuestionsChange = useCallback((questions: QuizJSONFormat['questions']) => {
    setQuizData(prev => ({ ...prev, questions }));
  }, []);

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(quizData.title && quizData.description && quizData.category && quizData.questions?.length);
      case 2:
        return !!(scheduling.scheduledAt && scheduling.scheduledTime && scheduling.duration > 0);
      case 3:
        return !!(scoring.correctPoints >= 0 && scoring.incorrectPoints <= scoring.correctPoints);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError('');
    } else {
      setError('Please fill in all required fields.');
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setError('');
  };

  const handleCreateQuiz = async () => {
    if (!validateStep(step)) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const scheduledDateTime = new Date(`${scheduling.scheduledAt}T${scheduling.scheduledTime}`);
      
      const quizPayload = {
        title: quizData.title!,
        description: quizData.description!,
        category: quizData.category!,
        questions: quizData.questions!,
        scheduledAt: scheduledDateTime,
        duration: scheduling.duration,
        maxParticipants: scheduling.maxParticipants,
        scoringConfig: {
          correctPoints: scoring.correctPoints,
          incorrectPoints: scoring.incorrectPoints
        }
      };

      const quizId = await liveQuizService.createLiveQuiz(quizPayload, 'current-user-id'); // TODO: Get actual user ID
      
      setSuccess('Live quiz created successfully!');
      setTimeout(() => {
        onQuizCreated(quizId);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `q${(quizData.questions?.length || 0) + 1}`,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    };
    handleQuestionsChange([...(quizData.questions || []), newQuestion]);
  };

  const updateQuestion = (index: number, field: string, value: string | string[]) => {
    const updatedQuestions = [...(quizData.questions || [])];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    handleQuestionsChange(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = (quizData.questions || []).filter((_, i) => i !== index);
    handleQuestionsChange(updatedQuestions);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Live Quiz</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center mt-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Step 1: Quiz Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Details</h3>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload JSON File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="json-upload"
                  />
                  <label htmlFor="json-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500 font-medium">
                      Choose a JSON file
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload a JSON file with your quiz questions
                  </p>
                </div>
              </div>

              {/* Manual Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quizData.title || ''}
                    onChange={(e) => handleManualInput('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={quizData.category || ''}
                    onChange={(e) => handleManualInput('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {QUIZ_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={quizData.description || ''}
                  onChange={(e) => handleManualInput('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quiz description"
                />
              </div>

              {/* Questions */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Questions</h4>
                  <button
                    onClick={addQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {(quizData.questions || []).map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">Question {index + 1}</h5>
                        <button
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Question text"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options.map((option, optionIndex) => (
                            <input
                              key={optionIndex}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(index, 'options', newOptions);
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            />
                          ))}
                        </div>

                        <select
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select correct answer</option>
                          {question.options.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {option || `Option ${String.fromCharCode(65 + optionIndex)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Scheduling */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Quiz</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={scheduling.scheduledAt}
                  onChange={(e) => setScheduling(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={scheduling.scheduledTime}
                  onChange={(e) => setScheduling(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={scheduling.duration}
                  onChange={(e) => setScheduling(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  min="5"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={scheduling.maxParticipants}
                  onChange={(e) => setScheduling(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 500 }))}
                  min="1"
                  max="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Scoring */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scoring Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points for Correct Answer *
                </label>
                <input
                  type="number"
                  value={scoring.correctPoints}
                  onChange={(e) => setScoring(prev => ({ ...prev, correctPoints: parseInt(e.target.value) || 0 }))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points for Incorrect Answer
                </label>
                <input
                  type="number"
                  value={scoring.incorrectPoints}
                  onChange={(e) => setScoring(prev => ({ ...prev, incorrectPoints: parseInt(e.target.value) || 0 }))}
                  max={scoring.correctPoints}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Scoring Summary</h4>
              <p className="text-sm text-blue-800">
                • Correct answer: +{scoring.correctPoints} points<br />
                • Incorrect answer: {scoring.incorrectPoints >= 0 ? '+' : ''}{scoring.incorrectPoints} points<br />
                • Maximum possible score: {(quizData.questions?.length || 0) * scoring.correctPoints} points
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Create</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Quiz Summary</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {quizData.title}</p>
                <p><strong>Category:</strong> {quizData.category}</p>
                <p><strong>Description:</strong> {quizData.description}</p>
                <p><strong>Questions:</strong> {quizData.questions?.length || 0}</p>
                <p><strong>Scheduled:</strong> {scheduling.scheduledAt} at {scheduling.scheduledTime}</p>
                <p><strong>Duration:</strong> {scheduling.duration} minutes</p>
                <p><strong>Max Participants:</strong> {scheduling.maxParticipants}</p>
                <p><strong>Scoring:</strong> +{scoring.correctPoints} correct, {scoring.incorrectPoints >= 0 ? '+' : ''}{scoring.incorrectPoints} incorrect</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreateQuiz}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Quiz
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
