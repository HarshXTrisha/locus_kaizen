import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicOnlyRoute } from '@/components/common/ProtectedRoute';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen w-full bg-black relative overflow-hidden">
        {/* Apple-style gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        
        {/* Subtle floating elements for Apple aesthetic */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {Array.from({ length: 20 }).map((_, index) => (
            <div
              key={index}
              className="absolute w-2 h-2 bg-white/5 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content - Centered */}
        <div className="w-full flex items-center justify-center p-8 relative z-10">

          <div className="w-full max-w-md relative z-10">
            {/* Logo */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center mr-4">
                  <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-5xl font-bold text-white tracking-tight">QuestAI</h1>
              </div>
            </div>

            {/* Login Form */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-10">
              <LoginForm />
            </div>

            {/* Footer */}
            <div className="mt-10 text-center">
              <p className="text-sm text-white/70 mb-4 font-medium leading-relaxed">
                New users will be automatically created when signing in
              </p>
              <div className="flex items-center justify-center text-xs text-white/50 font-medium">
                <span className="mr-2">Powered by</span>
                <span className="font-semibold text-white">Kaizen</span>
                <span className="ml-2">- Continuous Improvement</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PublicOnlyRoute>
  );
}
