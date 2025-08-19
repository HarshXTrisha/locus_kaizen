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

// Particle System Component
const ParticleSystem = () => {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1
      }));
      setParticles(newParticles);
    };

    generateParticles();

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y - particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.5
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.id * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const { user, isAuthenticated } = useAppStore();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Mouse movement effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#E8F5E8] overflow-x-hidden">
      {/* Particle System */}
      <ParticleSystem />
      
      {/* Header with Glassmorphism */}
      <header className="bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-[#212529] flex items-center tracking-tight hover:scale-105 transition-all duration-300 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-lg mr-3 flex items-center justify-center hover:rotate-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#20C997]/25">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Locus
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
                    className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#20C997]/25 transition-all duration-300 transform hover:scale-105 font-medium backdrop-blur-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-gray-700/80 transition-all duration-300 flex items-center font-medium hover:shadow-lg"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/login"
                  className="bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#20C997]/25 transition-all duration-300 transform hover:scale-105 flex items-center font-medium backdrop-blur-sm"
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

      {/* Hero Section with Enhanced Glassmorphism */}
      <section ref={heroRef} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#20C997] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1BA085] rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Floating Elements with Mouse Follow */}
        {typeof window !== 'undefined' && (
          <>
            <div 
              className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#20C997]/30 rounded-full transition-all duration-300 ease-out backdrop-blur-sm"
              style={{
                transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.02}px, ${(mousePosition.y - window.innerHeight / 2) * 0.02}px)`,
              }}
            ></div>
            <div 
              className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-[#1BA085]/30 rounded-full transition-all duration-300 ease-out backdrop-blur-sm"
              style={{
                transform: `translate(${(mousePosition.x - window.innerWidth / 2) * -0.02}px, ${(mousePosition.y - window.innerHeight / 2) * -0.02}px)`,
              }}
            ></div>
          </>
        )}

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 
            className={`text-5xl md:text-7xl lg:text-8xl font-bold text-[#212529] mb-8 transition-all duration-1000 leading-tight tracking-tight ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          >
            {isAuthenticated ? (
              <>
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C997] to-[#1BA085] hover:scale-105 transition-transform duration-300 inline-block">{user?.firstName || 'User'}!</span>
              </>
            ) : (
              <>
                Master Your Knowledge with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C997] to-[#1BA085] block hover:scale-105 transition-transform duration-300"> Locus</span>
              </>
            )}
          </h1>

          <p 
            className={`text-xl md:text-2xl lg:text-3xl text-[#6C757D] mb-10 max-w-5xl mx-auto transition-all duration-1000 delay-300 leading-relaxed font-normal ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{
              transform: `translateY(${scrollY * 0.05}px)`,
            }}
          >
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



          <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard"
                  className="group bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-10 py-5 rounded-xl text-xl font-semibold hover:shadow-xl hover:shadow-[#20C997]/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center relative overflow-hidden backdrop-blur-sm"
                >
                  <span className="relative z-10">Go to Dashboard</span>
                  <ArrowRight className="ml-3 h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1BA085] to-[#20C997] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  href="/create"
                  className="group bg-white/10 backdrop-blur-xl text-[#20C997] border-2 border-[#20C997]/30 px-10 py-5 rounded-xl text-xl font-semibold hover:bg-[#20C997] hover:text-white transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                >
                  <span className="relative z-10">Create New Quiz</span>
                  <div className="absolute inset-0 bg-[#20C997] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              </>
            ) : (
              <Link 
                href="/login"
                className="group bg-gradient-to-r from-[#20C997] to-[#1BA085] text-white px-10 py-5 rounded-xl text-xl font-semibold hover:shadow-xl hover:shadow-[#20C997]/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center relative overflow-hidden backdrop-blur-sm"
              >
                <span className="relative z-10">Sign In with Google</span>
                <ArrowRight className="ml-3 h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1BA085] to-[#20C997] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section with 3D Card Effects */}
      <section ref={featuresRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#20C997] to-[#1BA085] transform rotate-12 scale-150"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#212529] mb-6 leading-tight tracking-tight transition-all duration-700"
              style={{
                opacity: featuresRef.current ? (scrollY > (featuresRef.current.offsetTop - window.innerHeight * 0.8) ? 1 : 0.3) : 1,
                transform: featuresRef.current ? (scrollY > (featuresRef.current.offsetTop - window.innerHeight * 0.8) ? 'translateY(0)' : 'translateY(20px)') : 'translateY(0)',
              }}
            >
              Everything You Need to Succeed
            </h2>
            <p 
              className="text-xl md:text-2xl text-[#6C757D] max-w-3xl mx-auto leading-relaxed font-normal transition-all duration-700 delay-200"
              style={{
                opacity: featuresRef.current ? (scrollY > (featuresRef.current.offsetTop - window.innerHeight * 0.8) ? 1 : 0.3) : 1,
                transform: featuresRef.current ? (scrollY > (featuresRef.current.offsetTop - window.innerHeight * 0.8) ? 'translateY(0)' : 'translateY(20px)') : 'translateY(0)',
              }}
            >
              From quiz creation to detailed analytics, Locus provides all the tools you need 
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
                className={`group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  opacity: featuresRef.current ? (scrollY > (featuresRef.current.offsetTop - window.innerHeight * 0.6) ? 1 : 0) : 1,
                  transform: featuresRef.current ? (scrollY > (featuresRef.current.offsetTop - window.innerHeight * 0.6) ? 'translateY(0)' : 'translateY(50px)') : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-[#20C997]/25`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#212529] mb-4 group-hover:text-[#20C997] transition-colors leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[#6C757D] mb-6 leading-relaxed font-normal text-base">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-center text-[#20C997] font-semibold text-lg">
                    Explore
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
                {/* 3D Card Effect */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border ${feature.borderColor}`}
                  style={{
                    transform: hoveredCard === index ? 'perspective(1000px) rotateX(5deg) rotateY(5deg)' : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                    transition: 'transform 0.3s ease-out'
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* Quick Access Section with Enhanced Hover Effects */}
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
              className="group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center relative overflow-hidden hover:-translate-y-2"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-[#20C997]/25">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#212529] group-hover:text-[#20C997] transition-colors leading-tight relative z-10">Dashboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#20C997]/5 to-[#1BA085]/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            
            <Link 
              href="/create"
              className="group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center relative overflow-hidden hover:-translate-y-2"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-[#20C997]/25">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#212529] group-hover:text-[#20C997] transition-colors leading-tight relative z-10">Create Quiz</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#20C997]/5 to-[#1BA085]/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            
            <Link 
              href="/upload"
              className="group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center relative overflow-hidden hover:-translate-y-2"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-[#20C997]/25">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#212529] group-hover:text-[#20C997] transition-colors leading-tight relative z-10">Upload Files</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#20C997]/5 to-[#1BA085]/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            
            <Link 
              href="/results"
              className="group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center relative overflow-hidden hover:-translate-y-2"
            >
              <div className="p-3 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-2xl mx-auto mb-4 w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-[#20C997]/25">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#212529] group-hover:text-[#20C997] transition-colors leading-tight relative z-10">Results</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#20C997]/5 to-[#1BA085]/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section with Enhanced Glassmorphism */}
      <section ref={ctaRef} className="py-24 bg-gradient-to-r from-[#20C997] to-[#1BA085] relative overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 
            className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight transition-all duration-700"
            style={{
              opacity: ctaRef.current ? (scrollY > (ctaRef.current.offsetTop - window.innerHeight * 0.8) ? 1 : 0.3) : 1,
              transform: ctaRef.current ? (scrollY > (ctaRef.current.offsetTop - window.innerHeight * 0.8) ? 'translateY(0)' : 'translateY(20px)') : 'translateY(0)',
            }}
          >
            {isAuthenticated ? 'Ready to Continue Learning?' : 'Ready to Get Started?'}
          </h2>
          <p 
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed font-normal transition-all duration-700 delay-200"
            style={{
              opacity: ctaRef.current ? (scrollY > (ctaRef.current.offsetTop - window.innerHeight * 0.8) ? 1 : 0.3) : 1,
              transform: ctaRef.current ? (scrollY > (ctaRef.current.offsetTop - window.innerHeight * 0.8) ? 'translateY(0)' : 'translateY(20px)') : 'translateY(0)',
            }}
          >
            {isAuthenticated 
              ? "Access your dashboard to continue your learning journey and explore new features."
              : "Join educators and learners who trust Locus for their assessment and learning needs."
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
                className="group bg-white/10 backdrop-blur-xl text-[#20C997] px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-white hover:text-[#20C997] transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl relative overflow-hidden border border-white/20"
              >
                <span className="relative z-10">Go to Dashboard</span>
                <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
            ) : (
              <Link 
                href="/login"
                className="group bg-white/10 backdrop-blur-xl text-[#20C997] px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-white hover:text-[#20C997] transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl relative overflow-hidden border border-white/20"
              >
                <span className="relative z-10">Sign In with Google</span>
                <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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
              <div className="w-8 h-8 bg-gradient-to-r from-[#20C997] to-[#1BA085] rounded-lg mr-3 flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              Locus
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
              <p className="font-medium">&copy; 2024 Locus. All rights reserved. Built with ❤️ using Next.js and Firebase.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

