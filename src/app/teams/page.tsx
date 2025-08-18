'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { 
  getTeamMembers, 
  updateTeamMemberRole, 
  setAdminUser,
  getUserRole 
} from '@/lib/firebase-quiz';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { 
  Users, 
  Shield, 
  UserCheck, 
  User, 
  Crown, 
  Settings, 
  Mail, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

export default function TeamsPage() {
  const { user } = useAppStore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [settingAdmin, setSettingAdmin] = useState(false);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user's role
        if (user?.id) {
          const roleData = await getUserRole(user.id);
          setUserRole(roleData?.role || 'user');
        }

        // Get all team members
        const members = await getTeamMembers();
        setTeamMembers(members);
      } catch (err) {
        console.error('Error loading team data:', err);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [user?.id]);

  const handleSetAdmin = async () => {
    try {
      setSettingAdmin(true);
      const response = await fetch('/api/set-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Admin Set', 'spycook.jjn007@gmail.com has been set as admin');
        
        // Reload team data
        const members = await getTeamMembers();
        setTeamMembers(members);
      } else {
        showError('Failed to Set Admin', data.message || 'Could not set admin user');
      }
    } catch (error) {
      showError('Failed to Set Admin', 'Could not set admin user');
    } finally {
      setSettingAdmin(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    try {
      setUpdatingRole(userId);
      await updateTeamMemberRole(userId, newRole);
      showSuccess('Role Updated', `User role updated to ${newRole}`);
      
      // Reload team data
      const members = await getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      showError('Failed to Update Role', 'Could not update user role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'moderator':
        return <Shield className="h-5 w-5 text-blue-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3 mr-1" />
            Moderator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <User className="h-3 w-3 mr-1" />
            User
          </span>
        );
    }
  };

  const canManageRoles = userRole === 'admin';

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="xl" text="Loading team data..." />
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Team Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const admins = teamMembers.filter(member => member.role === 'admin');
  const moderators = teamMembers.filter(member => member.role === 'moderator');
  const users = teamMembers.filter(member => member.role === 'user');

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Team Management
            </h1>
            <p className="text-lg text-gray-600">
              Manage team members and their roles across the platform.
            </p>
          </div>

          {/* Role Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Crown className="h-8 w-8 text-yellow-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Admin</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Full control over the platform. Can manage all quizzes, users, and system settings.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Moderator</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Can upload questions, schedule live quizzes, and manage content for users.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <User className="h-8 w-8 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">User</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Can take live quizzes in the IIM BBA DBE section and view their results.
              </p>
            </div>
          </div>

          {/* Set Admin Button */}
          {canManageRoles && (
            <div className="mb-8">
              <button
                onClick={handleSetAdmin}
                disabled={settingAdmin}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {settingAdmin ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Crown className="h-5 w-5 mr-2" />
                )}
                Set spycook.jjn007@gmail.com as Admin
              </button>
            </div>
          )}

          {/* Team Members by Role */}
          <div className="space-y-8">
            {/* Admins Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center mb-6">
                <Crown className="h-6 w-6 text-yellow-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Administrators</h2>
                <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  {admins.length} member{admins.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {admins.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No administrators yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                          <Crown className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined {member.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(member.role)}
                        {canManageRoles && member.id !== user?.id && (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value as 'user' | 'admin' | 'moderator')}
                            disabled={updatingRole === member.id}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="user">User</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Moderators Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Moderators</h2>
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {moderators.length} member{moderators.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {moderators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No moderators yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moderators.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined {member.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(member.role)}
                        {canManageRoles && (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value as 'user' | 'admin' | 'moderator')}
                            disabled={updatingRole === member.id}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="user">User</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Users Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-gray-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
                <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  {users.length} member{users.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No users yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined {member.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(member.role)}
                        {canManageRoles && (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value as 'user' | 'admin' | 'moderator')}
                            disabled={updatingRole === member.id}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="user">User</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
