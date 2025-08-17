'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useIsAuthenticated } from '@/lib/store';
import { LoadingSpinner } from './LoadingSpinner';
import { LogIn } from '@/lib/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { loading } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  // Auto-redirect authenticated users away from public-only routes
  useEffect(() => {
    if (!loading && !requireAuth && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loading, requireAuth, isAuthenticated, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" text="Checking authentication..." />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          
          <p className="text-gray-600 mb-8">
            You need to be signed in to access this page. Please sign in with your Google account to continue.
          </p>

          <div className="flex justify-center">
            <Link
              href={redirectTo}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
            >
              <LogIn className="h-5 w-5" />
              Sign In with Google
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated but shouldn't be (e.g., on login page)
  if (!requireAuth && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <LogIn className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Already Signed In
          </h1>
          
          <p className="text-gray-600 mb-8">
            You are already signed in. Redirecting to dashboard...
          </p>

          <LoadingSpinner size="lg" text="Redirecting..." />
        </div>
      </div>
    );
  }

  // Render children if authentication requirements are met
  return <>{children}</>;
}

// Hook for checking authentication status
export function useRequireAuth() {
  const { loading } = useAuth();
  const isAuthenticated = useIsAuthenticated();

  return {
    loading,
    isAuthenticated,
    requireAuth: !loading && !isAuthenticated,
  };
}

// Component for pages that should only be accessible to unauthenticated users
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
}
