import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  FieldValue,
  setDoc,
  onSnapshot
} from 'firebase/firestore';

// Leaderboard entry interface
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  timestamp: Date;
  rank: number;
}

// Database Leaderboard entry interface
interface DatabaseLeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  timestamp: Date; // Changed from FieldValue to Date
  rank: number;
}

// Leaderboard interface
export interface QuizLeaderboard {
  quizId: string;
  scores: LeaderboardEntry[];
  lastUpdated: Date;
}

// Database Leaderboard interface
interface DatabaseQuizLeaderboard {
  quizId: string;
  scores: DatabaseLeaderboardEntry[];
  lastUpdated: FieldValue;
}

/**
 * Update leaderboard for a quiz with a new score
 * Maintains only top 20 scores
 */
export async function updateLeaderboard(
  quizId: string, 
  userId: string, 
  userName: string, 
  score: number
): Promise<void> {
  try {
    console.log('🔍 updateLeaderboard: Starting update for quiz:', quizId);
    console.log('👤 User:', userId, userName, 'Score:', score);
    
    const leaderboardRef = doc(db, 'quiz-leaderboards', quizId);
    const leaderboardDoc = await getDoc(leaderboardRef);

    let currentScores: DatabaseLeaderboardEntry[] = [];
    
    if (leaderboardDoc.exists()) {
      const data = leaderboardDoc.data() as DatabaseQuizLeaderboard;
      currentScores = data.scores || [];
    }

    // Add new score
    const newEntry: DatabaseLeaderboardEntry = {
      userId,
      userName,
      score,
      timestamp: new Date(), // Use regular Date instead of serverTimestamp for array elements
      rank: 0 // Will be calculated after sorting
    };

    // Add new score to existing scores
    const allScores = [...currentScores, newEntry];

    // Sort by score (highest first), then by timestamp (earliest first for ties)
    allScores.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score first
      }
      // If scores are equal, sort by timestamp (earlier first)
      // Handle potential null/undefined timestamps safely
      const aTime = a.timestamp ? a.timestamp.getTime() || 0 : 0;
      const bTime = b.timestamp ? b.timestamp.getTime() || 0 : 0;
      return aTime - bTime;
    });

    // Keep only top 20 scores
    const top20Scores = allScores.slice(0, 20);

    // Update ranks
    top20Scores.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Save to database
    const leaderboardData: DatabaseQuizLeaderboard = {
      quizId,
      scores: top20Scores,
      lastUpdated: serverTimestamp()
    };

    console.log('💾 updateLeaderboard: Saving leaderboard data:', leaderboardData);
    await setDoc(leaderboardRef, leaderboardData);
    console.log('✅ Leaderboard updated for quiz:', quizId);
  } catch (error) {
    console.error('❌ Error updating leaderboard:', error);
    throw new Error('Failed to update leaderboard');
  }
}

/**
 * Get leaderboard for a specific quiz
 */
export async function getLeaderboard(quizId: string): Promise<QuizLeaderboard | null> {
  try {
    const leaderboardRef = doc(db, 'quiz-leaderboards', quizId);
    const leaderboardDoc = await getDoc(leaderboardRef);

    if (!leaderboardDoc.exists()) {
      return null;
    }

    const data = leaderboardDoc.data() as DatabaseQuizLeaderboard;
    
    // Convert database format to user-facing format
    const scores: LeaderboardEntry[] = (data.scores || []).map(entry => ({
      userId: entry.userId,
      userName: entry.userName,
      score: entry.score,
      timestamp: entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp),
      rank: entry.rank
    }));

    return {
      quizId,
      scores,
      lastUpdated: data.lastUpdated ? (data.lastUpdated as any).toDate() || new Date() : new Date()
    };
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    throw new Error('Failed to get leaderboard');
  }
}

/**
 * Subscribe to real-time leaderboard updates
 */
export function subscribeToLeaderboard(
  quizId: string, 
  callback: (leaderboard: QuizLeaderboard | null) => void
): () => void {
  const leaderboardRef = doc(db, 'quiz-leaderboards', quizId);
  
  const unsubscribe = onSnapshot(leaderboardRef, (doc) => {
    if (!doc.exists()) {
      callback(null);
      return;
    }

    const data = doc.data() as DatabaseQuizLeaderboard;
    
    // Convert database format to user-facing format
    const scores: LeaderboardEntry[] = (data.scores || []).map(entry => ({
      userId: entry.userId,
      userName: entry.userName,
      score: entry.score,
      timestamp: entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp),
      rank: entry.rank
    }));

    const leaderboard: QuizLeaderboard = {
      quizId,
      scores,
      lastUpdated: data.lastUpdated ? (data.lastUpdated as any).toDate() || new Date() : new Date()
    };

    callback(leaderboard);
  }, (error) => {
    console.error('❌ Error subscribing to leaderboard:', error);
    callback(null);
  });

  return unsubscribe;
}

/**
 * Get user's rank in a specific quiz
 */
export function getUserRank(leaderboard: QuizLeaderboard | null, userId: string): number | null {
  if (!leaderboard) return null;
  
  const userEntry = leaderboard.scores.find(entry => entry.userId === userId);
  return userEntry ? userEntry.rank : null;
}

/**
 * Check if a score would make it to the top 20
 */
export function wouldMakeTop20(leaderboard: QuizLeaderboard | null, score: number): boolean {
  if (!leaderboard || leaderboard.scores.length < 20) {
    return true; // Always make it if less than 20 entries
  }
  
  const lowestScore = leaderboard.scores[leaderboard.scores.length - 1].score;
  return score >= lowestScore;
}
