'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { liveQuizService } from '@/lib/live-quiz-service';
import { LiveQuiz, LiveQuizParticipant } from '@/lib/live-quiz-types';
import ShareableLinkRegistration from '@/components/live-quiz/ShareableLinkRegistration';
import LiveQuizInterface from '@/components/live-quiz/LiveQuizInterface';

export default function LiveQuizPage() {
  const params = useParams();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<LiveQuiz | null>(null);
  const [participant, setParticipant] = useState<LiveQuizParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        const quizData = await liveQuizService.getLiveQuiz(quizId);
        
        if (!quizData) {
          setError('Quiz not found');
          return;
        }

        setQuiz(quizData);
        
        // Check if user is already registered
        const existingParticipant = quizData.participants.find(p => 
          p.userId === localStorage.getItem('liveQuizUserId')
        );
        
        if (existingParticipant) {
          setParticipant(existingParticipant);
          setIsRegistered(true);
        }
      } catch (err) {
        setError('Failed to load quiz');
        console.error('Error loading quiz:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const handleRegistrationComplete = (participantId: string) => {
    const newParticipant = quiz?.participants.find(p => p.userId === participantId);
    if (newParticipant) {
      setParticipant(newParticipant);
      setIsRegistered(true);
      localStorage.setItem('liveQuizUserId', participantId);
    }
  };

  const handleAnswerSubmit = async (questionId: string, answer: string, timeTaken: number) => {
    if (!participant || !quiz) return;
    
    try {
      await liveQuizService.submitAnswer(quizId, participant.userId, questionId, answer, timeTaken);
      
      // Update local participant data
      const updatedQuiz = await liveQuizService.getLiveQuiz(quizId);
      if (updatedQuiz) {
        setQuiz(updatedQuiz);
        const updatedParticipant = updatedQuiz.participants.find(p => p.userId === participant.userId);
        if (updatedParticipant) {
          setParticipant(updatedParticipant);
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const handleQuizComplete = async () => {
    if (!quiz) return;
    
    try {
      await liveQuizService.completeQuiz(quizId);
      // Redirect to results or show completion message
      window.location.href = `/iim-bba-dbe?tab=results`;
    } catch (err) {
      console.error('Error completing quiz:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Quiz...</h2>
          <p className="text-gray-600 mt-2">Please wait while we prepare your quiz</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The quiz you&apos;re looking for doesn&apos;t exist or has been removed.'}</p>
          <a 
            href="/iim-bba-dbe" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <ShareableLinkRegistration
        quizId={quizId}
        onRegistrationComplete={handleRegistrationComplete}
        onError={setError}
      />
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Registration Error</h2>
          <p className="text-gray-600 mb-4">Failed to register for the quiz. Please try again.</p>
          <button 
            onClick={() => setIsRegistered(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <LiveQuizInterface
      quiz={quiz}
      participant={participant}
      onAnswerSubmit={handleAnswerSubmit}
      onQuizComplete={handleQuizComplete}
    />
  );
}
