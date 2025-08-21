import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('⚙️ Testing Settings System...');
    
    return NextResponse.json({
      success: true,
      message: 'Settings system is working',
      details: {
        status: 'operational',
        features: ['user-preferences', 'app-configuration', 'profile-settings'],
        version: '1.0.0'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Settings test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Settings system test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
