import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { connectDB } from '@/lib/database';
import Quiz from '@/models/Quiz';
import { z } from 'zod';

// Validation schema for updates
const UpdateQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long').optional(),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject too long').optional(),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Question text is required'),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]),
    points: z.number().min(1, 'Points must be at least 1'),
    explanation: z.string().optional(),
  })).min(1, 'At least one question is required').optional(),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute').max(480, 'Time limit too long').optional(),
  passingScore: z.number().min(0, 'Passing score must be at least 0').max(100, 'Passing score cannot exceed 100').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  allowRetakes: z.boolean().optional(),
  maxAttempts: z.number().min(1, 'Max attempts must be at least 1').optional(),
});

// GET /api/quizzes/[id] - Get specific quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Connect to database
    await connectDB();

    // Find quiz by ID
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if user owns the quiz or if it's public
    if (quiz.createdBy !== user.uid && !quiz.isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quiz,
      message: 'Quiz retrieved successfully'
    });

  } catch (error) {
    console.error('📝 Get quiz error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve quiz' },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = UpdateQuizSchema.parse(body);

    // Connect to database
    await connectDB();

    // Find quiz by ID
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if user owns the quiz
    if (quiz.createdBy !== user.uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    console.log('📝 Quiz updated:', updatedQuiz?.title, 'by', user.email);

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
      message: 'Quiz updated successfully'
    });

  } catch (error) {
    console.error('📝 Update quiz error:', error);
    
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
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Connect to database
    await connectDB();

    // Find quiz by ID
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if user owns the quiz
    if (quiz.createdBy !== user.uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete quiz
    await Quiz.findByIdAndDelete(id);

    console.log('📝 Quiz deleted:', quiz.title, 'by', user.email);

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('📝 Delete quiz error:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
