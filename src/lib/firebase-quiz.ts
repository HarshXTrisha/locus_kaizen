import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  FieldValue,
  setDoc
} from 'firebase/firestore';
import { ExtractedQuestion } from './pdf-processor';

// Allowed subjects for quizzes
export const ALLOWED_SUBJECTS = [
  'Spreadsheets for Business Decisions',
  'Understanding Indian Culture: Theatre and its Presence in Daily Life',
  'Exploring Sustainability in the Indian Context',
  'Social Media for Marketing',
  'Design Your Thinking',
  'Entrepreneurial Mindset and Methods',
  'Management Accounting'
] as const;

export type AllowedSubject = typeof ALLOWED_SUBJECTS[number];

// Quiz interface (for user-facing operations)
export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: AllowedSubject;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  isTemporary?: boolean;
}

// Database Quiz interface (for Firestore operations)
interface DatabaseQuiz {
  title: string;
  description: string;
  subject: AllowedSubject;
  questions: Question[];
  timeLimit: number;
  passingScore: number;
  createdBy: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  isPublished: boolean;
  isTemporary?: boolean;
}

// Question interface
export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

// Result interface (for user-facing operations)
export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  completedAt: Date;
  answers: Answer[];
}

// Database Result interface (for Firestore operations)
interface DatabaseQuizResult {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: FieldValue;
  answers: Answer[];
}

// Answer interface
export interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  points: number;
}

// Quiz creation interface
export interface CreateQuizData {
  title: string;
  description: string;
  subject: string;
  questions: ExtractedQuestion[];
  timeLimit: number;
  passingScore: number;
  createdBy: string;
  isTemporary?: boolean;
}

// Admin controls interface
export interface QuizAdminControls {
  canPublish: boolean;
  canUnpublish: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAnalytics: boolean;
  isAdmin: boolean;
  isCreator: boolean;
}

// Enhanced Quiz interface with admin controls
export interface QuizWithControls extends Quiz {
  adminControls: QuizAdminControls;
}

/**
 * Create a new quiz
 */
export async function createQuiz(quizData: CreateQuizData): Promise<string> {
  try {
    // Validate and clean the quiz data before saving
    const cleanedQuestions = quizData.questions.map(q => ({
      id: q.id || `q${Math.random().toString(36).substr(2, 9)}`,
      text: q.text || 'Question text not provided',
      type: q.type || 'multiple-choice',
      options: q.options && q.options.length > 0 ? q.options.filter(opt => opt && opt.trim()) : undefined,
      correctAnswer: q.correctAnswer || (q.options && q.options.length > 0 ? q.options[0] : 'No correct answer provided'),
      points: q.points || 1
    }));

    const quizDoc: DatabaseQuiz = {
      title: quizData.title || 'Untitled Quiz',
      description: quizData.description || 'Quiz description not provided',
      subject: (quizData.subject || 'Spreadsheets for Business Decisions') as AllowedSubject,
      questions: cleanedQuestions,
      timeLimit: quizData.timeLimit || 30,
      passingScore: quizData.passingScore || 70,
      createdBy: quizData.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublished: false,
      isTemporary: quizData.isTemporary || false
    };

    // Validate subject is allowed
    if (!ALLOWED_SUBJECTS.includes(quizDoc.subject as AllowedSubject)) {
      throw new Error(`Subject must be one of: ${ALLOWED_SUBJECTS.join(', ')}`);
    }

    // Additional validation before saving
    if (!quizDoc.createdBy) {
      throw new Error('User ID is required to create a quiz');
    }

    if (quizDoc.questions.length === 0) {
      throw new Error('Quiz must have at least one question');
    }

    // Validate each question
    quizDoc.questions.forEach((question, index) => {
      if (!question.text || question.text.trim() === '') {
        throw new Error(`Question ${index + 1} has no text`);
      }
      if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
        throw new Error(`Question ${index + 1} needs at least 2 options for multiple choice`);
      }
      if (!question.correctAnswer || question.correctAnswer.trim() === '') {
        throw new Error(`Question ${index + 1} has no correct answer`);
      }
    });

    const docRef = await addDoc(collection(db, 'quizzes'), quizDoc);
    console.log('✅ Quiz created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating quiz:', error);
    throw new Error('Failed to create quiz');
  }
}

/**
 * Get a quiz by ID
 */
export async function getQuiz(quizId: string): Promise<Quiz | null> {
  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    
    if (quizDoc.exists()) {
      const data = quizDoc.data();
      return {
        id: quizDoc.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        questions: data.questions,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublished: data.isPublished,
        isTemporary: data.isTemporary || false
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting quiz:', error);
    throw new Error('Failed to get quiz');
  }
}

/**
 * Get all quizzes for a user
 */
export async function getUserQuizzes(userId: string): Promise<Quiz[]> {
  try {
    const q = query(
      collection(db, 'quizzes'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const quizzes: Quiz[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      quizzes.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        questions: data.questions,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublished: data.isPublished,
        isTemporary: data.isTemporary || false
      });
    });
    
    return quizzes;
  } catch (error) {
    console.error('❌ Error getting user quizzes:', error);
    throw new Error('Failed to get user quizzes');
  }
}

/**
 * Update a quiz
 */
export async function updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<void> {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    await updateDoc(quizRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Quiz updated successfully');
  } catch (error) {
    console.error('❌ Error updating quiz:', error);
    throw new Error('Failed to update quiz');
  }
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(quizId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'quizzes', quizId));
    console.log('✅ Quiz deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting quiz:', error);
    throw new Error('Failed to delete quiz');
  }
}

/**
 * Save quiz result
 */
