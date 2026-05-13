import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicOnlyRoute } from '@/components/common/ProtectedRoute';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="relative min-h-screen w-full overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>
        {/* Fullscreen Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay for Better Text Visibility */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        {/* Back to Home Link */}
        <div className="absolute top-8 left-8 z-20">
          <Link 
            href="/"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Login Container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8 animate-fade-rise">
              <h1 
                className="text-5xl tracking-tight text-white mb-2" 
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                QuestAI<sup className="text-xl">®</sup>
              </h1>
              <p className="text-white/70 text-sm">Transform learning into an experience</p>
            </div>

            {/* Login Form Card */}
            <div className="liquid-glass rounded-3xl p-8 animate-fade-rise-delay">
              <LoginForm />
            </div>

            {/* Footer */}
            <div className="mt-6 text-center animate-fade-rise-delay-2">
              <p className="text-xs text-white/60">
                New users will be automatically created when signing in
              </p>
            </div>
          </div>
        </div>
      </main>
    </PublicOnlyRoute>
  );
}
