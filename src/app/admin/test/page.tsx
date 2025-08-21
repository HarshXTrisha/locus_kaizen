'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase-auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminTest() {
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('🔍 Starting admin dashboard tests...');
    
    // Test 1: Authentication
    addResult(`👤 User: ${user?.email || 'None'}`);
    addResult(`🔄 Loading: ${loading}`);
    addResult(`🔐 User exists: ${!!user}`);
    
    // Test 2: Admin check
    const isAdmin = user?.email === 'admin@locus.com' || 
                   user?.email === 'spycook.jjn007@gmail.com' || 
                   user?.email?.includes('admin');
    addResult(`👑 Admin access: ${isAdmin}`);
    
    // Test 3: Firebase connection
    try {
      addResult('🔥 Testing Firebase connection...');
      const testQuery = query(collection(db, 'users'), limit(1));
      const testSnapshot = await getDocs(testQuery);
      addResult(`✅ Firebase connected - Users collection accessible`);
      addResult(`📊 Users in collection: ${testSnapshot.size}`);
    } catch (error) {
      addResult(`❌ Firebase error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Test 4: Collections test
    const collections = ['users', 'quizzes', 'results'];
    for (const collectionName of collections) {
      try {
        addResult(`📁 Testing ${collectionName} collection...`);
        const query = query(collection(db, collectionName), limit(5));
        const snapshot = await getDocs(query);
        addResult(`✅ ${collectionName}: ${snapshot.size} documents found`);
      } catch (error) {
        addResult(`❌ ${collectionName} error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    addResult('🎯 Tests completed!');
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard Debug Test</h1>
          
          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? 'Running Tests...' : 'Run Debug Tests'}
            </button>
          </div>
          
          <div className="bg-gray-100 rounded p-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500">Click "Run Debug Tests" to start testing</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded border">
            <h3 className="font-semibold text-yellow-800 mb-2">How to use:</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Login with your admin email: spycook.jjn007@gmail.com</li>
              <li>2. Click "Run Debug Tests" to check connectivity</li>
              <li>3. Check the results for any errors</li>
              <li>4. If tests pass, try accessing /admin</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
