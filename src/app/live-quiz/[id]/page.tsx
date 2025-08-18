'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { liveQuizService } from '@/lib/live-quiz-service';
import { LiveQuiz, LiveQuizParticipant } from '@/lib/live-quiz-types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
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
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
            <LoadingSpinner size="xl" text="Loading live quiz..." />
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
            <EmptyState
              type="error"
              title="Quiz Not Found"
              description={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!quiz) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
            <EmptyState
              type="quiz"
              title="Quiz Not Available"
              description="The requested quiz could not be found or is no longer available"
            />
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {!isRegistered ? (
          <div className="container mx-auto px-4 py-8">
            <ShareableLinkRegistration
              quiz={quiz}
              onRegistrationComplete={handleRegistrationComplete}
            />
          </div>
        ) : (
          <LiveQuizInterface
            quiz={quiz}
            participant={participant!}
            onAnswerSubmit={handleAnswerSubmit}
            onQuizComplete={handleQuizComplete}
          />
        )}
      </div>
    </ResponsiveLayout>
  );
}
