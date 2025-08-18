'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  className = ''
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebar && (
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          {sidebar}
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        {header && (
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                {sidebar && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
                  >
                    <Menu size={20} />
                  </button>
                )}
                <div className="ml-4 lg:ml-0">
                  {header}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-4',
  className = ''
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const classes = [];
    if (cols.sm) classes.push(`grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    return classes.join(' ');
  };

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  );
}

// Responsive card component
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

export function ResponsiveCard({
  children,
  className = '',
  padding = 'md',
  shadow = 'md'
}: ResponsiveCardProps) {
  const getPadding = () => {
    switch (padding) {
      case 'sm': return 'p-3 sm:p-4';
      case 'md': return 'p-4 sm:p-6';
      case 'lg': return 'p-6 sm:p-8';
      default: return 'p-4 sm:p-6';
    }
  };

  const getShadow = () => {
    switch (shadow) {
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      default: return 'shadow-md';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${getPadding()} ${getShadow()} ${className}`}>
      {children}
    </div>
  );
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small';
  className?: string;
}

export function ResponsiveText({
  children,
  variant = 'body',
  className = ''
}: ResponsiveTextProps) {
  const getTextClasses = () => {
    switch (variant) {
      case 'h1':
        return 'text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900';
      case 'h2':
        return 'text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900';
      case 'h3':
        return 'text-lg sm:text-xl md:text-2xl font-semibold text-gray-900';
      case 'h4':
        return 'text-base sm:text-lg md:text-xl font-medium text-gray-900';
      case 'body':
        return 'text-sm sm:text-base text-gray-700';
      case 'small':
        return 'text-xs sm:text-sm text-gray-600';
      default:
        return 'text-sm sm:text-base text-gray-700';
    }
  };

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  return (
    <Component className={`${getTextClasses()} ${className}`}>
      {children}
    </Component>
  );
}
