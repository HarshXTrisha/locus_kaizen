'use client';

import React from 'react';
import { Mail } from 'lucide-react'; // Using a relevant icon

export function ForgotPasswordForm() {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      <div className="mb-6 flex justify-center">
        {/* You can replace this with your actual logo component or SVG */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
        </div>
      </div>
      <h1 className="mb-2 text-center text-3xl font-bold text-[#1a202c]">
        Forgot Your Password?
      </h1>
      <p className="mb-8 text-center text-[#4a5568]">
        Enter the email address associated with your account and we&apos;ll send a verification code.
      </p>
      <form>
        <div className="mb-6">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#1a202c]">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="form-input w-full rounded-lg border-transparent bg-[#edf2f7] px-4 py-3 text-[#1a202c] placeholder-[#4a5568] transition duration-300 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-green-500 px-5 py-3 text-base font-bold text-white transition duration-300 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Send Verification Code
        </button>
      </form>
    </div>
  );
}
