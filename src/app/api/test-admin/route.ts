import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    console.log('🧪 Testing Firebase Admin SDK...');
    
    // This will throw an error if the service account is invalid
    const listUsersResult = await adminAuth.listUsers(1);
    
    console.log('✅ Firebase Admin SDK test successful');
    
    return Response.json({ 
      success: true, 
      message: 'Firebase Admin SDK is working correctly',
      timestamp: new Date().toISOString(),
      usersCount: listUsersResult.users.length
    });
  } catch (error) {
    console.error('❌ Firebase Admin SDK test failed:', error);
    
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
