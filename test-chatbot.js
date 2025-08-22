require('dotenv').config({ path: '.env.local' });

async function testChatbot() {
  console.log('🤖 Testing Chatbot Functionality...');
  
  try {
    // Test 1: Check if server is running
    console.log('   Testing server connection...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    if (healthResponse.ok) {
      console.log('   ✅ Server is running');
    } else {
      console.log('   ❌ Server is not responding');
      return;
    }

    // Test 2: Test chat API with Gemini
    console.log('   Testing chat API with Gemini...');
    const chatResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! Please respond with "OK" if you can hear me.',
        model: 'gemini'
      })
    });

    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log('   ✅ Chat API working');
      console.log(`   Response: ${data.response.substring(0, 100)}...`);
    } else {
      const errorData = await chatResponse.json();
      console.log(`   ❌ Chat API failed: ${chatResponse.status} - ${errorData.error || 'Unknown error'}`);
    }

    // Test 3: Test chat API with auto selection
    console.log('   Testing chat API with auto selection...');
    const autoResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! Please respond with "OK" if you can hear me.',
        model: 'auto'
      })
    });

    if (autoResponse.ok) {
      const data = await autoResponse.json();
      console.log('   ✅ Auto selection working');
      console.log(`   Selected model: ${data.model}`);
    } else {
      const errorData = await autoResponse.json();
      console.log(`   ❌ Auto selection failed: ${autoResponse.status} - ${errorData.error || 'Unknown error'}`);
    }

    // Test 4: Check environment variables
    console.log('   Checking environment variables...');
    const requiredVars = ['GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'HF_TOKEN'];
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value && value.trim() !== '') {
        console.log(`   ✅ ${varName}: Configured`);
      } else {
        console.log(`   ❌ ${varName}: Missing`);
      }
    }

  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

testChatbot().catch(console.error);
