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
import { updateLeaderboard } from './leaderboard';

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
  subject: string; // Allow any string for custom subjects
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  isTemporary?: boolean;
  source?: 'main' | 'iimb-bba-dbe' | 'personal'; // Source of the quiz
}

// Database Quiz interface (for Firestore operations)
interface DatabaseQuiz {
  title: string;
  description: string;
  subject: string; // Allow any string for custom subjects
  questions: Question[];
  timeLimit: number;
  passingScore: number;
  createdBy: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  isPublished: boolean;
  isTemporary?: boolean;
  source?: 'main' | 'iimb-bba-dbe' | 'personal'; // Source of the quiz
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
  userName?: string; // User's display name
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  completedAt: Date;
  answers: Answer[];
  source?: 'main' | 'iimb-bba-dbe' | 'personal'; // Source of the result
}

// Database Result interface (for Firestore operations)
interface DatabaseQuizResult {
  quizId: string;
  userId: string;
  userName?: string; // User's display name
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: FieldValue;
  answers: Answer[];
  source?: 'main' | 'iimb-bba-dbe' | 'personal'; // Source of the result
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
  source?: 'main' | 'iimb-bba-dbe' | 'personal'; // Source of the quiz
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
      subject: quizData.subject || 'Spreadsheets for Business Decisions', // Allow any string
      questions: cleanedQuestions,
      timeLimit: quizData.timeLimit || 30,
      passingScore: quizData.passingScore || 0,
      createdBy: quizData.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublished: true, // Set to true by default so other users can access quizzes
      isTemporary: quizData.isTemporary || false,
      source: quizData.source || 'main' // Default to 'main' if not specified
    };

    // Log custom subjects for debugging (no validation blocking)
    if (quizDoc.subject && !ALLOWED_SUBJECTS.includes(quizDoc.subject as AllowedSubject)) {
      console.log('Using custom subject:', quizDoc.subject);
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
export async function saveQuizResult(result: Omit<QuizResult, 'id'>, userName?: string): Promise<string> {
  try {
    const resultDoc: DatabaseQuizResult = {
      quizId: result.quizId,
      userId: result.userId,
      userName: userName || result.userName || 'Anonymous User',
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      timeTaken: result.timeTaken,
      completedAt: serverTimestamp(),
      answers: result.answers,
      source: result.source || 'main' // Default to 'main' if not specified
    };

    const docRef = await addDoc(collection(db, 'quizResults'), resultDoc);
    console.log('✅ Quiz result saved with ID:', docRef.id);
    
    // Update leaderboard if this is an iimb-bba-dbe quiz
    console.log('🔍 Checking if leaderboard should be updated...');
    console.log('Result source:', result.source);
    console.log('Quiz ID:', result.quizId);
    console.log('User ID:', result.userId);
    console.log('Score:', result.score);
    
    if (result.source === 'iimb-bba-dbe') {
      console.log('✅ This is an IIMB-BBA-DBE quiz, updating leaderboard...');
      try {
        const displayName = userName || result.userName || 'Anonymous User';
        console.log('Display name:', displayName);
        await updateLeaderboard(result.quizId, result.userId, displayName, result.score);
        console.log('✅ Leaderboard updated for iimb-bba-dbe quiz');
      } catch (leaderboardError) {
        console.error('❌ Error updating leaderboard:', leaderboardError);
        // Don't throw error here, as the result is already saved
      }
    } else {
      console.log('❌ Not an IIMB-BBA-DBE quiz, skipping leaderboard update');
    }
    
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
        userName: data.userName,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        timeTaken: data.timeTaken,
        completedAt: data.completedAt?.toDate() || new Date(),
        source: data.source || 'main',
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
        userName: data.userName,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        timeTaken: data.timeTaken,
        completedAt: data.completedAt?.toDate() || new Date(),
        source: data.source || 'main',
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
    const isModerator = userRole?.role === 'moderator';
    
    return {
      canPublish: (isCreator || isAdmin || isModerator) && !quizData.isPublished,
      canUnpublish: (isCreator || isAdmin) && quizData.isPublished,
      canEdit: isCreator || isAdmin || isModerator,
      canDelete: isCreator || isAdmin,
      canViewAnalytics: isCreator || isAdmin || isModerator,
      isAdmin,
      isCreator: isCreator || isModerator
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
        source: quizData.source || 'main',
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
export async function setUserRole(userId: string, role: 'user' | 'admin' | 'moderator') {
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

// Set admin user (for spycook.jjn007@gmail.com)
export async function setAdminUser() {
  try {
    // First, find the user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'spycook.jjn007@gmail.com'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await setUserRole(userDoc.id, 'admin');
      console.log('Admin role set for spycook.jjn007@gmail.com');
      return userDoc.id;
    } else {
      console.log('User spycook.jjn007@gmail.com not found');
      return null;
    }
  } catch (error) {
    console.error('Error setting admin user:', error);
    throw error;
  }
}

// Get all team members with their roles
export async function getTeamMembers(): Promise<Array<{
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}>> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const teamMembers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        name: data.name || data.displayName || 'Unknown User',
        role: data.role || 'user',
        createdAt: data.createdAt?.toDate() || new Date()
      };
    });
    
    // Sort by role (admin first, then moderator, then user)
    const roleOrder = { admin: 0, moderator: 1, user: 2 };
    return teamMembers.sort((a, b) => roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder]);
  } catch (error) {
    console.error('Error getting team members:', error);
    throw error;
  }
}

// Update team member role
export async function updateTeamMemberRole(userId: string, newRole: 'user' | 'admin' | 'moderator') {
  try {
    await setUserRole(userId, newRole);
    console.log(`Team member role updated to ${newRole} for user ${userId}`);
  } catch (error) {
    console.error('Error updating team member role:', error);
    throw error;
  }
}