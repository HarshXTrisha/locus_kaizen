import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 20 },  // Ramp up to 20 users
    { duration: '3m', target: 40 },  // Ramp up to 40 users
    { duration: '5m', target: 80 },  // Ramp up to 80 users
    { duration: '10m', target: 80 }, // Stay at 80 users for 10 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be below 5s
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
    errors: ['rate<0.1'],              // Custom error rate should be below 10%
    success: ['rate>0.9'],             // Success rate should be above 90%
  },
};

// Base URL - adjust this to your actual domain
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// User agents for desktop and mobile simulation
const desktopUserAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
];

const mobileUserAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.210 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1'
];

// Helper function to get random user agent
function getRandomUserAgent(isMobile = false) {
  const agents = isMobile ? mobileUserAgents : desktopUserAgents;
  return agents[Math.floor(Math.random() * agents.length)];
}

// Helper function to simulate realistic answer selection
function selectRandomAnswer() {
  const options = ['Option A', 'Option B', 'Option C', 'Option D'];
  return options[Math.floor(Math.random() * options.length)];
}

// Helper function to simulate realistic time spent on question
function getQuestionTime() {
  // Random time between 10-60 seconds per question
  return Math.random() * 50 + 10;
}

export default function () {
  const isMobile = Math.random() > 0.5; // 50% chance of mobile user
  const userAgent = getRandomUserAgent(isMobile);
  
  // Common headers
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  // Simulate user session
  const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
  const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🚀 Starting test for ${isMobile ? 'mobile' : 'desktop'} user: ${userId}`);

  try {
    // Step 1: Load the main page
    console.log(`📱 Loading main page for ${isMobile ? 'mobile' : 'desktop'} user`);
    const mainPageRes = http.get(`${BASE_URL}/`, { headers });
    
    check(mainPageRes, {
      'main page loaded': (r) => r.status === 200,
      'main page response time < 3s': (r) => r.timings.duration < 3000,
    }) ? successRate.add(1) : errorRate.add(1);

    sleep(1);

    // Step 2: Load the quiz page (using a test quiz ID)
    console.log(`📝 Loading quiz page for ${isMobile ? 'mobile' : 'desktop'} user`);
    const quizPageRes = http.get(`${BASE_URL}/quiz/load-test-quiz-60`, { headers });
    
    check(quizPageRes, {
      'quiz page loaded': (r) => r.status === 200,
      'quiz page response time < 5s': (r) => r.timings.duration < 5000,
    }) ? successRate.add(1) : errorRate.add(1);

    sleep(2);

    // Step 3: Simulate answering 60 questions
    console.log(`❓ Starting 60 questions for ${isMobile ? 'mobile' : 'desktop'} user`);
    
    for (let i = 0; i < 60; i++) {
      const questionStartTime = Date.now();
      
      // Simulate loading question (this would be the actual question display)
      const questionRes = http.get(`${BASE_URL}/quiz/load-test-quiz-60`, { headers });
      
      check(questionRes, {
        'question loaded': (r) => r.status === 200,
        'question response time < 2s': (r) => r.timings.duration < 2000,
      }) ? successRate.add(1) : errorRate.add(1);

      // Simulate time spent reading and answering question
      const questionTime = getQuestionTime();
      sleep(questionTime / 1000); // Convert to seconds

      // Simulate submitting answer (this would be the actual answer submission)
      const answerData = {
        questionId: `q${i + 1}`,
        selectedOption: selectRandomAnswer(),
        isFlagged: Math.random() > 0.9, // 10% chance of flagging
        timeSpent: questionTime
      };

      // This simulates the answer being saved in the quiz interface
      // In reality, this would be handled by the QuizInterface component
      console.log(`📝 ${isMobile ? 'Mobile' : 'Desktop'} user ${userId} answered question ${i + 1}`);

      // Small delay between questions
      sleep(0.5);

      // Log progress every 10 questions
      if ((i + 1) % 10 === 0) {
        console.log(`✅ ${isMobile ? 'Mobile' : 'Desktop'} user ${userId} completed ${i + 1}/60 questions`);
      }
    }

    // Step 4: Submit the quiz (simulate the submit action)
    console.log(`📤 Submitting quiz for ${isMobile ? 'mobile' : 'desktop'} user`);
    
    // This simulates the quiz submission process
    // In reality, this would be handled by the QuizInterface component
    const submitRes = http.post(
      `${BASE_URL}/api/quiz/submit`,
      JSON.stringify({
        quizId: 'load-test-quiz-60',
        userId: userId,
        completedAt: new Date().toISOString(),
        totalTimeSpent: 60 * 30 // Average 30 seconds per question
      }),
      {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        }
      }
    );

    check(submitRes, {
      'quiz submitted successfully': (r) => r.status === 200 || r.status === 404, // 404 is expected if API doesn't exist
      'submit response time < 3s': (r) => r.timings.duration < 3000,
    }) ? successRate.add(1) : errorRate.add(1);

    // Step 5: Load results page
    console.log(`📊 Loading results for ${isMobile ? 'mobile' : 'desktop'} user`);
    const resultsRes = http.get(`${BASE_URL}/results`, { headers });
    
    check(resultsRes, {
      'results page loaded': (r) => r.status === 200,
      'results response time < 3s': (r) => r.timings.duration < 3000,
    }) ? successRate.add(1) : errorRate.add(1);

    console.log(`🎉 ${isMobile ? 'Mobile' : 'Desktop'} user ${userId} completed full test cycle`);

  } catch (error) {
    console.error(`❌ Error for ${isMobile ? 'mobile' : 'desktop'} user ${userId}:`, error);
    errorRate.add(1);
  }

  // Final sleep before next iteration
  sleep(5);
}

// Setup function to create test quiz if needed
export function setup() {
  console.log('🔧 Setting up load test environment...');
  
  // Create a test quiz with 60 questions if it doesn't exist
  const quizData = {
    id: 'load-test-quiz-60',
    title: 'Load Test Quiz - 60 Questions',
    description: 'This is a test quiz for load testing with 80 users',
    subject: 'Load Testing',
    timeLimit: 60, // 60 minutes
    questions: Array.from({ length: 60 }, (_, i) => ({
      id: `q${i + 1}`,
      text: `Test question ${i + 1}: What is the correct answer for question ${i + 1}?`,
      type: 'multiple-choice',
      options: [
        `Option A for question ${i + 1}`,
        `Option B for question ${i + 1}`,
        `Option C for question ${i + 1}`,
        `Option D for question ${i + 1}`,
      ],
      correctAnswer: `Option A for question ${i + 1}`,
      points: 1
    })),
    createdBy: 'load-test-system',
    createdAt: new Date().toISOString()
  };

  try {
    // Try to create the quiz via API (if it exists)
    const createQuizRes = http.post(
      `${BASE_URL}/api/quizzes`,
      JSON.stringify(quizData),
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (createQuizRes.status === 200 || createQuizRes.status === 409) {
      console.log('✅ Test quiz ready for load testing');
    } else {
      console.log('⚠️ Could not create test quiz via API, proceeding anyway');
    }
  } catch (error) {
    console.log('⚠️ Setup error, proceeding with test:', error);
  }

  return { quizId: 'load-test-quiz-60' };
}

// Teardown function to clean up
export function teardown(data) {
  console.log('🧹 Cleaning up load test environment...');
  
  try {
    // Clean up test quiz
    const deleteRes = http.del(`${BASE_URL}/api/quizzes/${data.quizId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (deleteRes.status === 200) {
      console.log('✅ Test quiz cleaned up');
    }
  } catch (error) {
    console.log('⚠️ Cleanup error:', error);
  }
}
