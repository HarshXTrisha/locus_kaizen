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
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  runTransaction,
  Transaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  LiveQuiz, 
  LiveQuizQuestion,
  LiveQuizParticipant, 
  ParticipantAnswer, 
  LiveQuizResult, 
  LiveQuizRegistration,
  LiveQuizStats,
  QuizJSONFormat,
  validateQuizJSON,
  calculateRank,
  calculateAccuracy,
  calculateAverageTime,
  generateShareableLink
} from './live-quiz-types';

export class LiveQuizService {
  private static instance: LiveQuizService;
  private scheduleCheckInterval: NodeJS.Timeout | null = null;
  
  public static getInstance(): LiveQuizService {
    if (!LiveQuizService.instance) {
      LiveQuizService.instance = new LiveQuizService();
    }
    return LiveQuizService.instance;
  }

  // Initialize schedule checking
  initializeScheduleChecking(): void {
    if (this.scheduleCheckInterval) {
      clearInterval(this.scheduleCheckInterval);
    }
    
    // Check every 30 seconds for scheduled quizzes
    this.scheduleCheckInterval = setInterval(async () => {
      await this.checkScheduledQuizzes();
    }, 30000);
  }

  // Stop schedule checking
  stopScheduleChecking(): void {
    if (this.scheduleCheckInterval) {
      clearInterval(this.scheduleCheckInterval);
      this.scheduleCheckInterval = null;
    }
  }

  // Check for quizzes that need to start or stop
  private async checkScheduledQuizzes(): Promise<void> {
    try {
      const now = new Date();
      
      // Get all published quizzes
      const publishedQuizzes = await this.getPublishedQuizzes();
      
      for (const quiz of publishedQuizzes) {
        const scheduledTime = new Date(quiz.scheduledAt);
        const endTime = new Date(scheduledTime.getTime() + (quiz.duration * 60 * 1000));
        
        // Check if quiz should start
        if (quiz.status === 'published' && now >= scheduledTime && now < endTime) {
          await this.startQuiz(quiz.id);
          console.log(`🟢 Auto-started quiz: ${quiz.title}`);
        }
        
        // Check if quiz should end
        if (quiz.status === 'live' && now >= endTime) {
          await this.completeQuiz(quiz.id);
          console.log(`🔴 Auto-completed quiz: ${quiz.title}`);
        }
      }
    } catch (error) {
      console.error('Error checking scheduled quizzes:', error);
    }
  }

  // Get all published quizzes
  private async getPublishedQuizzes(): Promise<LiveQuiz[]> {
    try {
      const q = query(
        collection(db, 'liveQuizzes'),
        where('status', 'in', ['published', 'live'])
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LiveQuiz[];
    } catch (error) {
      console.error('Error getting published quizzes:', error);
      return [];
    }
  }

  // Create a new live quiz
  async createLiveQuiz(quizData: {
    title: string;
    description: string;
    category: string;
    questions: LiveQuizQuestion[];
    scheduledAt: Date;
    duration: number;
    maxParticipants: number;
    scoringConfig: {
      correctPoints: number;
      incorrectPoints: number;
    };
  }, userId: string): Promise<string> {
    try {
      // Validate quiz data
      if (!validateQuizJSON(quizData)) {
        throw new Error('Invalid quiz format');
      }

      const quizDoc = {
        ...quizData,
        createdAt: serverTimestamp(),
        createdBy: userId,
        currentParticipants: 0,
        participants: [],
        currentQuestionIndex: 0,
        status: 'draft' as const
      };

      const docRef = await addDoc(collection(db, 'liveQuizzes'), quizDoc);
      
      // Generate shareable link
      const shareableLink = generateShareableLink(docRef.id);
      await updateDoc(docRef, { shareableLink });

      return docRef.id;
    } catch (error) {
      console.error('Error creating live quiz:', error);
      throw error;
    }
  }

  // Get a single live quiz
  async getLiveQuiz(quizId: string): Promise<LiveQuiz | null> {
    try {
      const docRef = doc(db, 'liveQuizzes', quizId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          scheduledAt: data.scheduledAt?.toDate(),
          createdAt: data.createdAt?.toDate()
        } as LiveQuiz;
      }
      return null;
    } catch (error) {
      console.error('Error getting live quiz:', error);
      throw error;
    }
  }

