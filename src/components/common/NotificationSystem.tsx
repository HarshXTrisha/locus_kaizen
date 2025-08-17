'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from '@/lib/icons';
import { useNotifications, useAppStore } from '@/lib/store';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NotificationSystem />
      {children}
    </>
  );
}

export function NotificationSystem() {
  const notifications = useNotifications();
  const { removeNotification } = useAppStore();

  useEffect(() => {
    // Auto-remove notifications after their duration
    notifications.forEach((notification) => {
      if (notification.duration) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
      }
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  };
  onRemove: () => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div
      className={`max-w-sm w-full border rounded-lg p-4 shadow-lg ${getBackgroundColor()} animate-in slide-in-from-right-full duration-300`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTextColor()}`}>
            {notification.title}
          </h3>
          <p className={`text-sm ${getTextColor()} opacity-90`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Export utility functions for showing notifications
export const showSuccess = (title: string, message: string) => {
  const { addNotification } = useAppStore.getState();
  addNotification({
    id: Date.now().toString(),
    type: 'success',
    title,
    message,
    duration: 5000,
    createdAt: new Date(),
  });
};

export const showError = (title: string, message: string) => {
  const { addNotification } = useAppStore.getState();
  addNotification({
    id: Date.now().toString(),
    type: 'error',
    title,
    message,
    duration: 5000,
    createdAt: new Date(),
  });
};

export const showWarning = (title: string, message: string) => {
  const { addNotification } = useAppStore.getState();
  addNotification({
    id: Date.now().toString(),
    type: 'warning',
    title,
    message,
    duration: 5000,
    createdAt: new Date(),
  });
};

export const showInfo = (title: string, message: string) => {
  const { addNotification } = useAppStore.getState();
  addNotification({
    id: Date.now().toString(),
    type: 'info',
    title,
    message,
    duration: 5000,
    createdAt: new Date(),
  });
};
