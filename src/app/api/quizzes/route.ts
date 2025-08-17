import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { connectDB } from '@/lib/database';
import Quiz from '@/models/Quiz';
import { z } from 'zod';

// Validation schemas
const CreateQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject too long'),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Question text is required'),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]),
    points: z.number().min(1, 'Points must be at least 1'),
    explanation: z.string().optional(),
  })).min(1, 'At least one question is required'),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute').max(480, 'Time limit too long'),
  passingScore: z.number().min(0, 'Passing score must be at least 0').max(100, 'Passing score cannot exceed 100'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  allowRetakes: z.boolean().default(true),
  maxAttempts: z.number().min(1, 'Max attempts must be at least 1').default(3),
});

// GET /api/quizzes - Get user's quizzes
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    const { user } = authResult;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const published = searchParams.get('published');
    const subject = searchParams.get('subject');

    // Build query
    const query: any = { createdBy: user.uid };
    
    if (published !== null) {
      query.isPublished = published === 'true';
    }
    
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get quizzes with pagination
    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Quiz.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: 'Quizzes retrieved successfully'
    });

  } catch (error) {
    console.error('📝 Get quizzes error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve quizzes' },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create new quiz
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    const { user } = authResult;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = CreateQuizSchema.parse(body);

    // Connect to database
    await connectDB();

    // Create new quiz
    const quiz = new Quiz({
      ...validatedData,
      createdBy: user.uid,
    });

    await quiz.save();

    console.log('📝 Quiz created:', quiz.title, 'by', user.email);

    return NextResponse.json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('📝 Create quiz error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
