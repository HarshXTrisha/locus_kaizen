'use client';

import React, { useState } from 'react';
import { LogIn } from '@/lib/icons';
import { signInWithEmail } from '@/lib/firebase-auth'; // Import the sign-in function

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the form from reloading the page
    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithEmail(email, password);
      console.log('Signed in successfully:', user);
      // Redirect to the dashboard on successful login
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError('Failed to sign in. Please check your email and password.');
      console.error(err);
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
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-[#495057]">
              Password
            </label>
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-[#20C997] hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20C997] focus:ring-[#20C997] sm:text-sm"
          />
        </div>

        {/* Display error message if there is one */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-md bg-[#20C997] px-4 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : (
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
