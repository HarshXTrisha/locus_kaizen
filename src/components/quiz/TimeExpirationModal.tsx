'use client';

import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface TimeExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  timeExpired: boolean;
}

export function TimeExpirationModal({ 
  isOpen, 
  onClose, 
  onContinue, 
  timeExpired 
}: TimeExpirationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {timeExpired ? (
              <div className="p-2 bg-red-100 rounded-full">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            ) : (
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {timeExpired ? 'Time Expired!' : 'Time Almost Up!'}
              </h2>
              <p className="text-sm text-gray-600">
                {timeExpired ? 'Your test time has run out' : 'You have less than 5 minutes remaining'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {timeExpired ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Test Time Expired
                </h3>
                <p className="text-gray-600 mb-4">
                  Your allocated time for this test has ended. Your answers will be automatically submitted.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Auto-submission in progress...</span>
                </div>
                <p className="text-sm text-gray-600">
                  Please wait while we process your submission.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Time Warning
                </h3>
                <p className="text-gray-600 mb-4">
                  You have less than 5 minutes remaining. Please review your answers and submit soon.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Quick Actions</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Review unanswered questions</p>
                  <p>• Check flagged questions</p>
                  <p>• Submit when ready</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          {!timeExpired && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Quiz
            </button>
          )}
          <button
            onClick={onContinue}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              timeExpired
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {timeExpired ? 'Close' : 'Submit Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
