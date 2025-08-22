require('dotenv').config({ path: '.env.local' });

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  apiEndpoints: {
    chat: '/api/chat',
    pdfToQuiz: '/api/pdf-to-quiz',
    health: '/api/health'
  }
};

// Test utilities
const testUtils = {
  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${config.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return { status: response.status, data, success: response.ok };
    } catch (error) {
      return { status: 0, data: null, success: false, error: error.message };
    }
  },

  logTest(name, result) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    if (!result.success) {
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.error || result.data?.error || 'Unknown error'}`);
    }
    console.log('');
  }
};

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing Health Check...');
  const result = await testUtils.makeRequest(config.apiEndpoints.health);
  testUtils.logTest('Health Check', result);
  return result.success;
}

async function testChatAPI() {
  console.log('🤖 Testing Chat API...');
  
  // Test 1: Basic chat with OSS GPT
  console.log('   Testing OSS GPT chat...');
  const ossGptResult = await testUtils.makeRequest(config.apiEndpoints.chat, 'POST', {
    message: 'Hello! Please respond with "OK" if you can hear me.',
    model: 'oss-gpt'
  });
  testUtils.logTest('OSS GPT Chat', ossGptResult);

  // Test 2: Basic chat with Gemini
  console.log('   Testing Gemini chat...');
  const geminiResult = await testUtils.makeRequest(config.apiEndpoints.chat, 'POST', {
    message: 'Hello! Please respond with "OK" if you can hear me.',
    model: 'gemini'
  });
  testUtils.logTest('Gemini Chat', geminiResult);

  // Test 3: Auto model selection
  console.log('   Testing auto model selection...');
  const autoResult = await testUtils.makeRequest(config.apiEndpoints.chat, 'POST', {
    message: 'Hello! Please respond with "OK" if you can hear me.',
    model: 'auto'
  });
  testUtils.logTest('Auto Model Selection', autoResult);

  // Test 4: Chat with file metadata
  console.log('   Testing chat with file metadata...');
  const fileResult = await testUtils.makeRequest(config.apiEndpoints.chat, 'POST', {
    message: 'Please analyze this file.',
    model: 'gemini',
    files: [
      { name: 'test.pdf', type: 'application/pdf', size: 1024 }
    ]
  });
  testUtils.logTest('Chat with Files', fileResult);

  return ossGptResult.success && geminiResult.success && autoResult.success && fileResult.success;
}

async function testPDFToQuizAPI() {
  console.log('📄 Testing PDF to Quiz API...');
  
  // Test 1: GET endpoint (should return available models)
  console.log('   Testing GET endpoint...');
  const getResult = await testUtils.makeRequest(config.apiEndpoints.pdfToQuiz);
  testUtils.logTest('PDF to Quiz GET', getResult);

  // Test 2: POST endpoint with sample data
  console.log('   Testing POST endpoint...');
  const postResult = await testUtils.makeRequest(config.apiEndpoints.pdfToQuiz, 'POST', {
    fileName: 'test.pdf',
    pdfText: 'This is a test question. What is 2+2? A) 3 B) 4 C) 5 D) 6',
    questionCount: 1,
    includeExplanations: true,
    aiModel: 'gemini'
  });
  testUtils.logTest('PDF to Quiz POST', postResult);

  return getResult.success && postResult.success;
}

async function testEnvironmentVariables() {
  console.log('🔧 Testing Environment Variables...');
  
  const requiredVars = [
    'OPENROUTER_API_KEY',
    'GEMINI_API_KEY',
    'HF_TOKEN'
  ];

  const results = {};
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const hasValue = value && value.trim() !== '';
    results[varName] = hasValue;
    
    const status = hasValue ? '✅' : '❌';
    console.log(`${status} ${varName}: ${hasValue ? 'Configured' : 'Missing'}`);
  }

  console.log('');
  return Object.values(results).every(Boolean);
}

async function testModelConfigurations() {
  console.log('🤖 Testing Model Configurations...');
  
  // Test OSS GPT configuration
  const ossGptKey = process.env.OPENROUTER_API_KEY;
  const ossGptUrl = process.env.OSS_GPT_API_URL || 'https://openrouter.ai/api/v1';
  const ossGptModel = process.env.OSS_GPT_MODEL || 'openai/gpt-oss-20b:free';
  
  console.log(`   OSS GPT API Key: ${ossGptKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   OSS GPT API URL: ${ossGptUrl}`);
  console.log(`   OSS GPT Model: ${ossGptModel}`);

  // Test Gemini configuration
  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemma-3-12b-it';
  
  console.log(`   Gemini API Key: ${geminiKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Gemini Model: ${geminiModel}`);

  // Test Hugging Face configuration
  const hfToken = process.env.HF_TOKEN;
  
  console.log(`   Hugging Face Token: ${hfToken ? '✅ Configured' : '❌ Missing'}`);

  console.log('');
  return !!(ossGptKey && geminiKey && hfToken);
}

async function testDirectModelConnections() {
  console.log('🔗 Testing Direct Model Connections...');
  
  // Test OSS GPT connection
  if (process.env.OPENROUTER_API_KEY) {
    console.log('   Testing OSS GPT connection...');
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'QuestAI',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b:free',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });
      
      if (response.ok) {
        console.log('   ✅ OSS GPT connection successful');
      } else {
        const error = await response.json();
        console.log(`   ❌ OSS GPT connection failed: ${response.status} - ${error.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ OSS GPT connection error: ${error.message}`);
    }
  }

  // Test Gemini connection
  if (process.env.GEMINI_API_KEY) {
    console.log('   Testing Gemini connection...');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-12b-it:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });
      
      if (response.ok) {
        console.log('   ✅ Gemini connection successful');
      } else {
        const error = await response.json();
        console.log(`   ❌ Gemini connection failed: ${response.status} - ${error.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Gemini connection error: ${error.message}`);
    }
  }

  console.log('');
}

async function main() {
  console.log('🚀 Starting Comprehensive Debug Test...');
  console.log('=====================================');
  console.log('');

  // Test 1: Environment Variables
  const envTest = await testEnvironmentVariables();
  
  // Test 2: Model Configurations
  const configTest = await testModelConfigurations();
  
  // Test 3: Direct Model Connections
  await testDirectModelConnections();
  
  // Test 4: Health Check
  const healthTest = await testHealthCheck();
  
  // Test 5: Chat API
  const chatTest = await testChatAPI();
  
  // Test 6: PDF to Quiz API
  const pdfTest = await testPDFToQuizAPI();

  // Summary
  console.log('=====================================');
  console.log('📊 Debug Test Summary:');
  console.log(`   Environment Variables: ${envTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Model Configurations: ${configTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Health Check: ${healthTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Chat API: ${chatTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   PDF to Quiz API: ${pdfTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  const allTestsPassed = envTest && configTest && healthTest && chatTest && pdfTest;
  
  if (allTestsPassed) {
    console.log('🎉 All tests passed! The system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }

  console.log('');
  console.log('💡 Next Steps:');
  console.log('   1. Check the browser at http://localhost:3000/pdf-converter');
  console.log('   2. Test the chatbot functionality');
  console.log('   3. Test PDF upload and conversion');
  console.log('   4. Verify model selection works');
}

// Run the debug tests
main().catch(console.error);
