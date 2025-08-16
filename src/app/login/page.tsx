import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] p-4">
      <div className="w-full max-w-md">
        {/* Optional: You can add a logo here above the form */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Locus</h1>
        </div>
        
        <LoginForm />

        <p className="mt-6 text-center text-sm text-[#6C757D]">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-medium text-[#20C997] hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </main>
  );
}
