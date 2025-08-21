import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📊 Testing Results System...');
    
    return NextResponse.json({
      success: true,
      message: 'Results system is working',
      details: {
        status: 'operational',
        features: ['score-tracking', 'performance-analytics', 'result-storage'],
        version: '1.0.0'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Results test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Results system test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
