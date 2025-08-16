import React from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-green-50/50 p-4">
      <ResetPasswordForm />
    </main>
  );
}
