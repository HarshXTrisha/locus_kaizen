import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ResetSuccessPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Password Reset!
        </h1>
        <p className="text-gray-600 mb-8">
          Your password has been successfully reset!
        </p>
        <a
          href="/login" // Link to the login page
          className="w-full inline-block bg-green-400 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors duration-300"
        >
          Log In Now
        </a>
      </div>
    </main>
  );
}
