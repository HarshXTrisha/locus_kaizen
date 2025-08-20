import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicOnlyRoute } from '@/components/common/ProtectedRoute';
import { Target } from '@/lib/icons';

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen w-full relative overflow-hidden">
        {/* Floating Bubbles Background Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, index) => (
            <div
              key={index}
              className="absolute w-4 h-4 bg-gradient-to-br from-[#20C997]/20 to-[#1BA085]/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Left Side - Nano Banana Image */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#20C997]/10 via-[#1BA085]/5 to-[#20C997]/10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#20C997]/5 via-transparent to-[#1BA085]/5"></div>
          
          {/* Nano Banana Image Container */}
          <div className="relative z-10 flex items-center justify-center w-full h-full p-8">
            <div className="max-w-md text-center">
              {/* Placeholder for nano banana image */}
              <div className="w-96 h-96 mx-auto mb-8 bg-gradient-to-br from-[#20C997]/20 to-[#1BA085]/20 rounded-3xl flex items-center justify-center border border-[#20C997]/30 shadow-2xl">
                <div className="text-center">
                  <Target className="h-24 w-24 text-[#20C997] mx-auto mb-4" />
                  <p className="text-lg text-[#1BA085] font-medium">Nano Banana Image</p>
                  <p className="text-sm text-[#1BA085]/70 mt-2">Data Analysis & Learning</p>
                </div>
              </div>
              
              {/* Branding Text */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-[#212529] tracking-tight">
                  QuestAI
                </h1>
                <p className="text-xl text-[#6C757D] font-medium leading-relaxed">
                  Smart Learning, Smarter Results
                </p>
                <p className="text-base text-[#6C757D] font-normal leading-relaxed">
                  Transform your learning experience with AI-powered quizzes and analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 relative z-10">
          <div className="w-full max-w-md">
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-xl shadow-lg flex items-center justify-center mr-3">
                  <Target className="h-6 w-6 text-white" />
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
