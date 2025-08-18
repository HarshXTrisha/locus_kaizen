'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  BarChart3, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { QuizAdminControls as AdminControls } from '@/lib/firebase-quiz';
import { showSuccess, showError } from '@/components/common/NotificationSystem';

interface QuizAdminControlsProps {
  quizId: string;
  userId: string;
  adminControls: AdminControls;
  isPublished: boolean;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewAnalytics?: () => void;
}

export function QuizAdminControls({
  quizId,
  userId,
  adminControls,
  isPublished,
  onPublish,
  onUnpublish,
  onEdit,
  onDelete,
  onViewAnalytics
}: QuizAdminControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handlePublish = async () => {
    if (!adminControls.canPublish) return;
    
    setIsLoading(true);
    try {
      if (onPublish) {
        await onPublish();
      }
      showSuccess('Success', 'Quiz published successfully!');
    } catch (error) {
      showError('Publish Failed', 'Failed to publish quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!adminControls.canUnpublish) return;
    
    setIsLoading(true);
    try {
      if (onUnpublish) {
        await onUnpublish();
      }
      showSuccess('Success', 'Quiz unpublished successfully!');
    } catch (error) {
      showError('Unpublish Failed', 'Failed to unpublish quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!adminControls.canEdit) return;
    if (onEdit) onEdit();
  };

  const handleDelete = () => {
    if (!adminControls.canDelete) return;
    if (onDelete) onDelete();
  };

  const handleViewAnalytics = () => {
    if (!adminControls.canViewAnalytics) return;
    if (onViewAnalytics) onViewAnalytics();
  };

  return (
    <div className="relative">
      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPublished 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isPublished ? (
            <>
              <CheckCircle size={12} />
              Published
            </>
          ) : (
            <>
              <AlertCircle size={12} />
              Draft
            </>
          )}
        </div>
        
        {adminControls.isCreator && (
          <span className="text-xs text-gray-500">(Creator)</span>
        )}
        {adminControls.isAdmin && (
          <span className="text-xs text-blue-500">(Admin)</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Publish/Unpublish Button */}
        {adminControls.canPublish && (
          <button
            onClick={handlePublish}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Eye size={16} />
            )}
            Publish
          </button>
        )}

        {adminControls.canUnpublish && (
          <button
            onClick={handleUnpublish}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <EyeOff size={16} />
            )}
            Unpublish
          </button>
        )}

        {/* Edit Button */}
        {adminControls.canEdit && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
        )}

        {/* Analytics Button */}
        {adminControls.canViewAnalytics && (
          <button
            onClick={handleViewAnalytics}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <BarChart3 size={16} />
            Analytics
          </button>
        )}

        {/* More Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <MoreVertical size={16} />
            More
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
              {adminControls.canDelete && (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Quiz
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Permissions Info */}
      <div className="mt-3 text-xs text-gray-500">
        {!adminControls.canPublish && !adminControls.canUnpublish && (
          <p>You don&apos;t have permission to publish/unpublish this quiz</p>
        )}
        {!adminControls.canEdit && (
          <p>You don&apos;t have permission to edit this quiz</p>
        )}
      </div>
    </div>
  );
}
