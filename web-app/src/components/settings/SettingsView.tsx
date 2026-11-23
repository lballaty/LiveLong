// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/settings/SettingsView.tsx
// Description: User preferences for exercise animation cast/variant/views and audio/haptic cues
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

'use client';

import React from 'react';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';
import ExerciseAnimationPlayer, { CAST_LABELS } from '@/components/exercises/ExerciseAnimationPlayer';
import {
  CastCharacterId,
  ExerciseVariant,
  ExerciseViewMode,
  VoiceOptionId,
} from '@/types/unified-profile.types';
import { audioCueService } from '@/services/audio/AudioCueService';

export default function SettingsView() {
  const { preferences, updatePreferences } = useUnifiedTimerStore();

  return (
    <div className="w-full max-w-2xl mx-auto p-4" data-testid="settings-view">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Practice Settings</h2>

      <div className="space-y-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Exercise Guide Character (Cast of 6)
          </label>
          <select
            value={preferences.characterId}
            onChange={(e) =>
              updatePreferences({ characterId: e.target.value as CastCharacterId })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            {(Object.keys(CAST_LABELS) as CastCharacterId[]).map((id) => (
              <option key={id} value={id}>
                {CAST_LABELS[id]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-sm font-semibold text-gray-800 mb-2">
            Exercise Posture Variant
          </span>
          <div className="flex gap-2">
            {(['standing', 'chair'] as ExerciseVariant[]).map((variant) => (
              <button
                key={variant}
                type="button"
                onClick={() => updatePreferences({ variant })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  preferences.variant === variant
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {variant === 'standing' ? 'Standing' : 'Chair-Based'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-semibold text-gray-800 mb-2">
            Exercise Camera View
          </span>
          <div className="flex gap-2">
            {([
              { id: 'front', label: 'Front' },
              { id: 'side', label: 'Side' },
              { id: 'both', label: 'Front + Side' },
            ] as { id: ExerciseViewMode; label: string }[]).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updatePreferences({ views: opt.id })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  preferences.views === opt.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">Audio Chimes</div>
                <div className="text-xs text-gray-500">
                  Synthesized Web Audio tones on step/phase transitions and completion
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                className="h-4 w-4 accent-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24">Chime Volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(preferences.chimeVolume * 100)}
                onChange={(e) => updatePreferences({ chimeVolume: Number(e.target.value) / 100 })}
                className="flex-1 accent-blue-500"
                aria-label="Chime volume"
              />
              <span className="text-xs text-gray-600 w-10 text-right tabular-nums">
                {Math.round(preferences.chimeVolume * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">Script / Voice Guidance</div>
                <div className="text-xs text-gray-500">
                  Spoken cues for exercise steps and breathing phases (independent channel)
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.voiceCuesEnabled}
                onChange={(e) => updatePreferences({ voiceCuesEnabled: e.target.checked })}
                className="h-4 w-4 accent-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24">Guide Voice</span>
              <div className="flex gap-2">
                {([
                  { id: 'woman', label: 'Woman' },
                  { id: 'man', label: 'Man' },
                ] as { id: VoiceOptionId; label: string }[]).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => updatePreferences({ voiceId: v.id })}
                    className={`px-3 py-1 rounded-md text-xs font-medium border ${
                      preferences.voiceId === v.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24">Voice Volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(preferences.voiceVolume * 100)}
                onChange={(e) => updatePreferences({ voiceVolume: Number(e.target.value) / 100 })}
                className="flex-1 accent-blue-500"
                aria-label="Voice volume"
              />
              <span className="text-xs text-gray-600 w-10 text-right tabular-nums">
                {Math.round(preferences.voiceVolume * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">Background Music</div>
                <div className="text-xs text-gray-500">
                  Mute or adjust background music independently of script voice cues
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={!preferences.musicMuted}
                  onChange={(e) => updatePreferences({ musicMuted: !e.target.checked })}
                  className="h-4 w-4 accent-blue-500"
                />
                Enabled
              </label>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24">Music Volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(preferences.musicVolume * 100)}
                onChange={(e) => updatePreferences({ musicVolume: Number(e.target.value) / 100 })}
                className="flex-1 accent-blue-500"
                aria-label="Music volume"
              />
              <span className="text-xs text-gray-600 w-10 text-right tabular-nums">
                {Math.round(preferences.musicVolume * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">Haptic Vibration</div>
              <div className="text-xs text-gray-500">Vibrate on mobile when a session completes</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.vibrationEnabled}
              onChange={(e) => updatePreferences({ vibrationEnabled: e.target.checked })}
              className="h-4 w-4 accent-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                audioCueService.unlock();
                audioCueService.playChime('complete');
                if (preferences.voiceCuesEnabled) {
                  audioCueService.speak('Audio guidance is ready.');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Test Audio Cue
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <span className="block text-sm font-semibold text-gray-800 mb-2">
            Live Figure Preview (staticPose)
          </span>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <ExerciseAnimationPlayer
              stepId="side-bends"
              stepName="Side Bends Preview"
              characterId={preferences.characterId}
              variant={preferences.variant}
              views={preferences.views}
              isPlaying={false}
              phase="rest"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
