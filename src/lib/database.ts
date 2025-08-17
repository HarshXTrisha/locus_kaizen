import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/locus';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface Connection {
  isConnected?: number;
}

const connection: Connection = {};

async function connectDB() {
  if (connection.isConnected) {
    console.log('🔗 Database: Already connected');
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log('🔗 Database: Using existing connection');
      return;
    }
    await mongoose.disconnect();
  }

  try {
    console.log('🔗 Database: Connecting to MongoDB...');
    const db = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('✅ Database: Connected successfully');
  } catch (error) {
    console.error('❌ Database: Connection failed:', error);
    throw error;
  }
}

async function disconnectDB() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      connection.isConnected = 0;
      console.log('🔗 Database: Disconnected');
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

export { connectDB, disconnectDB };
