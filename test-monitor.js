// Real-time Test Monitor for 200-User Load Test
// This script monitors the test progress and provides real-time insights

const http = require('http');
const https = require('https');
const fs = require('fs');

class TestMonitor {
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
  }

  // Start monitoring
  start() {
    console.log('🔍 Starting Test Monitor for 200-User Load Test...');
    console.log('📊 Monitoring URL:', this.baseUrl);
    console.log('⏰ Test started at:', new Date().toISOString());
    console.log('='.repeat(60));
    
    this.isRunning = true;
    this.monitorInterval = setInterval(() => {
      this.updateMetrics();
      this.displayStatus();
    }, 5000); // Update every 5 seconds
    
    // Monitor for 20 minutes (test duration)
    setTimeout(() => {
      this.stop();
    }, 20 * 60 * 1000);
  }

  // Stop monitoring
  stop() {
    this.isRunning = false;
    clearInterval(this.monitorInterval);
    this.generateReport();
  }

  // Update metrics from the system
  async updateMetrics() {
    try {
      // Check system health
      const healthRes = await this.makeRequest('/api/health');
      if (healthRes.status === 200) {
        this.metrics.systemHealth = 'Healthy';
      } else {
        this.metrics.systemHealth = 'Issues Detected';
        this.metrics.errorCount++;
      }

      // Check active quiz sessions
      const quizRes = await this.makeRequest('/api/live-quiz/test-quiz-200-users/status');
      if (quizRes.status === 200) {
        const quizData = JSON.parse(quizRes.data);
        this.metrics.activeUsers = quizData.activeParticipants || 0;
        this.metrics.completedUsers = quizData.completedParticipants || 0;
        this.metrics.questionsAnswered = quizData.totalAnswers || 0;
        this.metrics.leaderboardUpdates = quizData.leaderboardUpdates || 0;
      }

      // Calculate average response time
      if (this.testResults.length > 0) {
        const totalTime = this.testResults.reduce((sum, result) => sum + result.responseTime, 0);
        this.metrics.averageResponseTime = Math.round(totalTime / this.testResults.length);
      }

    } catch (error) {
      console.log('⚠️ Error updating metrics:', error.message);
      this.metrics.errorCount++;
    }
  }

  // Display current status
  displayStatus() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const progress = Math.round((this.metrics.completedUsers / this.metrics.totalUsers) * 100);
    
    console.clear();
    console.log('🎯 200-User Load Test Monitor');
    console.log('='.repeat(60));
    console.log(`⏱️  Elapsed Time: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
    console.log(`📈 Progress: ${progress}% (${this.metrics.completedUsers}/${this.metrics.totalUsers} users completed)`);
    console.log(`👥 Active Users: ${this.metrics.activeUsers}`);
    console.log(`✅ Completed Users: ${this.metrics.completedUsers}`);
    console.log(`❓ Questions Answered: ${this.metrics.questionsAnswered.toLocaleString()}`);
    console.log(`🏆 Leaderboard Updates: ${this.metrics.leaderboardUpdates}`);
    console.log(`⚡ Avg Response Time: ${this.metrics.averageResponseTime}ms`);
    console.log(`✅ Success Rate: ${this.metrics.successCount}`);
    console.log(`❌ Error Count: ${this.metrics.errorCount}`);
    console.log(`💚 System Health: ${this.metrics.systemHealth || 'Unknown'}`);
    console.log('='.repeat(60));
    
    // Progress bar
    const barLength = 40;
    const filledLength = Math.round((progress / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    console.log(`Progress: [${bar}] ${progress}%`);
    console.log('');
    
    // Recent activity
    if (this.testResults.length > 0) {
      console.log('📝 Recent Activity:');
      const recent = this.testResults.slice(-5);
      recent.forEach(result => {
        const time = new Date(result.timestamp).toLocaleTimeString();
        console.log(`  ${time} - User ${result.userId}: ${result.score}% (${result.responseTime}ms)`);
      });
    }
  }

  // Make HTTP request
  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  // Add test result
  addResult(result) {
    this.testResults.push({
      ...result,
      timestamp: new Date().toISOString()
    });
    
    if (result.success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }
  }

  // Generate final report
  generateReport() {
    console.log('\n📊 Test Report Generated');
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
        usersPerMinute: Math.round(this.metrics.completedUsers / (totalTime / 60) * 100) / 100,
        averageTimePerQuestion: Math.round(this.metrics.averageResponseTime)
      }
    };
    
    console.log('📋 Test Summary:');
    console.log(`  Duration: ${report.testInfo.duration}`);
    console.log(`  Completed Users: ${report.results.completedUsers}/${report.testInfo.totalUsers}`);
    console.log(`  Success Rate: ${report.results.successRate}%`);
    console.log(`  Questions Answered: ${report.results.totalQuestionsAnswered.toLocaleString()}`);
    console.log(`  Avg Response Time: ${report.results.averageResponseTime}ms`);
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
    
    if (report.results.averageResponseTime < 500) {
      console.log('  ✅ Response times are excellent');
    } else if (report.results.averageResponseTime < 1000) {
      console.log('  ✅ Response times are good');
    } else {
      console.log('  ⚠️ Response times need optimization');
    }
  }
}

// Export the monitor
module.exports = TestMonitor;

// If run directly, start monitoring
if (require.main === module) {
  const monitor = new TestMonitor();
  monitor.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping test monitor...');
    monitor.stop();
    process.exit(0);
  });
}
