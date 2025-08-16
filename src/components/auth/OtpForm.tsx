'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function OtpForm() {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-green-100">
          <ShieldCheck className="size-6 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[#18181b]">Verify Your Email</h1>
        <p className="mb-6 text-center text-[#71717a]">
          A verification code has been sent to{' '}
          <span className="font-semibold text-[#18181b]">your.email@example.com</span>. Please enter it below.
        </p>
        <fieldset className="mb-4 flex justify-center gap-2">
          {/* Create 6 OTP input boxes */}
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              className="h-16 w-12 rounded-lg border border-gray-300 text-center text-2xl font-bold text-[#18181b] focus:border-green-500 focus:ring-green-500"
              maxLength={1}
              type="text"
            />
          ))}
        </fieldset>
        <div className="mb-6 flex items-center gap-2 text-sm text-[#71717a]">
          <span>Code expires in:</span>
          <span className="font-semibold text-[#18181b]">04:59</span>
        </div>
        <button className="w-full rounded-lg bg-green-500 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90">
          Verify Code
        </button>
        <p className="mt-6 text-center text-sm text-[#71717a]">
          Didn&apos;t receive the code?{' '}
          <a className="font-semibold text-green-500 hover:underline" href="#">
            Resend
          </a>
        </p>
      </div>
    </div>
  );
}
