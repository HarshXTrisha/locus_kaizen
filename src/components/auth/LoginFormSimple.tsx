'use client';

import React, { useState } from 'react';

export function LoginFormSimple() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form submitted:', { email, password });
    alert('Form submitted! Check console for details.');
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-[#E9ECEF] bg-white p-8 shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#212529]">Welcome Back</h2>
        <p className="mt-2 text-sm text-[#6C757D]">Sign in to continue to your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
          />
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-md bg-[#20C997] px-4 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            Sign In (Simple Version)
          </button>
        </div>
      </form>
    </div>
  );
}
