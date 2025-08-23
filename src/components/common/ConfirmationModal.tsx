'use client';

import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  itemName?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
  itemName
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-200',
          bg: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          border: 'border-yellow-200',
          bg: 'bg-yellow-50'
        };
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-blue-500" />,
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          border: 'border-blue-200',
          bg: 'bg-blue-50'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className={`px-6 py-4 ${styles.border} border-b`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-center mb-4">
              {styles.icon}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{message}</p>
              {itemName && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.border}`}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {itemName}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 ${styles.border} border-t bg-gray-50`}>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
