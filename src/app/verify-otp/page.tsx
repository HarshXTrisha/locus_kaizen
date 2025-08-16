import React from 'react';
import { OtpForm } from '@/components/auth/OtpForm';

export default function VerifyOtpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] p-4">
      <OtpForm />
    </main>
  );
}
