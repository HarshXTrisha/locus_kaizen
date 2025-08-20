'use client';

import React, { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithMicrosoft, getSignInResult } from '@/lib/firebase-auth';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { ButtonLoader } from '@/components/common/LoadingSpinner';

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 34.691l6.571-4.819C14.655 34.91 18.961 38 24 38c5.039 0 9.345-3.09 11.124-7.481l6.571 4.819C38.631 41.902 31.847 44 24 44c-7.847 0-14.631-2.098-20.124-5.697l2.43-1.612z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.991 36.636 44 31.023 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

// Microsoft Icon SVG
const MicrosoftIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48">
    <path fill="#ff5722" d="M6 6h15v15H6z"/>
    <path fill="#4caf50" d="M27 6h15v15H27z"/>
    <path fill="#ffc107" d="M6 27h15v15H6z"/>
    <path fill="#2196f3" d="M27 27h15v15H27z"/>
  </svg>
);

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<'google' | 'microsoft' | null>(null);

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getSignInResult();
        if (result) {
          console.log('✅ Redirect sign-in successful:', result);
          const provider = result.providerId === 'microsoft.com' ? 'Microsoft' : 'Google';
          showSuccess('Signed In!', `You have successfully signed in with ${provider}.`);
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        }
      } catch (error) {
        console.error('Error checking redirect result:', error);
      }
    };

    checkRedirectResult();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthProvider('google');
    console.log('🔍 Starting Google Sign-In process...');
    
    try {
      console.log('📡 Attempting to sign in with Google...');
      const result = await signInWithGoogle();
      console.log('✅ Google Sign-In successful:', result);
      
      showSuccess('Signed In!', 'You have successfully signed in with Google.');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      
      // Provide more specific error messages based on error codes
      let errorMessage = 'Could not sign in with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please contact support.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/invalid-client') {
        errorMessage = 'Invalid client configuration. Please check Firebase settings.';
      } else if (error.code === 'auth/redirect-uri-mismatch') {
        errorMessage = 'Redirect URI mismatch. Please check OAuth configuration.';
      } else if (error.message === 'Redirect initiated') {
        // This is expected when using redirect method
        console.log('🔄 Redirect initiated, user will be redirected to Google...');
        return; // Don't show error for redirect
      } else if (error.message) {
        errorMessage = `Sign-in failed: ${error.message}`;
      }
      
      showError('Sign In Failed', errorMessage);
    } finally {
      setIsLoading(false);
      setAuthProvider(null);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    setAuthProvider('microsoft');
    console.log('🔍 Starting Microsoft Sign-In process...');
    
    try {
      console.log('📡 Attempting to sign in with Microsoft...');
      const result = await signInWithMicrosoft();
      console.log('✅ Microsoft Sign-In successful:', result);
      
      showSuccess('Signed In!', 'You have successfully signed in with Microsoft.');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error: any) {
      console.error('❌ Microsoft sign in error:', error);
      
      // Provide more specific error messages based on error codes
      let errorMessage = 'Could not sign in with Microsoft. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please contact support.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/invalid-client') {
        errorMessage = 'Invalid client configuration. Please check Firebase settings.';
      } else if (error.code === 'auth/redirect-uri-mismatch') {
        errorMessage = 'Redirect URI mismatch. Please check OAuth configuration.';
      } else if (error.message === 'Redirect initiated') {
        // This is expected when using redirect method
        console.log('🔄 Redirect initiated, user will be redirected to Microsoft...');
        return; // Don't show error for redirect
      } else if (error.message) {
        errorMessage = `Sign-in failed: ${error.message}`;
      }
      
      showError('Sign In Failed', errorMessage);
    } finally {
      setIsLoading(false);
      setAuthProvider(null);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-[#212529] mb-4 leading-tight tracking-tight">Welcome Back!</h2>
        <p className="text-gray-600 text-center">Sign in to continue your learning journey with QuestAI.</p>
      </div>

      <div className="space-y-6">
        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-2xl bg-white px-8 py-5 text-xl font-semibold text-gray-700 border-2 border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-[#20C997] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 group"
        >
          {isLoading && authProvider === 'google' ? (
            <ButtonLoader text="Signing In..." />
          ) : (
            <>
              <div className="mr-4 group-hover:scale-110 transition-transform duration-300">
                <GoogleIcon />
              </div>
              <span className="group-hover:text-[#20C997] transition-colors duration-300">
                Sign In with Google
              </span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">or</span>
          </div>
        </div>

        {/* Microsoft Sign In Button */}
        <button
          type="button"
          onClick={handleMicrosoftSignIn}
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-2xl bg-white px-8 py-5 text-xl font-semibold text-gray-700 border-2 border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-[#20C997] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 group"
        >
          {isLoading && authProvider === 'microsoft' ? (
            <ButtonLoader text="Signing In..." />
          ) : (
            <>
              <div className="mr-4 group-hover:scale-110 transition-transform duration-300">
                <MicrosoftIcon />
              </div>
              <span className="group-hover:text-[#20C997] transition-colors duration-300">
                Sign In with Microsoft
              </span>
            </>
          )}
        </button>

        {/* Benefits */}
        <div className="mt-10 space-y-5">
          <div className="flex items-center text-base text-[#6C757D] font-medium">
            <div className="w-2 h-2 bg-[#20C997] rounded-full mr-4"></div>
            <span>Secure authentication with Google or Microsoft</span>
          </div>
          <div className="flex items-center text-base text-[#6C757D] font-medium">
            <div className="w-2 h-2 bg-[#20C997] rounded-full mr-4"></div>
            <span>Access to all quiz features</span>
          </div>
          <div className="flex items-center text-base text-[#6C757D] font-medium">
            <div className="w-2 h-2 bg-[#20C997] rounded-full mr-4"></div>
            <span>Personalized learning dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
