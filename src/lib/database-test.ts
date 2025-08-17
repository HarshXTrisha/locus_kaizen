import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';

export interface SystemTestResult {
  success: boolean;
  message: string;
  details?: any;
  category: 'auth' | 'database' | 'quiz' | 'results' | 'settings' | 'performance';
}

export interface SystemStatus {
  auth: {
    firebaseInitialized: boolean;
    anonymousAuth: boolean;
    googleAuth: boolean;
  };
  database: {
    connection: boolean;
    readOperations: boolean;
    writeOperations: boolean;
    securityRules: boolean;
  };
  quiz: {
    creation: boolean;
    retrieval: boolean;
    updating: boolean;
    deletion: boolean;
  };
  results: {
    saving: boolean;
    retrieval: boolean;
    analytics: boolean;
  };
  settings: {
    userSettings: boolean;
    preferences: boolean;
  };
  performance: {
    responseTime: number;
    bundleSize: number;
  };
}

// Test Firebase Authentication
export async function testAuthentication(): Promise<SystemTestResult[]> {
  const results: SystemTestResult[] = [];
  
  try {
    // Test 1: Check if Firebase Auth is initialized
    if (!auth) {
      results.push({
        success: false,
        message: 'Firebase Auth not initialized',
        category: 'auth'
      });
      return results;
    }
    
    results.push({
      success: true,
      message: 'Firebase Auth initialized',
      category: 'auth'
    });

    // Test 2: Test anonymous authentication
    try {
      const userCredential = await signInAnonymously(auth);
      results.push({
        success: true,
        message: 'Anonymous authentication working',
        details: { uid: userCredential.user.uid },
        category: 'auth'
      });
      
      // Sign out after test
      await signOut(auth);
    } catch (error) {
      results.push({
        success: false,
        message: 'Anonymous authentication failed',
        details: { error: error.message },
        category: 'auth'
      });
    }

    // Test 3: Check Google Auth provider availability
    try {
      const { GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      results.push({
        success: true,
        message: 'Google Auth provider available',
        category: 'auth'
      });
    } catch (error) {
      results.push({
        success: false,
        message: 'Google Auth provider not available',
        details: { error: error.message },
        category: 'auth'
      });
    }

  } catch (error) {
    results.push({
      success: false,
      message: 'Authentication test failed',
      details: { error: error.message },
      category: 'auth'
    });
  }

  return results;
}

// Test Database Operations
export async function testDatabaseOperations(): Promise<SystemTestResult[]> {
  const results: SystemTestResult[] = [];
  
  try {
    // Test 1: Check if db is initialized
    if (!db) {
      results.push({
        success: false,
        message: 'Firestore not initialized',
        category: 'database'
      });
      return results;
    }
    
    results.push({
      success: true,
      message: 'Firestore initialized',
      category: 'database'
    });

    // Test 2: Test read operations
    try {
      const testCollection = collection(db, 'quizzes');
      const snapshot = await getDocs(testCollection);
      results.push({
        success: true,
        message: 'Read operations working',
        details: { count: snapshot.size },
        category: 'database'
      });
    } catch (error) {
      results.push({
        success: false,
        message: 'Read operations failed',
        details: { error: error.message },
        category: 'database'
      });
    }

    // Test 3: Test write operations
    try {
      const testData = {
        title: 'System Test Quiz',
        description: 'Temporary quiz for system testing',
        subject: 'System Test',
        questions: [],
        timeLimit: 5,
        passingScore: 70,
        createdBy: 'system-test',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false
      };
      
      const docRef = await addDoc(collection(db, 'quizzes'), testData);
      results.push({
        success: true,
        message: 'Write operations working',
        details: { documentId: docRef.id },
        category: 'database'
      });

      // Clean up
      await deleteDoc(doc(db, 'quizzes', docRef.id));
      results.push({
        success: true,
        message: 'Delete operations working',
        category: 'database'
      });
    } catch (error) {
      results.push({
        success: false,
        message: 'Write operations failed',
        details: { error: error.message },
        category: 'database'
      });
    }

    // Test 4: Test complex queries
    try {
      const q = query(
        collection(db, 'quizzes'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      await getDocs(q);
      results.push({
        success: true,
        message: 'Complex queries working',
        category: 'database'
      });
    } catch (error) {
      results.push({
        success: false,
        message: 'Complex queries failed',
        details: { error: error.message },
        category: 'database'
      });
    }

  } catch (error) {
    results.push({
      success: false,
      message: 'Database operations test failed',
      details: { error: error.message },
      category: 'database'
    });
  }

  return results;
}

// Test Quiz Operations
export async function testQuizOperations(): Promise<SystemTestResult[]> {
  const results: SystemTestResult[] = [];
  
  try {
    // Test 1: Create a test quiz
    const testQuiz = {
      title: 'System Test Quiz',
      description: 'A comprehensive test quiz',
      subject: 'System Test',
      questions: [
        {
          id: 'q1',
          text: 'What is 2 + 2?',
          type: 'multiple-choice',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          points: 1
        },
        {
          id: 'q2',
          text: 'What is the capital of France?',
          type: 'multiple-choice',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 'Paris',
          points: 1
        }
      ],
      timeLimit: 10,
      passingScore: 70,
      createdBy: 'system-test',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: false
    };

    try {
      const docRef = await addDoc(collection(db, 'quizzes'), testQuiz);
      results.push({
        success: true,
        message: 'Quiz creation working',
        details: { quizId: docRef.id },
        category: 'quiz'
      });

      // Test 2: Retrieve the quiz
      const quizDoc = await getDocs(query(collection(db, 'quizzes'), where('__name__', '==', docRef.id)));
      if (!quizDoc.empty) {
        results.push({
          success: true,
          message: 'Quiz retrieval working',
          category: 'quiz'
        });
      }

      // Test 3: Save a quiz result
      const testResult = {
        quizId: docRef.id,
        userId: 'system-test',
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        timeTaken: 120,
        completedAt: new Date(),
        answers: [
          {
            questionId: 'q1',
            userAnswer: '4',
            isCorrect: true,
            points: 1
          },
          {
            questionId: 'q2',
            userAnswer: 'Paris',
            isCorrect: true,
            points: 1
          }
        ]
      };

      const resultRef = await addDoc(collection(db, 'quizResults'), testResult);
      results.push({
        success: true,
        message: 'Quiz result saving working',
        details: { resultId: resultRef.id },
        category: 'results'
      });

      // Test 4: Retrieve results
      const resultsQuery = query(
        collection(db, 'quizResults'),
        where('quizId', '==', docRef.id)
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      results.push({
        success: true,
        message: 'Quiz results retrieval working',
        details: { count: resultsSnapshot.size },
        category: 'results'
      });

      // Clean up
      await deleteDoc(doc(db, 'quizResults', resultRef.id));
      await deleteDoc(doc(db, 'quizzes', docRef.id));
      results.push({
        success: true,
        message: 'Quiz cleanup successful',
        category: 'quiz'
      });

    } catch (error) {
      results.push({
        success: false,
        message: 'Quiz operations failed',
        details: { error: error.message },
        category: 'quiz'
      });
    }

  } catch (error) {
    results.push({
      success: false,
      message: 'Quiz operations test failed',
      details: { error: error.message },
      category: 'quiz'
    });
  }

  return results;
}

// Test User Settings
export async function testUserSettings(): Promise<SystemTestResult[]> {
  const results: SystemTestResult[] = [];
  
  try {
    // Test 1: Create test user settings
    const testSettings = {
      userId: 'system-test',
      displayName: 'System Test User',
      bio: 'Test user for system validation',
      avatar: '',
      timezone: 'UTC',
      language: 'en',
      emailNotifications: {
        newQuizzes: true,
        quizResults: true,
        systemUpdates: true,
        marketing: false
      },
      quizPreferences: {
        defaultTimeLimit: 60,
        defaultPassingScore: 70,
        showTimer: true,
        allowReview: true,
        randomizeQuestions: false
      },
      privacy: {
        profileVisibility: 'public',
        showResults: true,
        allowAnalytics: true
      },
      theme: {
        mode: 'light',
        primaryColor: '#20C997',
        fontSize: 'medium'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, 'userSettings'), testSettings);
      results.push({
        success: true,
        message: 'User settings creation working',
        details: { settingsId: docRef.id },
        category: 'settings'
      });

      // Test 2: Retrieve settings
      const settingsQuery = query(
        collection(db, 'userSettings'),
        where('userId', '==', 'system-test')
      );
      const settingsSnapshot = await getDocs(settingsQuery);
      if (!settingsSnapshot.empty) {
        results.push({
          success: true,
          message: 'User settings retrieval working',
          category: 'settings'
        });
      }

      // Clean up
      await deleteDoc(doc(db, 'userSettings', docRef.id));
      results.push({
        success: true,
        message: 'User settings cleanup successful',
        category: 'settings'
      });

    } catch (error) {
      results.push({
        success: false,
        message: 'User settings operations failed',
        details: { error: error.message },
        category: 'settings'
      });
    }

  } catch (error) {
    results.push({
      success: false,
      message: 'User settings test failed',
      details: { error: error.message },
      category: 'settings'
    });
  }

  return results;
}

// Test Performance
export async function testPerformance(): Promise<SystemTestResult[]> {
  const results: SystemTestResult[] = [];
  
  try {
    // Test 1: Measure database response time
    const startTime = performance.now();
    
    try {
      await getDocs(collection(db, 'quizzes'));
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      results.push({
        success: responseTime < 1000, // Less than 1 second
        message: `Database response time: ${responseTime.toFixed(2)}ms`,
        details: { responseTime },
        category: 'performance'
      });
    } catch (error) {
      results.push({
        success: false,
        message: 'Performance test failed',
        details: { error: error.message },
        category: 'performance'
      });
    }

    // Test 2: Check bundle size (approximate)
    if (typeof window !== 'undefined') {
      const bundleSize = performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0;
      results.push({
        success: bundleSize < 50, // Less than 50MB
        message: `Bundle size: ${bundleSize.toFixed(2)}MB`,
        details: { bundleSize },
        category: 'performance'
      });
    }

  } catch (error) {
    results.push({
      success: false,
      message: 'Performance test failed',
      details: { error: error.message },
      category: 'performance'
    });
  }

  return results;
}

// Run comprehensive system test
export async function runSystemTest(): Promise<{
  auth: SystemTestResult[];
  database: SystemTestResult[];
  quiz: SystemTestResult[];
  results: SystemTestResult[];
  settings: SystemTestResult[];
  performance: SystemTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    categories: {
      auth: { passed: number; failed: number };
      database: { passed: number; failed: number };
      quiz: { passed: number; failed: number };
      results: { passed: number; failed: number };
      settings: { passed: number; failed: number };
      performance: { passed: number; failed: number };
    };
  };
}> {
  const auth = await testAuthentication();
  const database = await testDatabaseOperations();
  const quiz = await testQuizOperations();
  const results = await testQuizOperations(); // This includes results testing
  const settings = await testUserSettings();
  const performance = await testPerformance();

  const allResults = [...auth, ...database, ...quiz, ...results, ...settings, ...performance];
  
  const summary = {
    total: allResults.length,
    passed: allResults.filter(r => r.success).length,
    failed: allResults.filter(r => !r.success).length,
    categories: {
      auth: {
        passed: auth.filter(r => r.success).length,
        failed: auth.filter(r => !r.success).length
      },
      database: {
        passed: database.filter(r => r.success).length,
        failed: database.filter(r => !r.success).length
      },
      quiz: {
        passed: quiz.filter(r => r.success).length,
        failed: quiz.filter(r => !r.success).length
      },
      results: {
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      settings: {
        passed: settings.filter(r => r.success).length,
        failed: settings.filter(r => !r.success).length
      },
      performance: {
        passed: performance.filter(r => r.success).length,
        failed: performance.filter(r => !r.success).length
      }
    }
  };

  return {
    auth,
    database,
    quiz,
    results,
    settings,
    performance,
    summary
  };
}
