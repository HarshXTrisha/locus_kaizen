// Live Quiz System Types and Interfaces

export interface LiveQuiz {
  id: string;
  title: string;
  description: string;
  category: string;
  scheduledAt: Date;
  duration: number; // minutes
  maxParticipants: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'live' | 'paused' | 'completed';
  currentQuestionIndex: number;
  questions: LiveQuizQuestion[];
  participants: LiveQuizParticipant[];
  scoringConfig: {
    correctPoints: number;
    incorrectPoints: number;
  };
  shareableLink: string;
  createdAt: Date;
  createdBy: string;
  startedAt?: Date;
  endedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
}

export interface LiveQuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  timeLimit?: number; // seconds per question
}

export interface LiveQuizParticipant {
  userId: string;
  name: string;
  score: number;
  rank: number;
  answers: ParticipantAnswer[];
  joinedAt: Date;
  completedAt?: Date;
  isActive: boolean;
}

export interface ParticipantAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // seconds
  points: number;
  answeredAt: Date;
}

export interface LiveQuizResult {
  quizId: string;
  quizTitle: string;
  category: string;
  date: Date;
  participantName: string;
  score: number;
  rank: number;
  totalParticipants: number;
  duration: number;
  accuracy: number;
  averageTimePerQuestion: number;
}

export interface UserDashboard {
  userId: string;
  name: string;
  completedTests: LiveQuizResult[];
  summary: {
    totalTests: number;
    averageScore: number;
    bestRank: number;
    totalParticipants: number;
    totalPoints: number;
  };
}

export interface LiveQuizRegistration {
  quizId: string;
  userId: string;
  name: string;
  registeredAt: Date;
  status: 'registered' | 'participated' | 'completed';
}

export interface LiveQuizStats {
  totalQuizzes: number;
  activeParticipants: number;
  totalParticipants: number;
  averageScore: number;
  upcomingQuizzes: number;
  liveQuizzes: number;
}

export interface RealTimeUpdate {
  type: 'question' | 'leaderboard' | 'timer' | 'status' | 'participant_count';
  data: any;
  timestamp: Date;
  quizId: string;
}

// JSON Upload Format
export interface QuizJSONFormat {
  title: string;
  description: string;
  category: string;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
  }[];
}

// Scoring Configuration
export interface ScoringConfig {
  correctPoints: number;
  incorrectPoints: number;
  timeBonus?: boolean;
  streakBonus?: boolean;
}

// Live Quiz Settings
export interface LiveQuizSettings {
  autoStart: boolean;
  showLeaderboard: boolean;
  allowLateJoin: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showTimer: boolean;
  showProgress: boolean;
}

// Error Types
export interface LiveQuizError {
  code: string;
  message: string;
  details?: any;
}

// Success Response
export interface LiveQuizSuccess {
  success: true;
  data: any;
  message?: string;
}

// API Response
export type LiveQuizResponse = LiveQuizSuccess | LiveQuizError;

// Real-time Events
export enum LiveQuizEvents {
  QUIZ_STARTED = 'quiz_started',
  QUIZ_ENDED = 'quiz_ended',
  QUESTION_CHANGED = 'question_changed',
  LEADERBOARD_UPDATED = 'leaderboard_updated',
  PARTICIPANT_JOINED = 'participant_joined',
  PARTICIPANT_LEFT = 'participant_left',
  ANSWER_SUBMITTED = 'answer_submitted',
  TIMER_UPDATE = 'timer_update',
  STATUS_UPDATE = 'status_update'
}

// Quiz Categories
export const QUIZ_CATEGORIES = [
  'Finance & Accounting',
  'Marketing & Sales',
  'Operations & Supply Chain',
  'Human Resources',
  'Information Technology',
  'International Business',
  'Business Analytics',
  'General Business'
] as const;

export type QuizCategory = typeof QUIZ_CATEGORIES[number];

// Quiz Status Transitions
export const QUIZ_STATUS_TRANSITIONS = {
  draft: ['published'],
  published: ['live', 'draft'],
  live: ['completed'],
  completed: []
} as const;

// Validation Functions
export function validateQuizJSON(data: any): data is QuizJSONFormat {
  return (
    typeof data === 'object' &&
    typeof data.title === 'string' &&
    typeof data.description === 'string' &&
    typeof data.category === 'string' &&
    Array.isArray(data.questions) &&
    data.questions.every((q: any) =>
      typeof q.id === 'string' &&
      typeof q.text === 'string' &&
      Array.isArray(q.options) &&
      q.options.every((opt: any) => typeof opt === 'string') &&
      typeof q.correctAnswer === 'string'
    )
  );
}

export function validateScoringConfig(config: any): config is ScoringConfig {
  return (
    typeof config === 'object' &&
    typeof config.correctPoints === 'number' &&
    typeof config.incorrectPoints === 'number' &&
    config.correctPoints >= 0 &&
    config.incorrectPoints <= config.correctPoints
  );
}

// Utility Functions
export function generateShareableLink(quizId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/live-quiz/${quizId}`;
}

export function calculateRank(participants: LiveQuizParticipant[], score: number): number {
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const rank = sortedParticipants.findIndex(p => p.score === score) + 1;
  return rank;
}

export function calculateAccuracy(answers: ParticipantAnswer[]): number {
  if (answers.length === 0) return 0;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  return (correctAnswers / answers.length) * 100;
}

export function calculateAverageTime(answers: ParticipantAnswer[]): number {
  if (answers.length === 0) return 0;
  const totalTime = answers.reduce((sum, a) => sum + a.timeTaken, 0);
  return totalTime / answers.length;
}
