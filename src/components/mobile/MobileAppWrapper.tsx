'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMobileDetection } from '@/lib/mobile-detection';
import MobileDashboard from './MobileOptimizedDashboard';
import MobileCreateQuiz from './MobileCreateQuiz';
import MobileUpload from './MobileUpload';
import MobileQuizTaker from './MobileQuizTaker';
import MobileQuizList from './MobileQuizList';
import MobileResults from './MobileResults';
import MobileProfile from './MobileProfile';

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

export function MobileAppWrapper({ children }: MobileAppWrapperProps) {
  const { isMobile } = useMobileDetection();
  const pathname = usePathname();

  // If not mobile, render the desktop version
  if (!isMobile) {
    return <>{children}</>;
  }

  // Mobile route mapping
  const getMobileComponent = () => {
    // Check for specific routes
    if (pathname === '/dashboard') {
      return <MobileDashboard />;
    }
    if (pathname === '/create') {
      return <MobileCreateQuiz />;
    }
    if (pathname === '/upload') {
      return <MobileUpload />;
    }
    if (pathname === '/quiz') {
      return <MobileQuizList />;
    }
    if (pathname.startsWith('/quiz/')) {
      return <MobileQuizTaker />;
    }
    if (pathname === '/results' || pathname.startsWith('/results/')) {
      return <MobileResults />;
    }
    if (pathname === '/profile' || pathname === '/settings') {
      return <MobileProfile />;
    }
    
    // For other routes, show the desktop version
    return <>{children}</>;
  };

  return getMobileComponent();
}

// Export individual mobile components for direct use
export {
  MobileDashboard,
  MobileCreateQuiz,
  MobileUpload,
  MobileQuizTaker,
  MobileQuizList,
  MobileResults,
  MobileProfile
};
