import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User interface
interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
}

// Quiz interface
interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

// Question interface
interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

// Result interface
interface Result {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: Date;
  answers: Answer[];
}

// Answer interface
interface Answer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  points: number;
}

// Processed content interface
interface ProcessedContent {
  fileName: string;
  content: string;
  fileId: string;
}

// App state interface
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Quiz state
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  quizResults: Result[];
  
  // File processing state
  processedContent: ProcessedContent | null;
  
  // UI state
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  
  // Quiz actions
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  
  // File processing actions
  setProcessedContent: (content: ProcessedContent | null) => void;
  clearProcessedContent: () => void;
  
  // Result actions
  addResult: (result: Result) => void;
  getResultsByQuiz: (quizId: string) => Result[];
  getResultsByUser: (userId: string) => Result[];
  
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Notification interface
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
  read?: boolean;
}

// Create the store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      quizzes: [],
      currentQuiz: null,
      quizResults: [],
      processedContent: null,
      theme: 'light',
      sidebarOpen: false,
      notifications: [],

      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        currentQuiz: null,
        processedContent: null,
        notifications: []
      }),

      // Quiz actions
      addQuiz: (quiz) => set((state) => ({ 
        quizzes: [...state.quizzes, quiz] 
      })),
      
      updateQuiz: (id, updates) => set((state) => ({
        quizzes: state.quizzes.map(quiz => 
          quiz.id === id ? { ...quiz, ...updates, updatedAt: new Date() } : quiz
        )
      })),
      
      deleteQuiz: (id) => set((state) => ({
        quizzes: state.quizzes.filter(quiz => quiz.id !== id)
      })),
      
      setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),

      // File processing actions
      setProcessedContent: (content) => set({ processedContent: content }),
      clearProcessedContent: () => set({ processedContent: null }),

      // Result actions
      addResult: (result) => set((state) => ({
        quizResults: [...state.quizResults, result]
      })),
      
      getResultsByQuiz: (quizId) => {
        const state = get();
        return state.quizResults.filter(result => result.quizId === quizId);
      },
      
      getResultsByUser: (userId) => {
        const state = get();
        return state.quizResults.filter(result => result.userId === userId);
      },

      // UI actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, notification]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'questai-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        quizzes: state.quizzes,
        quizResults: state.quizResults,
        theme: state.theme,
      }),
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useQuizzes = () => useAppStore((state) => state.quizzes);
export const useCurrentQuiz = () => useAppStore((state) => state.currentQuiz);
export const useQuizResults = () => useAppStore((state) => state.quizResults);
export const useProcessedContent = () => useAppStore((state) => state.processedContent);
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useNotifications = () => useAppStore((state) => state.notifications);
