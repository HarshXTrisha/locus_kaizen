'use client';

import React, { useState } from 'react';
import { signInWithGoogle } from '@/lib/firebase-auth';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { ButtonLoader } from '@/components/common/LoadingSpinner';

// Simple SVG for Google icon
const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 34.691l6.571-4.819C14.655 34.91 18.961 38 24 38c5.039 0 9.345-3.09 11.124-7.481l6.571 4.819C38.631 41.902 31.847 44 24 44c-7.847 0-14.631-2.098-20.124-5.697l2.43-1.612z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.991 36.636 44 31.023 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);


export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      showSuccess('Signed In!', 'You have successfully signed in with Google.');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error) {
      console.error('Google sign in error:', error);
      showError('Sign In Failed', 'Could not sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-[#E9ECEF] bg-white p-8 shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#212529]">Welcome to Locus</h2>
        <p className="mt-2 text-sm text-[#6C757D]">Sign in with your Google account to continue.</p>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-base font-semibold text-gray-700 border border-gray-300 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <ButtonLoader text="Signing In..." />
          ) : (
            <>
              <GoogleIcon />
              Sign In with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
