import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicOnlyRoute } from '@/components/common/ProtectedRoute';

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Locus</h1>
            <p className="text-gray-600 mt-2">Sign in with your Google account</p>
          </div>
          
          <LoginForm />

          <p className="mt-6 text-center text-sm text-[#6C757D]">
            New users will be automatically created when signing in with Google
          </p>
        </div>
      </main>
    </PublicOnlyRoute>
  );
}
