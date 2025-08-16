'use client';

import React, { useState } from 'react';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from '@/lib/icons';

export function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      // Simulate 2FA toggle
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEnabled(!isEnabled);
      showSuccess(
        isEnabled ? '2FA Disabled' : '2FA Enabled',
        isEnabled 
          ? 'Two-factor authentication has been disabled.'
          : 'Two-factor authentication has been enabled. Please check your email for setup instructions.'
      );
    } catch (error) {
      showError('Update Failed', 'There was an error updating your 2FA settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">
              {isEnabled 
                ? 'Two-factor authentication is currently enabled.'
                : 'Add an extra layer of security to your account.'
              }
            </p>
          </div>
        </div>
        <Button
          variant={isEnabled ? 'destructive' : 'primary'}
          onClick={handleToggle}
          loading={isLoading}
        >
          {isEnabled ? 'Disable' : 'Enable'} 2FA
        </Button>
      </div>
    </div>
  );
}
