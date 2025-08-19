const { check } = require('k6');
const http = require('k6/http');
const { Rate } = require('k6/metrics');

// Custom metrics
const errorRate = new Rate('errors');
const questionResponseTime = new Rate('question_response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '5m', target: 1000 }, // Ramp up to 1000 users over 5 minutes
    { duration: '30m', target: 1000 }, // Stay at 1000 users for 30 minutes
    { duration: '5m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Error rate must be less than 1%
    'question_response_time': ['rate<0.05'], // Question response time must be under 5%
  },
};

// Test data
const testUsers = [];
for (let i = 0; i < 1000; i++) {
  testUsers.push({
    id: `user_${i}`,
    email: `testuser${i}@example.com`,
    name: `Test User ${i}`,
  });
}

// Main test function
export default function(data) {
  const user = testUsers[__VU % testUsers.length];
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  // Test scenario: Complete quiz taking flow
  const quizFlow = () => {
    // 1. Login/Authentication
    const loginRes = http.post(`${baseUrl}/api/auth/login`, {
      email: user.email,
      password: 'testpassword123'
    });
    
    check(loginRes, {
      'login successful': (r) => r.status === 200,
      'login response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    if (loginRes.status !== 200) {
      errorRate.add(1);
      return;
    }
    
    // 2. Join live quiz
    const quizId = 'test-quiz-1000-users';
    const joinRes = http.post(`${baseUrl}/api/live-quiz/${quizId}/join`, {
      userId: user.id,
      userName: user.name
    });
    
    check(joinRes, {
      'join quiz successful': (r) => r.status === 200,
      'join response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    // 3. Answer 100 questions
    for (let questionNum = 1; questionNum <= 100; questionNum++) {
      const startTime = Date.now();
      
      // Get question
      const questionRes = http.get(`${baseUrl}/api/live-quiz/${quizId}/question/${questionNum}`);
      
      check(questionRes, {
        'question loaded': (r) => r.status === 200,
        'question response time < 200ms': (r) => r.timings.duration < 200,
      });
      
      // Submit answer
      const answerRes = http.post(`${baseUrl}/api/live-quiz/${quizId}/answer`, {
        userId: user.id,
        questionId: questionNum,
        answer: Math.random() > 0.5 ? 'A' : 'B', // Random answer
        timeTaken: Date.now() - startTime
      });
      
      check(answerRes, {
        'answer submitted': (r) => r.status === 200,
        'answer response time < 300ms': (r) => r.timings.duration < 300,
      });
      
      // Track question response time
      const responseTime = Date.now() - startTime;
      questionResponseTime.add(responseTime < 500 ? 1 : 0);
      
      // Small delay between questions
      if (questionNum % 10 === 0) {
        // Every 10 questions, check leaderboard
        const leaderboardRes = http.get(`${baseUrl}/api/live-quiz/${quizId}/leaderboard`);
        check(leaderboardRes, {
          'leaderboard loaded': (r) => r.status === 200,
        });
      }
    }
    
    // 4. Submit final results
    const submitRes = http.post(`${baseUrl}/api/live-quiz/${quizId}/complete`, {
      userId: user.id,
      totalTime: 3600000, // 1 hour in milliseconds
      score: Math.floor(Math.random() * 100)
    });
    
    check(submitRes, {
      'results submitted': (r) => r.status === 200,
      'final submission < 1s': (r) => r.timings.duration < 1000,
    });
  };
  
  // Execute the quiz flow
  quizFlow();
}

// Setup function to prepare test data
export function setup() {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  // Create test quiz with 100 questions
  const quizData = {
    title: 'Load Test Quiz - 1000 Users',
    description: 'Test quiz for 1000 concurrent users',
    questions: []
  };
  
  // Generate 100 test questions
  for (let i = 1; i <= 100; i++) {
    quizData.questions.push({
      id: `q${i}`,
      text: `Test question ${i}: What is the answer to question ${i}?`,
      type: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      points: 1
    });
  }
  
  // Create the quiz
  const createRes = http.post(`${baseUrl}/api/quizzes`, quizData);
  
  if (createRes.status === 200) {
    const quiz = JSON.parse(createRes.body);
    return { quizId: quiz.id };
  }
  
  return { quizId: 'test-quiz-1000-users' };
}

// Teardown function to clean up
export function teardown(data) {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  // Clean up test data
  http.del(`${baseUrl}/api/quizzes/${data.quizId}`);
  
  console.log('Load test completed. Cleaning up test data...');
}
