#!/usr/bin/env node

// Simple Page Load Test for Locus
// This script tests the existing pages with 200 simulated users

const http = require('http');
const https = require('https');
const fs = require('fs');

class PageLoadTest {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.startTime = Date.now();
    this.metrics = {
      totalUsers: 200,
      activeUsers: 0,
      completedUsers: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };
    
    this.testResults = [];
    this.isRunning = false;
  }

  // Generate test users
  generateTestUsers() {
    const users = [];
    for (let i = 0; i < 200; i++) {
      users.push({
        id: `test_user_${i}`,
        email: `testuser${i}@locus-test.com`,
        name: `Test User ${i}`,
      });
    }
    return users;
  }

  // Make HTTP request
  makeRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'User-Agent': 'Locus-Page-Load-Test'
        }
      };
      
      const startTime = Date.now();
      
      const req = client.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers,
            responseTime: responseTime
          });
        });
      });
      
      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        reject({
          error: error.message,
          responseTime: responseTime
        });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject({
          error: 'Request timeout',
          responseTime: Date.now() - startTime
        });
      });
      
      req.end();
    });
  }

  // Test available pages
  async testPages() {
    const pages = [
      '/',
      '/upload',
      '/dashboard',
      '/create',
      '/login',
      '/api/health',
      '/api/quizzes',
      '/api/auth/login',
      '/api/user/profile'
    ];

    const results = [];
    
    for (const page of pages) {
      try {
        console.log(`🔍 Testing page: ${page}`);
        const response = await this.makeRequest(page);
        
        results.push({
          page: page,
          status: response.status,
          responseTime: response.responseTime,
          success: response.status >= 200 && response.status < 400
        });
        
        console.log(`  ✅ ${page}: ${response.status} (${response.responseTime}ms)`);
        
      } catch (error) {
        results.push({
          page: page,
          status: 'ERROR',
          responseTime: error.responseTime || 0,
          success: false,
          error: error.error
        });
        
        console.log(`  ❌ ${page}: ${error.error} (${error.responseTime}ms)`);
      }
    }
    
    return results;
  }

  // Simulate a single user browsing
  async simulateUser(user, userIndex) {
    try {
      console.log(`👤 User ${user.id} starting page test...`);
      
      const userResults = {
        userId: user.id,
        startTime: Date.now(),
        pageResults: [],
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalResponseTime: 0
      };
      
      // Test main pages
      const pages = ['/', '/upload', '/dashboard', '/create', '/login'];
      
      for (const page of pages) {
        try {
          const response = await this.makeRequest(page);
          
          userResults.totalRequests++;
          userResults.totalResponseTime += response.responseTime;
          
          if (response.status >= 200 && response.status < 400) {
            userResults.successfulRequests++;
            this.metrics.successfulRequests++;
          } else {
            userResults.failedRequests++;
            this.metrics.failedRequests++;
          }
          
          userResults.pageResults.push({
            page: page,
            status: response.status,
            responseTime: response.responseTime,
            success: response.status >= 200 && response.status < 400
          });
          
          // Small delay between requests to simulate real user behavior
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
          
        } catch (error) {
          userResults.totalRequests++;
          userResults.failedRequests++;
          this.metrics.failedRequests++;
          
          userResults.pageResults.push({
            page: page,
            status: 'ERROR',
            responseTime: error.responseTime || 0,
            success: false,
            error: error.error
          });
        }
      }
      
      // Test API endpoints
      const apiEndpoints = ['/api/health', '/api/quizzes'];
      
      for (const endpoint of apiEndpoints) {
        try {
          const response = await this.makeRequest(endpoint);
          
          userResults.totalRequests++;
          userResults.totalResponseTime += response.responseTime;
          
          if (response.status >= 200 && response.status < 400) {
            userResults.successfulRequests++;
            this.metrics.successfulRequests++;
          } else {
            userResults.failedRequests++;
            this.metrics.failedRequests++;
          }
          
          userResults.pageResults.push({
            page: endpoint,
            status: response.status,
            responseTime: response.responseTime,
            success: response.status >= 200 && response.status < 400
          });
          
        } catch (error) {
          userResults.totalRequests++;
          userResults.failedRequests++;
          this.metrics.failedRequests++;
          
          userResults.pageResults.push({
            page: endpoint,
            status: 'ERROR',
            responseTime: error.responseTime || 0,
            success: false,
            error: error.error
          });
        }
      }
      
      userResults.endTime = Date.now();
      userResults.duration = userResults.endTime - userResults.startTime;
      userResults.averageResponseTime = userResults.totalResponseTime / userResults.totalRequests;
      userResults.successRate = (userResults.successfulRequests / userResults.totalRequests) * 100;
      
      this.metrics.totalRequests += userResults.totalRequests;
      this.metrics.completedUsers++;
      
      console.log(`✅ User ${user.id} completed: ${userResults.successfulRequests}/${userResults.totalRequests} successful (${Math.round(userResults.successRate)}%)`);
      
      this.testResults.push(userResults);
      
    } catch (error) {
      console.log(`❌ Error for user ${user.id}: ${error.message}`);
      this.metrics.failedRequests++;
    }
  }

  // Start the load test
  async start() {
    console.log('🚀 Starting 200-User Page Load Test for Locus');
    console.log('='.repeat(60));
    console.log(`📊 Target: 200 users testing main pages`);
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    const users = this.generateTestUsers();
    
    console.log(`👥 Generated ${users.length} test users`);
    console.log('');
    
    // First, test all available pages
    console.log('🔍 Testing available pages...');
    const pageResults = await this.testPages();
    
    console.log('');
    console.log('📊 Page Test Results:');
    pageResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.page}: ${result.status} (${result.responseTime}ms)`);
    });
    
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
    console.log(`📡 Total Requests: ${this.metrics.totalRequests.toLocaleString()}`);
    console.log(`✅ Successful Requests: ${this.metrics.successfulRequests.toLocaleString()}`);
    console.log(`❌ Failed Requests: ${this.metrics.failedRequests.toLocaleString()}`);
    
    if (this.metrics.totalRequests > 0) {
      const successRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
      console.log(`📊 Success Rate: ${Math.round(successRate * 100) / 100}%`);
    }
    
    if (this.testResults.length > 0) {
      const avgResponseTime = this.testResults.reduce((sum, result) => sum + result.averageResponseTime, 0) / this.testResults.length;
      console.log(`⚡ Avg Response Time: ${Math.round(avgResponseTime)}ms`);
    }
    console.log('');
  }

  // Generate final report
  generateReport() {
    console.log('📊 Test Report Generated');
    console.log('='.repeat(60));
    
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    const successRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 : 0;
    
    const report = {
      testInfo: {
        name: '200-User Page Load Test',
        totalUsers: this.metrics.totalUsers,
        duration: `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`,
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString()
      },
      results: {
        completedUsers: this.metrics.completedUsers,
        totalRequests: this.metrics.totalRequests,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        successRate: Math.round(successRate * 100) / 100
      },
      performance: {
        requestsPerSecond: Math.round(this.metrics.totalRequests / totalTime * 100) / 100,
        usersPerMinute: Math.round(this.metrics.completedUsers / (totalTime / 60) * 100) / 100
      }
    };
    
    console.log('📋 Test Summary:');
    console.log(`  Duration: ${report.testInfo.duration}`);
    console.log(`  Completed Users: ${report.results.completedUsers}/${report.testInfo.totalUsers}`);
    console.log(`  Total Requests: ${report.results.totalRequests.toLocaleString()}`);
    console.log(`  Success Rate: ${report.results.successRate}%`);
    console.log(`  Requests/Second: ${report.performance.requestsPerSecond}`);
    console.log(`  Users/Minute: ${report.performance.usersPerMinute}`);
    
    // Save report to file
    const reportFile = `page-test-report-${Date.now()}.json`;
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
    
    console.log('\n🎉 200-User Page Load Test Completed!');
  }
}

// Run the test
async function main() {
  const test = new PageLoadTest();
  
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
