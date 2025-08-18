'use client';

import React from 'react';
import { DatabaseTest } from '@/components/common/DatabaseTest';

export default function TestDatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Status Check</h1>
          <p className="text-gray-600 mt-2">Comprehensive test of all quiz application systems</p>
        </div>
        
        <DatabaseTest />
        
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Test</h2>
          <p className="text-gray-600 text-sm mb-3">
            This comprehensive system test checks all the critical components your quiz application needs to function properly:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Authentication:</strong> Google Sign-In, user management</li>
            <li>• <strong>Database:</strong> Firestore operations, data persistence</li>
            <li>• <strong>Quiz System:</strong> Creation, management, and retrieval</li>
            <li>• <strong>Results:</strong> Score tracking and analytics</li>
            <li>• <strong>Settings:</strong> User preferences and configuration</li>
            <li>• <strong>Performance:</strong> Response times and optimization</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
