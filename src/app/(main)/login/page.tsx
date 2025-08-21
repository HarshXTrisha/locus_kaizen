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
              className="object-cover w-full h-full animate-gentle-float"
              priority
              sizes="50vw"
              style={{
                objectPosition: 'center center'
              }}
            />
          </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 relative z-10">

          <div className="w-full max-w-md relative z-10">
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/logo - Copy.png" 
                  alt="QuestAI Logo" 
                  className="w-[calc(3rem*1.4)] h-[calc(3rem*1.4)] mr-3 object-contain"
                />
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
