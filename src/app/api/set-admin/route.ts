import { NextRequest, NextResponse } from 'next/server';
import { setAdminUser } from '@/lib/firebase-quiz';

export async function POST(request: NextRequest) {
  try {
    // Set the admin user
    const userId = await setAdminUser();
    
    if (userId) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user set successfully',
        userId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'User spycook.jjn007@gmail.com not found' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error setting admin user:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to set admin user' 
    }, { status: 500 });
  }
}
