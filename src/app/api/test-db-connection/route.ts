import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Testing MongoDB connection...');
    
    // Test the connection
    await connectDB();
    
    // Check if we're connected
    const isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      console.log('✅ MongoDB connection successful!');
      
      // Test basic operations
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      return NextResponse.json({
        success: true,
        message: 'MongoDB connection successful!',
        details: {
          connectionState: mongoose.connection.readyState,
          databaseName: mongoose.connection.db.databaseName,
          collections: collections.map(col => col.name),
          host: mongoose.connection.host,
          port: mongoose.connection.port,
        },
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ MongoDB connection failed!');
      return NextResponse.json({
        success: false,
        message: 'MongoDB connection failed',
        details: {
          connectionState: mongoose.connection.readyState,
          error: 'Connection not established'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'MongoDB connection error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        connectionState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      }
    }, { status: 500 });
  }
}
