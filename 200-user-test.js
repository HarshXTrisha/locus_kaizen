// 200 User Load Test for Locus - 100 Questions Each
// This script simulates 200 concurrent users taking a 100-question test

const { check } = require('k6');
const http = require('k6/http');
const { Rate, Trend } = require('k6/metrics');

// Custom metrics for detailed monitoring
const questionLoadTime = new Trend('question_load_time');
const answerSubmitTime = new Trend('answer_submit_time');
const leaderboardUpdateTime = new Trend('leaderboard_update_time');
const errorRate = new Rate('errors');
const successRate = new Rate('success');

// Test configuration for 200 users
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '10m', target: 200 }, // Stay at 200 users for 10 minutes
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
    'question_load_time': ['p(95)<300'], // Question load under 300ms
    'answer_submit_time': ['p(95)<400'], // Answer submit under 400ms
    'leaderboard_update_time': ['p(95)<600'], // Leaderboard under 600ms
    'errors': ['rate<0.02'], // Error rate under 2%
    'success': ['rate>0.98'], // Success rate above 98%
  },
};

// Test data - 200 unique users
const testUsers = [];
for (let i = 0; i < 200; i++) {
  testUsers.push({
    id: `test_user_${i}`,
    email: `testuser${i}@questai-test.com`,
    name: `Test User ${i}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
  });
}

// Generate 100 test questions
const generateTestQuestions = () => {
  const questions = [];
  const questionTypes = ['multiple-choice', 'true-false', 'short-answer'];
  const subjects = ['Mathematics', 'Science', 'History', 'Literature', 'Geography'];
  
  for (let i = 1; i <= 100; i++) {
    const type = questionTypes[i % 3];
    const subject = subjects[i % 5];
    
    const question = {
      id: `q${i}`,
      text: `Test Question ${i}: This is a ${type} question about ${subject}. What is the correct answer?`,
      type: type,
      subject: subject,
      points: 1,
      correctAnswer: type === 'multiple-choice' ? 'Option A' : 
                    type === 'true-false' ? 'True' : 'Correct Answer',
    };
    
    if (type === 'multiple-choice') {
      question.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    } else if (type === 'true-false') {
      question.options = ['True', 'False'];
    }
    
    questions.push(question);
  }
  
  return questions;
};

// Main test function
export default function(data) {
  const user = testUsers[__VU % testUsers.length];
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const quizId = data.quizId || 'test-quiz-200-users';
  
  // Test scenario: Complete quiz taking flow
  const quizFlow = () => {
    try {
      // 1. User Authentication (simulated)
      const authStart = Date.now();
      const authRes = http.post(`${baseUrl}/api/auth/login`, {
        email: user.email,
        password: 'testpassword123'
      });
      
      check(authRes, {
        'authentication successful': (r) => r.status === 200,
        'auth response time < 500ms': (r) => r.timings.duration < 500,
      });
      
      if (authRes.status !== 200) {
        errorRate.add(1);
        console.log(`Auth failed for user ${user.id}: ${authRes.status}`);
        return;
      }
      
      // 2. Join Live Quiz
      const joinStart = Date.now();
      const joinRes = http.post(`${baseUrl}/api/live-quiz/${quizId}/join`, {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        joinTime: new Date().toISOString()
      });
      
      check(joinRes, {
        'join quiz successful': (r) => r.status === 200,
        'join response time < 300ms': (r) => r.timings.duration < 300,
      });
      
      if (joinRes.status !== 200) {
        errorRate.add(1);
        console.log(`Join failed for user ${user.id}: ${joinRes.status}`);
        return;
      }
      
      // 3. Answer 100 Questions
      let correctAnswers = 0;
      let totalTime = 0;
      
      for (let questionNum = 1; questionNum <= 100; questionNum++) {
        const questionStart = Date.now();
        
        // Get question
        const questionRes = http.get(`${baseUrl}/api/live-quiz/${quizId}/question/${questionNum}`, {
          headers: {
            'User-Agent': `QuestAI-Test-User-${user.id}`,
            'X-User-ID': user.id
          }
        });
        
        const questionLoadDuration = Date.now() - questionStart;
        questionLoadTime.add(questionLoadDuration);
        
        check(questionRes, {
          'question loaded': (r) => r.status === 200,
          'question response time < 200ms': (r) => r.timings.duration < 200,
        });
        
        if (questionRes.status !== 200) {
          errorRate.add(1);
          console.log(`Question ${questionNum} failed for user ${user.id}: ${questionRes.status}`);
          continue;
        }
        
        // Submit answer
        const answerStart = Date.now();
        const isCorrect = Math.random() > 0.3; // 70% correct answers on average
        const userAnswer = isCorrect ? 'Option A' : 'Option B';
        
        const answerRes = http.post(`${baseUrl}/api/live-quiz/${quizId}/answer`, {
          userId: user.id,
          questionId: questionNum,
          answer: userAnswer,
          timeTaken: questionLoadDuration,
          isCorrect: isCorrect,
          timestamp: new Date().toISOString()
        });
        
        const answerSubmitDuration = Date.now() - answerStart;
        answerSubmitTime.add(answerSubmitDuration);
        
        check(answerRes, {
          'answer submitted': (r) => r.status === 200,
          'answer response time < 300ms': (r) => r.timings.duration < 300,
        });
        
        if (answerRes.status === 200) {
          correctAnswers++;
          successRate.add(1);
        } else {
          errorRate.add(1);
          console.log(`Answer ${questionNum} failed for user ${user.id}: ${answerRes.status}`);
        }
        
        totalTime += questionLoadDuration + answerSubmitDuration;
        
        // Check leaderboard every 10 questions
        if (questionNum % 10 === 0) {
          const leaderboardStart = Date.now();
          const leaderboardRes = http.get(`${baseUrl}/api/live-quiz/${quizId}/leaderboard`, {
            headers: {
              'User-Agent': `QuestAI-Test-User-${user.id}`,
              'X-User-ID': user.id
            }
          });
          
          const leaderboardDuration = Date.now() - leaderboardStart;
          leaderboardUpdateTime.add(leaderboardDuration);
          
          check(leaderboardRes, {
            'leaderboard loaded': (r) => r.status === 200,
            'leaderboard response time < 500ms': (r) => r.timings.duration < 500,
          });
          
          // Small delay to simulate real user behavior
          if (__VU % 5 === 0) { // Every 5th user takes a short break
            const delay = Math.random() * 1000 + 500; // 500-1500ms delay
            http.get(`${baseUrl}/api/health`); // Keep connection alive
          }
        }
      }
      
      // 4. Submit Final Results
      const finalScore = Math.round((correctAnswers / 100) * 100);
      const submitRes = http.post(`${baseUrl}/api/live-quiz/${quizId}/complete`, {
        userId: user.id,
        totalQuestions: 100,
        correctAnswers: correctAnswers,
        score: finalScore,
        totalTime: totalTime,
        averageTimePerQuestion: Math.round(totalTime / 100),
        completedAt: new Date().toISOString()
      });
      
      check(submitRes, {
        'results submitted': (r) => r.status === 200,
        'final submission < 1s': (r) => r.timings.duration < 1000,
      });
      
      if (submitRes.status === 200) {
        successRate.add(1);
        console.log(`User ${user.id} completed quiz with ${correctAnswers}/100 correct answers (${finalScore}%)`);
      } else {
        errorRate.add(1);
        console.log(`Final submission failed for user ${user.id}: ${submitRes.status}`);
      }
      
    } catch (error) {
      errorRate.add(1);
      console.log(`Error for user ${user.id}: ${error.message}`);
    }
  };
  
  // Execute the quiz flow
  quizFlow();
}

// Setup function to prepare test data
export function setup() {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  console.log('🚀 Setting up 200-user load test...');
  
  // Create test quiz with 100 questions
  const quizData = {
    title: 'Load Test Quiz - 200 Users',
    description: 'Comprehensive test for 200 concurrent users taking 100 questions each',
    subject: 'Load Testing',
    questions: generateTestQuestions(),
    timeLimit: 120, // 2 hours
    passingScore: 60,
    isPublished: true,
    isLive: true,
    maxParticipants: 200,
    createdBy: 'load-test-system'
  };
  
  console.log(`📝 Created quiz with ${quizData.questions.length} questions`);
  
  // Create the quiz
  const createRes = http.post(`${baseUrl}/api/quizzes`, JSON.stringify(quizData), {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Mode': 'true'
    }
  });
  
  if (createRes.status === 200) {
    const quiz = JSON.parse(createRes.body);
    console.log(`✅ Quiz created successfully with ID: ${quiz.id}`);
    return { quizId: quiz.id };
  } else {
    console.log(`⚠️ Quiz creation failed, using default ID. Status: ${createRes.status}`);
    return { quizId: 'test-quiz-200-users' };
  }
}

// Teardown function to clean up
export function teardown(data) {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  console.log('🧹 Cleaning up test data...');
  
  // Clean up test data
  const cleanupRes = http.del(`${baseUrl}/api/quizzes/${data.quizId}`, null, {
    headers: {
      'X-Test-Mode': 'true'
    }
  });
  
  if (cleanupRes.status === 200) {
    console.log('✅ Test data cleaned up successfully');
  } else {
    console.log(`⚠️ Cleanup failed: ${cleanupRes.status}`);
  }
  
  console.log('🎉 200-user load test completed!');
}
