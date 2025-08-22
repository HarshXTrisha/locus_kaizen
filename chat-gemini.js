require('dotenv').config({ path: '.env.local' });
const readline = require('readline');

// Configuration
const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  geminiModel: process.env.GEMINI_MODEL || 'gemma-3-12b-it',
  maxTokens: 4000,
  temperature: 0.7
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Chat history
let chatHistory = [];

async function sendMessage(message) {
  try {
    // Add user message to history
    chatHistory.push({ role: 'user', content: message });
    
    // For gemma-3-12b-it, we send just the current message
    // This model doesn't support conversation history in the same way
    const contents = [{
      parts: [{ text: message }]
    }];

    console.log('🤖 Thinking...');
    
    const response = await fetch(`${config.geminiApiUrl}/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
          topP: 0.8,
          topK: 40
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Add AI response to history
    chatHistory.push({ role: 'assistant', content: aiResponse });
    
    return aiResponse;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

function displayWelcome() {
  console.clear();
  console.log('🤖 Welcome to Gemini AI Chat!');
  console.log('=====================================');
  console.log(`Model: ${config.geminiModel}`);
  console.log(`Temperature: ${config.temperature}`);
  console.log(`Max Tokens: ${config.maxTokens}`);
  console.log('');
  console.log('💡 Commands:');
  console.log('   /clear - Clear chat history');
  console.log('   /help - Show this help');
  console.log('   /exit or /quit - Exit chat');
  console.log('   /temp <value> - Set temperature (0.0-1.0)');
  console.log('   /tokens <value> - Set max tokens');
  console.log('');
  console.log('Start chatting with Gemini AI! 🚀');
  console.log('=====================================');
  console.log('');
}

function displayHelp() {
  console.log('');
  console.log('📖 Available Commands:');
  console.log('   /clear - Clear chat history');
  console.log('   /help - Show this help');
  console.log('   /exit or /quit - Exit chat');
  console.log('   /temp <value> - Set temperature (0.0-1.0)');
  console.log('   /tokens <value> - Set max tokens');
  console.log('   /history - Show chat history');
  console.log('');
}

function displayHistory() {
  console.log('');
  console.log('📜 Chat History:');
  console.log('================');
  chatHistory.forEach((msg, index) => {
    const role = msg.role === 'user' ? '👤 You' : '🤖 Gemini';
    const content = msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content;
    console.log(`${index + 1}. ${role}: ${content}`);
  });
  console.log('');
}

function processCommand(input) {
  const parts = input.split(' ');
  const command = parts[0].toLowerCase();

  switch (command) {
    case '/clear':
      chatHistory = [];
      console.log('✅ Chat history cleared!');
      return true;

    case '/help':
      displayHelp();
      return true;

    case '/exit':
    case '/quit':
      console.log('👋 Goodbye! Thanks for chatting with Gemini AI!');
      rl.close();
      return true;

    case '/temp':
      const temp = parseFloat(parts[1]);
      if (isNaN(temp) || temp < 0 || temp > 1) {
        console.log('❌ Temperature must be between 0.0 and 1.0');
      } else {
        config.temperature = temp;
        console.log(`✅ Temperature set to ${temp}`);
      }
      return true;

    case '/tokens':
      const tokens = parseInt(parts[1]);
      if (isNaN(tokens) || tokens < 1) {
        console.log('❌ Max tokens must be a positive number');
      } else {
        config.maxTokens = tokens;
        console.log(`✅ Max tokens set to ${tokens}`);
      }
      return true;

    case '/history':
      displayHistory();
      return true;

    default:
      return false; // Not a command, treat as message
  }
}

async function startChat() {
  if (!config.geminiApiKey) {
    console.error('❌ Gemini API key not configured in .env.local');
    console.log('💡 Please add: GEMINI_API_KEY=your_gemini_api_key_here');
    return;
  }

  displayWelcome();

  const askQuestion = () => {
    rl.question('👤 You: ', async (input) => {
      if (!input.trim()) {
        askQuestion();
        return;
      }

      // Check if it's a command
      if (input.startsWith('/')) {
        const isCommand = processCommand(input);
        if (isCommand) {
          askQuestion();
          return;
        }
      }

      // Send message to Gemini
      const response = await sendMessage(input);
      
      if (response) {
        console.log('🤖 Gemini:', response);
        console.log('');
      }

      askQuestion();
    });
  };

  askQuestion();
}

// Handle graceful exit
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye! Thanks for chatting with Gemini AI!');
  rl.close();
  process.exit(0);
});

// Start the chat
startChat().catch(console.error);
