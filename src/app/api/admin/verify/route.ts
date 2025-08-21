import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if user is admin (you can modify this logic)
    const isAdmin = decodedToken.email === 'admin@locus.com' || 
                   decodedToken.email === 'spycook.jjn007@gmail.com' ||
                   decodedToken.email?.includes('admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
