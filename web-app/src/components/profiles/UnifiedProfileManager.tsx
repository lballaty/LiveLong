// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/profiles/UnifiedProfileManager.tsx
// Description: Unified profile manager component supporting all timer types (simple, series, breathing)
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

'use client';

import React, { useState, useEffect } from 'react';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';
import { UnifiedProfile, createSimpleProfile } from '@/types/unified-profile.types';

interface ProfileCardProps {
  profile: UnifiedProfile;
  isActive: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isActive, onSelect, onEdit, onDelete }) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}min`;
  };

  const getTypeLabel = () => {
    switch (profile.type) {
      case 'simple':
        return 'Timer';
      case 'series':
        return 'Exercise Series';
      case 'breathing':
        return 'Breathing';
      default:
        return '';
    }
  };

  return (
    <div
      data-testid={`profile-${profile.id}`}
      className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{profile.icon}</span>
            <h3 className="font-semibold text-gray-800">{profile.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{profile.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">
              {getTypeLabel()}
            </span>
            <span>
              {formatDuration(profile.totalDurationSeconds)}
            </span>
            {profile.type === 'series' && profile.seriesConfig && (
              <span>{profile.seriesConfig.steps.length} steps</span>
            )}
            {profile.type === 'breathing' && profile.breathingConfig && (
              <span>{profile.breathingConfig.cycleCount} cycles</span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {onEdit && profile.type === 'simple' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
              aria-label="Edit profile"
            >
              ✏️
            </button>
          )}
          {profile.isCustom && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
              aria-label="Delete profile"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      {profile.type === 'series' && profile.seriesConfig && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Steps: {profile.seriesConfig.steps.map(s => s.name).join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
};

interface ProfileFormProps {
  onClose: () => void;
  onSave: (profile: UnifiedProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workMinutes: 25,
    workSeconds: 0,
    breakMinutes: 5,
    breakSeconds: 0,
    color: '#3b82f6',
    icon: '⏱️'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = createSimpleProfile(
      formData.name,
      formData.description,
      formData.workMinutes + formData.workSeconds / 60,
      formData.breakMinutes + formData.breakSeconds / 60,
      formData.color,
      formData.icon
    );
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Custom Timer</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Duration
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.workMinutes}
                  onChange={(e) => setFormData({ ...formData, workMinutes: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="999"
                />
                <span className="py-2">min</span>
                <input
                  type="number"
                  value={formData.workSeconds}
                  onChange={(e) => setFormData({ ...formData, workSeconds: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="59"
                />
                <span className="py-2">sec</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break Duration
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.breakMinutes}
                  onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="999"
                />
                <span className="py-2">min</span>
                <input
                  type="number"
                  value={formData.breakSeconds}
                  onChange={(e) => setFormData({ ...formData, breakSeconds: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="59"
                />
                <span className="py-2">sec</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <div className="flex gap-2 flex-wrap">
                {['⏱️', '📚', '💻', '🎯', '🔥', '⚡', '🌟', '🚀'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`text-2xl p-2 rounded ${
                      formData.icon === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function UnifiedProfileManager() {
  const {
    profiles,
    customProfiles,
    activeProfile,
    initializeProfiles,
    selectProfile,
    createCustomProfile,
    updateProfile,
    deleteCustomProfile
  } = useUnifiedTimerStore();

  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UnifiedProfile | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'simple' | 'series' | 'breathing'>('all');

  useEffect(() => {
    initializeProfiles();
  }, [initializeProfiles]);

  const allProfiles = [...profiles, ...customProfiles];
  const filteredProfiles = filterType === 'all'
    ? allProfiles
    : allProfiles.filter(p => p.type === filterType);

  // Group profiles by type
  const simpleProfiles = filteredProfiles.filter(p => p.type === 'simple');
  const seriesProfiles = filteredProfiles.filter(p => p.type === 'series');
  const breathingProfiles = filteredProfiles.filter(p => p.type === 'breathing');

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Timer Profiles</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Create Custom Timer
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'simple', 'series', 'breathing'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {simpleProfiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Simple Timers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simpleProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={activeProfile?.id === profile.id}
                onSelect={() => selectProfile(profile.id)}
                onEdit={() => setEditingProfile(profile)}
                onDelete={profile.isCustom ? () => deleteCustomProfile(profile.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {seriesProfiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Exercise Series</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seriesProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={activeProfile?.id === profile.id}
                onSelect={() => selectProfile(profile.id)}
                onDelete={profile.isCustom ? () => deleteCustomProfile(profile.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {breathingProfiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Breathing Exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {breathingProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={activeProfile?.id === profile.id}
                onSelect={() => selectProfile(profile.id)}
                onDelete={profile.isCustom ? () => deleteCustomProfile(profile.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <ProfileForm
          onClose={() => setShowForm(false)}
          onSave={createCustomProfile}
        />
      )}

      {editingProfile && editingProfile.type === 'simple' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Timer: {editingProfile.name}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updates: Partial<UnifiedProfile> = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                simpleDuration: {
                  workMinutes: parseInt(formData.get('workMinutes') as string) || 0,
                  workSeconds: parseInt(formData.get('workSeconds') as string) || 0,
                  breakMinutes: parseInt(formData.get('breakMinutes') as string) || 0,
                  breakSeconds: parseInt(formData.get('breakSeconds') as string) || 0,
                },
                totalDurationSeconds:
                  (parseInt(formData.get('workMinutes') as string) || 0) * 60 +
                  (parseInt(formData.get('workSeconds') as string) || 0) +
                  (parseInt(formData.get('breakMinutes') as string) || 0) * 60 +
                  (parseInt(formData.get('breakSeconds') as string) || 0)
              };
              updateProfile(editingProfile.id, updates);
              setEditingProfile(null);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProfile.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProfile.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="workMinutes"
                      defaultValue={editingProfile.simpleDuration?.workMinutes || 0}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      max="999"
                    />
                    <span className="py-2">min</span>
                    <input
                      type="number"
                      name="workSeconds"
                      defaultValue={editingProfile.simpleDuration?.workSeconds || 0}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      max="59"
                    />
                    <span className="py-2">sec</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Break Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="breakMinutes"
                      defaultValue={editingProfile.simpleDuration?.breakMinutes || 0}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      max="999"
                    />
                    <span className="py-2">min</span>
                    <input
                      type="number"
                      name="breakSeconds"
                      defaultValue={editingProfile.simpleDuration?.breakSeconds || 0}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      max="59"
                    />
                    <span className="py-2">sec</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}