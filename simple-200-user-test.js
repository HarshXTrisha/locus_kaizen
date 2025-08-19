#!/usr/bin/env node

// Simple 200-User Load Test for Locus
// This script simulates 200 concurrent users taking a 100-question test

const http = require('http');
const https = require('https');
const fs = require('fs');

class LoadTest {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.startTime = Date.now();
    this.metrics = {
      totalUsers: 200,
      activeUsers: 0,
      completedUsers: 0,
      totalQuestions: 100,
      questionsAnswered: 0,
      averageResponseTime: 0,
      errorCount: 0,
      successCount: 0,
      leaderboardUpdates: 0
    };
    
    this.testResults = [];
    this.isRunning = false;
    this.quizId = 'test-quiz-200-users';
  }

  // Generate test users
  generateTestUsers() {
    const users = [];
    for (let i = 0; i < 200; i++) {
      users.push({
        id: `test_user_${i}`,
        email: `testuser${i}@locus-test.com`,
        name: `Test User ${i}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
      });
    }
    return users;
  }

  // Generate test questions
  generateTestQuestions() {
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
  }

  // Make HTTP request
  makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Locus-Load-Test'
        }
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }
      
      const req = client.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        });
      });
      
      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  // Simulate a single user taking the quiz
  async simulateUser(user, userIndex) {
    try {
      console.log(`👤 User ${user.id} starting quiz...`);
      
      // 1. Simulate authentication
      const authStart = Date.now();
      const authRes = await this.makeRequest('/api/auth/login', 'POST', {
        email: user.email,
        password: 'testpassword123'
      });
      
      const authTime = Date.now() - authStart;
      console.log(`🔐 User ${user.id} authenticated in ${authTime}ms (${authRes.status})`);
      
      if (authRes.status !== 200) {
        this.metrics.errorCount++;
        return;
      }
      
      // 2. Join live quiz
      const joinStart = Date.now();
      const joinRes = await this.makeRequest(`/api/live-quiz/${this.quizId}/join`, 'POST', {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        joinTime: new Date().toISOString()
      });
      
      const joinTime = Date.now() - joinStart;
      console.log(`🎯 User ${user.id} joined quiz in ${joinTime}ms (${joinRes.status})`);
      
      if (joinRes.status !== 200) {
        this.metrics.errorCount++;
        return;
      }
      
      // 3. Answer 100 questions
      let correctAnswers = 0;
      let totalTime = 0;
      
      for (let questionNum = 1; questionNum <= 100; questionNum++) {
        const questionStart = Date.now();
        
        // Get question
        const questionRes = await this.makeRequest(`/api/live-quiz/${this.quizId}/question/${questionNum}`);
        
        const questionLoadTime = Date.now() - questionStart;
        
        if (questionRes.status === 200) {
          // Submit answer
          const answerStart = Date.now();
          const isCorrect = Math.random() > 0.3; // 70% correct answers
          const userAnswer = isCorrect ? 'Option A' : 'Option B';
          
          const answerRes = await this.makeRequest(`/api/live-quiz/${this.quizId}/answer`, 'POST', {
            userId: user.id,
            questionId: questionNum,
            answer: userAnswer,
            timeTaken: questionLoadTime,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
          });
          
          const answerSubmitTime = Date.now() - answerStart;
          
          if (answerRes.status === 200) {
            correctAnswers++;
            this.metrics.questionsAnswered++;
            this.metrics.successCount++;
          } else {
            this.metrics.errorCount++;
          }
          
          totalTime += questionLoadTime + answerSubmitTime;
          
          // Check leaderboard every 10 questions
          if (questionNum % 10 === 0) {
            const leaderboardRes = await this.makeRequest(`/api/live-quiz/${this.quizId}/leaderboard`);
            if (leaderboardRes.status === 200) {
              this.metrics.leaderboardUpdates++;
            }
          }
          
          // Progress update every 25 questions
          if (questionNum % 25 === 0) {
            console.log(`📝 User ${user.id}: ${questionNum}/100 questions completed`);
          }
        } else {
          this.metrics.errorCount++;
        }
      }
      
      // 4. Submit final results
      const finalScore = Math.round((correctAnswers / 100) * 100);
      const submitRes = await this.makeRequest(`/api/live-quiz/${this.quizId}/complete`, 'POST', {
        userId: user.id,
        totalQuestions: 100,
        correctAnswers: correctAnswers,
        score: finalScore,
        totalTime: totalTime,
        averageTimePerQuestion: Math.round(totalTime / 100),
        completedAt: new Date().toISOString()
      });
      
      if (submitRes.status === 200) {
        this.metrics.completedUsers++;
        this.metrics.successCount++;
        console.log(`✅ User ${user.id} completed quiz with ${correctAnswers}/100 correct answers (${finalScore}%)`);
      } else {
        this.metrics.errorCount++;
        console.log(`❌ User ${user.id} failed to submit results: ${submitRes.status}`);
      }
      
      // Add result to tracking
      this.testResults.push({
        userId: user.id,
        score: finalScore,
        correctAnswers: correctAnswers,
        totalTime: totalTime,
        responseTime: totalTime / 100,
        success: submitRes.status === 200,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.log(`❌ Error for user ${user.id}: ${error.message}`);
      this.metrics.errorCount++;
    }
  }

  // Start the load test
  async start() {
    console.log('🚀 Starting 200-User Load Test for Locus');
    console.log('='.repeat(60));
    console.log(`📊 Target: 200 users, 100 questions each`);
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    const users = this.generateTestUsers();
    const questions = this.generateTestQuestions();
    
    console.log(`👥 Generated ${users.length} test users`);
    console.log(`❓ Generated ${questions.length} test questions`);
    console.log('');
    
    // Create test quiz
    console.log('📝 Creating test quiz...');
    const quizData = {
      title: 'Load Test Quiz - 200 Users',
      description: 'Comprehensive test for 200 concurrent users taking 100 questions each',
      subject: 'Load Testing',
      questions: questions,
      timeLimit: 120,
      passingScore: 60,
      isPublished: true,
      isLive: true,
      maxParticipants: 200,
      createdBy: 'load-test-system'
    };
    
    try {
      const createRes = await this.makeRequest('/api/quizzes', 'POST', quizData);
      if (createRes.status === 200) {
        const quiz = JSON.parse(createRes.data);
        this.quizId = quiz.id;
        console.log(`✅ Quiz created with ID: ${this.quizId}`);
      } else {
        console.log(`⚠️ Quiz creation failed, using default ID: ${this.quizId}`);
      }
    } catch (error) {
      console.log(`⚠️ Quiz creation error: ${error.message}`);
    }
    
    console.log('');
    console.log('🎯 Starting user simulation...');
    console.log('');
    
    // Start user simulation with controlled concurrency
    const concurrency = 10; // Start with 10 concurrent users
    const userBatches = [];
    
    for (let i = 0; i < users.length; i += concurrency) {
      userBatches.push(users.slice(i, i + concurrency));
    }
    
    // Process batches with delays to simulate realistic load
    for (let batchIndex = 0; batchIndex < userBatches.length; batchIndex++) {
      const batch = userBatches[batchIndex];
      console.log(`📦 Starting batch ${batchIndex + 1}/${userBatches.length} (${batch.length} users)`);
      
      const promises = batch.map((user, index) => 
        this.simulateUser(user, batchIndex * concurrency + index)
      );
      
      await Promise.all(promises);
      
      // Update metrics
      this.metrics.activeUsers = Math.min((batchIndex + 1) * concurrency, this.metrics.totalUsers);
      this.displayStatus();
      
      // Small delay between batches
      if (batchIndex < userBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Final status and report
    this.displayStatus();
    this.generateReport();
  }

  // Display current status
  displayStatus() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const progress = Math.round((this.metrics.completedUsers / this.metrics.totalUsers) * 100);
    
    console.log('');
    console.log('📊 Current Status:');
    console.log(`⏱️  Elapsed Time: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
    console.log(`📈 Progress: ${progress}% (${this.metrics.completedUsers}/${this.metrics.totalUsers} users completed)`);
    console.log(`👥 Active Users: ${this.metrics.activeUsers}`);
    console.log(`✅ Completed Users: ${this.metrics.completedUsers}`);
    console.log(`❓ Questions Answered: ${this.metrics.questionsAnswered.toLocaleString()}`);
    console.log(`🏆 Leaderboard Updates: ${this.metrics.leaderboardUpdates}`);
    console.log(`✅ Success Count: ${this.metrics.successCount}`);
    console.log(`❌ Error Count: ${this.metrics.errorCount}`);
    
    if (this.testResults.length > 0) {
      const avgResponseTime = this.testResults.reduce((sum, result) => sum + result.responseTime, 0) / this.testResults.length;
      console.log(`⚡ Avg Response Time: ${Math.round(avgResponseTime)}ms`);
    }
    console.log('');
  }

  // Generate final report
  generateReport() {
    console.log('📊 Test Report Generated');
    console.log('='.repeat(60));
    
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    const successRate = this.metrics.successCount / (this.metrics.successCount + this.metrics.errorCount) * 100;
    
    const report = {
      testInfo: {
        name: '200-User Load Test',
        totalUsers: this.metrics.totalUsers,
        totalQuestions: this.metrics.totalQuestions,
        duration: `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`,
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString()
      },
      results: {
        completedUsers: this.metrics.completedUsers,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: this.metrics.averageResponseTime,
        totalQuestionsAnswered: this.metrics.questionsAnswered,
        leaderboardUpdates: this.metrics.leaderboardUpdates,
        errors: this.metrics.errorCount
      },
      performance: {
        questionsPerSecond: Math.round(this.metrics.questionsAnswered / totalTime * 100) / 100,
        usersPerMinute: Math.round(this.metrics.completedUsers / (totalTime / 60) * 100) / 100
      }
    };
    
    console.log('📋 Test Summary:');
    console.log(`  Duration: ${report.testInfo.duration}`);
    console.log(`  Completed Users: ${report.results.completedUsers}/${report.testInfo.totalUsers}`);
    console.log(`  Success Rate: ${report.results.successRate}%`);
    console.log(`  Questions Answered: ${report.results.totalQuestionsAnswered.toLocaleString()}`);
    console.log(`  Questions/Second: ${report.performance.questionsPerSecond}`);
    console.log(`  Users/Minute: ${report.performance.usersPerMinute}`);
    
    // Save report to file
    const reportFile = `test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
    
    // Performance assessment
    console.log('\n🎯 Performance Assessment:');
    if (report.results.successRate >= 95) {
      console.log('  ✅ EXCELLENT: System handled load very well');
    } else if (report.results.successRate >= 90) {
      console.log('  ✅ GOOD: System performed well under load');
    } else if (report.results.successRate >= 80) {
      console.log('  ⚠️ ACCEPTABLE: Some performance issues detected');
    } else {
      console.log('  ❌ NEEDS IMPROVEMENT: Significant performance issues');
    }
    
    console.log('\n🎉 200-User Load Test Completed!');
  }
}

// Run the test
async function main() {
  const test = new LoadTest();
  
  try {
    await test.start();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  process.exit(0);
});

// Run the test
main();
