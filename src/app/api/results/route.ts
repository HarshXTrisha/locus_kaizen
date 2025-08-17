import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { connectDB } from '@/lib/database';
import Result from '@/models/Result';
import Quiz from '@/models/Quiz';
import User from '@/models/User';
import { z } from 'zod';

// Validation schema for submitting results
const SubmitResultSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  answers: z.array(z.object({
    questionId: z.string(),
    userAnswer: z.union([z.string(), z.array(z.string())]),
    timeSpent: z.number().min(0, 'Time spent must be non-negative'),
  })),
  timeTaken: z.number().min(0, 'Time taken must be non-negative'),
  startedAt: z.string().datetime(),
  feedback: z.string().optional(),
});

// GET /api/results - Get user's results
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
    const quizId = searchParams.get('quizId');

    // Build query
    const query: any = { userId: user.uid };
    
    if (quizId) {
      query.quizId = quizId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get results with pagination and populate quiz details
    const results = await Result.find(query)
      .populate('quizId', 'title subject')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Result.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: 'Results retrieved successfully'
    });

  } catch (error) {
    console.error('📊 Get results error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve results' },
      { status: 500 }
    );
  }
}

// POST /api/results - Submit quiz result
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
    const validatedData = SubmitResultSchema.parse(body);

    // Connect to database
    await connectDB();

    // Get quiz details
    const quiz = await Quiz.findById(validatedData.quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if quiz is published
    if (!quiz.isPublished) {
      return NextResponse.json(
        { error: 'Quiz is not available' },
        { status: 403 }
      );
    }

    // Calculate results
    let correctAnswers = 0;
    let earnedPoints = 0;
    const processedAnswers = [];

    for (const answer of validatedData.answers) {
      const question = quiz.questions.find((q: any) => q.id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      
      // Check if answer is correct based on question type
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        isCorrect = answer.userAnswer === question.correctAnswer;
      } else if (question.type === 'short-answer') {
        // For short answer, do case-insensitive comparison
        isCorrect = String(answer.userAnswer).toLowerCase().trim() === 
                   String(question.correctAnswer).toLowerCase().trim();
      }

      const points = isCorrect ? question.points : 0;
      correctAnswers += isCorrect ? 1 : 0;
      earnedPoints += points;

      processedAnswers.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
        points,
        timeSpent: answer.timeSpent,
      });
    }

    const score = Math.round((earnedPoints / quiz.totalPoints) * 100);

    // Create result
    const result = new Result({
      quizId: validatedData.quizId,
      userId: user.uid,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      totalPoints: quiz.totalPoints,
      earnedPoints,
      timeTaken: validatedData.timeTaken,
      answers: processedAnswers,
      completedAt: new Date(),
      startedAt: new Date(validatedData.startedAt),
      status: 'completed',
      feedback: validatedData.feedback,
      metadata: {
        userAgent: request.headers.get('user-agent') || '',
        deviceType: 'desktop', // You can add logic to detect device type
      },
    });

    await result.save();

    // Update quiz statistics
    await Quiz.findByIdAndUpdate(validatedData.quizId, {
      $inc: {
        'stats.totalAttempts': 1,
        'stats.averageScore': score,
        'stats.averageTime': validatedData.timeTaken,
      },
    });

    // Update user statistics
    await User.findOneAndUpdate(
      { firebaseUid: user.uid },
      {
        $inc: {
          'stats.totalResults': 1,
          'stats.totalTimeSpent': validatedData.timeTaken,
        },
      }
    );

    console.log('📊 Result submitted:', `Score: ${score}%`, 'by', user.email);

    return NextResponse.json({
      success: true,
      data: {
        ...result.toObject(),
        quiz: {
          title: quiz.title,
          subject: quiz.subject,
        },
      },
      message: 'Result submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('📊 Submit result error:', error);
    
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
      { error: 'Failed to submit result' },
      { status: 500 }
    );
  }
}
