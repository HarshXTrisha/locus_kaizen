import { NextRequest, NextResponse } from 'next/server';
import { OSSGPTPDFProcessor } from '@/lib/oss-gpt-pdf-processor';
import { validateAIConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    console.log('📄 PDF to Quiz conversion request received');

    // Validate AI configuration
    if (!validateAIConfig()) {
      return NextResponse.json(
        { 
          error: 'Configuration error', 
          message: 'AI model configuration is invalid. Please check your API keys.' 
        },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { 
      pdfText, 
      fileName, 
      questionCount = 10,
      subject,
      includeExplanations = true,
      aiModel = 'auto'
    } = body;

    // Validate input
    if (!pdfText || typeof pdfText !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input', message: 'PDF text content is required' },
        { status: 400 }
      );
    }

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input', message: 'File name is required' },
        { status: 400 }
      );
    }

    // Validate parameters
    if (questionCount < 1 || questionCount > 50) {
      return NextResponse.json(
        { error: 'Invalid input', message: 'Question count must be between 1 and 50' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting PDF conversion...');
    console.log('📊 Parameters:', {
      fileName,
      textLength: pdfText.length,
      questionCount,
      subject,
      includeExplanations,
      aiModel
    });

    // Convert PDF to QuestAI JSON format using selected AI model
    const result = await OSSGPTPDFProcessor.convertToQuestAIJSON(
      pdfText,
      fileName,
      {
        questionCount,
        subject,
        includeExplanations,
        aiModel
      }
    );

    const { quiz, metadata } = result;

    console.log('✅ PDF to QuestAI JSON conversion completed successfully');
    console.log('📊 Result summary:', {
      title: quiz.title,
      questionsGenerated: quiz.questions.length,
      confidence: metadata.confidence,
      warnings: metadata.warnings.length
    });

    // Return the generated quiz in QuestAI format
    return NextResponse.json({
      success: true,
      data: quiz,
      metadata: metadata,
      summary: {
        questionsGenerated: quiz.questions.length,
        confidence: metadata.confidence,
        warnings: metadata.warnings,
        processingMethod: metadata.processingMethod
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ PDF to Quiz conversion error:', error);
    
    return NextResponse.json(
      { 
        error: 'Conversion failed', 
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Please check your PDF content and try again. For complex PDFs, try reducing the question count or simplifying the content.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'PDF to Quiz Converter',
    models: [
      {
        id: 'oss-gpt',
        name: 'OSS GPT 20B',
        provider: 'OpenRouter',
        description: 'Powerful 20B parameter model'
      },
      {
        id: 'gemini',
        name: 'Gemini (Gemma 3 12B)',
        provider: 'Google',
        description: 'Google\'s advanced language model'
      },
      {
        id: 'auto',
        name: 'Auto Select',
        provider: 'System',
        description: 'Automatically choose the best available model'
      }
    ],
    features: [
      'Intelligent content analysis',
      'Structured quiz generation',
      'Multiple question types',
      'Difficulty assessment',
      'Topic identification',
      'Answer explanations',
      'Fallback processing',
      'Multi-model support'
    ],
    limits: {
      maxQuestions: 50,
      maxTextLength: 10000,
      supportedDifficulties: ['easy', 'medium', 'hard'],
      supportedTypes: ['multiple-choice', 'true-false', 'mixed']
    },
    timestamp: new Date().toISOString()
  });
}