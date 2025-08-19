'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { 
  Target, 
  BarChart3, 
  Users, 
  BookOpen, 
  Upload, 
  Settings, 
  LogIn,
  LogOut,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Globe,
  Award,
  Smartphone,
  Monitor
} from '@/lib/icons';

export default function Home() {
  const { user, isAuthenticated } = useAppStore();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#E8F5E8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-[#212529] flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-lg mr-2 flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Locus<span className="text-[#20C997]">(x)</span>Kaizen
                </h1>
              </div>
              <div className="ml-4 flex items-center text-xs text-[#6C757D]">
                <span className="mr-1">Powered by</span>
                <span className="font-bold text-[#20C997]">Kaizen</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:block text-gray-600">Welcome, {user?.firstName || 'User'}!</span>
                  <Link 
                    href="/dashboard"
                    className="bg-[#20C997] text-white px-4 py-2 rounded-lg hover:bg-[#1BA085] transition-all duration-300 transform hover:scale-105"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/login"
                  className="bg-[#20C997] text-white px-4 py-2 rounded-lg hover:bg-[#1BA085] transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign In with Google</span>
                  <span className="sm:hidden">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#212529] mb-6">
              {isAuthenticated ? (
                <>
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C997] to-[#1BA085]">{user?.firstName || 'User'}!</span>
                </>
              ) : (
                <>
                  Master Your Knowledge with
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C997] to-[#1BA085] block"> Locus(x)Kaizen</span>
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-[#6C757D] mb-8 max-w-4xl mx-auto">
              {isAuthenticated 
                ? "Ready to continue your learning journey? Access your dashboard or explore our features."
                : "A comprehensive quiz management platform powered by Kaizen methodology, designed for educators and learners who value continuous improvement."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link 
                    href="/create"
                    className="bg-white/90 backdrop-blur-sm text-[#20C997] border-2 border-[#20C997] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#20C997] hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    Create New Quiz
                  </Link>
                </>
              ) : (
                <Link 
                  href="/login"
                  className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  Sign In with Google
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-[#6C757D] max-w-2xl mx-auto">
              From quiz creation to detailed analytics, Locus(x)Kaizen provides all the tools you need 
              for effective learning and continuous improvement.
            </p>
            <div className="flex items-center justify-center mt-4 text-sm text-[#6C757D]">
              <span className="mr-2">Powered by</span>
              <span className="font-bold text-[#20C997]">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link 
              href="/create"
              className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#212529] mb-3 group-hover:text-[#20C997] transition-colors">
                    Quiz Creation
                  </h3>
                  <p className="text-[#6C757D] mb-6 text-lg leading-relaxed">
                    Create custom quizzes with multiple question types and detailed analytics.
                  </p>
                  <div className="flex items-center text-[#20C997] font-semibold text-lg">
                    Explore
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
            
            <Link 
              href="/quiz"
              className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#212529] mb-3 group-hover:text-[#20C997] transition-colors">
                    Interactive Quizzes
                  </h3>
                  <p className="text-[#6C757D] mb-6 text-lg leading-relaxed">
                    Take quizzes with real-time progress tracking and instant feedback.
                  </p>
                  <div className="flex items-center text-[#20C997] font-semibold text-lg">
                    Explore
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
            
            <Link 
              href="/dashboard"
              className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#212529] mb-3 group-hover:text-[#20C997] transition-colors">
                    Analytics Dashboard
                  </h3>
                  <p className="text-[#6C757D] mb-6 text-lg leading-relaxed">
                    Comprehensive analytics and performance insights with beautiful charts.
                  </p>
                  <div className="flex items-center text-[#20C997] font-semibold text-lg">
                    Explore
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#20C997] to-[#1BA085] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isAuthenticated ? 'Ready to Continue Learning?' : 'Ready to Get Started?'}
          </h2>
          <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
            {isAuthenticated 
              ? "Access your dashboard to continue your learning journey and explore new features."
              : "Join educators and learners who trust Locus(x)Kaizen for their assessment and continuous improvement needs."
            }
          </p>
          <div className="flex items-center justify-center mb-10 text-white/80 text-sm">
            <span className="mr-2">Powered by</span>
            <span className="font-bold text-white">Kaizen</span>
            <span className="ml-2">- Continuous Improvement</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isAuthenticated ? (
              <Link 
                href="/dashboard"
                className="bg-white text-[#20C997] px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-white text-[#20C997] px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Sign In with Google
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#212529] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-lg mr-3 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                Locus<span className="text-[#20C997]">(x)</span>Kaizen
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-4">
                The ultimate quiz management platform powered by Kaizen methodology for continuous improvement.
              </p>
              <div className="flex items-center text-gray-400 text-sm">
                <span className="mr-2">Powered by</span>
                <span className="font-bold text-[#20C997]">Kaizen</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/create" className="hover:text-white transition-colors">Quiz Creation</Link></li>
                <li><Link href="/results" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="/upload" className="hover:text-white transition-colors">File Upload</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/settings" className="hover:text-white transition-colors">Settings</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Next.js 14</li>
                <li>Firebase</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2024 Locus(x)Kaizen. All rights reserved. Built with ❤️ using Next.js and Firebase.</p>
            <p className="text-sm mt-2">Powered by <span className="font-bold text-[#20C997]">Kaizen</span> - Continuous Improvement</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
