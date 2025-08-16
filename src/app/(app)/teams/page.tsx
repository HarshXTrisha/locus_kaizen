'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAppStore } from '@/lib/store';
import { getUserTeams, createTeam, Team } from '@/lib/firebase-collaboration';
import { showSuccess, showError } from '@/components/common/NotificationSystem';
import { 
  Users, 
  Plus, 
  Settings, 
  UserPlus, 
  Share2, 
  Calendar,
  Loader2,
  Search,
  Filter
} from 'lucide-react';

export default function TeamsPage() {
  const { user } = useAppStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const loadTeams = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userTeams = await getUserTeams(user.id);
        setTeams(userTeams);
      } catch (error) {
        console.error('Error loading teams:', error);
        showError('Loading Failed', 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [user]);

  const handleCreateTeam = async () => {
    if (!user || !newTeam.name.trim()) return;
    
    try {
      const teamId = await createTeam({
        name: newTeam.name,
        description: newTeam.description,
        ownerId: user.id,
        members: [{
          userId: user.id,
          role: 'owner',
          joinedAt: new Date(),
          displayName: `${user.firstName} ${user.lastName}`,
          email: user.email
        }]
      });

      showSuccess('Team Created', 'Your team has been created successfully');
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '' });
      
      // Reload teams
      const userTeams = await getUserTeams(user.id);
      setTeams(userTeams);
    } catch (error) {
      console.error('Error creating team:', error);
      showError('Creation Failed', 'Failed to create team');
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-[#20C997] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Teams...</h2>
            <p className="text-gray-600">Please wait while we load your teams.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-2">Collaborate with others on quizzes and projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {teams.length === 0 ? 'No teams yet' : 'No teams found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {teams.length === 0 
                ? 'Create your first team to start collaborating on quizzes'
                : 'Try adjusting your search terms'
              }
            </p>
            {teams.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Team</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div key={team.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-[#20C997] to-[#1BA085] rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.members.length} members</p>
                    </div>
                  </div>
                  {team.ownerId === user?.id && (
                    <div className="px-2 py-1 bg-[#20C997]/10 text-[#20C997] text-xs font-medium rounded-full">
                      Owner
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {team.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                  <span>Updated {new Date(team.updatedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <UserPlus className="h-4 w-4" />
                    <span>Invite</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20C997] focus:border-[#20C997]"
                    placeholder="Describe your team's purpose..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeam.name.trim()}
                  className="flex-1 px-4 py-2 bg-[#20C997] text-white rounded-lg hover:bg-[#1BA085] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
