import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { connectDB } from '@/lib/database';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { 
          error: authResult.error,
          message: 'Authentication failed'
        },
        { status: authResult.status || 401 }
      );
    }

    const { user } = authResult;

    // Connect to database
    await connectDB();

    // Check if user exists in our database
    let dbUser = await User.findOne({ firebaseUid: user.uid });

    if (!dbUser) {
      // Create new user if doesn't exist
      dbUser = new User({
        firebaseUid: user.uid,
        email: user.email,
        firstName: user.name?.split(' ')[0] || 'User',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        avatar: user.picture,
        settings: {
          theme: 'light',
          notifications: true,
          timezone: 'UTC',
          language: 'en',
        },
        stats: {
          totalQuizzes: 0,
          totalResults: 0,
          averageScore: 0,
          totalTimeSpent: 0,
        },
      });

      await dbUser.save();
      console.log('👤 User created:', user.email);
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id,
        firebaseUid: dbUser.firebaseUid,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        fullName: dbUser.fullName,
        avatar: dbUser.avatar,
        settings: dbUser.settings,
        stats: dbUser.stats,
        createdAt: dbUser.createdAt,
      },
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('🔐 Auth verification error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to verify authentication'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { 
          error: authResult.error,
          message: 'Authentication required'
        },
        { status: authResult.status || 401 }
      );
    }

    const { user } = authResult;

    // Connect to database
    await connectDB();

    // Get user from database
    const dbUser = await User.findOne({ firebaseUid: user.uid });

    if (!dbUser) {
      return NextResponse.json(
        { 
          error: 'User not found',
          message: 'User profile not found in database'
        },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id,
        firebaseUid: dbUser.firebaseUid,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        fullName: dbUser.fullName,
        avatar: dbUser.avatar,
        settings: dbUser.settings,
        stats: dbUser.stats,
        createdAt: dbUser.createdAt,
      },
      message: 'User profile retrieved successfully'
    });

  } catch (error) {
    console.error('🔐 Auth verification error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve user profile'
      },
      { status: 500 }
    );
  }
}
