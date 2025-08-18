'use client';

import React from 'react';
import { 
  AlertCircle, 
  FileText, 
  BarChart3, 
  BookOpen, 
  Plus, 
  RefreshCw,
  Search,
  Inbox
} from 'lucide-react';

interface EmptyStateProps {
  type: 'quiz' | 'result' | 'error' | 'search' | 'upload' | 'analytics';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showIcon?: boolean;
  className?: string;
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  showIcon = true,
  className = ''
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'quiz':
        return <BookOpen className="h-12 w-12 text-gray-400" />;
      case 'result':
        return <BarChart3 className="h-12 w-12 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-400" />;
      case 'search':
        return <Search className="h-12 w-12 text-gray-400" />;
      case 'upload':
        return <FileText className="h-12 w-12 text-gray-400" />;
      case 'analytics':
        return <BarChart3 className="h-12 w-12 text-gray-400" />;
      default:
        return <Inbox className="h-12 w-12 text-gray-400" />;
    }
  };

  const getContainerClasses = () => {
    const baseClasses = 'flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 text-center';
    const typeClasses = type === 'error' ? 'bg-red-50 border border-red-200 rounded-lg' : 'bg-gray-50 border border-gray-200 rounded-lg';
    return `${baseClasses} ${typeClasses} ${className}`;
  };

  const getTitleClasses = () => {
    const baseClasses = 'text-lg sm:text-xl font-semibold mb-2';
    const typeClasses = type === 'error' ? 'text-red-800' : 'text-gray-900';
    return `${baseClasses} ${typeClasses}`;
  };

  const getDescriptionClasses = () => {
    const baseClasses = 'text-sm sm:text-base mb-6 max-w-md';
    const typeClasses = type === 'error' ? 'text-red-600' : 'text-gray-600';
    return `${baseClasses} ${typeClasses}`;
  };

  return (
    <div className={getContainerClasses()}>
      {showIcon && (
        <div className="mb-4">
          {getIcon()}
        </div>
      )}
      
      <h3 className={getTitleClasses()}>
        {title}
      </h3>
      
      <p className={getDescriptionClasses()}>
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`
            inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${type === 'error' 
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {type === 'error' ? <RefreshCw size={16} /> : <Plus size={16} />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Specific empty state components for common use cases
export function NoQuizzesEmptyState({ onCreateQuiz }: { onCreateQuiz?: () => void }) {
  return (
    <EmptyState
      type="quiz"
      title="No quizzes yet"
      description="Create your first quiz to get started. You can upload PDFs, add questions manually, or use our templates."
      actionLabel="Create Quiz"
      onAction={onCreateQuiz}
    />
  );
}

export function NoResultsEmptyState({ onTakeQuiz }: { onTakeQuiz?: () => void }) {
  return (
    <EmptyState
      type="result"
      title="No results yet"
      description="Take a quiz to see your results and performance analytics here."
      actionLabel="Take a Quiz"
      onAction={onTakeQuiz}
    />
  );
}

export function SearchEmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      type="search"
      title="No results found"
      description={`No quizzes found matching "${searchTerm}". Try adjusting your search terms or browse all quizzes.`}
      actionLabel="Clear Search"
      onAction={() => window.location.reload()}
    />
  );
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "An unexpected error occurred. Please try again.",
  onRetry 
}: { 
  title?: string; 
  description?: string; 
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      type="error"
      title={title}
      description={description}
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
    />
  );
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-sm sm:text-base">{message}</p>
    </div>
  );
}
