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
  FieldValue
} from 'firebase/firestore';
import { ExtractedQuestion } from './pdf-processor';

// Quiz interface (for user-facing operations)
export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

// Database Quiz interface (for Firestore operations)
interface DatabaseQuiz {
  title: string;
  description: string;
  subject: string;
  questions: Question[];
  timeLimit: number;
  passingScore: number;
  createdBy: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  isPublished: boolean;
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
}

/**
 * Create a new quiz
 */
export async function createQuiz(quizData: CreateQuizData): Promise<string> {
  try {
    const quizDoc: DatabaseQuiz = {
      title: quizData.title,
      description: quizData.description,
      subject: quizData.subject,
      questions: quizData.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points
      })),
      timeLimit: quizData.timeLimit,
      passingScore: quizData.passingScore,
      createdBy: quizData.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublished: false
    };

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
        isPublished: data.isPublished
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
        isPublished: data.isPublished
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