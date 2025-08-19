import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicOnlyRoute } from '@/components/common/ProtectedRoute';
import { Target, Zap, Shield, Globe } from '@/lib/icons';

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] via-white to-[#E8F5E8] p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#20C997]/5 via-transparent to-[#1BA085]/5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#20C997]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1BA085]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-20 w-4 h-4 bg-[#20C997]/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute top-48 right-32 w-6 h-6 bg-[#1BA085]/20 rounded-full animate-bounce delay-2000"></div>
          <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-[#20C997]/30 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-48 right-1/4 w-5 h-5 bg-[#1BA085]/25 rounded-full animate-bounce delay-3000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo and Title */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl shadow-lg flex items-center justify-center mr-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-[#212529] tracking-tight">QuestAI</h1>
            </div>
            <p className="text-xl text-[#6C757D] mb-3 font-medium leading-relaxed">Sign in with your Google account</p>
            <p className="text-base text-[#6C757D] font-normal leading-relaxed">Access your personalized learning dashboard powered by Kaizen</p>
          </div>
          
          {/* Login Form */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
            <LoginForm />
          </div>

          {/* Features Preview */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center shadow-lg border border-white/30">
              <Zap className="h-7 w-7 text-[#20C997] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#212529] leading-tight">Lightning Fast</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center shadow-lg border border-white/30">
              <Shield className="h-7 w-7 text-[#20C997] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#212529] leading-tight">Secure</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center shadow-lg border border-white/30">
              <Globe className="h-7 w-7 text-[#20C997] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#212529] leading-tight">Cross-Platform</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center shadow-lg border border-white/30">
              <Target className="h-7 w-7 text-[#20C997] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#212529] leading-tight">Smart Analytics</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-sm text-[#6C757D] mb-3 font-medium leading-relaxed">
              New users will be automatically created when signing in with Google
            </p>
            <div className="flex items-center justify-center text-xs text-[#6C757D] font-medium">
              <span className="mr-2">Powered by</span>
              <span className="font-semibold text-[#20C997]">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
          </div>
        </div>
      </main>
    </PublicOnlyRoute>
  );
}
