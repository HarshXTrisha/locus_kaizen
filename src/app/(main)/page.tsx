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
import FloatingElementsAnimation from '@/components/common/FloatingElementsAnimation';

// Typewriter Animation Component
const TypewriterText = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000 }: {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const currentText = texts[currentTextIndex];
    
    if (!isDeleting) {
      // Typing phase
      if (currentCharIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, currentCharIndex + 1));
          setCurrentCharIndex(currentCharIndex + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait then start deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting phase
      if (currentCharIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, currentCharIndex - 1));
          setCurrentCharIndex(currentCharIndex - 1);
        }, deleteSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next text
        setIsDeleting(false);
        setCurrentTextIndex((currentTextIndex + 1) % texts.length);
      }
    }
  }, [currentTextIndex, currentCharIndex, isDeleting, texts, speed, deleteSpeed, pauseTime]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C997] to-[#1BA085]">
      {displayText}
      <span className="inline-block w-0.5 h-8 bg-gradient-to-r from-[#20C997] to-[#1BA085] ml-1 animate-blink"></span>
    </span>
  );
};

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
      color: "from-green-400/20 to-green-600/20",
      borderColor: "border-green-400/30"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-white" />,
      title: "Interactive Quizzes",
      description: "Take quizzes with real-time progress tracking and instant feedback.",
      link: "/quiz",
      color: "from-blue-400/20 to-blue-600/20",
      borderColor: "border-blue-400/30"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and performance insights with beautiful charts.",
      link: "/dashboard",
      color: "from-purple-400/20 to-purple-600/20",
      borderColor: "border-purple-400/30"
    },
    {
      icon: <Upload className="h-8 w-8 text-white" />,
      title: "File Management",
      description: "Upload and manage quiz files with secure cloud storage.",
      link: "/upload",
      color: "from-indigo-400/20 to-indigo-600/20",
      borderColor: "border-indigo-400/30"
    }
  ];

  // Typewriter texts for non-authenticated users
  const typewriterTexts = [
    "QuestAI",
    "Learning Platform", 
    "Quiz Management"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#E8F5E8] overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-[#212529] flex items-center tracking-tight">
                  {/* Logo Mockup - Replace with your actual logo */}
                  <div className="w-12 h-12 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-lg mr-3 flex items-center justify-center border-2 border-white/20 shadow-lg">
                    {/* Logo Placeholder - Upload your logo here */}
                    <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">LOGO</span>
                    </div>
                    {/* 
                    To use your actual logo, replace the above div with:
                    <img 
                      src="/your-logo.png" 
                      alt="QuestAI Logo" 
                      className="w-8 h-8 object-contain"
                    />
                    */}
                  </div>
                  QuestAI
                </h1>
              </div>
              <div className="ml-4 flex items-center text-xs text-[#6C757D] font-medium">
                <span className="mr-1">Powered by</span>
                <span className="font-semibold text-[#20C997]">Kaizen</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:block text-gray-600 font-medium">Welcome, {user?.firstName || 'User'}!</span>
                  <Link 
                    href="/dashboard"
                    className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/login"
                  className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-4 py-2 rounded-lg flex items-center font-medium backdrop-blur-sm"
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
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Floating Elements Animation Background */}
        {!isAuthenticated && <FloatingElementsAnimation />}
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#212529] mb-8 leading-tight tracking-tight">
            {isAuthenticated ? (
              <>
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C997] to-[#1BA085]">{user?.firstName || 'User'}!</span>
              </>
            ) : (
              <>
                Welcome to
                <span className="block">
                  <TypewriterText 
                    texts={typewriterTexts}
                    speed={150}
                    deleteSpeed={75}
                    pauseTime={2000}
                  />
                </span>
              </>
            )}
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-[#6C757D] mb-10 max-w-5xl mx-auto leading-relaxed font-normal">
            {isAuthenticated 
              ? "Ready to continue your learning journey? Access your dashboard or explore our features."
              : "A comprehensive quiz management platform that helps you create, take, and analyze quizzes with powerful analytics and beautiful insights."
            }
          </p>

          <div className="flex items-center justify-center mb-10 text-sm text-[#6C757D] font-medium">
            <span className="mr-2">Powered by</span>
            <span className="font-semibold text-[#20C997]">Kaizen</span>
            <span className="ml-2">- Continuous Improvement</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard"
                  className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-10 py-5 rounded-xl text-xl font-semibold flex items-center justify-center backdrop-blur-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
                <Link 
                  href="/create"
                  className="bg-white/10 backdrop-blur-xl text-[#20C997] border-2 border-[#20C997]/30 px-10 py-5 rounded-xl text-xl font-semibold"
                >
                  <span>Create New Quiz</span>
                </Link>
              </>
            ) : (
              <Link 
                href="/login"
                className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-10 py-5 rounded-xl text-xl font-semibold flex items-center justify-center backdrop-blur-sm hover:from-[#1BA085] hover:to-[#20C997] transition-all duration-300 shadow-lg"
              >
                <span>Sign In with Google</span>
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#212529] mb-6 leading-tight tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl md:text-2xl text-[#6C757D] max-w-3xl mx-auto leading-relaxed font-normal">
              From quiz creation to detailed analytics, QuestAI provides all the tools you need 
              for effective learning and assessment.
            </p>
            <div className="flex items-center justify-center mt-6 text-sm text-[#6C757D] font-medium">
              <span className="mr-2">Powered by</span>
              <span className="font-semibold text-[#20C997]">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                href={feature.link}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl shadow-lg">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#212529] mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[#6C757D] mb-6 leading-relaxed font-normal text-base">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-center text-[#20C997] font-semibold text-lg">
                    Explore
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#212529] mb-6 leading-tight tracking-tight">
              Quick Access
            </h2>
            <p className="text-xl md:text-2xl text-[#6C757D] max-w-3xl mx-auto leading-relaxed font-normal">
              Jump directly to any section of the platform with these quick links.
            </p>
            <div className="flex items-center justify-center mt-6 text-sm text-[#6C757D] font-medium">
              <span className="mr-2">Powered by</span>
              <span className="font-semibold text-[#20C997]">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link 
              href="/dashboard"
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg text-center"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#212529] leading-tight">Dashboard</span>
            </Link>
            
            <Link 
              href="/create"
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg text-center"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#212529] leading-tight">Create Quiz</span>
            </Link>
            
            <Link 
              href="/upload"
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg text-center"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#212529] leading-tight">Upload Files</span>
            </Link>
            
            <Link 
              href="/results"
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg text-center"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#212529] leading-tight">Results</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#20C997] to-[#1BA085] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            {isAuthenticated ? 'Ready to Continue Learning?' : 'Ready to Get Started?'}
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed font-normal">
            {isAuthenticated 
              ? "Access your dashboard to continue your learning journey and explore new features."
              : "Join educators and learners who trust QuestAI for their assessment and learning needs."
            }
          </p>
          <div className="flex items-center justify-center mb-12 text-white/80 text-sm font-medium">
            <span className="mr-2">Powered by</span>
            <span className="font-semibold text-white">Kaizen</span>
            <span className="ml-2">- Continuous Improvement</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isAuthenticated ? (
              <Link 
                href="/dashboard"
                className="bg-white/10 backdrop-blur-xl text-[#20C997] px-12 py-6 rounded-2xl text-2xl font-bold border border-white/20"
              >
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-white text-[#20C997] px-12 py-6 rounded-2xl text-2xl font-bold border border-white/20 shadow-lg hover:bg-gray-50 transition-colors"
              >
                <span>Sign In with Google</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#212529] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-6 flex items-center justify-center tracking-tight">
              {/* Logo Mockup - Replace with your actual logo */}
              <div className="w-12 h-12 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-lg mr-3 flex items-center justify-center border-2 border-white/20 shadow-lg">
                {/* Logo Placeholder - Upload your logo here */}
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LOGO</span>
                </div>
                {/* 
                To use your actual logo, replace the above div with:
                <img 
                  src="/your-logo.png" 
                  alt="QuestAI Logo" 
                  className="w-8 h-8 object-contain"
                />
                */}
              </div>
              QuestAI
            </h3>
            <p className="text-xl text-gray-400 mb-6 leading-relaxed font-normal">
              The ultimate quiz management platform for modern learning and assessment.
            </p>
            <div className="flex items-center justify-center text-gray-400 text-sm mb-10 font-medium">
              <span className="mr-2">Powered by</span>
              <span className="font-semibold text-[#20C997]">Kaizen</span>
              <span className="ml-2">- Continuous Improvement</span>
            </div>
            <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
              <p className="font-medium">&copy; 2024 QuestAI. All rights reserved. Built with ❤️ using Next.js and Firebase.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

