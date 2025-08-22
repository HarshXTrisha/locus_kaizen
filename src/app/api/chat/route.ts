import { NextRequest, NextResponse } from 'next/server';
import { OSSGPTPDFProcessor } from '@/lib/oss-gpt-pdf-processor';
import { GeminiService } from '@/lib/gemini-service';
import { aiConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model, files } = body;

    if (!message && (!files || files.length === 0)) {
      return NextResponse.json(
        { error: 'Message or files are required' },
        { status: 400 }
      );
    }

    // Determine which model to use
    let selectedModel = model || 'auto';
    if (selectedModel === 'auto') {
      // Auto-select based on content type, prefer Gemini due to OSS GPT rate limits
      if (files && files.length > 0) {
        selectedModel = 'gemini'; // Gemini is better for file processing
      } else {
        selectedModel = 'gemini'; // Prefer Gemini for text conversations due to rate limits
      }
    }

    console.log('🤖 Chat request received:', {
      messageLength: message?.length || 0,
      filesCount: files?.length || 0,
      selectedModel
    });

    let response: string;

    // Process based on selected model with better error handling
    try {
      switch (selectedModel) {
        case 'oss-gpt':
          if (!aiConfig.ossGptApiKey) {
            throw new Error('OSS GPT API key not configured in production environment');
          }
          response = await processWithOSSGPT(message, files);
          break;
        
        case 'gemini':
          if (!aiConfig.geminiApiKey) {
            throw new Error('Gemini API key not configured in production environment');
          }
          response = await processWithGemini(message, files);
          break;
        
        case 'huggingface':
          if (!aiConfig.hfToken) {
            throw new Error('Hugging Face token not configured in production environment');
          }
          response = await processWithHuggingFace(message, files);
          break;
        
        default:
          // Try available models in order of preference
          let lastError = null;
          
          // Try Gemini first (most reliable)
          if (aiConfig.geminiApiKey) {
            try {
              response = await processWithGemini(message, files);
              break;
            } catch (error) {
              lastError = error;
              console.log('Gemini failed, trying OSS GPT...');
            }
          }
          
          // Try OSS GPT
          if (aiConfig.ossGptApiKey) {
            try {
              response = await processWithOSSGPT(message, files);
              break;
            } catch (error) {
              lastError = error;
              console.log('OSS GPT failed, trying Hugging Face...');
            }
          }
          
          // Try Hugging Face
          if (aiConfig.hfToken) {
            try {
              response = await processWithHuggingFace(message, files);
              break;
            } catch (error) {
              lastError = error;
            }
          }
          
          // If all models failed, throw the last error
          if (lastError) {
            throw lastError;
          } else {
            throw new Error('No AI models are currently available. Please check your API key configuration.');
          }
      }
    } catch (error) {
      console.error('Model processing failed:', error);
      // Provide a helpful fallback response
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response = `I apologize, but I'm currently experiencing technical difficulties. Please try again in a moment or switch to a different AI model. Error: ${errorMessage}`;
    }

    return NextResponse.json({
      response,
      model: selectedModel,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

async function processWithOSSGPT(message: string, files?: any[]): Promise<string> {
  if (!aiConfig.ossGptApiKey) {
    throw new Error('OSS GPT API key not configured');
  }

  // If files are provided, process them for content extraction
  let contentToProcess = message;
  
  if (files && files.length > 0) {
    // For now, we'll add file information to the message
    // In a full implementation, you'd process the actual files
    const fileInfo = files.map(f => `${f.name} (${f.type})`).join(', ');
    contentToProcess = `${message}\n\nAttached files: ${fileInfo}`;
  }

  const prompt = `You are a helpful AI assistant. Please respond to the following message in a conversational and helpful manner:

${contentToProcess}

Please provide a clear, informative, and engaging response.`;

  const response = await fetch(`${aiConfig.ossGptApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiConfig.ossGptApiKey}`,
      'HTTP-Referer': aiConfig.siteUrl,
      'X-Title': aiConfig.siteName,
    },
    body: JSON.stringify({
      model: aiConfig.ossGptModel,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || 'Unknown error';
    
    // Handle rate limit specifically
    if (response.status === 429) {
      throw new Error(`OSS GPT rate limit exceeded. Please try again later or switch to a different model. ${errorMessage}`);
    }
    
    throw new Error(`OSS GPT API error: ${response.status} - ${errorMessage}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated';
}

async function processWithGemini(message: string, files?: any[]): Promise<string> {
  if (!aiConfig.geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  // If files are provided, process them for content extraction
  let contentToProcess = message;
  
  if (files && files.length > 0) {
    const fileInfo = files.map(f => `${f.name} (${f.type})`).join(', ');
    contentToProcess = `${message}\n\nAttached files: ${fileInfo}`;
  }

  const prompt = `You are a helpful AI assistant. Please respond to the following message in a conversational and helpful manner:

${contentToProcess}

Please provide a clear, informative, and engaging response.`;

  const geminiResponse = await GeminiService.sendRequest(prompt, {
    temperature: 0.7,
    maxTokens: 1000
  });

  if (!geminiResponse.success) {
    throw new Error(`Gemini API error: ${geminiResponse.error}`);
  }

  return geminiResponse.content;
}

async function processWithHuggingFace(message: string, files?: any[]): Promise<string> {
  if (!aiConfig.hfToken) {
    throw new Error('Hugging Face token not configured');
  }

  // If files are provided, process them for content extraction
  let contentToProcess = message;
  
  if (files && files.length > 0) {
    const fileInfo = files.map(f => `${f.name} (${f.type})`).join(', ');
    contentToProcess = `${message}\n\nAttached files: ${fileInfo}`;
  }

  const prompt = `You are a helpful AI assistant. Please respond to the following message in a conversational and helpful manner:

${contentToProcess}

Please provide a clear, informative, and engaging response.`;

  const response = await fetch(aiConfig.hfApiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${aiConfig.hfToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_length: 500,
        temperature: 0.7,
        do_sample: true,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }

  const data = await response.json();
  return data[0]?.generated_text || 'No response generated';
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat API is running',
    availableModels: aiConfig.availableModels,
    timestamp: new Date().toISOString()
  });
}
