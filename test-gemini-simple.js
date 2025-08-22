require('dotenv').config({ path: '.env.local' });

// Configuration
const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  geminiModel: process.env.GEMINI_MODEL || 'gemma-3-12b-it',
};

async function testGemini() {
  console.log('🔍 Testing Gemini API...');
  console.log(`API Key: ${config.geminiApiKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`Model: ${config.geminiModel}`);
  console.log(`API URL: ${config.geminiApiUrl}`);
  console.log('');

  if (!config.geminiApiKey) {
    console.error('❌ Gemini API key not configured');
    return;
  }

  try {
    // Test 1: Simple text generation
    console.log('🧪 Test 1: Simple text generation...');
    
    const response = await fetch(`${config.geminiApiUrl}/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello! Please respond with 'OK' if you can hear me."
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

    console.log(`Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error: ${response.status}`);
      console.error(`Error Details:`, errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ Response received:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGemini().catch(console.error);
