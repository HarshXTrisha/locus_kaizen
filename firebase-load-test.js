const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp 
} = require('firebase/firestore');

// Firebase configuration (you'll need to add your config here)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

class FirebaseLoadTest {
  constructor() {
    this.app = null;
    this.db = null;
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.successCount = 0;
    this.errorCount = 0;
    this.quizId = null;
  }

  async initialize() {
    try {
      console.log('🔥 Initializing Firebase...');
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error.message);
      throw error;
    }
  }

  async createTestQuiz() {
    try {
      console.log('📝 Creating test quiz...');
      
      const quizData = {
        title: 'Load Test Quiz - 250 Users',
        description: 'Quiz created for load testing with 250 concurrent users',
        subject: 'Load Testing',
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
            options: ['London', 'Paris', 'Berlin', 'Madrid'],
            correctAnswer: 'Paris',
            points: 1
          },
          {
            id: 'q3',
            text: 'What is the largest planet in our solar system?',
            type: 'multiple-choice',
            options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
            correctAnswer: 'Jupiter',
            points: 1
          }
        ],
        timeLimit: 10,
        passingScore: 50,
        createdBy: 'load-test-admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublished: true,
        isTemporary: false
      };

      const docRef = await addDoc(collection(this.db, 'quizzes'), quizData);
      this.quizId = docRef.id;
      console.log('✅ Test quiz created with ID:', this.quizId);
      return this.quizId;
    } catch (error) {
      console.error('❌ Quiz creation failed:', error.message);
      throw error;
    }
  }

  async simulateUser(userId) {
    const startTime = Date.now();
    
    try {
      // Simulate user joining the quiz
      const participantData = {
        quizId: this.quizId,
        userId: `user-${userId}`,
        name: `Test User ${userId}`,
        email: `user${userId}@loadtest.com`,
        joinedAt: serverTimestamp(),
        status: 'active',
        currentQuestion: 0,
        answers: [],
        score: 0,
        timeStarted: serverTimestamp()
      };

      // Add participant to quiz
      await addDoc(collection(this.db, 'quiz_participants'), participantData);
      console.log(`✅ User ${userId} joined quiz`);

      // Simulate answering questions
      const answers = [
        { questionId: 'q1', answer: '4', isCorrect: true, points: 1 },
        { questionId: 'q2', answer: 'Paris', isCorrect: true, points: 1 },
        { questionId: 'q3', answer: 'Jupiter', isCorrect: true, points: 1 }
      ];

      // Simulate random time for answering (1-5 seconds per question)
      for (let i = 0; i < answers.length; i++) {
        const answerTime = Math.floor(Math.random() * 4000) + 1000; // 1-5 seconds
        await new Promise(resolve => setTimeout(resolve, answerTime));
        
        // Update participant with answer
        const participantQuery = query(
          collection(this.db, 'quiz_participants'),
          where('quizId', '==', this.quizId),
          where('userId', '==', `user-${userId}`)
        );
        
        // In a real implementation, you'd update the participant document
        console.log(`✅ User ${userId} answered question ${i + 1}`);
      }

      // Simulate quiz completion
      const completionData = {
        quizId: this.quizId,
        userId: `user-${userId}`,
        name: `Test User ${userId}`,
        email: `user${userId}@loadtest.com`,
        score: 3,
        totalQuestions: 3,
        correctAnswers: 3,
        timeTaken: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
        completedAt: serverTimestamp(),
        answers: answers
      };

      // Add result
      await addDoc(collection(this.db, 'quiz_results'), completionData);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.results.push({
        userId: userId,
        success: true,
        responseTime: responseTime,
        score: 3
      });

      this.successCount++;
      console.log(`✅ User ${userId} completed quiz in ${responseTime}ms`);

    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.results.push({
        userId: userId,
        success: false,
        responseTime: responseTime,
        error: error.message
      });

      this.errorCount++;
      console.log(`❌ User ${userId} failed: ${error.message}`);
    }
  }

  async runLoadTest() {
    this.startTime = Date.now();
    console.log('🚀 Starting Firebase load test with 250 concurrent users...');
    console.log(`⏰ Test started at: ${new Date(this.startTime).toISOString()}`);

    try {
      // Create test quiz
      await this.createTestQuiz();

      const userCount = 250;
      const batchSize = 25; // Process in batches

      // Create users in batches
      for (let i = 0; i < userCount; i += batchSize) {
        const batch = [];
        const batchEnd = Math.min(i + batchSize, userCount);
        
        console.log(`👥 Processing users ${i + 1} to ${batchEnd}...`);
        
        for (let j = i; j < batchEnd; j++) {
          const userId = j + 1;
          batch.push(this.simulateUser(userId));
        }

        // Wait for batch to complete
        await Promise.all(batch);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.endTime = Date.now();
      console.log(`⏰ Load test completed at: ${new Date(this.endTime).toISOString()}`);

      // Generate report
      await this.generateReport();

    } catch (error) {
      console.error('❌ Load test failed:', error);
    }
  }

  async generateReport() {
    const duration = this.endTime - this.startTime;
    const successRate = (this.successCount / 250) * 100;
    
    const successfulRequests = this.results.filter(r => r.success);
    const averageResponseTime = successfulRequests.length > 0 
      ? successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length 
      : 0;

    const report = {
      testDate: new Date().toISOString(),
      totalUsers: 250,
      successfulUsers: this.successCount,
      failedUsers: this.errorCount,
      successRate: `${successRate.toFixed(2)}%`,
      duration: `${(duration / 1000).toFixed(2)} seconds`,
      averageResponseTime: `${averageResponseTime.toFixed(2)}ms`,
      requestsPerSecond: `${(this.successCount / (duration / 1000)).toFixed(2)}`,
      systemPerformance: successRate > 90 ? 'Excellent' : successRate > 70 ? 'Good' : 'Needs Improvement',
      quizId: this.quizId,
      detailedResults: this.results
    };

    console.log('\n📊 FIREBASE LOAD TEST REPORT:');
    console.log('============================');
    console.log(`Total Users: ${report.totalUsers}`);
    console.log(`Successful Users: ${report.successfulUsers}`);
    console.log(`Failed Users: ${report.failedUsers}`);
    console.log(`Success Rate: ${report.successRate}`);
    console.log(`Duration: ${report.duration}`);
    console.log(`Average Response Time: ${report.averageResponseTime}ms`);
    console.log(`Requests Per Second: ${report.requestsPerSecond}`);
    console.log(`System Performance: ${report.systemPerformance}`);
    console.log(`Quiz ID: ${report.quizId}`);

    // Performance analysis
    if (successfulRequests.length > 0) {
      const responseTimes = successfulRequests.map(r => r.responseTime);
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      const medianResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)];

      console.log('\n📈 RESPONSE TIME ANALYSIS:');
      console.log(`Min Response Time: ${minResponseTime}ms`);
      console.log(`Max Response Time: ${maxResponseTime}ms`);
      console.log(`Median Response Time: ${medianResponseTime}ms`);
    }

    // Save detailed report
    const fs = require('fs');
    fs.writeFileSync('firebase-load-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: firebase-load-test-report.json');

    // Performance recommendations
    console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
    if (successRate < 70) {
      console.log('⚠️  System needs optimization for high concurrent users');
      console.log('   - Consider implementing Firebase connection pooling');
      console.log('   - Add rate limiting to Firebase rules');
      console.log('   - Optimize Firestore queries');
      console.log('   - Consider using Firebase Functions for heavy operations');
    } else if (successRate < 90) {
      console.log('⚠️  System performs well but could be optimized');
      console.log('   - Monitor Firebase usage and costs');
      console.log('   - Consider implementing caching strategies');
      console.log('   - Optimize batch operations');
    } else {
      console.log('✅ System performs excellently under load');
      console.log('   - Firebase handles concurrent users well');
      console.log('   - Ready for production use');
      console.log('   - Consider monitoring Firebase costs');
    }
  }
}

// Run the Firebase load test
async function main() {
  const loadTest = new FirebaseLoadTest();
  
  try {
    await loadTest.initialize();
    await loadTest.runLoadTest();
  } catch (error) {
    console.error('❌ Firebase load test failed:', error);
  }
}

// Check if Firebase is configured
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
  console.error('❌ Firebase configuration not set up!');
  console.error('Please update the firebaseConfig object in this file with your Firebase credentials.');
  process.exit(1);
}

main();
