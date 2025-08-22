/**
 * Terminal Chat with OSS GPT 20B
 * Run with: node chat-with-oss-gpt.js
 */

const readline = require('readline');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const OSS_GPT_API_KEY = process.env.OPENROUTER_API_KEY;
const OSS_GPT_API_URL = process.env.OSS_GPT_API_URL || 'https://openrouter.ai/api/v1';
const OSS_GPT_MODEL = process.env.OSS_GPT_MODEL || 'openai/gpt-oss-20b:free';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.SITE_NAME || 'QuestAI';

if (!OSS_GPT_API_KEY) {
  console.error('❌ OSS GPT API key not found. Please check your .env.local file.');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function chatWithOSSGPT(message) {
  try {
    console.log('🤖 Thinking...');
    
    const response = await fetch(`${OSS_GPT_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OSS_GPT_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
      },
      body: JSON.stringify({
        model: OSS_GPT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('No response generated');
    }

    return reply;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

function askQuestion() {
  rl.question('\n💬 You: ', async (input) => {
    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      return;
    }

    if (input.trim() === '') {
      askQuestion();
      return;
    }

    const reply = await chatWithOSSGPT(input);
    console.log(`\n🤖 OSS GPT 20B: ${reply}`);
    
    askQuestion();
  });
}

// Main chat loop
console.log('🚀 Welcome to OSS GPT 20B Chat!');
console.log('📝 Type your message and press Enter to chat.');
console.log('❌ Type "quit" or "exit" to end the chat.\n');
console.log('🔧 Configuration:');
console.log(`   Model: ${OSS_GPT_MODEL}`);
console.log(`   API: ${OSS_GPT_API_URL}`);
console.log(`   Site: ${SITE_NAME}\n`);

askQuestion();
