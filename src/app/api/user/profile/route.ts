import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { setUserRole } from '@/lib/firebase-quiz';

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/user/profile - Starting request');
    
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

    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, email } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('Invalid name:', name);
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      console.log('Invalid email:', email);
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Updating user profile for UID:', user.uid);
    
    // Update user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    console.log('User document exists:', userDoc.exists());
    
    if (userDoc.exists()) {
      // Update existing user
      console.log('Updating existing user document');
      await updateDoc(userRef, {
        firstName: name.trim(),
        email: email,
        updatedAt: new Date()
      });
      console.log('User document updated successfully');
    } else {
      // Create new user document
      console.log('Creating new user document');
      await setDoc(userRef, {
        firebaseUid: user.uid,
        email: email,
        firstName: name.trim(),
        lastName: '',
        avatar: null,
        role: 'user', // Default role
        settings: {
          theme: 'light',
          notifications: true,
          timezone: 'UTC',
          language: 'en'
        },
        stats: {
          totalQuizzes: 0,
          totalResults: 0,
          averageScore: 0,
          totalTimeSpent: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Set user role in the users collection
      await setUserRole(user.uid, 'user', email);
      
      console.log('New user document created successfully');
    }

    // Get updated user data
    const updatedUserDoc = await getDoc(userRef);
    const userData = updatedUserDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        id: user.uid,
        email: userData?.email || email,
        name: userData?.firstName || name.trim(),
        role: userData?.role || 'user',
        createdAt: userData?.createdAt?.toDate() || new Date(),
        updatedAt: userData?.updatedAt?.toDate() || new Date()
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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

    console.log('GET /api/user/profile - Fetching profile for user:', user.uid);

    // Get user from Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        id: user.uid,
        email: userData.email,
        name: userData.firstName,
        role: userData.role || 'user',
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
