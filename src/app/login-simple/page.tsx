import React from 'react';
import { LoginFormSimple } from '@/components/auth/LoginFormSimple';

export default function LoginSimplePage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Locus - Simple Login</h1>
        </div>
        
        <LoginFormSimple />

        <p className="mt-6 text-center text-sm text-[#6C757D]">
          <a href="/login" className="font-medium text-[#20C997] hover:underline">
            Go to Firebase Login
          </a>
        </p>
      </div>
    </main>
  );
}
