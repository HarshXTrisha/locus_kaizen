'use client';

import React, { useState } from 'react';
import { runSystemTest, SystemTestResult } from '@/lib/database-test';
import { showSuccess, showError } from './NotificationSystem';

export function DatabaseTest() {
  const [isSystemWorking, setIsSystemWorking] = useState<boolean | null>(null);
  const [testResults, setTestResults] = useState<SystemTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [summary, setSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    categories: {
      auth: { passed: number; failed: number };
      database: { passed: number; failed: number };
      quiz: { passed: number; failed: number };
      results: { passed: number; failed: number };
      settings: { passed: number; failed: number };
      performance: { passed: number; failed: number };
    };
  } | null>(null);

  const testSystemStatus = async () => {
    setIsTesting(true);
    setTestResults([]);
    setSummary(null);
    
    try {
      const result = await runSystemTest();
      
      const allResults = [
        ...result.auth,
        ...result.database,
        ...result.quiz,
        ...result.results,
        ...result.settings,
        ...result.performance
      ];
      
      setTestResults(allResults);
      setSummary(result.summary);
      
      if (result.summary.failed === 0) {
        setIsSystemWorking(true);
        showSuccess('System Test Complete', 'All systems are working perfectly! Your quiz application is ready to use.');
      } else {
        setIsSystemWorking(false);
        showError('System Test Failed', `${result.summary.failed} out of ${result.summary.total} tests failed. Some features may not work properly.`);
      }
    } catch (error) {
      console.error('System test error:', error);
      setTestResults([{
        success: false,
        message: 'System test failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error occurred' },
        category: 'database'
      }]);
      setIsSystemWorking(false);
      showError('System Test Failed', 'There are critical issues with the system.');
    } finally {
      setIsTesting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'bg-blue-100 text-blue-800';
      case 'database': return 'bg-green-100 text-green-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      case 'results': return 'bg-orange-100 text-orange-800';
      case 'settings': return 'bg-pink-100 text-pink-800';
      case 'performance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return '🔐';
      case 'database': return '🗄️';
      case 'quiz': return '📝';
      case 'results': return '📊';
      case 'settings': return '⚙️';
      case 'performance': return '⚡';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status Check</h2>
      
      <div className="mb-4">
        <button
          onClick={testSystemStatus}
          disabled={isTesting}
          className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors disabled:opacity-50"
        >
          {isTesting ? 'Testing System...' : 'Run Complete System Test'}
        </button>
      </div>

      {isSystemWorking !== null && (
        <div className={`p-3 rounded-lg mb-4 ${
          isSystemWorking ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`font-medium ${
            isSystemWorking ? 'text-green-800' : 'text-red-800'
          }`}>
            Status: {isSystemWorking ? 'All Systems Operational' : 'System Issues Detected'}
          </p>
        </div>
      )}

      {summary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">System Summary:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{summary.total}</div>
              <div className="text-gray-600">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{summary.passed}</div>
              <div className="text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{summary.failed}</div>
              <div className="text-gray-600">Failed</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(summary.categories).map(([category, stats]) => (
              <div key={category} className="text-center p-2 bg-white rounded border">
                <div className="text-xs font-medium text-gray-600 uppercase">{category}</div>
                <div className="flex justify-center gap-2 mt-1">
                  <span className="text-green-600 font-bold">{stats.passed}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-red-600 font-bold">{stats.failed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Detailed Test Results:</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`text-sm p-3 rounded border ${
                result.success ? 'bg-white border-green-200' : 'bg-white border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(result.category)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(result.category)}`}>
                    {result.category}
                  </span>
                  <span>{result.success ? '✅' : '❌'}</span>
                  <span className="font-medium">{result.message}</span>
                </div>
                {result.details && (
                  <div className="ml-8 mt-1 text-xs text-gray-600">
                    {Object.entries(result.details).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">What This Test Checks:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
          <div>
            <span className="font-medium">🔐 Authentication:</span> Firebase Auth, Google Sign-In
          </div>
          <div>
            <span className="font-medium">🗄️ Database:</span> Firestore operations, security rules
          </div>
          <div>
            <span className="font-medium">📝 Quiz System:</span> Creation, retrieval, management
          </div>
          <div>
            <span className="font-medium">📊 Results:</span> Score saving, analytics, reporting
          </div>
          <div>
            <span className="font-medium">⚙️ Settings:</span> User preferences, configuration
          </div>
          <div>
            <span className="font-medium">⚡ Performance:</span> Response times, memory usage
          </div>
        </div>
      </div>
    </div>
  );
}
