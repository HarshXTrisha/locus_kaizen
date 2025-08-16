import React from 'react';
import Link from 'next/link';
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  Users, 
  BookOpen, 
  Upload, 
  Settings, 
  LogIn,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Globe
} from '@/lib/icons';

export default function Home() {
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
    { number: "100+", label: "Quizzes Created" },
    { number: "50K+", label: "Questions Answered" },
    { number: "95%", label: "User Satisfaction" },
    { number: "24/7", label: "Availability" }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-[#212529]">Locus</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="bg-[#20C997] text-white px-4 py-2 rounded-lg hover:bg-[#1BA085] transition-colors"
              >
                Sign In with Google
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[#212529] mb-6">
            Master Your Knowledge with
            <span className="text-[#20C997]"> Locus</span>
          </h1>
          <p className="text-xl text-[#6C757D] mb-8 max-w-3xl mx-auto">
            A comprehensive quiz management platform that helps you create, take, and analyze quizzes 
            with powerful analytics and beautiful insights. Sign in with your Google account to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-[#20C997] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#1BA085] transition-colors flex items-center justify-center"
            >
              Sign In with Google
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#20C997] mb-2">
                  {stat.number}
                </div>
                <div className="text-[#6C757D] font-medium">
                  {stat.label}
                </div>
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
                className={`group p-6 rounded-xl border-2 ${feature.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
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
              <div key={index} className="text-center">
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
            
            <Link 
              href="/login"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#20C997] hover:shadow-md transition-all text-center group"
            >
              <LogIn className="h-8 w-8 text-[#20C997] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#212529] group-hover:text-[#20C997]">Sign In</span>
            </Link>
            

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#20C997]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already using Locus to improve their learning and assessment experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-white text-[#20C997] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign In with Google
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#212529] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Locus</h3>
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

