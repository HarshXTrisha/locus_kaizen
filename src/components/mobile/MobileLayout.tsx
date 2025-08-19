'use client';

import React from 'react';
import { useMobileDetection } from '@/lib/mobile-detection';

interface MobileLayoutProps {
  children: React.ReactNode;
  mobileComponent: React.ComponentType<any>;
  mobileProps?: any;
}

export function MobileLayout({ 
  children, 
  mobileComponent: MobileComponent, 
  mobileProps = {} 
}: MobileLayoutProps) {
  const { isMobile } = useMobileDetection();

  // Render mobile component only on mobile devices
  if (isMobile) {
    return <MobileComponent {...mobileProps} />;
  }

  // Render desktop component on larger screens
  return <>{children}</>;
}

// Mobile navigation component
export function MobileNavigation() {
  const { isMobile } = useMobileDetection();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
          { id: 'create', label: 'Create', icon: '➕' },
          { id: 'upload', label: 'Upload', icon: '📤' },
          { id: 'quizzes', label: 'Quizzes', icon: '📚' },
          { id: 'results', label: 'Results', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
