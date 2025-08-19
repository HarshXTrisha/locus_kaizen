#!/usr/bin/env node

// Simple Test Runner for 200-User Load Test
// This script makes it easy to start and monitor the test

const { spawn } = require('child_process');
const TestMonitor = require('./test-monitor');

console.log('🎯 QuestAI 200-User Load Test Runner');
console.log('='.repeat(50));

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  testDuration: '18m', // 18 minutes total test
  rampUpTime: '6m',    // 6 minutes to reach 200 users
  steadyState: '10m',  // 10 minutes at 200 users
  rampDown: '2m'       // 2 minutes to ramp down
};

console.log('📋 Test Configuration:');
console.log(`  Target Users: 200`);
console.log(`  Questions per User: 100`);
console.log(`  Total Questions: 20,000`);
console.log(`  Base URL: ${config.baseUrl}`);
console.log(`  Test Duration: ${config.testDuration}`);
console.log(`  Ramp Up: ${config.rampUpTime}`);
console.log(`  Steady State: ${config.steadyState}`);
console.log(`  Ramp Down: ${config.rampDown}`);
console.log('');

// Check if development server is running
async function checkServer() {
  const http = require('http');
  
  return new Promise((resolve) => {
    const req = http.get(config.baseUrl, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Development server is running');
        resolve(true);
      } else {
        console.log('⚠️ Server responded with status:', res.statusCode);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('❌ Development server is not running');
      console.log('Please start the server with: npm run dev');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('❌ Server connection timeout');
      resolve(false);
    });
  });
}

// Start the test
async function startTest() {
  console.log('🚀 Starting 200-User Load Test...');
  console.log('');
  
  // Start the test monitor
  const monitor = new TestMonitor(config.baseUrl);
  monitor.start();
  
  // Start the K6 test
  const k6Process = spawn('k6', [
    'run',
    '200-user-test.js',
    '--env', `BASE_URL=${config.baseUrl}`,
    '--out', 'json=test-results.json',
    '--out', 'influxdb=http://localhost:8086/locus_test'
  ], {
    stdio: 'pipe',
    shell: true
  });
  
  // Handle K6 output
  k6Process.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📊 K6:', output.trim());
    
    // Parse K6 metrics and update monitor
    if (output.includes('http_req_duration')) {
      const match = output.match(/avg=(\d+\.\d+)ms/);
      if (match) {
        const avgTime = parseFloat(match[1]);
        monitor.metrics.averageResponseTime = Math.round(avgTime);
      }
    }
  });
  
  k6Process.stderr.on('data', (data) => {
    console.log('⚠️ K6 Error:', data.toString().trim());
  });
  
  // Handle test completion
  k6Process.on('close', (code) => {
    console.log(`\n🎉 K6 test completed with code: ${code}`);
    monitor.stop();
    
    if (code === 0) {
      console.log('✅ Test completed successfully!');
    } else {
      console.log('❌ Test completed with errors');
    }
    
    process.exit(code);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping test...');
    k6Process.kill('SIGINT');
    monitor.stop();
    process.exit(0);
  });
}

// Main execution
async function main() {
  try {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
      console.log('\n❌ Please start the development server first:');
      console.log('   npm run dev');
      console.log('\nThen run this test again.');
      process.exit(1);
    }
    
    console.log('⏳ Starting test in 5 seconds...');
    console.log('Press Ctrl+C to stop the test');
    console.log('');
    
    setTimeout(startTest, 5000);
    
  } catch (error) {
    console.error('❌ Error starting test:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
