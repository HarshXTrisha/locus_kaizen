/**
 * Test script for OSS GPT 20B integration
 * Run with: node test-oss-gpt.js
 */

const testOSSGPT = async () => {
  console.log('🧪 Testing OSS GPT 20B Integration...\n');

  const baseUrl = 'http://localhost:3000';
  const testAnswers = 'Marketing: wrong, Finance: correct, HR: wrong, Operations: correct';

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${baseUrl}/api/analyze`);
    const healthData = await healthResponse.json();
    
    console.log('✅ Health Check Response:', JSON.stringify(healthData, null, 2));
    
    if (healthData.preferredModel === 'oss-gpt') {
      console.log('✅ OSS GPT is configured as preferred model');
    } else {
      console.log('⚠️  OSS GPT is not the preferred model');
    }

    // Test 2: Quiz Analysis
    console.log('\n2️⃣ Testing Quiz Analysis...');
    const analysisResponse = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-oss-gpt'
      },
      body: JSON.stringify({ answers: testAnswers })
    });

    const analysisData = await analysisResponse.json();
    
    if (analysisResponse.ok) {
      console.log('✅ Analysis Response:', JSON.stringify(analysisData, null, 2));
      
      // Validate response structure
      if (analysisData.data && 
          analysisData.data.weak_topics && 
          analysisData.data.strong_topics && 
          typeof analysisData.data.score === 'number' && 
          analysisData.data.recommendation) {
        console.log('✅ Response structure is valid');
      } else {
        console.log('❌ Response structure is invalid');
      }
    } else {
      console.log('❌ Analysis failed:', analysisData);
    }

    // Test 3: Error Handling
    console.log('\n3️⃣ Testing Error Handling...');
    const errorResponse = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-error'
      },
      body: JSON.stringify({ answers: 'invalid format' })
    });

    const errorData = await errorResponse.json();
    console.log('✅ Error Response:', JSON.stringify(errorData, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testOSSGPT().then(() => {
  console.log('\n🎉 OSS GPT 20B Integration Test Complete!');
}).catch((error) => {
  console.error('💥 Test failed:', error);
});
