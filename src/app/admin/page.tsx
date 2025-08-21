'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: any;
  lastLoginAt: any;
}

interface Quiz {
  id: string;
  title: string;
  createdBy: string;
  createdAt: any;
  questionCount: number;
  takenCount: number;
}

interface Result {
  id: string;
  quizTitle: string;
  userName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: any;
}

export default function AdminDashboard() {
  const { user, isLoading: loading } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalResults: 0,
    averageScore: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Check if user is admin (you can modify this logic)
  const isAdmin = user?.email === 'admin@locus.com' || 
                 user?.email === 'spycook.jjn007@gmail.com' || 
                 user?.email?.includes('admin');

  useEffect(() => {
    console.log('🔍 Admin Dashboard Debug:', {
      user: user?.email,
      loading,
      isAdmin,
      userExists: !!user
    });

    setDebugInfo(`User: ${user?.email || 'None'}, Loading: ${loading}, Admin: ${isAdmin}`);

    if (!loading && !isAdmin) {
      console.log('❌ Access denied - redirecting to home');
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      console.log('✅ Admin access granted - loading data');
      loadAdminData();
    }
  }, [user, loading, isAdmin]);

  const loadAdminData = async () => {
    try {
      console.log('🔄 Starting to load admin data...');
      setIsLoading(true);
      setDebugInfo('Loading data...');
      
      // Load users
      console.log('📊 Loading users...');
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
      console.log(`✅ Loaded ${usersData.length} users`);

      // Load quizzes
      console.log('📝 Loading quizzes...');
      const quizzesQuery = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'), limit(50));
      const quizzesSnapshot = await getDocs(quizzesQuery);
      const quizzesData = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quiz[];
      setQuizzes(quizzesData);
      console.log(`✅ Loaded ${quizzesData.length} quizzes`);

      // Load results
      console.log('📈 Loading results...');
      const resultsQuery = query(collection(db, 'results'), orderBy('completedAt', 'desc'), limit(50));
      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Result[];
      setResults(resultsData);
      console.log(`✅ Loaded ${resultsData.length} results`);

      // Calculate stats
      const totalUsers = usersData.length;
      const totalQuizzes = quizzesData.length;
      const totalResults = resultsData.length;
      const averageScore = resultsData.length > 0 
        ? resultsData.reduce((sum, result) => sum + result.percentage, 0) / resultsData.length 
        : 0;

      setStats({ totalUsers, totalQuizzes, totalResults, averageScore });
      setDebugInfo(`Loaded: ${totalUsers} users, ${totalQuizzes} quizzes, ${totalResults} results`);
      console.log('✅ Admin data loaded successfully:', { totalUsers, totalQuizzes, totalResults, averageScore });
    } catch (error) {
      console.error('❌ Error loading admin data:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">{debugInfo}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="mt-2 text-sm text-gray-500">Debug: {debugInfo}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info Bar */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
        <p className="text-sm text-yellow-800">
          <strong>Debug:</strong> {debugInfo}
        </p>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.displayName || user?.email}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to App
              </button>
              <button
                onClick={loadAdminData}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'users', name: 'Users' },
              { id: 'quizzes', name: 'Quizzes' },
              { id: 'results', name: 'Results' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Quizzes</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalQuizzes}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Results</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalResults}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Score</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.averageScore.toFixed(1)}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Users ({users.length})</h3>
            </div>
            {users.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                                 No users found. This might be because:
                 <ul className="mt-2 text-sm">
                   <li>• No users have registered yet</li>
                   <li>• Users collection doesn&apos;t exist</li>
                   <li>• Firebase permissions issue</li>
                 </ul>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.displayName || 'No Name'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.createdAt?.toDate?.() ? user.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Quizzes ({quizzes.length})</h3>
            </div>
            {quizzes.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                                 No quizzes found. This might be because:
                 <ul className="mt-2 text-sm">
                   <li>• No quizzes have been created yet</li>
                   <li>• Quizzes collection doesn&apos;t exist</li>
                   <li>• Firebase permissions issue</li>
                 </ul>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500">Created by: {quiz.createdBy}</div>
                        <div className="text-sm text-gray-500">{quiz.questionCount} questions</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {quiz.createdAt?.toDate?.() ? quiz.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Results ({results.length})</h3>
            </div>
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                                 No results found. This might be because:
                 <ul className="mt-2 text-sm">
                   <li>• No quizzes have been taken yet</li>
                   <li>• Results collection doesn&apos;t exist</li>
                   <li>• Firebase permissions issue</li>
                 </ul>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {results.map((result) => (
                  <li key={result.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{result.quizTitle}</div>
                        <div className="text-sm text-gray-500">By: {result.userName}</div>
                        <div className="text-sm text-gray-500">
                          Score: {result.score}/{result.totalQuestions} ({result.percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.completedAt?.toDate?.() ? result.completedAt.toDate().toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
