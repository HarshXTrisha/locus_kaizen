import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Update user profile in Firestore
    const userRef = doc(db, 'users', authResult.user.uid);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        firstName: name.trim(),
        updatedAt: new Date()
      });
    } else {
      // Create new user document
      await setDoc(userRef, {
        firebaseUid: authResult.user.uid,
        email: email,
        firstName: name.trim(),
        lastName: '',
        avatar: null,
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
    }

    // Get updated user data
    const updatedUserDoc = await getDoc(userRef);
    const userData = updatedUserDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user.uid,
        email: userData?.email || email,
        name: userData?.firstName || name.trim(),
        createdAt: userData?.createdAt?.toDate() || new Date(),
        updatedAt: userData?.updatedAt?.toDate() || new Date()
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from Firestore
    const userRef = doc(db, 'users', authResult.user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user.uid,
        email: userData.email,
        name: userData.firstName,
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
