// Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDK0NLMysqFRE_S2xhuVDa1aA6YnPIYutI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "locus-8b4e8.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "locus-8b4e8",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "locus-8b4e8.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "5682995815",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:5682995815:web:eb32cee9007c4674e2aac2",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GXSXV4NNE8"
};

// Google OAuth Configuration
export const googleConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com",
  scopes: ['email', 'profile'],
  prompt: 'select_account'
};

// Microsoft OAuth Configuration
export const microsoftConfig = {
  clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "",
  scopes: ['email', 'profile', 'openid'],
  prompt: 'select_account'
};

// AI Model Configuration
export const aiConfig = {
  // Hugging Face Configuration (legacy)
  hfToken: process.env.HF_TOKEN,
  hfApiUrl: 'https://api-inference.huggingface.co/models/facebook/bart-base',
  
  // OSS GPT 20B Configuration (OpenRouter)
  ossGptApiKey: process.env.OPENROUTER_API_KEY,
  ossGptApiUrl: process.env.OSS_GPT_API_URL || 'https://openrouter.ai/api/v1',
  ossGptModel: process.env.OSS_GPT_MODEL || 'openai/gpt-oss-20b:free',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
  siteName: process.env.SITE_NAME || 'QuestAI',
  
  // Gemini Configuration
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  geminiModel: process.env.GEMINI_MODEL || 'gemma-3-12b-it',
  
  // Default to OSS GPT if available, otherwise fallback to Hugging Face
  preferredModel: process.env.PREFERRED_AI_MODEL || 'oss-gpt',
  
  // Available AI Models
  availableModels: [
    {
      id: 'oss-gpt',
      name: 'OSS GPT 20B',
      description: 'Powerful 20B parameter model via OpenRouter',
      provider: 'OpenRouter',
      maxTokens: 4000,
      features: ['High accuracy', 'Fast processing', 'Educational content']
    },
    {
      id: 'gemini',
      name: 'Gemini (Gemma 3 12B)',
      description: 'Google\'s advanced language model',
      provider: 'Google',
      maxTokens: 8000,
      features: ['Multimodal', 'High quality', 'Google\'s latest']
    },
    {
      id: 'huggingface',
      name: 'Hugging Face (Fallback)',
      description: 'Reliable fallback option',
      provider: 'Hugging Face',
      maxTokens: 1000,
      features: ['Always available', 'Basic processing']
    }
  ]
};

// App Configuration
export const appConfig = {
  name: 'QuestAI',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
};

// Validate configuration
export const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing Firebase configuration fields:', missingFields);
    return false;
  }

  console.log('✅ Firebase configuration validated');
  return true;
};

// Validate AI configuration
export const validateAIConfig = () => {
  const availableModels = [];
  
  // Check OSS GPT configuration
  if (aiConfig.ossGptApiKey) {
    availableModels.push('OSS GPT');
  }
  
  // Check Gemini configuration
  if (aiConfig.geminiApiKey) {
    availableModels.push('Gemini');
  }
  
  // Check Hugging Face configuration
  if (aiConfig.hfToken) {
    availableModels.push('Hugging Face');
  }
  
  if (availableModels.length === 0) {
    console.error('❌ No AI models configured. Please configure at least one AI service.');
    return false;
  }
  
  console.log(`✅ AI configuration validated. Available models: ${availableModels.join(', ')}`);
  return true;
};
