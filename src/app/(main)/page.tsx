'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>
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
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-3xl tracking-tight text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
          QuestAI<sup className="text-xs">®</sup>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-white transition-colors">Home</Link>
          <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/create" className="text-sm text-white/70 hover:text-white transition-colors">Create Quiz</Link>
          <Link href="/results" className="text-sm text-white/70 hover:text-white transition-colors">Results</Link>
          <Link href="/upload" className="text-sm text-white/70 hover:text-white transition-colors">Upload</Link>
        </div>
        <Link 
          href="/login"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px]">
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal animate-fade-rise text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Transform <em className="not-italic text-white/60">learning</em> into an <em className="not-italic text-white/60">experience.</em>
        </h1>
        
        <p className="text-white/80 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          Create powerful quizzes, track real-time progress, and unlock deep insights with AI-powered analytics. From PDF uploads to live leaderboards, QuestAI makes assessment effortless and engaging.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-12 animate-fade-rise-delay-2">
          <Link 
            href="/login"
            className="liquid-glass rounded-full px-14 py-5 text-base text-white hover:scale-[1.03] transition-transform cursor-pointer"
          >
            Get Started Free
          </Link>
          <Link 
            href="/create"
            className="liquid-glass rounded-full px-14 py-5 text-base text-white hover:scale-[1.03] transition-transform cursor-pointer"
          >
            Create Quiz
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-16 animate-fade-rise-delay-2">
          <div className="liquid-glass rounded-full px-6 py-2 text-xs text-white/70">
            AI-Powered Analytics
          </div>
          <div className="liquid-glass rounded-full px-6 py-2 text-xs text-white/70">
            PDF to Quiz Conversion
          </div>
          <div className="liquid-glass rounded-full px-6 py-2 text-xs text-white/70">
            Live Leaderboards
          </div>
          <div className="liquid-glass rounded-full px-6 py-2 text-xs text-white/70">
            Real-Time Progress
          </div>
        </div>
      </section>
    </div>
  );
}

