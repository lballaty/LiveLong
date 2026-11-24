// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/profiles/UnifiedProfileManager.tsx
// Description: Unified profile manager component supporting all timer types (simple, series, breathing)
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';
import {
  UnifiedProfile,
  SessionPlan,
  createSimpleProfile,
} from '@/types/unified-profile.types';
import {
  BUILTIN_MUSIC_TRACKS,
  MusicTrackOption,
  backgroundMusicService,
} from '@/services/audio/BackgroundMusicService';
import { audioCueService } from '@/services/audio/AudioCueService';
import RoutineEditorModal from './RoutineEditorModal';
import SessionComposerModal from './SessionComposerModal';
import RoutineAudioModal from './RoutineAudioModal';
import IconPicker, { RoutineIcon } from './IconPicker';

interface ProfileCardProps {
  profile: UnifiedProfile;
  isActive: boolean;
  selectedMusicId: string;
  musicOptions: MusicTrackOption[];
  isPreviewingMusic?: boolean;
  onMusicChange: (trackId: string) => void;
  onPreviewMusic?: () => void;
  onPreviewChime?: () => void;
  onOpenAudioConfig?: () => void;
  onMoveEarlier?: () => void;
  onMoveLater?: () => void;
  onSelect: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isActive,
  selectedMusicId,
  musicOptions,
  isPreviewingMusic = false,
  onMusicChange,
  onPreviewMusic,
  onPreviewChime,
  onOpenAudioConfig,
  onMoveEarlier,
  onMoveLater,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
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
            <RoutineIcon icon={profile.icon} className="text-2xl" imgClassName="w-7 h-7 object-contain rounded" />
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
          {onMoveEarlier && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveEarlier();
              }}
              className="p-1 text-slate-500 hover:bg-slate-100 rounded text-xs"
              aria-label="Move routine earlier"
              title="Move earlier"
            >
              ←
            </button>
          )}
          {onMoveLater && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveLater();
              }}
              className="p-1 text-slate-500 hover:bg-slate-100 rounded text-xs"
              aria-label="Move routine later"
              title="Move later"
            >
              →
            </button>
          )}
          {onEdit && (profile.type === 'simple' || profile.isCustom) && (
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
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 text-slate-600 hover:bg-slate-100 rounded"
              aria-label="Clone routine"
              title="Clone & customize"
            >
              📋
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
      <div
        className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="text-xs text-gray-500 shrink-0" htmlFor={`music-${profile.id}`}>
          🎵
        </label>
        <select
          id={`music-${profile.id}`}
          data-testid={`music-select-${profile.id}`}
          value={selectedMusicId}
          onChange={(e) => onMusicChange(e.target.value)}
          className="flex-1 min-w-0 text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700"
        >
          {musicOptions.map((track) => (
            <option key={track.id} value={track.id}>
              {track.label}
            </option>
          ))}
        </select>
        {onPreviewMusic && (
          <button
            type="button"
            data-testid={`preview-music-${profile.id}`}
            disabled={selectedMusicId === 'none'}
            onClick={onPreviewMusic}
            className="px-2 py-1 text-xs rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 shrink-0"
            title={isPreviewingMusic ? 'Stop music preview' : 'Preview selected music'}
            aria-label={isPreviewingMusic ? 'Stop music preview' : 'Preview selected music'}
          >
            {isPreviewingMusic ? '⏹' : '▶'}
          </button>
        )}
        {onPreviewChime && (
          <button
            type="button"
            data-testid={`preview-chime-${profile.id}`}
            onClick={onPreviewChime}
            className="px-2 py-1 text-xs rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 shrink-0"
            title="Preview transition chime"
            aria-label="Preview transition chime"
          >
            🔔
          </button>
        )}
        {onOpenAudioConfig && (
          <button
            type="button"
            data-testid={`audio-config-${profile.id}`}
            onClick={onOpenAudioConfig}
            className="px-2 py-1 text-xs rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 shrink-0"
            title="Configure audio & volumes"
            aria-label="Configure audio and volumes"
          >
            🎛️
          </button>
        )}
      </div>
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

            <IconPicker
              value={formData.icon}
              onChange={(ic) => setFormData({ ...formData, icon: ic })}
              presets={['⏱️', '📚', '💻', '🎯', '🔥', '⚡', '🌟', '🚀']}
            />
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

interface UnifiedProfileManagerProps {
  onProfileSelect?: (profile: UnifiedProfile) => void;
}

export default function UnifiedProfileManager({ onProfileSelect }: UnifiedProfileManagerProps = {}) {
  const [previewingCardTrack, setPreviewingCardTrack] = useState<string | null>(null);
  const [audioConfigProfile, setAudioConfigProfile] = useState<UnifiedProfile | null>(null);
  const {
    profiles,
    customProfiles,
    profileOrder,
    activeProfile,
    sessionPlans,
    preferences,
    profileMusicMap,
    customMusicTracks,
    initializeProfiles,
    selectProfile,
    createCustomProfile,
    duplicateProfile,
    updateProfile,
    deleteCustomProfile,
    moveProfileOrder,
    createSessionPlan,
    updateSessionPlan,
    deleteSessionPlan,
    startSessionPlan,
    updatePreferences,
    setProfileMusic,
    addCustomMusicTrack,
  } = useUnifiedTimerStore();

  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<UnifiedProfile | null>(null);
  const [showSessionComposer, setShowSessionComposer] = useState(false);
  const [editingSessionPlan, setEditingSessionPlan] = useState<SessionPlan | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const allMusicOptions = [...BUILTIN_MUSIC_TRACKS, ...customMusicTracks];

  const handlePreviewMusic = (profileId: string, trackId: string) => {
    const playing = backgroundMusicService.previewToggle(
      trackId,
      customMusicTracks,
      preferences.musicVolume
    );
    setPreviewingCardTrack(playing ? profileId : null);
  };

  const handlePreviewChime = () => {
    audioCueService.unlock();
    audioCueService.playChime('phase', preferences.chimeVolume);
  };

  const handleAddAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addCustomMusicTrack({
          id: `custom-${Date.now()}`,
          label: file.name.replace(/\.[^.]+$/, ''),
          description: 'Custom audio file',
          isCustom: true,
          dataUrl: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UnifiedProfile | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'simple' | 'series' | 'breathing'>('all');

  useEffect(() => {
    initializeProfiles();
  }, [initializeProfiles]);

  const allProfiles = [...profiles, ...customProfiles].sort((a, b) => {
    const idxA = profileOrder.indexOf(a.id);
    const idxB = profileOrder.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
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
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Routines & Timers</h2>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAddAudioFile}
              className="hidden"
              data-testid="custom-music-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              + Add Music File
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingRoutine(null);
                setShowRoutineModal(true);
              }}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              + New Routine
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingSessionPlan(null);
                setShowSessionComposer(true);
              }}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              + Compose Session
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              + Create Custom Timer
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {([
            { id: 'all', label: 'All' },
            { id: 'series', label: 'Exercises' },
            { id: 'breathing', label: 'Breathing' },
            { id: 'simple', label: 'Focus Timers' },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterType(id)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {sessionPlans.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Composed Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionPlans.map((plan) => (
              <div
                key={plan.id}
                data-testid={`session-plan-${plan.id}`}
                className="p-4 rounded-lg border-2 border-indigo-200 bg-indigo-50/40 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <RoutineIcon icon={plan.icon} className="text-2xl" imgClassName="w-7 h-7 object-contain rounded" />
                      <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSessionPlan(plan);
                          setShowSessionComposer(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        aria-label="Edit session plan"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSessionPlan(plan.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        aria-label="Delete session plan"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{plan.description}</p>
                  <p className="text-xs text-indigo-700 font-medium mt-2">
                    {plan.items.length} routines in sequence
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    startSessionPlan(plan.id);
                    const first = allProfiles.find((p) => p.id === plan.items[0]?.profileId);
                    if (first) onProfileSelect?.(first);
                  }}
                  className="w-full py-2 px-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  ▶ Start Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {seriesProfiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Japanese Longevity Exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seriesProfiles.map((profile, idx) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={activeProfile?.id === profile.id}
                selectedMusicId={profileMusicMap[profile.id] || profile.musicTrackId || 'none'}
                musicOptions={allMusicOptions}
                isPreviewingMusic={previewingCardTrack === profile.id}
                onMoveEarlier={
                  idx > 0
                    ? () =>
                        moveProfileOrder(
                          profile.id,
                          -1,
                          seriesProfiles.map((p) => p.id)
                        )
                    : undefined
                }
                onMoveLater={
                  idx < seriesProfiles.length - 1
                    ? () =>
                        moveProfileOrder(
                          profile.id,
                          1,
                          seriesProfiles.map((p) => p.id)
                        )
                    : undefined
                }
                onMusicChange={(trackId) => {
                  setProfileMusic(profile.id, trackId);
                  if (previewingCardTrack === profile.id) {
                    handlePreviewMusic(profile.id, trackId);
                  }
                }}
                onPreviewMusic={() =>
                  handlePreviewMusic(
                    profile.id,
                    profileMusicMap[profile.id] || profile.musicTrackId || 'none'
                  )
                }
                onPreviewChime={handlePreviewChime}
                onOpenAudioConfig={() => setAudioConfigProfile(profile)}
                onSelect={() => {
                  selectProfile(profile.id);
                  onProfileSelect?.(profile);
                }}
                onEdit={profile.isCustom ? () => setEditingRoutine(profile) : undefined}
                onDuplicate={() => {
                  const cloned = duplicateProfile(profile.id);
                  if (cloned) setEditingRoutine(cloned);
                }}
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
            {breathingProfiles.map((profile, idx) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={activeProfile?.id === profile.id}
                selectedMusicId={profileMusicMap[profile.id] || profile.musicTrackId || 'none'}
                musicOptions={allMusicOptions}
                isPreviewingMusic={previewingCardTrack === profile.id}
                onMoveEarlier={
                  idx > 0
                    ? () =>
                        moveProfileOrder(
                          profile.id,
                          -1,
                          breathingProfiles.map((p) => p.id)
                        )
                    : undefined
                }
                onMoveLater={
                  idx < breathingProfiles.length - 1
                    ? () =>
                        moveProfileOrder(
                          profile.id,
                          1,
                          breathingProfiles.map((p) => p.id)
                        )
                    : undefined
                }
                onMusicChange={(trackId) => {
                  setProfileMusic(profile.id, trackId);
                  if (previewingCardTrack === profile.id) {
                    handlePreviewMusic(profile.id, trackId);
                  }
                }}
                onPreviewMusic={() =>
                  handlePreviewMusic(
                    profile.id,
                    profileMusicMap[profile.id] || profile.musicTrackId || 'none'
                  )
                }
                onPreviewChime={handlePreviewChime}
                onOpenAudioConfig={() => setAudioConfigProfile(profile)}
                onSelect={() => {
                  selectProfile(profile.id);
                  onProfileSelect?.(profile);
                }}
                onEdit={profile.isCustom ? () => setEditingRoutine(profile) : undefined}
                onDuplicate={() => {
                  const cloned = duplicateProfile(profile.id);
                  if (cloned) setEditingRoutine(cloned);
                }}
                onDelete={profile.isCustom ? () => deleteCustomProfile(profile.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {simpleProfiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Focus & Meditation Timers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simpleProfiles.map((profile, idx) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={activeProfile?.id === profile.id}
                selectedMusicId={profileMusicMap[profile.id] || profile.musicTrackId || 'none'}
                musicOptions={allMusicOptions}
                isPreviewingMusic={previewingCardTrack === profile.id}
                onMoveEarlier={
                  idx > 0
                    ? () =>
                        moveProfileOrder(
                          profile.id,
                          -1,
                          simpleProfiles.map((p) => p.id)
                        )
                    : undefined
                }
                onMoveLater={
                  idx < simpleProfiles.length - 1
                    ? () =>
                        moveProfileOrder(
                          profile.id,
                          1,
                          simpleProfiles.map((p) => p.id)
                        )
                    : undefined
                }
                onMusicChange={(trackId) => {
                  setProfileMusic(profile.id, trackId);
                  if (previewingCardTrack === profile.id) {
                    handlePreviewMusic(profile.id, trackId);
                  }
                }}
                onPreviewMusic={() =>
                  handlePreviewMusic(
                    profile.id,
                    profileMusicMap[profile.id] || profile.musicTrackId || 'none'
                  )
                }
                onPreviewChime={handlePreviewChime}
                onOpenAudioConfig={() => setAudioConfigProfile(profile)}
                onSelect={() => {
                  selectProfile(profile.id);
                  onProfileSelect?.(profile);
                }}
                onEdit={() => setEditingProfile(profile)}
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

      {(showRoutineModal || editingRoutine) && (
        <RoutineEditorModal
          profile={editingRoutine || undefined}
          musicOptions={allMusicOptions}
          onClose={() => {
            setShowRoutineModal(false);
            setEditingRoutine(null);
          }}
          onSave={(saved) => {
            if (editingRoutine) {
              updateProfile(editingRoutine.id, saved);
            } else {
              createCustomProfile(saved);
            }
          }}
        />
      )}

      {showSessionComposer && (
        <SessionComposerModal
          plan={editingSessionPlan || undefined}
          availableProfiles={allProfiles}
          onClose={() => {
            setShowSessionComposer(false);
            setEditingSessionPlan(null);
          }}
          onSave={(data) => {
            if (editingSessionPlan) {
              updateSessionPlan(editingSessionPlan.id, data);
            } else {
              createSessionPlan(data);
            }
          }}
        />
      )}
      {audioConfigProfile && (
        <RoutineAudioModal
          profile={audioConfigProfile}
          selectedMusicId={
            profileMusicMap[audioConfigProfile.id] || audioConfigProfile.musicTrackId || 'none'
          }
          musicOptions={allMusicOptions}
          preferences={preferences}
          onMusicChange={(trackId) => setProfileMusic(audioConfigProfile.id, trackId)}
          onUpdatePreferences={updatePreferences}
          onClose={() => setAudioConfigProfile(null)}
        />
      )}
    </div>
  );
}