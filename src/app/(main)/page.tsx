'use client';

import React, { useState, useEffect } from 'react';
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

  const features = [
    {
      icon: <Target className="h-8 w-8 text-white" />,
      title: "Quiz Creation",
      description: "Create custom quizzes with multiple question types and detailed analytics.",
      link: "/create",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-white" />,
      title: "Interactive Quizzes",
      description: "Take quizzes with real-time progress tracking and instant feedback.",
      link: "/quiz",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and performance insights with beautiful charts.",
      link: "/dashboard",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <Upload className="h-8 w-8 text-white" />,
      title: "File Management",
      description: "Upload and manage quiz files with secure cloud storage.",
      link: "/upload",
      color: "bg-indigo-50 border-indigo-200"
    }
  ];

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
                  Locus
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-[#212529] mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {isAuthenticated ? (
              <>
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C997] to-[#1BA085]">{user?.firstName || 'User'}!</span>
              </>
            ) : (
              <>
                Master Your Knowledge with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C997] to-[#1BA085] block"> Locus</span>
              </>
            )}
          </h1>

          <p className={`text-lg md:text-xl lg:text-2xl text-[#6C757D] mb-8 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {isAuthenticated 
              ? "Ready to continue your learning journey? Access your dashboard or explore our features."
              : "A comprehensive quiz management platform that helps you create, take, and analyze quizzes with powerful analytics and beautiful insights."
            }
          </p>

          <div className="flex items-center justify-center mb-8 text-sm text-[#6C757D]">
            <span className="mr-2">Powered by</span>
            <span className="font-bold text-[#20C997]">Kaizen</span>
            <span className="ml-2">- Continuous Improvement</span>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
                  className="bg-white text-[#20C997] border-2 border-[#20C997] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#20C997] hover:text-white transition-all duration-300 transform hover:scale-105"
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
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-[#6C757D] max-w-2xl mx-auto">
              From quiz creation to detailed analytics, Locus provides all the tools you need 
              for effective learning and assessment.
            </p>
            <div className="flex items-center justify-center mt-4 text-sm text-[#6C757D]">
              <span className="mr-2">Powered by</span>
              <span className="font-bold text-[#20C997]">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                href={feature.link}
                className={`group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#212529] mb-3 group-hover:text-[#20C997] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[#6C757D] mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-center text-[#20C997] font-semibold">
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-4">
              Quick Access
            </h2>
            <p className="text-xl text-[#6C757D] max-w-2xl mx-auto">
              Jump directly to any section of the platform with these quick links.
            </p>
            <div className="flex items-center justify-center mt-4 text-sm text-[#6C757D]">
              <span className="mr-2">Powered by</span>
              <span className="font-bold text-[#20C997]">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link 
              href="/dashboard"
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-[#212529] group-hover:text-[#20C997] transition-colors">Dashboard</span>
            </Link>
            
            <Link 
              href="/create"
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-[#212529] group-hover:text-[#20C997] transition-colors">Create Quiz</span>
            </Link>
            
            <Link 
              href="/upload"
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-[#212529] group-hover:text-[#20C997] transition-colors">Upload Files</span>
            </Link>
            
            <Link 
              href="/results"
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-[#212529] group-hover:text-[#20C997] transition-colors">Results</span>
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
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {isAuthenticated 
              ? "Access your dashboard to continue your learning journey and explore new features."
              : "Join educators and learners who trust Locus for their assessment and learning needs."
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
                className="bg-white text-[#20C997] px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-white text-[#20C997] px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
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
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-lg mr-3 flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              Locus
            </h3>
            <p className="text-gray-400 text-lg mb-4">
              The ultimate quiz management platform for modern learning and assessment.
            </p>
            <div className="flex items-center justify-center text-gray-400 text-sm mb-8">
              <span className="mr-2">Powered by</span>
              <span className="font-bold text-[#20C997]">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
            <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Locus. All rights reserved. Built with ❤️ using Next.js and Firebase.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

