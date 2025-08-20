import { NextRequest, NextResponse } from 'next/server';
import { analyzeQuiz, validateQuizAnswers, formatQuizAnswers } from '@/lib/huggingface-service';
import { useAppStore } from '@/lib/store';

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration: 25 requests per hour per user
const RATE_LIMIT_MAX = 25;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Rate limiting middleware
 * @param userId - User identifier
 * @returns boolean - True if request is allowed
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new rate limit entry
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  // Increment count
  userLimit.count++;
  return true;
}

/**
 * POST /api/analyze
 * Analyzes quiz answers using Hugging Face AI model
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from request (you may need to adjust this based on your auth system)
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    // Rate limiting disabled for now
    // if (!checkRateLimit(userId)) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Rate limit exceeded', 
    //       message: 'You have exceeded the limit of 25 requests per hour. Please try again later.',
    //       retryAfter: RATE_LIMIT_WINDOW / 1000
    //     },
    //     { status: 429 }
    //   );
    // }

    // Parse request body
    const body = await request.json();
    const { answers } = body;

    // Validate input
    if (!answers || typeof answers !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input', message: 'Answers field is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate answers format
    if (!validateQuizAnswers(answers)) {
      return NextResponse.json(
        { 
          error: 'Invalid format', 
          message: 'Answers must be in format: "Topic: result, Topic: result" (e.g., "Marketing: wrong, Finance: correct")' 
        },
        { status: 400 }
      );
    }

    // Format answers for better AI analysis
    const formattedAnswers = formatQuizAnswers(answers);

    console.log('📊 Analyzing quiz answers:', formattedAnswers);

    // Call Hugging Face API for analysis
    const analysis = await analyzeQuiz(formattedAnswers);

    console.log('✅ Analysis completed:', analysis);

    // Return the analysis results
    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Hugging Face token')) {
        return NextResponse.json(
          { error: 'Configuration error', message: 'AI analysis service not properly configured' },
          { status: 500 }
        );
      }

      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: 'Service unavailable', message: 'AI analysis service is temporarily unavailable' },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'An unexpected error occurred while analyzing quiz results' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Quiz Analysis API',
    model: 'facebook/bart-base',
    rateLimit: 'disabled',
    timestamp: new Date().toISOString()
  });
}
