import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicOnlyRoute } from '@/components/common/ProtectedRoute';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen w-full relative overflow-hidden">
        {/* Floating Bubbles Background Animation (Full Page) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {Array.from({ length: 40 }).map((_, index) => (
            <div
              key={index}
              className="absolute w-4 h-4 bg-gradient-to-br from-[#20C997]/24 to-[#1BA085]/24 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${9 + Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

                                  {/* Left Side - Nano Banana Image (Fully Covered) */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10">
            <Image
              src="/nano-banana_I_need_you_change_co.png"
              alt="QuestAI Data Analysis"
              fill
              className="object-cover w-full h-full"
              priority
              sizes="50vw"
              style={{
                objectPosition: 'center 120%'
              }}
            />
          </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 relative z-10">

          <div className="w-full max-w-md relative z-10">
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-xl shadow-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-[#212529] tracking-tight">QuestAI</h1>
              </div>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <LoginForm />
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#6C757D] mb-3 font-medium leading-relaxed">
                New users will be automatically created when signing in
              </p>
              <div className="flex items-center justify-center text-xs text-[#6C757D] font-medium">
                <span className="mr-2">Powered by</span>
                <span className="font-semibold text-[#20C997]">Kaizen</span>
                <span className="ml-2">- Continuous Improvement</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PublicOnlyRoute>
  );
}