export async function saveQuizResult(result: Omit<QuizResult, 'id'>): Promise<string> {
  try {
    const resultDoc: DatabaseQuizResult = {
      quizId: result.quizId,
      userId: result.userId,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      timeTaken: result.timeTaken,
      completedAt: serverTimestamp(),
      answers: result.answers
    };

    const docRef = await addDoc(collection(db, 'quizResults'), resultDoc);
    console.log('✅ Quiz result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving quiz result:', error);
    throw new Error('Failed to save quiz result');
  }
}

/**
 * Get quiz results for a user
 */
export async function getUserQuizResults(userId: string): Promise<QuizResult[]> {
  try {
    const q = query(
      collection(db, 'quizResults'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const results: QuizResult[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        quizId: data.quizId,
        userId: data.userId,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        timeTaken: data.timeTaken,
        completedAt: data.completedAt?.toDate() || new Date(),
        answers: data.answers
      });
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error getting user quiz results:', error);
    throw new Error('Failed to get user quiz results');
  }
}

/**
 * Get quiz results for a specific quiz
 */
export async function getQuizResults(quizId: string): Promise<QuizResult[]> {
  try {
    const q = query(
      collection(db, 'quizResults'),
      where('quizId', '==', quizId),
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const results: QuizResult[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        quizId: data.quizId,
        userId: data.userId,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        timeTaken: data.timeTaken,
        completedAt: data.completedAt?.toDate() || new Date(),
        answers: data.answers
      });
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error getting quiz results:', error);
    throw new Error('Failed to get quiz results');
  }
}

/**
 * Get a single quiz result by ID
 */
export async function getQuizResult(resultId: string): Promise<QuizResult | null> {
  try {
    const resultDoc = await getDoc(doc(db, 'quizResults', resultId));
    
    if (resultDoc.exists()) {
      const data = resultDoc.data();
      return {
        id: resultDoc.id,
        quizId: data.quizId,
        userId: data.userId,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        timeTaken: data.timeTaken,
        completedAt: data.completedAt?.toDate() || new Date(),
        answers: data.answers
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting quiz result:', error);
    throw new Error('Failed to get quiz result');
  }
}

/**
 * Delete a quiz result by ID
 */
export async function deleteQuizResult(resultId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'quizResults', resultId));
    console.log('✅ Quiz result deleted successfully:', resultId);
  } catch (error) {
    console.error('❌ Error deleting quiz result:', error);
    throw new Error('Failed to delete quiz result');
  }
}

// Publish/Unpublish quiz functions
export const publishQuiz = async (quizId: string, userId: string): Promise<void> => {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizDoc = await getDoc(quizRef);
    
    if (!quizDoc.exists()) {
      throw new Error('Quiz not found');
    }
    
    const quizData = quizDoc.data();
    if (quizData.createdBy !== userId) {
      throw new Error('Only the quiz creator can publish/unpublish');
    }
    
    await updateDoc(quizRef, {
      isPublished: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error publishing quiz:', error);
    throw error;
  }
};

export const unpublishQuiz = async (quizId: string, userId: string): Promise<void> => {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizDoc = await getDoc(quizRef);
    
    if (!quizDoc.exists()) {
      throw new Error('Quiz not found');
    }
    
    const quizData = quizDoc.data();
    if (quizData.createdBy !== userId) {
      throw new Error('Only the quiz creator can publish/unpublish');
    }
    
    await updateDoc(quizRef, {
      isPublished: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error unpublishing quiz:', error);
    throw error;
  }
};

// Get admin controls for a quiz
export const getQuizAdminControls = async (quizId: string, userId: string): Promise<QuizAdminControls> => {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizDoc = await getDoc(quizRef);
    
    if (!quizDoc.exists()) {
      throw new Error('Quiz not found');
    }
    
    const quizData = quizDoc.data();
    const isCreator = quizData.createdBy === userId;
    
    // Get user role from Firestore users collection
    const userRole = await getUserRole(userId);
    const isAdmin = userRole?.role === 'admin';
    const isCreatorRole = userRole?.role === 'creator';
    
    return {
      canPublish: (isCreator || isAdmin) && !quizData.isPublished,
      canUnpublish: (isCreator || isAdmin) && quizData.isPublished,
      canEdit: isCreator || isAdmin || isCreatorRole,
      canDelete: isCreator || isAdmin,
      canViewAnalytics: isCreator || isAdmin,
      isAdmin,
      isCreator: isCreator || isCreatorRole
    };
  } catch (error) {
    console.error('Error getting admin controls:', error);
    throw error;
  }
};

// Get quizzes with admin controls
export const getUserQuizzesWithControls = async (userId: string): Promise<QuizWithControls[]> => {
  try {
    const quizzesQuery = query(
      collection(db, 'quizzes'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(quizzesQuery);
    const quizzes: QuizWithControls[] = [];
    
    for (const doc of querySnapshot.docs) {
      const quizData = doc.data();
      const adminControls = await getQuizAdminControls(doc.id, userId);
      
      quizzes.push({
        id: doc.id,
        title: quizData.title,
        description: quizData.description,
        subject: quizData.subject,
        questions: quizData.questions,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        createdBy: quizData.createdBy,
        createdAt: quizData.createdAt?.toDate() || new Date(),
        updatedAt: quizData.updatedAt?.toDate() || new Date(),
        isPublished: quizData.isPublished || false,
        isTemporary: quizData.isTemporary || false,
        adminControls
      });
    }
    
    return quizzes;
  } catch (error) {
    console.error('Error getting user quizzes with controls:', error);
    throw error;
  }
};

// Set user role in Firestore
export async function setUserRole(userId: string, role: 'user' | 'admin' | 'creator') {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { role }, { merge: true });
    console.log(`User role set to ${role} for user ${userId}`);
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
}

// Get user role from Firestore
export async function getUserRole(userId: string): Promise<{ role: string } | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as { role: string };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}