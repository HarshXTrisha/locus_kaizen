'use client';

import React from 'react';

interface LoadingIndicatorProps {
  isVisible: boolean;
}

export function LoadingIndicator({ isVisible }: LoadingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div className="h-full bg-gradient-to-r from-[#20C997] to-[#1BA085] animate-pulse">
        <div className="h-full bg-gradient-to-r from-[#20C997] to-[#1BA085] animate-loading-bar"></div>
      </div>
    </div>
  );
}
