'use client';

import React from 'react';

export function BasicInfo() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold leading-6">Basic Information</h3>
      </div>
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="name">Name</label>
            <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" id="name" type="text" defaultValue="Sanjay" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" id="email" type="email" defaultValue="sanjay@example.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <div className="mt-2 flex items-start gap-x-4">
            <div className="relative h-24 w-24">
              <img alt="Profile Picture" className="h-24 w-24 rounded-full border-2 border-dashed border-gray-300 object-cover p-1" src="https://avatar.vercel.sh/sanjay" />
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-40 text-sm font-medium text-white opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100" htmlFor="profile-picture-upload">
                <span>Upload</span>
                <input accept="image/jpeg, image/png" className="sr-only" id="profile-picture-upload" name="profile-picture-upload" type="file" />
              </label>
            </div>
            <div className="flex-1">
              <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50" type="button">Change Picture</button>
              <p className="mt-2 text-xs text-gray-500">JPG, PNG under 5MB.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
