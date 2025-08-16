'use client';

import React from 'react';

// A single checklist item for password requirements
const PasswordChecklistItem = ({ text, isChecked }: { text: string; isChecked: boolean }) => (
  <div className="flex items-center gap-x-3 text-sm text-gray-600">
    <input
      type="checkbox"
      checked={isChecked}
      disabled
      className="h-5 w-5 rounded border-2 border-green-200 bg-transparent text-green-500 focus:ring-0 focus:ring-offset-0"
    />
    <label>{text}</label>
  </div>
);

export function ResetPasswordForm() {
  // In a real app, this state would be driven by user input
  const [passwordCriteria, setPasswordCriteria] = React.useState({
    length: true,
    number: true,
    special: false,
    uppercase: false,
  });

  return (
    <div className="w-full max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Reset Your Password
        </h1>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2" htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              className="form-input w-full rounded-lg border-green-200 bg-green-50 text-gray-800 placeholder:text-green-800/50 focus:border-green-500 focus:ring-green-500 py-3 px-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2" htmlFor="confirm-new-password">
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              placeholder="Confirm new password"
              className="form-input w-full rounded-lg border-green-200 bg-green-50 text-gray-800 placeholder:text-green-800/50 focus:border-green-500 focus:ring-green-500 py-3 px-4"
            />
          </div>
          <div className="space-y-3 pt-2">
            <PasswordChecklistItem text="At least 8 characters" isChecked={passwordCriteria.length} />
            <PasswordChecklistItem text="Contains at least one number" isChecked={passwordCriteria.number} />
            <PasswordChecklistItem text="Contains at least one special character" isChecked={passwordCriteria.special} />
            <PasswordChecklistItem text="Contains at least one uppercase letter" isChecked={passwordCriteria.uppercase} />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-gray-800 bg-green-400 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
