// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/store/unifiedTimerStore.ts
// Description: Unified store for managing timer profiles and state with support for all timer types
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

import { create } from 'zustand';
import { UnifiedProfile, UnifiedTimerState, createSimpleProfile, convertExerciseSeriesToUnified, convertBreathingPatternToUnified } from '@/types/unified-profile.types';
import { UnifiedTimerEngine } from '@/services/timer/UnifiedTimerEngine';
import { JAPANESE_EXERCISE_SERIES } from '@/data/japanese-exercise-series';
import { BREATHING_PATTERNS } from '@/data/breathing-patterns';
import { getAllBreathingProfiles } from '@/data/breathing-profiles';

interface UnifiedTimerStore {
  // Profiles
  profiles: UnifiedProfile[];
  activeProfile: UnifiedProfile | null;
  customProfiles: UnifiedProfile[];

  // Timer
  timerEngine: UnifiedTimerEngine | null;
  timerState: UnifiedTimerState | null;

  // Actions
  initializeProfiles: () => void;
  selectProfile: (profileId: string) => void;
  createCustomProfile: (profile: UnifiedProfile) => void;
  deleteCustomProfile: (profileId: string) => void;

  // Timer controls
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;

  // Callbacks
  onTimerUpdate?: (state: UnifiedTimerState) => void;
  onTimerComplete?: () => void;
  onPhaseChange?: (phase: string) => void;
}

export const useUnifiedTimerStore = create<UnifiedTimerStore>((set, get) => ({
  profiles: [],
  activeProfile: null,
  customProfiles: [],
  timerEngine: null,
  timerState: null,

  initializeProfiles: () => {
    // Create default simple profiles
    const defaultSimpleProfiles: UnifiedProfile[] = [
      createSimpleProfile('Pomodoro', 'Classic 25-minute focus sessions', 25, 5, '#ef4444', '🍅'),
      createSimpleProfile('Deep Work', '90-minute deep focus blocks', 90, 15, '#3b82f6', '🧠'),
      createSimpleProfile('Quick Focus', '15-minute quick tasks', 15, 3, '#10b981', '⚡'),
      createSimpleProfile('Exercise', '30-second high intensity', 0.5, 0.5, '#10b981', '💪'),
      createSimpleProfile('Meditation', '10-minute mindfulness', 10, 2, '#8b5cf6', '🧘')
    ];

    // Convert Japanese exercise series to unified profiles
    const exerciseProfiles = Object.values(JAPANESE_EXERCISE_SERIES).map(series =>
      convertExerciseSeriesToUnified(series)
    );

    // Set proper icons and colors for exercise series
    if (exerciseProfiles[0]) {
      exerciseProfiles[0].icon = '📻';
      exerciseProfiles[0].color = '#dc2626';
    }
    if (exerciseProfiles[1]) {
      exerciseProfiles[1].icon = '☯️';
      exerciseProfiles[1].color = '#0891b2';
    }
    if (exerciseProfiles[2]) {
      exerciseProfiles[2].icon = '🌲';
      exerciseProfiles[2].color = '#059669';
    }

    // Convert breathing patterns to unified profiles
    const breathingProfiles = getAllBreathingProfiles().map(profile => {
      const pattern = BREATHING_PATTERNS[profile.pattern as keyof typeof BREATHING_PATTERNS];
      if (!pattern) return null;
      return convertBreathingPatternToUnified(pattern, profile);
    }).filter(Boolean) as UnifiedProfile[];

    // Combine all profiles
    const allProfiles = [
      ...defaultSimpleProfiles,
      ...exerciseProfiles,
      ...breathingProfiles
    ];

    set({
      profiles: allProfiles,
      activeProfile: allProfiles[0] // Default to Pomodoro
    });
  },

  selectProfile: (profileId: string) => {
    const { profiles, customProfiles, timerEngine } = get();

    // Stop current timer if running
    if (timerEngine) {
      timerEngine.stop();
    }

    // Find profile in all profiles
    const allProfiles = [...profiles, ...customProfiles];
    const profile = allProfiles.find(p => p.id === profileId);

    if (profile) {
      const newEngine = new UnifiedTimerEngine(profile);
      set({
        activeProfile: profile,
        timerEngine: newEngine,
        timerState: newEngine.getState()
      });
    }
  },

  createCustomProfile: (profile: UnifiedProfile) => {
    const { customProfiles } = get();
    profile.isCustom = true;
    profile.isDefault = false;
    set({ customProfiles: [...customProfiles, profile] });
  },

  deleteCustomProfile: (profileId: string) => {
    const { customProfiles } = get();
    set({
      customProfiles: customProfiles.filter(p => p.id !== profileId)
    });
  },

  startTimer: () => {
    const { timerEngine, activeProfile } = get();
    if (!timerEngine || !activeProfile) {
      // Initialize with default if not set
      const profiles = get().profiles;
      if (profiles.length > 0) {
        get().selectProfile(profiles[0].id);
      }
      return;
    }

    timerEngine.start(
      (state) => set({ timerState: state }),
      () => {
        // Timer completed
        const { onTimerComplete } = get();
        onTimerComplete?.();

        // Play notification sound if enabled
        if (activeProfile.soundEnabled) {
          const audio = new Audio('/sounds/bell.mp3');
          audio.play().catch(() => {});
        }

        // Vibrate if enabled
        if (activeProfile.vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      },
      (phase) => {
        const { onPhaseChange } = get();
        onPhaseChange?.(phase);
      }
    );
  },

  pauseTimer: () => {
    const { timerEngine } = get();
    timerEngine?.pause();
    set({ timerState: timerEngine?.getState() || null });
  },

  resumeTimer: () => {
    const { timerEngine } = get();
    timerEngine?.resume();
  },

  stopTimer: () => {
    const { timerEngine } = get();
    timerEngine?.stop();
    set({ timerState: timerEngine?.getState() || null });
  }
}));