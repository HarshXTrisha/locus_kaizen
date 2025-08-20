import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { connectDB } from '@/lib/database';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import Result from '@/models/Result';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/analytics/dashboard - Get dashboard analytics
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

    // Get user data
    const userData = await User.findOne({ firebaseUid: user.uid });
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recent quizzes (last 5)
    const recentQuizzes = await Quiz.find({ createdBy: user.uid })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title subject createdAt stats')
      .lean();

    // Get recent results (last 5)
    const recentResults = await Result.find({ userId: user.uid })
      .populate('quizId', 'title subject')
      .sort({ completedAt: -1 })
      .limit(5)
      .lean();

    // Get performance statistics
    const performanceStats = await Result.aggregate([
      { $match: { userId: user.uid } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          totalTimeSpent: { $sum: '$timeTaken' },
          averageTimePerQuiz: { $avg: '$timeTaken' },
        },
      },
    ]);

    // Get subject-wise performance
    const subjectPerformance = await Result.aggregate([
      { $match: { userId: user.uid } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quiz',
        },
      },
      { $unwind: '$quiz' },
      {
        $group: {
          _id: '$quiz.subject',
          attempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 5 },
    ]);

    // Get monthly activity
    const monthlyActivity = await Result.aggregate([
      { $match: { userId: user.uid } },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
          },
          attempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);

    // Calculate improvement trend
    const improvementTrend = await Result.aggregate([
      { $match: { userId: user.uid } },
      { $sort: { completedAt: 1 } },
      {
        $group: {
          _id: null,
          scores: { $push: '$score' },
        },
      },
    ]);

    let improvementRate = 0;
    if (improvementTrend.length > 0 && improvementTrend[0].scores.length > 1) {
      const scores = improvementTrend[0].scores;
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      
      const firstAvg = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;
      
      improvementRate = secondAvg > firstAvg ? 
        ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    }

    // Format the response
    const analytics = {
      user: {
        id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        stats: userData.stats,
      },
      overview: {
        totalQuizzes: userData.stats.totalQuizzes,
        totalResults: userData.stats.totalResults,
        averageScore: userData.stats.averageScore,
        totalTimeSpent: userData.stats.totalTimeSpent,
        improvementRate: Math.round(improvementRate * 100) / 100,
      },
      performance: performanceStats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        averageTimePerQuiz: 0,
      },
      recentQuizzes,
      recentResults,
      subjectPerformance,
      monthlyActivity: monthlyActivity.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        attempts: item.attempts,
        averageScore: Math.round(item.averageScore * 100) / 100,
      })),
      insights: {
        topSubject: subjectPerformance[0]?._id || 'No data',
        mostActiveMonth: monthlyActivity[0] ? 
          `${monthlyActivity[0]._id.year}-${monthlyActivity[0]._id.month.toString().padStart(2, '0')}` : 
          'No data',
        improvementTrend: improvementRate > 0 ? 'Improving' : improvementRate < 0 ? 'Declining' : 'Stable',
      },
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Dashboard analytics retrieved successfully'
    });

  } catch (error) {
    console.error('📊 Dashboard analytics error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard analytics' },
      { status: 500 }
    );
  }
}
