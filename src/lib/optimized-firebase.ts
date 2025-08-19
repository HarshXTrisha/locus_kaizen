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
  setDoc,
  limit,
  startAfter,
  getCountFromServer
} from 'firebase/firestore';
import { Quiz, QuizResult, Question } from './firebase-quiz';

// Cache for storing frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache TTL in milliseconds
const CACHE_TTL = {
  QUIZ: 5 * 60 * 1000, // 5 minutes
  DASHBOARD: 3 * 60 * 1000, // 3 minutes
  RESULTS: 2 * 60 * 1000, // 2 minutes
  STATS: 10 * 60 * 1000 // 10 minutes
};

/**
 * Get data from cache if available and not expired
 */
function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Set data in cache with TTL
 */
function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

/**
 * Clear cache for specific patterns
 */
function clearCache(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Optimized: Get dashboard data in a single batch operation
 */
export async function getOptimizedDashboardData(userId: string) {
  const cacheKey = `dashboard:${userId}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    // Batch all queries together
    const [quizzesSnapshot, resultsSnapshot, statsSnapshot] = await Promise.all([
      getDocs(query(
        collection(db, 'quizzes'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20) // Limit to recent quizzes
      )),
      getDocs(query(
        collection(db, 'quizResults'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc'),
        limit(50) // Limit to recent results
      )),
      getCountFromServer(query(
        collection(db, 'quizResults'),
        where('userId', '==', userId)
      ))
    ]);

    // Process quizzes
    const quizzes = quizzesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));

    // Process results
    const results = resultsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate() || new Date()
    }));

    // Calculate stats
    const totalResults = statsSnapshot.data().count;
    const averageScore = results.length > 0 
      ? Math.round(results.reduce((sum: number, result: any) => sum + result.score, 0) / results.length)
      : 0;
    const totalTimeSpent = results.reduce((sum: number, result: any) => sum + (result.timeTaken || 0), 0);

    const dashboardData = {
      quizzes,
      results,
      stats: {
        totalQuizzes: quizzes.length,
        totalResults,
        averageScore,
        totalTimeSpent
      }
    };

    // Cache the result
    setCache(cacheKey, dashboardData, CACHE_TTL.DASHBOARD);
    
    return dashboardData;
  } catch (error) {
    console.error('❌ Error getting optimized dashboard data:', error);
    throw new Error('Failed to get dashboard data');
  }
}

/**
 * Optimized: Get quizzes with pagination
 */
export async function getQuizzesPaginated(
  userId: string,
  pageSize: number = 10,
  lastDoc?: any
) {
  const cacheKey = `quizzes:${userId}:${pageSize}:${lastDoc?.id || 'first'}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    let q = query(
      collection(db, 'quizzes'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const quizzes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));

    const result = {
      quizzes,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };

    setCache(cacheKey, result, CACHE_TTL.QUIZ);
    return result;
  } catch (error) {
    console.error('❌ Error getting paginated quizzes:', error);
    throw new Error('Failed to get quizzes');
  }
}

/**
 * Optimized: Get quiz with caching
 */
export async function getOptimizedQuiz(quizId: string): Promise<Quiz | null> {
  const cacheKey = `quiz:${quizId}`;
  const cached = getFromCache<Quiz>(cacheKey);
  if (cached) return cached;

  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    
    if (quizDoc.exists()) {
      const data = quizDoc.data();
      const quiz = {
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

      setCache(cacheKey, quiz, CACHE_TTL.QUIZ);
      return quiz;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting optimized quiz:', error);
    throw new Error('Failed to get quiz');
  }
}

/**
 * Optimized: Save quiz result with cache invalidation
 */
export async function saveOptimizedQuizResult(result: Omit<QuizResult, 'id'>): Promise<string> {
  try {
    const resultDoc = {
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
    
    // Clear related caches
    clearCache(`dashboard:${result.userId}`);
    clearCache(`results:${result.userId}`);
    clearCache(`stats:${result.userId}`);
    
    console.log('✅ Optimized quiz result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving optimized quiz result:', error);
    throw new Error('Failed to save quiz result');
  }
}

/**
 * Optimized: Get user stats with caching
 */
export async function getUserStats(userId: string) {
  const cacheKey = `stats:${userId}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const [quizzesCount, resultsCount, resultsSnapshot] = await Promise.all([
      getCountFromServer(query(
        collection(db, 'quizzes'),
        where('createdBy', '==', userId)
      )),
      getCountFromServer(query(
        collection(db, 'quizResults'),
        where('userId', '==', userId)
      )),
      getDocs(query(
        collection(db, 'quizResults'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc'),
        limit(100) // Get last 100 results for stats calculation
      ))
    ]);

    const results = resultsSnapshot.docs.map(doc => doc.data());
    const averageScore = results.length > 0 
      ? Math.round(results.reduce((sum: number, result: any) => sum + result.score, 0) / results.length)
      : 0;
    const totalTimeSpent = results.reduce((sum: number, result: any) => sum + (result.timeTaken || 0), 0);

    const stats = {
      totalQuizzes: quizzesCount.data().count,
      totalResults: resultsCount.data().count,
      averageScore,
      totalTimeSpent,
      recentActivity: results.length
    };

    setCache(cacheKey, stats, CACHE_TTL.STATS);
    return stats;
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    throw new Error('Failed to get user stats');
  }
}

/**
 * Optimized: Batch update multiple quizzes
 */
export async function batchUpdateQuizzes(updates: Array<{ id: string; updates: Partial<Quiz> }>) {
  try {
    const batch = db.batch();
    
    updates.forEach(({ id, updates: quizUpdates }) => {
      const quizRef = doc(db, 'quizzes', id);
      batch.update(quizRef, {
        ...quizUpdates,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    
    // Clear related caches
    updates.forEach(({ id }) => {
      clearCache(`quiz:${id}`);
    });
    
    console.log('✅ Batch updated', updates.length, 'quizzes');
  } catch (error) {
    console.error('❌ Error batch updating quizzes:', error);
    throw new Error('Failed to batch update quizzes');
  }
}

/**
 * Optimized: Search quizzes with caching
 */
export async function searchQuizzes(
  userId: string,
  searchTerm: string,
  subject?: string
) {
  const cacheKey = `search:${userId}:${searchTerm}:${subject || 'all'}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    let q = query(
      collection(db, 'quizzes'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    let quizzes = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
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
      };
    });

    // Client-side filtering for better performance
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      quizzes = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(term) ||
        quiz.description.toLowerCase().includes(term) ||
        quiz.subject.toLowerCase().includes(term)
      );
    }

    if (subject) {
      quizzes = quizzes.filter(quiz => quiz.subject === subject);
    }

    setCache(cacheKey, quizzes, CACHE_TTL.QUIZ);
    return quizzes;
  } catch (error) {
    console.error('❌ Error searching quizzes:', error);
    throw new Error('Failed to search quizzes');
  }
}

/**
 * Clear all caches (useful for testing or manual cache management)
 */
export function clearAllCaches(): void {
  cache.clear();
  console.log('🧹 All caches cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const stats = {
    totalEntries: cache.size,
    totalSize: 0,
    entries: Array.from(cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      ttl: value.ttl
    }))
  };

  return stats;
}
