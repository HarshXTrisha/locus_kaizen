const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
  baseUrl: 'http://localhost:3000',
  testPdfText: `This is a test PDF content about mathematics and science.

Key Concepts:
1. Mathematics: 2 + 2 = 4, 3 x 3 = 9
2. Science: The Earth orbits around the Sun
3. Geography: Paris is the capital of France
4. History: World War II ended in 1945

Important facts:
- The human body has 206 bones
- Water boils at 100 degrees Celsius
- The speed of light is 299,792,458 meters per second
- The Great Wall of China is over 13,000 miles long`,
  fileName: 'test-educational-content.pdf'
};

async function testPDFTool() {
  console.log('🧪 Testing PDF Tool Components...\n');

  try {
    // Test 1: Test PDF to Quiz API directly
    console.log('1️⃣ Testing PDF to Quiz API...');
    const pdfResponse = await fetch(`${testConfig.baseUrl}/api/pdf-to-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfText: testConfig.testPdfText,
        fileName: testConfig.fileName,
        questionCount: 3,
        includeExplanations: true
      })
    });

    if (pdfResponse.ok) {
      const result = await pdfResponse.json();
      console.log('✅ PDF to Quiz API working');
      console.log(`📊 Generated ${result.data?.questions?.length || 0} questions`);
      console.log(`🎯 Confidence: ${result.metadata?.confidence || 'N/A'}%`);
      console.log(`🔧 Method: ${result.metadata?.processingMethod || 'N/A'}`);
      
      if (result.data?.questions?.length > 0) {
        console.log('\n📝 Sample Question:');
        const sampleQuestion = result.data.questions[0];
        console.log(`Q: ${sampleQuestion.question}`);
        console.log(`Options: ${sampleQuestion.options.join(', ')}`);
        console.log(`Correct: ${sampleQuestion.correctAnswer}`);
        if (sampleQuestion.explanation) {
          console.log(`Explanation: ${sampleQuestion.explanation}`);
        }
      }
    } else {
      const error = await pdfResponse.text();
      console.log('❌ PDF to Quiz API failed:', error);
    }

    // Test 2: Check PDF converter page
    console.log('\n2️⃣ Testing PDF converter page...');
    const pageResponse = await fetch(`${testConfig.baseUrl}/pdf-converter`);
    if (pageResponse.ok) {
      console.log('✅ PDF converter page accessible');
    } else {
      console.log('❌ PDF converter page not accessible');
    }

    // Test 3: Check environment variables via test-admin
    console.log('\n3️⃣ Checking environment variables...');
    try {
      const envResponse = await fetch(`${testConfig.baseUrl}/api/test-admin`);
      if (envResponse.ok) {
        const envData = await envResponse.json();
        console.log('✅ Environment variables loaded');
        console.log(`🔑 OSS GPT API Key: ${envData.ossGptApiKey ? 'Configured' : 'Missing'}`);
        console.log(`🌐 Site URL: ${envData.siteUrl || 'Not set'}`);
      } else {
        console.log('⚠️ Could not verify environment variables via test-admin');
      }
    } catch (envError) {
      console.log('⚠️ Environment check skipped');
    }

    console.log('\n🎉 PDF Tool Testing Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPDFTool();
