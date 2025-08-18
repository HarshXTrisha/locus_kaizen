const axios = require('axios');
const fs = require('fs');

class APILoadTest {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.successCount = 0;
    this.errorCount = 0;
  }

  async testQuizCreation() {
    console.log('🧪 Testing Quiz Creation API...');
    
    const quizData = {
      title: 'Load Test Quiz',
      description: 'Quiz created for load testing',
      subject: 'Load Testing',
      questions: [
        {
          text: 'What is 2 + 2?',
          type: 'multiple-choice',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          points: 1
        },
        {
          text: 'What is the capital of France?',
          type: 'multiple-choice',
          options: ['London', 'Paris', 'Berlin', 'Madrid'],
          correctAnswer: 'Paris',
          points: 1
        }
      ],
      timeLimit: 10,
      passingScore: 50,
      createdBy: 'load-test-user'
    };

    try {
      const response = await axios.post(`${this.baseURL}/api/quizzes`, quizData);
      console.log('✅ Quiz created successfully:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('❌ Quiz creation failed:', error.message);
      return null;
    }
  }

  async simulateUser(userId, quizId) {
    const userData = {
      name: `Test User ${userId}`,
      email: `user${userId}@loadtest.com`,
      quizId: quizId
    };

    const startTime = Date.now();
    
    try {
      // Simulate user joining quiz
      const joinResponse = await axios.post(`${this.baseURL}/api/live-quiz/join`, userData);
      
      // Simulate answering questions
      const answers = [
        { questionId: '1', answer: '4' },
        { questionId: '2', answer: 'Paris' }
      ];

      const submitResponse = await axios.post(`${this.baseURL}/api/live-quiz/submit`, {
        userId: joinResponse.data.userId,
        quizId: quizId,
        answers: answers,
        timeTaken: Math.floor(Math.random() * 300) + 60 // Random time between 1-6 minutes
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.results.push({
        userId: userId,
        success: true,
        responseTime: responseTime,
        score: submitResponse.data.score || 0
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
    console.log('🚀 Starting API load test with 250 concurrent users...');
    console.log(`⏰ Test started at: ${new Date(this.startTime).toISOString()}`);

    // First, create a quiz
    const quizId = await this.testQuizCreation();
    if (!quizId) {
      console.error('❌ Cannot proceed without quiz creation');
      return;
    }

    const userCount = 250;
    const batchSize = 25; // Process in batches to avoid overwhelming the system

    try {
      // Create users in batches
      for (let i = 0; i < userCount; i += batchSize) {
        const batch = [];
        const batchEnd = Math.min(i + batchSize, userCount);
        
        console.log(`👥 Processing users ${i + 1} to ${batchEnd}...`);
        
        for (let j = i; j < batchEnd; j++) {
          const userId = j + 1;
          batch.push(this.simulateUser(userId, quizId));
        }

        // Wait for batch to complete
        await Promise.all(batch);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      detailedResults: this.results
    };

    console.log('\n📊 API LOAD TEST REPORT:');
    console.log('========================');
    console.log(`Total Users: ${report.totalUsers}`);
    console.log(`Successful Users: ${report.successfulUsers}`);
    console.log(`Failed Users: ${report.failedUsers}`);
    console.log(`Success Rate: ${report.successRate}`);
    console.log(`Duration: ${report.duration}`);
    console.log(`Average Response Time: ${report.averageResponseTime}ms`);
    console.log(`Requests Per Second: ${report.requestsPerSecond}`);
    console.log(`System Performance: ${report.systemPerformance}`);

    // Performance analysis
    const responseTimes = successfulRequests.map(r => r.responseTime);
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    const medianResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)];

    console.log('\n📈 RESPONSE TIME ANALYSIS:');
    console.log(`Min Response Time: ${minResponseTime}ms`);
    console.log(`Max Response Time: ${maxResponseTime}ms`);
    console.log(`Median Response Time: ${medianResponseTime}ms`);

    // Save detailed report
    fs.writeFileSync('api-load-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: api-load-test-report.json');

    // Performance recommendations
    console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
    if (successRate < 70) {
      console.log('⚠️  System needs optimization for high concurrent users');
      console.log('   - Consider implementing connection pooling');
      console.log('   - Add rate limiting');
      console.log('   - Optimize database queries');
    } else if (successRate < 90) {
      console.log('⚠️  System performs well but could be optimized');
      console.log('   - Monitor response times');
      console.log('   - Consider caching strategies');
    } else {
      console.log('✅ System performs excellently under load');
      console.log('   - Ready for production use');
    }
  }
}

// Run the API load test
async function main() {
  const loadTest = new APILoadTest();
  
  try {
    await loadTest.runLoadTest();
  } catch (error) {
    console.error('❌ API load test failed:', error);
  }
}

// Check if axios is installed
try {
  require('axios');
  main();
} catch (error) {
  console.error('❌ Axios not installed. Please install it first:');
  console.error('npm install axios');
  process.exit(1);
}
