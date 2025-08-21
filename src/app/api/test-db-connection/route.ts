import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Testing Database Connection...');
    
    // Check if MongoDB is configured
    const hasMongoConfig = process.env.MONGODB_URI || process.env.ENABLE_MONGODB_TEST === 'true';
    
    if (!hasMongoConfig) {
      console.log('ℹ️ MongoDB not configured - skipping test');
      return NextResponse.json({
        success: true,
        message: 'Database test skipped - MongoDB not configured',
        details: {
          status: 'skipped',
          reason: 'MongoDB not configured'
        },
        timestamp: new Date().toISOString()
      });
    }

    // If MongoDB is configured, test the connection
    try {
      const { connectDB } = await import('@/lib/database');
      const mongoose = await import('mongoose');
      
      await connectDB();
      
      const isConnected = mongoose.default.connection.readyState === 1;
      
      if (isConnected) {
        console.log('✅ Database connection successful!');
        return NextResponse.json({
          success: true,
          message: 'Database connection successful!',
          details: {
            connectionState: mongoose.default.connection.readyState,
            databaseName: mongoose.default.connection.db?.databaseName,
            host: mongoose.default.connection.host,
            port: mongoose.default.connection.port,
          },
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Database connection not established');
      }
    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
        details: {
          status: 'failed',
          reason: 'Connection error'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Database test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database test error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        status: 'error',
        reason: 'Test execution error'
      }
    }, { status: 500 });
  }
}
