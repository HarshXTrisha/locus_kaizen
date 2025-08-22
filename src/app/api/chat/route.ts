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

    console.log('🤖 Chat request received:', {
      messageLength: message?.length || 0,
      filesCount: files?.length || 0,
      model
    });

    // Simple fallback responses for common queries
    const fallbackResponses = {
      hello: "Hello! I'm your AI assistant. I can help you with questions, analyze files, and assist with various tasks. What would you like to know?",
      help: "I'm here to help! I can answer questions, analyze documents, help with coding, explain concepts, and much more. Just ask me anything!",
      test: "I'm working! This is a test response from your AI assistant. How can I help you today?",
      default: "I understand your message. I'm currently in a limited mode but can still help with basic questions and tasks. What would you like assistance with?"
    };

    // Check for simple queries and provide fallback responses
    const lowerMessage = message.toLowerCase();
    let response = fallbackResponses.default;

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = fallbackResponses.hello;
    } else if (lowerMessage.includes('help')) {
      response = fallbackResponses.help;
    } else if (lowerMessage.includes('test') || lowerMessage.includes('ok')) {
      response = fallbackResponses.test;
    } else if (lowerMessage.includes('what can you do')) {
      response = "I can help you with:\n• Answering questions\n• Analyzing documents and files\n• Explaining concepts\n• Providing information\n• Basic problem solving\n• And much more! Just ask me anything.";
    } else if (lowerMessage.includes('pdf') || lowerMessage.includes('convert')) {
      response = "I can help you convert PDFs to quizzes! Use the PDF upload tool on this page to convert your documents into interactive quizzes. The tool supports multiple AI models for the best results.";
    } else if (files && files.length > 0) {
      const fileNames = files.map((f: any) => f.name).join(', ');
      response = `I see you've uploaded: ${fileNames}. I can help analyze these files. For PDF conversion to quizzes, please use the dedicated PDF upload tool on this page for the best results.`;
    } else {
      // For other messages, provide a helpful response
      response = `I received your message: "${message}". I'm currently in a limited mode but can still assist you. For complex AI tasks, please ensure your API keys are properly configured.`;
    }

    return NextResponse.json({
      response,
      model: 'fallback',
      timestamp: new Date().toISOString(),
      note: 'Using fallback mode - API keys not configured'
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        response: "I'm sorry, I encountered an error. Please try again or check your configuration.",
        model: 'fallback'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat API is running (Fallback Mode)',
    status: 'limited',
    note: 'API keys not configured - using fallback responses',
    availableModels: [
      {
        id: 'fallback',
        name: 'Fallback Mode',
        description: 'Basic responses without AI models',
        provider: 'System'
      }
    ],
    timestamp: new Date().toISOString()
  });
}