  // Get all live quizzes
  async getAllLiveQuizzes(): Promise<LiveQuiz[]> {
    try {
      const q = query(collection(db, 'liveQuizzes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as LiveQuiz[];
    } catch (error) {
      console.error('Error getting all live quizzes:', error);
      throw error;
    }
  }

  // Get upcoming quizzes
  async getUpcomingQuizzes(): Promise<LiveQuiz[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'liveQuizzes'),
        where('status', 'in', ['published', 'live']),
        where('scheduledAt', '>', now),
        orderBy('scheduledAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as LiveQuiz[];
    } catch (error) {
      console.error('Error getting upcoming quizzes:', error);
      throw error;
    }
  }

  // Get live quizzes
  async getLiveQuizzes(): Promise<LiveQuiz[]> {
    try {
      const q = query(
        collection(db, 'liveQuizzes'),
        where('status', '==', 'live'),
        orderBy('scheduledAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as LiveQuiz[];
    } catch (error) {
      console.error('Error getting live quizzes:', error);
      throw error;
    }
  }

  // Update quiz status
  async updateQuizStatus(quizId: string, status: LiveQuiz['status']): Promise<void> {
    try {
      const docRef = doc(db, 'liveQuizzes', quizId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Error updating quiz status:', error);
      throw error;
    }
  }

  // Start a quiz
  async startQuiz(quizId: string): Promise<void> {
    try {
      const docRef = doc(db, 'liveQuizzes', quizId);
      await updateDoc(docRef, { 
        status: 'live',
        startedAt: serverTimestamp(),
        currentQuestionIndex: 0
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      throw error;
    }
  }

  // Stop a quiz
  async stopQuiz(quizId: string): Promise<void> {
    try {
      const docRef = doc(db, 'liveQuizzes', quizId);
      await updateDoc(docRef, { 
        status: 'completed',
        endedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error stopping quiz:', error);
      throw error;
    }
  }

  // Pause a quiz
  async pauseQuiz(quizId: string): Promise<void> {
    try {
      const docRef = doc(db, 'liveQuizzes', quizId);
      await updateDoc(docRef, { 
        status: 'paused',
        pausedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error pausing quiz:', error);
      throw error;
    }
  }

  // Resume a quiz
  async resumeQuiz(quizId: string): Promise<void> {
    try {
      const docRef = doc(db, 'liveQuizzes', quizId);
      await updateDoc(docRef, { 
        status: 'live',
        resumedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error resuming quiz:', error);
      throw error;
    }
  }

  // Publish a quiz (make it available for registration)
  async publishQuiz(quizId: string): Promise<void> {
    try {
      const docRef = doc(db, 'liveQuizzes', quizId);
      await updateDoc(docRef, { 
        status: 'published',
        publishedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error publishing quiz:', error);
      throw error;
    }
  }

  // Register participant for a quiz
  async registerParticipant(quizId: string, userId: string, name: string): Promise<void> {
    try {
      const quizRef = doc(db, 'liveQuizzes', quizId);
      await runTransaction(db, async (tx: Transaction) => {
        const snap = await tx.get(quizRef);
        if (!snap.exists()) throw new Error('Quiz not found');
        const data = snap.data() as any;

        if (data.status !== 'published') throw new Error('Quiz is not open for registration');
        if ((data.currentParticipants || 0) >= data.maxParticipants) throw new Error('Quiz is full');
        if ((data.participants || []).some((p: any) => p.userId === userId)) throw new Error('Already registered for this quiz');

        const newParticipant: LiveQuizParticipant = {
          userId,
          name,
          score: 0,
          rank: 0,
          answers: [],
          joinedAt: new Date(),
          isActive: true
        };

        tx.update(quizRef, {
          participants: [...(data.participants || []), newParticipant],
          currentParticipants: (data.currentParticipants || 0) + 1
        });
      });
    } catch (error) {
      console.error('Error registering participant:', error);
      throw error;
    }
  }

  // Submit answer
  async submitAnswer(quizId: string, userId: string, questionId: string, selectedAnswer: string, timeTaken: number): Promise<void> {
    try {
      const quiz = await this.getLiveQuiz(quizId);
      if (!quiz) throw new Error('Quiz not found');

      const participant = quiz.participants.find(p => p.userId === userId);
      if (!participant) throw new Error('Participant not found');

      const question = quiz.questions.find(q => q.id === questionId);
      if (!question) throw new Error('Question not found');

      const isCorrect = selectedAnswer === question.correctAnswer;
      const points = isCorrect ? quiz.scoringConfig.correctPoints : quiz.scoringConfig.incorrectPoints;

      const answer: ParticipantAnswer = {
        questionId,
        selectedAnswer,
        isCorrect,
        timeTaken,
        points,
        answeredAt: new Date()
      };

      // Update participant's answers and score
      const updatedAnswers = [...participant.answers, answer];
      const newScore = updatedAnswers.reduce((sum, a) => sum + a.points, 0);

      // Update participant in quiz
      const updatedParticipants = quiz.participants.map(p => 
        p.userId === userId 
          ? { ...p, answers: updatedAnswers, score: newScore }
          : p
      );

      // Recalculate ranks
      const sortedParticipants = [...updatedParticipants].sort((a, b) => b.score - a.score);
      const updatedParticipantsWithRanks = updatedParticipants.map(p => ({
        ...p,
        rank: calculateRank(sortedParticipants, p.score)
      }));

      const docRef = doc(db, 'liveQuizzes', quizId);
      await updateDoc(docRef, {
        participants: updatedParticipantsWithRanks
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  // Complete quiz and save results
  async completeQuiz(quizId: string): Promise<void> {
    try {
      const quiz = await this.getLiveQuiz(quizId);
      if (!quiz) throw new Error('Quiz not found');

      // Update quiz status
      await this.updateQuizStatus(quizId, 'completed');

      // Save results for each participant
      const batch = writeBatch(db);
      
      for (const participant of quiz.participants) {
        if (participant.answers.length > 0) {
          const result: LiveQuizResult = {
            quizId,
            quizTitle: quiz.title,
            category: quiz.category,
            date: new Date(),
            participantName: participant.name,
            score: participant.score,
            rank: participant.rank,
            totalParticipants: quiz.participants.length,
            duration: quiz.duration,
            accuracy: calculateAccuracy(participant.answers),
            averageTimePerQuestion: calculateAverageTime(participant.answers)
          };

          const resultRef = doc(collection(db, 'liveQuizResults'));
          batch.set(resultRef, result);
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    }
  }

  // Change current question index (host control)
  async setCurrentQuestion(quizId: string, index: number): Promise<void> {
    try {
      const quizRef = doc(db, 'liveQuizzes', quizId);
      await updateDoc(quizRef, { currentQuestionIndex: index });
    } catch (error) {
      console.error('Error setting current question:', error);
      throw error;
    }
  }

  // Get user's completed quizzes
  async getUserResults(userId: string): Promise<LiveQuizResult[]> {
    try {
      const q = query(
        collection(db, 'liveQuizResults'),
        where('participantName', '==', userId), // This should be userId, not name
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          quizId: data.quizId || '',
          quizTitle: data.quizTitle || '',
          category: data.category || '',
          date: data.date?.toDate() || new Date(),
          participantName: data.participantName || '',
          score: data.score || 0,
          rank: data.rank || 0,
          totalParticipants: data.totalParticipants || 0,
          duration: data.duration || 0,
          accuracy: data.accuracy || 0,
          averageTimePerQuestion: data.averageTimePerQuestion || 0
        } as LiveQuizResult;
      });
    } catch (error) {
      console.error('Error getting user results:', error);
      throw error;
    }
  }

  // Get all completed quizzes (for all users)
  async getAllCompletedQuizzes(): Promise<LiveQuizResult[]> {
    try {
      const q = query(
        collection(db, 'liveQuizResults'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          quizId: data.quizId || '',
          quizTitle: data.quizTitle || '',
          category: data.category || '',
          date: data.date?.toDate() || new Date(),
          participantName: data.participantName || '',
          score: data.score || 0,
          rank: data.rank || 0,
          totalParticipants: data.totalParticipants || 0,
          duration: data.duration || 0,
          accuracy: data.accuracy || 0,
          averageTimePerQuestion: data.averageTimePerQuestion || 0
        } as LiveQuizResult;
      });
    } catch (error) {
      console.error('Error getting all completed quizzes:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(): Promise<{ name: string; score: number; tests: number }[]> {
    try {
      const q = query(
        collection(db, 'liveQuizResults'),
        orderBy('score', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => doc.data() as LiveQuizResult);
      
      // Aggregate scores by participant
      const participantScores = new Map<string, { score: number; tests: number }>();
      
      for (const result of results) {
        const existing = participantScores.get(result.participantName) || { score: 0, tests: 0 };
        participantScores.set(result.participantName, {
          score: existing.score + result.score,
          tests: existing.tests + 1
        });
      }

      return Array.from(participantScores.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Get live quiz stats
  async getLiveQuizStats(): Promise<LiveQuizStats> {
    try {
      const [allQuizzes, upcomingQuizzes, liveQuizzes, results] = await Promise.all([
        this.getAllLiveQuizzes(),
        this.getUpcomingQuizzes(),
        this.getLiveQuizzes(),
        getDocs(collection(db, 'liveQuizResults'))
      ]);

      const totalParticipants = allQuizzes.reduce((sum, quiz) => sum + quiz.currentParticipants, 0);
      const totalScore = results.docs.reduce((sum, doc) => sum + (doc.data().score || 0), 0);
      const averageScore = results.docs.length > 0 ? totalScore / results.docs.length : 0;

      return {
        totalQuizzes: allQuizzes.length,
        activeParticipants: liveQuizzes.reduce((sum, quiz) => sum + quiz.currentParticipants, 0),
        totalParticipants,
        averageScore: Math.round(averageScore),
        upcomingQuizzes: upcomingQuizzes.length,
        liveQuizzes: liveQuizzes.length
      };
    } catch (error) {
      console.error('Error getting live quiz stats:', error);
      throw error;
    }
  }

  // Real-time listeners
  onQuizUpdate(quizId: string, callback: (quiz: LiveQuiz) => void): () => void {
    const docRef = doc(db, 'liveQuizzes', quizId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const quiz: LiveQuiz = {
          id: doc.id,
          ...data,
          scheduledAt: data.scheduledAt?.toDate(),
          createdAt: data.createdAt?.toDate()
        } as LiveQuiz;
        callback(quiz);
      }
    });
  }

  onUpcomingQuizzesUpdate(callback: (quizzes: LiveQuiz[]) => void): () => void {
    const now = new Date();
    const q = query(
      collection(db, 'liveQuizzes'),
      where('status', 'in', ['published', 'live']),
      where('scheduledAt', '>', now),
      orderBy('scheduledAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const quizzes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as LiveQuiz[];
      callback(quizzes);
    });
  }

  onLiveQuizzesUpdate(callback: (quizzes: LiveQuiz[]) => void): () => void {
    const q = query(
      collection(db, 'liveQuizzes'),
      where('status', '==', 'live'),
      orderBy('scheduledAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const quizzes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as LiveQuiz[];
      callback(quizzes);
    });
  }
}

export const liveQuizService = LiveQuizService.getInstance();
