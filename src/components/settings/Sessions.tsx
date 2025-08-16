'use client';

import React, { useState } from 'react';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Globe } from '@/lib/icons';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      lastActive: '2 minutes ago',
      isCurrent: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, USA',
      lastActive: '1 hour ago',
      isCurrent: false
    },
    {
      id: '3',
      device: 'Firefox on Mac',
      location: 'San Francisco, USA',
      lastActive: '2 days ago',
      isCurrent: false
    }
  ]);

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (device.includes('Mac') || device.includes('Windows')) {
      return <Monitor className="h-4 w-4" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // Simulate revoking session
      await new Promise(resolve => setTimeout(resolve, 500));
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      showSuccess('Session Revoked', 'The session has been successfully revoked.');
    } catch (error) {
      showError('Revoke Failed', 'There was an error revoking the session. Please try again.');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      // Simulate revoking all sessions
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions(prev => prev.filter(session => session.isCurrent));
      showSuccess('Sessions Revoked', 'All other sessions have been successfully revoked.');
    } catch (error) {
      showError('Revoke Failed', 'There was an error revoking the sessions. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRevokeAllSessions}
          disabled={sessions.filter(s => !s.isCurrent).length === 0}
        >
          Revoke All Others
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {getDeviceIcon(session.device)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{session.device}</p>
                <p className="text-sm text-gray-600">{session.location}</p>
                <p className="text-sm text-gray-500">Last active: {session.lastActive}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session.isCurrent && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Current
                </span>
              )}
              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  Revoke
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
