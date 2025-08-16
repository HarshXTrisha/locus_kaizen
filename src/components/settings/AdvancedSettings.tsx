'use client';

import React from 'react';

export function AdvancedSettings() {
  return (
    <>
      {/* Password Management Section */}
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold leading-6">Password Management</h3>
        </div>
        <div className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="current-password">Current Password</label>
            <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" id="current-password" type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="new-password">New Password</label>
            <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" id="new-password" type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="confirm-password">Confirm New Password</label>
            <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" id="confirm-password" type="password" />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 text-right">
          <button className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-green-200" type="button">Change Password</button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold leading-6">Notifications</h3>
        </div>
        <div className="divide-y divide-gray-200 p-6">
          <div className="relative flex items-start py-4">
            <div className="min-w-0 flex-1 text-sm">
              <label className="font-medium text-gray-700" htmlFor="email-notifications">Email Notifications</label>
              <p className="text-gray-500">Get emails about new tests and results.</p>
            </div>
            <div className="ml-3 flex h-5 items-center">
              <input defaultChecked className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500" id="email-notifications" name="email-notifications" type="checkbox" />
            </div>
          </div>
          <div className="relative flex items-start py-4">
            <div className="min-w-0 flex-1 text-sm">
              <label className="font-medium text-gray-700" htmlFor="sms-notifications">SMS Notifications</label>
              <p className="text-gray-500">Get text messages for important updates.</p>
            </div>
            <div className="ml-3 flex h-5 items-center">
              <input className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500" id="sms-notifications" name="sms-notifications" type="checkbox" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
