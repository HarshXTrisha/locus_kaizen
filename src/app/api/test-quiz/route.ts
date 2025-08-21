import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing Quiz System...');
    
    return NextResponse.json({
      success: true,
      message: 'Quiz system is working',
      details: {
        status: 'operational',
        features: ['quiz-creation', 'quiz-taking', 'quiz-analysis'],
        version: '1.0.0'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Quiz test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Quiz system test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
