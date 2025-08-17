const mongoose = require('mongoose');

// MongoDB connection string with your credentials (password URL-encoded)
const MONGODB_URI = 'mongodb+srv://locus_kaizen:Harsh%40iimb2007@locus.pzqcxnb.mongodb.net/locus?retryWrites=true&w=majority&appName=Locus';

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('📊 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Get database info
    const db = mongoose.connection.db;
    console.log('📊 Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(col => col.name));
    
    // Test basic operations
    console.log('🧪 Testing basic operations...');
    
    // Test creating a test collection
    const testCollection = db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    console.log('✅ Write operation successful');
    
    // Test reading
    const result = await testCollection.findOne({ test: true });
    console.log('✅ Read operation successful:', result);
    
    // Clean up test data
    await testCollection.deleteOne({ test: true });
    console.log('✅ Delete operation successful');
    
    console.log('🎉 All tests passed! MongoDB connection is working perfectly.');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('🔐 Authentication Error: Check username and password');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🌐 Network Error: Check if MongoDB Atlas is accessible');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔍 DNS Error: Check the connection string format');
    }
    
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
  }
}

// Run the test
testConnection();
