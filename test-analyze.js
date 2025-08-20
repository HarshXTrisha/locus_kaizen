/**
 * Test script for Quiz Analysis API
 * Tests the Hugging Face integration with sample quiz answers
 */

const BASE_URL = 'http://localhost:3000';

// Sample quiz answers for testing
const testCases = [
  {
    name: "Mixed Performance",
    answers: "Marketing: wrong, Finance: correct, HR: wrong, Operations: correct, Sales: correct"
  },
  {
    name: "Poor Performance", 
    answers: "Marketing: wrong, Finance: wrong, HR: wrong, Operations: wrong, Sales: wrong"
  },
  {
    name: "Excellent Performance",
    answers: "Marketing: correct, Finance: correct, HR: correct, Operations: correct, Sales: correct"
  },
  {
    name: "Business Topics",
    answers: "Management: correct, Accounting: wrong, Economics: correct, Strategy: wrong, Leadership: correct"
  }
];

/**
 * Test the analyze API endpoint
 */
async function testAnalyzeAPI() {
  console.log('🧪 Starting Quiz Analysis API Tests...\n');

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`Input: ${testCase.answers}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-123' // For rate limiting
        },
        body: JSON.stringify({
          answers: testCase.answers
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Success!');
        console.log('📊 Analysis Results:');
        console.log(`   Weak Topics: ${data.data.weak_topics.join(', ')}`);
        console.log(`   Strong Topics: ${data.data.strong_topics.join(', ')}`);
        console.log(`   Score: ${data.data.score}%`);
        console.log(`   Recommendation: ${data.data.recommendation}`);
      } else {
        console.log('❌ Error:', data.error);
        console.log('Message:', data.message);
      }
    } catch (error) {
      console.log('❌ Network Error:', error.message);
    }
    
    console.log('─'.repeat(50));
  }
}

/**
 * Test the health check endpoint
 */
async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/analyze`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health Check Passed!');
      console.log('Service:', data.service);
      console.log('Model:', data.model);
      console.log('Rate Limit:', data.rateLimit);
    } else {
      console.log('❌ Health Check Failed:', data);
    }
  } catch (error) {
    console.log('❌ Health Check Error:', error.message);
  }
}

/**
 * Test rate limiting
 */
async function testRateLimit() {
  console.log('\n🚦 Testing Rate Limiting...');
  
  const promises = [];
  
  // Make 30 requests (exceeds the 25 per hour limit)
  for (let i = 0; i < 30; i++) {
    promises.push(
      fetch(`${BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'rate-limit-test'
        },
        body: JSON.stringify({
          answers: "Test: correct"
        })
      }).then(async (response) => {
        const data = await response.json();
        return { status: response.status, data };
      })
    );
  }
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r.status === 200).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  
  console.log(`✅ Successful requests: ${successful}`);
  console.log(`🚫 Rate limited requests: ${rateLimited}`);
  console.log(`📊 Total requests: ${results.length}`);
}

// Run tests
async function runTests() {
  console.log('🚀 Quiz Analysis API Test Suite\n');
  
  // Test health check first
  await testHealthCheck();
  
  // Test main functionality
  await testAnalyzeAPI();
  
  // Test rate limiting
  await testRateLimit();
  
  console.log('\n✨ Test suite completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAnalyzeAPI, testHealthCheck, testRateLimit };
