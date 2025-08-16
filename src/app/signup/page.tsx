import React from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import { PublicOnlyRoute } from '@/components/common/ProtectedRoute';

export default function SignupPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Locus</h1>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>
          
          <SignupForm />

          <p className="mt-6 text-center text-sm text-[#6C757D]">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-[#20C997] hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </main>
    </PublicOnlyRoute>
  );
}
