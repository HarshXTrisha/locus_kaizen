import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { BasicInfo } from '@/components/settings/BasicInfo';
import { ChangePassword } from '@/components/settings/ChangePassword';
import { TwoFactorAuth } from '@/components/settings/TwoFactorAuth';
import { Sessions } from '@/components/settings/Sessions';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Settings
          </h2>
          <div className="mt-8 space-y-8">
            <BasicInfo />
            <ChangePassword />
            <TwoFactorAuth />
            <Sessions />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
