'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { 
  Target, 
  LogIn,
  LogOut,
  ArrowRight,
  BookOpen,
  BarChart3,
  Upload,
  TrendingUp
} from '@/lib/icons';

export default function Home() {
  const { user, isAuthenticated } = useAppStore();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const features = [
    {
      icon: <Target className="h-8 w-8 text-white" />,
      title: "Quiz Creation",
      description: "Create custom quizzes with multiple question types and detailed analytics.",
      link: "/create",
      color: "from-primary-1/20 to-primary-2/20",
      borderColor: "border-primary-1/30"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-white" />,
      title: "Interactive Quizzes",
      description: "Take quizzes with real-time progress tracking and instant feedback.",
      link: "/quiz",
      color: "from-accent/20 to-primary-1/20",
      borderColor: "border-accent/30"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and performance insights with beautiful charts.",
      link: "/dashboard",
      color: "from-primary-2/20 to-accent/20",
      borderColor: "border-primary-2/30"
    },
    {
      icon: <Upload className="h-8 w-8 text-white" />,
      title: "File Management",
      description: "Upload and manage quiz files with secure cloud storage.",
      link: "/upload",
      color: "from-accent/20 to-primary-2/20",
      borderColor: "border-accent/30"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Apple-style Header */}
      <header className="bg-black/80 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white flex items-center tracking-tight">
                  <div className="w-8 h-8 bg-white rounded-2xl mr-3 flex items-center justify-center">
                    <Target className="h-5 w-5 text-black" />
                  </div>
                  QuestAI
                </h1>
              </div>
              <div className="ml-4 flex items-center text-xs text-white/60 font-medium">
                <span className="mr-1">Powered by</span>
                <span className="font-semibold text-white">Kaizen</span>
              </div>
            </div>
                          <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <span className="hidden sm:block text-white/80 font-medium">Welcome, {user?.firstName || 'User'}!</span>
                    <Link 
                      href="/dashboard"
                      className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-white/90 transition-all duration-300"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full flex items-center font-medium hover:bg-white/20 transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login"
                    className="bg-white text-black px-6 py-2 rounded-full flex items-center font-medium hover:bg-white/90 transition-all duration-300"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sign In</span>
                    <span className="sm:hidden">Sign In</span>
                  </Link>
                )}
              </div>
          </div>
        </div>
      </header>

      {/* Apple-style Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-6">
              ✨ The Future of Learning
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-none tracking-tight">
            {isAuthenticated ? (
              <>
                Welcome back, <br />
                <span className="text-white">{user?.firstName || 'User'}!</span>
              </>
            ) : (
              <>
                Master Your <br />
                <span className="text-white">Knowledge</span>
              </>
            )}
          </h1>

          <p className="text-2xl md:text-3xl lg:text-4xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            {isAuthenticated 
              ? "Ready to continue your learning journey? Access your dashboard or explore our features."
              : "A comprehensive quiz management platform that helps you create, take, and analyze quizzes with powerful analytics and beautiful insights."
            }
          </p>

          <div className="flex items-center justify-center mb-12 text-sm text-white/60 font-medium">
            <span className="mr-2">Powered by</span>
            <span className="font-semibold text-white">Kaizen</span>
            <span className="ml-2">- Continuous Improvement</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard"
                  className="bg-white text-black px-12 py-6 rounded-full text-xl font-semibold flex items-center justify-center hover:bg-white/90 transition-all duration-300 shadow-2xl"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
                <Link 
                  href="/create"
                  className="bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 px-12 py-6 rounded-full text-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <span>Create New Quiz</span>
                </Link>
              </>
            ) : (
              <Link 
                href="/login"
                className="bg-white text-black px-12 py-6 rounded-full text-xl font-semibold flex items-center justify-center hover:bg-white/90 transition-all duration-300 shadow-2xl"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Apple-style Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-6">
              ✨ Powerful Features
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-none tracking-tight">
              Everything You Need <br />
              <span className="text-white/80">to Succeed</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
              From quiz creation to detailed analytics, QuestAI provides all the tools you need 
              for effective learning and assessment.
            </p>
            <div className="flex items-center justify-center mt-8 text-sm text-white/60 font-medium">
              <span className="mr-2">Powered by</span>
              <span className="font-semibold text-white">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                href={feature.link}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-8">
                    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl group-hover:bg-white/20 transition-all duration-500">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 mb-8 leading-relaxed font-light text-base">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-center text-white font-semibold text-lg group-hover:text-white/80 transition-colors duration-300">
                    Explore
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Apple-style Quick Access Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-6">
              ⚡ Quick Access
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-none tracking-tight">
              Jump Right In <br />
              <span className="text-white/80">Get Started</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
              Jump directly to any section of the platform with these quick links.
            </p>
            <div className="flex items-center justify-center mt-8 text-sm text-white/60 font-medium">
              <span className="mr-2">Powered by</span>
              <span className="font-semibold text-white">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link 
              href="/dashboard"
              className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center hover:bg-white/10 transition-all duration-500 hover:scale-105"
            >
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl mx-auto mb-6 w-fit shadow-2xl group-hover:bg-white/20 transition-all duration-500">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <span className="text-xl font-bold text-white leading-tight">Dashboard</span>
            </Link>
            
            <Link 
              href="/create"
              className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center hover:bg-white/10 transition-all duration-500 hover:scale-105"
            >
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl mx-auto mb-6 w-fit shadow-2xl group-hover:bg-white/20 transition-all duration-500">
                <Target className="h-8 w-8 text-white" />
              </div>
              <span className="text-xl font-bold text-white leading-tight">Create Quiz</span>
            </Link>
            
            <Link 
              href="/upload"
              className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center hover:bg-white/10 transition-all duration-500 hover:scale-105"
            >
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl mx-auto mb-6 w-fit shadow-2xl group-hover:bg-white/20 transition-all duration-500">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <span className="text-xl font-bold text-white leading-tight">Upload Files</span>
            </Link>
            
            <Link 
              href="/results"
              className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center hover:bg-white/10 transition-all duration-500 hover:scale-105"
            >
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl mx-auto mb-6 w-fit shadow-2xl group-hover:bg-white/20 transition-all duration-500">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <span className="text-xl font-bold text-white leading-tight">Results</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Apple-style CTA Section */}
      <section className="py-32 bg-gradient-to-br from-white/5 to-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-6">
            🚀 Ready to Launch
          </span>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-none tracking-tight">
            {isAuthenticated ? 'Ready to Continue <br />Learning?' : 'Ready to Get <br />Started?'}
          </h2>
          <p className="text-2xl md:text-3xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            {isAuthenticated 
              ? "Access your dashboard to continue your learning journey and explore new features."
              : "Join educators and learners who trust QuestAI for their assessment and learning needs."
            }
          </p>
          <div className="flex items-center justify-center mb-16 text-white/60 text-sm font-medium">
            <span className="mr-2">Powered by</span>
            <span className="font-semibold text-white">Kaizen</span>
            <span className="ml-2">- Continuous Improvement</span>
          </div>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isAuthenticated ? (
              <Link 
                href="/dashboard"
                className="bg-white text-black px-16 py-8 rounded-full text-2xl font-bold hover:bg-white/90 transition-all duration-300 shadow-2xl"
              >
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-white text-black px-16 py-8 rounded-full text-2xl font-bold hover:bg-white/90 transition-all duration-300 shadow-2xl"
              >
                <span>Get Started</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Apple-style Footer */}
      <footer className="bg-black/50 backdrop-blur-2xl border-t border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-8 flex items-center justify-center tracking-tight">
              <div className="w-10 h-10 bg-white rounded-3xl mr-4 flex items-center justify-center">
                <Target className="h-6 w-6 text-black" />
              </div>
              QuestAI
            </h3>
            <p className="text-xl text-white/60 mb-8 leading-relaxed font-light">
              The ultimate quiz management platform for modern learning and assessment.
            </p>
            <div className="flex items-center justify-center text-white/40 text-sm mb-12 font-medium">
              <span className="mr-2">Powered by</span>
              <span className="font-semibold text-white">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-white/40">
              <p className="font-medium">&copy; 2024 QuestAI. All rights reserved. Built with ❤️ using Next.js and Firebase.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

