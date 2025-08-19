'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  Users, 
  BookOpen, 
  Upload, 
  Settings, 
  LogIn,
  LogOut,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Globe,
  Award,
  Clock,
  Smartphone,
  Monitor
} from '@/lib/icons';

export default function Home() {
  const { user, isAuthenticated } = useAppStore();
  const { signOut } = useAuth();
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const heroFeatures = [
    {
      icon: <Target className="h-12 w-12 text-white" />,
      title: "Smart Quiz Creation",
      description: "Create engaging quizzes with AI-powered question generation"
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-white" />,
      title: "Real-time Analytics",
      description: "Get instant insights into performance and learning progress"
    },
    {
      icon: <Zap className="h-12 w-12 text-white" />,
      title: "Lightning Fast",
      description: "Optimized for speed with instant loading and smooth interactions"
    }
  ];

  const features = [
    {
      icon: <Target className="h-8 w-8 text-[#20C997]" />,
      title: "Quiz Creation",
      description: "Create custom quizzes with multiple question types and detailed analytics.",
      link: "/create",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-[#20C997]" />,
      title: "Interactive Quizzes",
      description: "Take quizzes with real-time progress tracking and instant feedback.",
      link: "/quiz",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-[#20C997]" />,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and performance insights with beautiful charts.",
      link: "/dashboard",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-[#20C997]" />,
      title: "Results & Insights",
      description: "Detailed performance analysis and actionable insights for improvement.",
      link: "/results",
      color: "bg-orange-50 border-orange-200"
    },
    {
      icon: <Upload className="h-8 w-8 text-[#20C997]" />,
      title: "File Management",
      description: "Upload and manage quiz files with secure cloud storage.",
      link: "/upload",
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      icon: <Users className="h-8 w-8 text-[#20C997]" />,
      title: "User Management",
      description: "Manage user accounts, permissions, and authentication settings.",
      link: "/settings",
      color: "bg-pink-50 border-pink-200"
    }
  ];

  const stats = [
    { number: "100+", label: "Quizzes Created", icon: <Target className="h-6 w-6" /> },
    { number: "50K+", label: "Questions Answered", icon: <CheckCircle className="h-6 w-6" /> },
    { number: "95%", label: "User Satisfaction", icon: <Star className="h-6 w-6" /> },
    { number: "24/7", label: "Availability", icon: <Clock className="h-6 w-6" /> }
  ];

  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-[#20C997]" />,
      title: "Lightning Fast",
      description: "Optimized performance with dynamic loading and code splitting."
    },
    {
      icon: <Shield className="h-6 w-6 text-[#20C997]" />,
      title: "Secure & Reliable",
      description: "Firebase-powered authentication and secure data handling."
    },
    {
      icon: <Globe className="h-6 w-6 text-[#20C997]" />,
      title: "Cross-Platform",
      description: "Works seamlessly on desktop, tablet, and mobile devices."
    },
    {
      icon: <Star className="h-6 w-6 text-[#20C997]" />,
      title: "Modern UI/UX",
      description: "Beautiful, intuitive interface designed for the best user experience."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Educational Consultant",
      content: "Locus has transformed how I create and manage assessments. The analytics are incredibly insightful!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Corporate Trainer",
      content: "The mobile experience is flawless. My team can take quizzes anywhere, anytime. Highly recommended!",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "University Professor",
      content: "The quiz creation tools are intuitive and the results analysis helps me understand student performance better.",
      rating: 5,
      avatar: "ER"
    }
  ];

  const trustSignals = [
    {
      icon: <Shield className="h-8 w-8 text-[#20C997]" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and secure data handling"
    },
    {
      icon: <Award className="h-8 w-8 text-[#20C997]" />,
      title: "99.9% Uptime",
      description: "Reliable service with guaranteed availability"
    },
    {
      icon: <Users className="h-8 w-8 text-[#20C997]" />,
      title: "10,000+ Users",
      description: "Trusted by educators and learners worldwide"
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

      {/* Enhanced Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#20C997]/10 via-transparent to-[#1BA085]/10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#20C997]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1BA085]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Main Heading */}
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

            {/* Subtitle */}
            <p className={`text-lg md:text-xl lg:text-2xl text-[#6C757D] mb-8 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {isAuthenticated 
                ? "Ready to continue your learning journey? Access your dashboard or explore our features."
                : "A comprehensive quiz management platform that helps you create, take, and analyze quizzes with powerful analytics and beautiful insights. Sign in with your Google account to get started."
              }
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link 
                    href="/create"
                    className="bg-white text-[#20C997] border-2 border-[#20C997] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#20C997] hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    Create New Quiz
                  </Link>
                </>
              ) : (
                <Link 
                  href="/login"
                  className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  Sign In with Google
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Rotating Feature Highlight */}
            <div className={`max-w-2xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-center mb-4">
                  {heroFeatures[currentFeature].icon}
                </div>
                <h3 className="text-xl font-semibold text-[#212529] mb-2">
                  {heroFeatures[currentFeature].title}
                </h3>
                <p className="text-[#6C757D]">
                  {heroFeatures[currentFeature].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-full text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[#20C997] mb-2">
                  {stat.number}
                </div>
                <div className="text-[#6C757D] font-medium text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-xl text-[#6C757D] max-w-2xl mx-auto">
              Join thousands of educators and learners who trust Locus for their assessment needs.
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#212529]">{testimonial.name}</h4>
                    <p className="text-sm text-[#6C757D]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-[#6C757D] mb-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustSignals.map((signal, index) => (
              <div key={index} className={`text-center transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex justify-center mb-4">
                  {signal.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#212529] mb-2">
                  {signal.title}
                </h3>
                <p className="text-[#6C757D]">
                  {signal.description}
                </p>
              </div>
            ))}
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
              From quiz creation to detailed analytics, Locus provides all the tools you need 
              for effective learning and assessment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                href={feature.link}
                className={`group p-6 rounded-xl border-2 ${feature.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#212529] mb-2 group-hover:text-[#20C997] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[#6C757D] mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-[#20C997] font-medium">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-4">
              Why Choose Locus?
            </h2>
            <p className="text-xl text-[#6C757D] max-w-2xl mx-auto">
              Built with modern technologies and best practices for the best user experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className={`text-center transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#212529] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-[#6C757D]">
                  {benefit.description}
                </p>
              </div>
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
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link 
              href="/dashboard"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all text-center group"
            >
              <BarChart3 className="h-8 w-8 text-[#20C997] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#212529] group-hover:text-[#20C997]">Dashboard</span>
            </Link>
            
            <Link 
              href="/create"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all text-center group"
            >
              <Target className="h-8 w-8 text-[#20C997] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#212529] group-hover:text-[#20C997]">Create Quiz</span>
            </Link>
            
            <Link 
              href="/upload"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all text-center group"
            >
              <Upload className="h-8 w-8 text-[#20C997] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#212529] group-hover:text-[#20C997]">Upload Files</span>
            </Link>
            
            <Link 
              href="/results"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all text-center group"
            >
              <TrendingUp className="h-8 w-8 text-[#20C997] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#212529] group-hover:text-[#20C997]">Results</span>
            </Link>
            
            <Link 
              href="/settings"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all text-center group"
            >
              <Settings className="h-8 w-8 text-[#20C997] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#212529] group-hover:text-[#20C997]">Settings</span>
            </Link>
            
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-md transition-all text-center group"
              >
                <LogOut className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-[#212529] group-hover:text-red-500">Sign Out</span>
              </button>
            ) : (
              <Link 
                href="/login"
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all text-center group"
              >
                <LogIn className="h-8 w-8 text-[#20C997] mx-auto mb-2" />
                <span className="text-sm font-medium text-[#212529] group-hover:text-[#20C997]">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#20C997] to-[#1BA085]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isAuthenticated ? 'Ready to Continue Learning?' : 'Ready to Get Started?'}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {isAuthenticated 
              ? "Access your dashboard to continue your learning journey and explore new features."
              : "Join thousands of users who are already using Locus to improve their learning and assessment experience."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link 
                href="/dashboard"
                className="bg-white text-[#20C997] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-white text-[#20C997] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Sign In with Google
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#212529] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded mr-2 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Locus
              </h3>
              <p className="text-gray-400">
                The ultimate quiz management platform for modern learning and assessment.
              </p>
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
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Locus. All rights reserved. Built with ❤️ using Next.js and Firebase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

