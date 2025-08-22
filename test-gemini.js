require('dotenv').config({ path: '.env.local' });

// Test configuration
const testConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  geminiModel: process.env.GEMINI_MODEL || 'gemma-3-12b-it',
  testPrompt: 'Hello! Please respond with "OK" if you can hear me.',
  testQuizContent: `This is a test educational content about mathematics and science.

Key Concepts:
1. Mathematics: 2 + 2 = 4, 3 x 3 = 9
2. Science: The Earth orbits around the Sun
3. Geography: Paris is the capital of France
4. History: World War II ended in 1945

Important facts:
- The human body has 206 bones
- Water boils at 100 degrees Celsius
- The speed of light is 299,792,458 meters per second
- The Great Wall of China is over 13,000 miles long`
};

async function testGeminiConnection() {
  console.log('🤖 Testing Gemini AI Connection...');
  console.log('📋 Configuration:');
  console.log(`   API Key: ${testConfig.geminiApiKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   API URL: ${testConfig.geminiApiUrl}`);
  console.log(`   Model: ${testConfig.geminiModel}`);
  console.log('');

  if (!testConfig.geminiApiKey) {
    console.error('❌ Gemini API key not configured in .env.local');
    console.log('💡 Please add: GEMINI_API_KEY=your_gemini_api_key_here');
    return false;
  }

  try {
    console.log('🔄 Sending test request to Gemini...');
    
    const response = await fetch(`${testConfig.geminiApiUrl}/${testConfig.geminiModel}:generateContent?key=${testConfig.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: testConfig.testPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100,
          topP: 0.8,
          topK: 40
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Gemini API error: ${response.status}`);
      console.error(`   Error: ${errorData.error?.message || 'Unknown error'}`);
      return false;
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No response generated from Gemini');
      return false;
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log('✅ Gemini AI response received:');
    console.log(`   Response: "${content}"`);
    
    const isOK = content.toLowerCase().includes('ok');
    console.log(`   Test Result: ${isOK ? '✅ PASSED' : '❌ FAILED'}`);
    
    return isOK;

  } catch (error) {
    console.error('❌ Gemini connection test failed:', error.message);
    return false;
  }
}

async function testGeminiQuizGeneration() {
  console.log('\n📝 Testing Gemini Quiz Generation...');
  
  try {
    const prompt = `Convert this educational content into a quiz format. Generate exactly 3 multiple-choice questions.

Content:
${testConfig.testQuizContent}

Requirements:
1. Create EXACTLY 3 high-quality multiple-choice questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Use correctAnswer as 0-based index (0, 1, 2, 3)
4. Include explanations for correct answers
5. Ensure questions cover different aspects of the content
6. Make questions challenging but fair

Return ONLY this JSON structure:
{
  "title": "Quiz Title Based on Content",
  "description": "Brief description of what this quiz covers",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct..."
    }
  ]
}

JSON:`;

    console.log('🔄 Sending quiz generation request...');
    
    const response = await fetch(`${testConfig.geminiApiUrl}/${testConfig.geminiModel}:generateContent?key=${testConfig.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 40
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Quiz generation failed: ${response.status}`);
      console.error(`   Error: ${errorData.error?.message || 'Unknown error'}`);
      return false;
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No quiz generated from Gemini');
      return false;
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log('✅ Quiz generation response received:');
    console.log('📄 Raw Response:');
    console.log(content);
    console.log('');

    // Try to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const quiz = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON Parsing: SUCCESS');
        console.log(`   Title: ${quiz.title}`);
        console.log(`   Questions: ${quiz.questions?.length || 0}`);
        console.log(`   Format: ${quiz.questions?.[0]?.options?.length === 4 ? '✅ Valid' : '❌ Invalid'}`);
        return true;
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError.message);
        return false;
      }
    } else {
      console.error('❌ No JSON found in response');
      return false;
    }

  } catch (error) {
    console.error('❌ Quiz generation test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Gemini AI Tests...');
  console.log('=====================================');
  
  // Test 1: Basic Connection
  const connectionTest = await testGeminiConnection();
  
  // Test 2: Quiz Generation
  const quizTest = await testGeminiQuizGeneration();
  
  console.log('\n=====================================');
  console.log('📊 Test Results Summary:');
  console.log(`   Connection Test: ${connectionTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Quiz Generation: ${quizTest ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (connectionTest && quizTest) {
    console.log('\n🎉 All tests passed! Gemini AI is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your configuration.');
  }
}

// Run the tests
main().catch(console.error);
