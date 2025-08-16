import React from 'react';
import { AppHeader } from '@/components/common/AppHeader';
import { BasicInfo } from '@/components/settings/BasicInfo';
import { AdvancedSettings } from '@/components/settings/AdvancedSettings';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans text-gray-900 bg-gray-50">
      <AppHeader />
      <main className="flex flex-1 justify-center py-12">
        <div className="w-full max-w-3xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Manage your account settings and set e-mail preferences.</p>
          </div>

          <div className="space-y-8">
            <BasicInfo />
            <AdvancedSettings />
            <div className="flex justify-end">
              <button className="inline-flex justify-center rounded-md border border-transparent bg-green-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-opacity-90" type="submit">
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
