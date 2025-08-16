'use client';

import React, { useState } from 'react';
import { LogIn } from '@/lib/icons';
import { signInWithEmail } from '@/lib/firebase-auth';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { ButtonLoader } from '@/components/common/LoadingSpinner';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmail(email, password);
      console.log('Signed in successfully:', userCredential);
      
      showSuccess('Welcome Back!', 'You have been successfully signed in.');
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/user-not-found') {
        showError('User Not Found', 'No account found with this email address. Please check your email or create a new account.');
      } else if (err.code === 'auth/wrong-password') {
        showError('Invalid Password', 'The password you entered is incorrect. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        showError('Invalid Email', 'Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        showError('Too Many Attempts', 'Too many failed login attempts. Please try again later.');
      } else {
        showError('Sign In Failed', 'Failed to sign in. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-[#E9ECEF] bg-white p-8 shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#212529]">Welcome Back</h2>
        <p className="mt-2 text-sm text-[#6C757D]">Sign in to continue to your dashboard.</p>
      </div>

      <form onSubmit={handleSignIn} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#495057]">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#495057]">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm"
            disabled={isLoading}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-md bg-[#20C997] px-4 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <ButtonLoader text="Signing In..." />
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
