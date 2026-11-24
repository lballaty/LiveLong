// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/RoutineAudioModal.tsx
// Description: Modal for configuring and previewing music, chimes, and script voice from a Routine card
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-24

'use client';

import React, { useEffect, useState } from 'react';
import {
  PracticePreferences,
  UnifiedProfile,
  VoiceOptionId,
} from '@/types/unified-profile.types';
import {
  MusicTrackOption,
  backgroundMusicService,
} from '@/services/audio/BackgroundMusicService';
import { audioCueService } from '@/services/audio/AudioCueService';

interface RoutineAudioModalProps {
  profile: UnifiedProfile;
  selectedMusicId: string;
  musicOptions: MusicTrackOption[];
  preferences: PracticePreferences;
  onMusicChange: (trackId: string) => void;
  onUpdatePreferences: (updates: Partial<PracticePreferences>) => void;
  onClose: () => void;
}

export default function RoutineAudioModal({
  profile,
  selectedMusicId,
  musicOptions,
  preferences,
  onMusicChange,
  onUpdatePreferences,
  onClose,
}: RoutineAudioModalProps) {
  const [isPreviewingMusic, setIsPreviewingMusic] = useState(false);

  useEffect(() => {
    return () => {
      backgroundMusicService.stop();
    };
  }, []);

  const handleClose = () => {
    backgroundMusicService.stop();
    onClose();
  };

  return (
    <div
      data-testid="routine-audio-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            🎛️ Audio Setup: {profile.name}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-800 px-2 py-1"
            aria-label="Close audio setup"
          >
            ✕
          </button>
        </div>

        {/* Music */}
        <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">🎵 Background Music</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={!preferences.musicMuted}
                onChange={(e) => onUpdatePreferences({ musicMuted: !e.target.checked })}
                className="h-4 w-4 accent-emerald-600"
              />
              Enabled
            </label>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedMusicId}
              onChange={(e) => {
                const val = e.target.value;
                onMusicChange(val);
                if (isPreviewingMusic) {
                  const playing = backgroundMusicService.previewToggle(
                    val,
                    musicOptions,
                    preferences.musicVolume
                  );
                  setIsPreviewingMusic(playing);
                }
              }}
              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {musicOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={selectedMusicId === 'none'}
              onClick={() => {
                const playing = backgroundMusicService.previewToggle(
                  selectedMusicId,
                  musicOptions,
                  preferences.musicVolume
                );
                setIsPreviewingMusic(playing);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            >
              {isPreviewingMusic ? '⏹ Stop' : '▶ Preview'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-16">Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(preferences.musicVolume * 100)}
              onChange={(e) => onUpdatePreferences({ musicVolume: Number(e.target.value) / 100 })}
              className="flex-1 accent-emerald-600"
              aria-label="Routine music volume"
            />
            <span className="text-xs text-slate-600 w-9 text-right tabular-nums">
              {Math.round(preferences.musicVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Chimes */}
        <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">🔔 Transition Chimes</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => onUpdatePreferences({ soundEnabled: e.target.checked })}
                className="h-4 w-4 accent-amber-600"
              />
              Enabled
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-16">Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(preferences.chimeVolume * 100)}
              onChange={(e) => onUpdatePreferences({ chimeVolume: Number(e.target.value) / 100 })}
              className="flex-1 accent-amber-600"
              aria-label="Routine chime volume"
            />
            <span className="text-xs text-slate-600 w-9 text-right tabular-nums">
              {Math.round(preferences.chimeVolume * 100)}%
            </span>
            <button
              type="button"
              onClick={() => {
                audioCueService.unlock();
                audioCueService.playChime('phase', preferences.chimeVolume);
              }}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              🔔 Test
            </button>
          </div>
        </div>

        {/* Script Voice */}
        <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">🔊 Guided Voice</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={preferences.voiceCuesEnabled}
                onChange={(e) => onUpdatePreferences({ voiceCuesEnabled: e.target.checked })}
                className="h-4 w-4 accent-blue-600"
              />
              Enabled
            </label>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={preferences.voiceId}
              onChange={(e) =>
                onUpdatePreferences({ voiceId: e.target.value as VoiceOptionId })
              }
              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="woman">Woman (Calm Guide)</option>
              <option value="man">Man (Calm Guide)</option>
            </select>
            <button
              type="button"
              onClick={() => {
                audioCueService.unlock();
                audioCueService.speakCue(
                  'session.start',
                  `Ready for ${profile.name}.`,
                  undefined,
                  preferences.voiceVolume,
                  preferences.voiceId
                );
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              🔊 Test
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-16">Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(preferences.voiceVolume * 100)}
              onChange={(e) => onUpdatePreferences({ voiceVolume: Number(e.target.value) / 100 })}
              className="flex-1 accent-blue-600"
              aria-label="Routine voice volume"
            />
            <span className="text-xs text-slate-600 w-9 text-right tabular-nums">
              {Math.round(preferences.voiceVolume * 100)}%
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
