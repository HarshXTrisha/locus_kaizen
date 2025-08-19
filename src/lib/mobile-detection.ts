'use client';

import { useState, useEffect } from 'react';

// Mobile detection utility
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width < 768); // md breakpoint
      setIsTablet(width >= 768 && width < 1024); // md to lg breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize,
    isSmallScreen: screenSize.width < 640, // sm breakpoint
    isMediumScreen: screenSize.width >= 640 && screenSize.width < 768, // sm to md
    isLargeScreen: screenSize.width >= 1024, // lg and above
  };
}

// Mobile-specific CSS classes
export const mobileClasses = {
  container: 'px-4 py-3 sm:px-6 lg:px-8',
  card: 'bg-white rounded-xl border border-gray-200 p-4 shadow-sm',
  button: {
    primary: 'bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform',
    secondary: 'bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform',
    danger: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform',
  },
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent',
  text: {
    h1: 'text-xl font-bold text-gray-900',
    h2: 'text-lg font-semibold text-gray-900',
    h3: 'text-base font-medium text-gray-900',
    body: 'text-sm text-gray-700',
    small: 'text-xs text-gray-600',
  }
};

// Mobile navigation helper
export const mobileNavigation = {
  tabs: [
    { id: 'dashboard', label: 'Dashboard', icon: 'Home' },
    { id: 'create', label: 'Create', icon: 'Plus' },
    { id: 'upload', label: 'Upload', icon: 'Upload' },
    { id: 'quizzes', label: 'Quizzes', icon: 'BookOpen' },
    { id: 'results', label: 'Results', icon: 'BarChart3' },
    { id: 'profile', label: 'Profile', icon: 'User' },
  ]
};
