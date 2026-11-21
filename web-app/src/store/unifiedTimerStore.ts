// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/store/unifiedTimerStore.ts
// Description: Unified store for managing timer profiles, preferences, audio cues, and IndexedDB session history
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

import { create } from 'zustand';
import {
  UnifiedProfile,
  UnifiedTimerState,
  PracticePreferences,
  createSimpleProfile,
  convertExerciseSeriesToUnified,
  convertBreathingPatternToUnified,
} from '@/types/unified-profile.types';
import { UnifiedTimerEngine } from '@/services/timer/UnifiedTimerEngine';
import { JAPANESE_EXERCISE_SERIES } from '@/data/japanese-exercise-series';
import { getAllBreathingProfiles } from '@/data/breathing-profiles';
import { audioCueService } from '@/services/audio/AudioCueService';
import { IndexedDBService } from '@/services/database/IndexedDBService';
import { SessionRepository } from '@/services/repositories/SessionRepository';
import { Session, SessionStatistics, SessionStatus } from '@/types/profile.types';

const PREFS_STORAGE_KEY = 'livelong_preferences';
const CUSTOM_PROFILES_STORAGE_KEY = 'livelong_custom_profiles';

const DEFAULT_PREFERENCES: PracticePreferences = {
  characterId: 'm25-athletic',
  variant: 'standing',
  views: 'front',
  soundEnabled: true,
  voiceCuesEnabled: false,
  vibrationEnabled: true,
};

function loadStoredPreferences(): PracticePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function loadStoredCustomProfiles(): UnifiedProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_PROFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UnifiedProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface UnifiedTimerStore {
  // Profiles
  profiles: UnifiedProfile[];
  activeProfile: UnifiedProfile | null;
  customProfiles: UnifiedProfile[];

  // Timer
  timerEngine: UnifiedTimerEngine | null;
  timerState: UnifiedTimerState | null;
  sessionStartedAt: Date | null;

  // Preferences & Progress
  preferences: PracticePreferences;
  stats: SessionStatistics | null;
  recentSessions: Session[];

  // Actions
  initializeProfiles: () => void;
  selectProfile: (profileId: string) => void;
  createCustomProfile: (profile: UnifiedProfile) => void;
  updateProfile: (profileId: string, updates: Partial<UnifiedProfile>) => void;
  deleteCustomProfile: (profileId: string) => void;
  updatePreferences: (updates: Partial<PracticePreferences>) => void;
  loadProgress: () => Promise<void>;

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

async function getSessionRepository(): Promise<SessionRepository | null> {
  if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
    return null;
  }
  const dbService = IndexedDBService.getInstance();
  await dbService.initialize();
  return new SessionRepository(dbService);
}

export const useUnifiedTimerStore = create<UnifiedTimerStore>((set, get) => ({
  profiles: [],
  activeProfile: null,
  customProfiles: [],
  timerEngine: null,
  timerState: null,
  sessionStartedAt: null,
  preferences: DEFAULT_PREFERENCES,
  stats: null,
  recentSessions: [],

  initializeProfiles: () => {
    if (get().profiles.length > 0 && get().timerEngine) {
      return;
    }

    const defaultSimpleProfiles: UnifiedProfile[] = [
      createSimpleProfile('Pomodoro', 'Classic 25-minute focus sessions', 25, 5, '#ef4444', '🍅'),
      createSimpleProfile('Deep Work', '90-minute deep focus blocks', 90, 15, '#3b82f6', '🧠'),
      createSimpleProfile('Quick Focus', '15-minute quick tasks', 15, 3, '#10b981', '⚡'),
      createSimpleProfile('Exercise', '30-second high intensity', 0.5, 0.5, '#10b981', '💪'),
      createSimpleProfile('Meditation', '10-minute mindfulness', 10, 2, '#8b5cf6', '🧘'),
    ];

    const exerciseProfiles = Object.values(JAPANESE_EXERCISE_SERIES).map((series) =>
      convertExerciseSeriesToUnified(series)
    );

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

    const breathingProfiles = getAllBreathingProfiles()
      .map((profile) => {
        const pattern = profile.exerciseSeries?.breathingPattern;
        if (!pattern) return null;
        return convertBreathingPatternToUnified(pattern, profile);
      })
      .filter(Boolean) as UnifiedProfile[];

    const allProfiles = [
      ...exerciseProfiles,
      ...breathingProfiles,
      ...defaultSimpleProfiles,
    ];

    const storedCustom = loadStoredCustomProfiles();
    const storedPrefs = loadStoredPreferences();
    const defaultActive = allProfiles[0];
    const engine = defaultActive ? new UnifiedTimerEngine(defaultActive) : null;

    set({
      profiles: allProfiles,
      customProfiles: storedCustom,
      preferences: storedPrefs,
      activeProfile: defaultActive || null,
      timerEngine: engine,
      timerState: engine ? engine.getState() : null,
    });
  },

  selectProfile: (profileId: string) => {
    const { profiles, customProfiles, timerEngine } = get();
    if (timerEngine) {
      timerEngine.stop();
    }
    audioCueService.stopSpeech();

    const allProfiles = [...profiles, ...customProfiles];
    const profile = allProfiles.find((p) => p.id === profileId);

    if (profile) {
      const newEngine = new UnifiedTimerEngine(profile);
      set({
        activeProfile: profile,
        timerEngine: newEngine,
        timerState: newEngine.getState(),
        sessionStartedAt: null,
      });
    }
  },

  createCustomProfile: (profile: UnifiedProfile) => {
    const { customProfiles } = get();
    profile.isCustom = true;
    profile.isDefault = false;
    const next = [...customProfiles, profile];
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CUSTOM_PROFILES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
    }
    set({ customProfiles: next });
  },

  updateProfile: (profileId: string, updates: Partial<UnifiedProfile>) => {
    const { profiles, customProfiles, activeProfile } = get();

    const updatedProfiles = profiles.map((p) =>
      p.id === profileId ? { ...p, ...updates, id: p.id, type: p.type } : p
    );
    const updatedCustomProfiles = customProfiles.map((p) =>
      p.id === profileId ? { ...p, ...updates, id: p.id, type: p.type } : p
    );
    const updatedActiveProfile =
      activeProfile?.id === profileId
        ? { ...activeProfile, ...updates, id: activeProfile.id, type: activeProfile.type }
        : activeProfile;

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CUSTOM_PROFILES_STORAGE_KEY, JSON.stringify(updatedCustomProfiles));
      } catch {
        // Ignore
      }
    }

    set({
      profiles: updatedProfiles,
      customProfiles: updatedCustomProfiles,
      activeProfile: updatedActiveProfile,
    });
  },

  deleteCustomProfile: (profileId: string) => {
    const { customProfiles } = get();
    const next = customProfiles.filter((p) => p.id !== profileId);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CUSTOM_PROFILES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    set({ customProfiles: next });
  },

  updatePreferences: (updates: Partial<PracticePreferences>) => {
    const next = { ...get().preferences, ...updates };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    set({ preferences: next });
  },

  loadProgress: async () => {
    try {
      const repo = await getSessionRepository();
      if (!repo) return;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [stats, recent] = await Promise.all([
        repo.getStatistics(),
        repo.findByDateRange(thirtyDaysAgo, new Date()),
      ]);
      const recentSessions = recent
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, 10);
      set({ stats, recentSessions });
    } catch {
      // Ignore IndexedDB unavailability
    }
  },

  startTimer: () => {
    const { timerEngine, activeProfile, preferences } = get();
    if (!timerEngine || !activeProfile) {
      const profiles = get().profiles;
      if (profiles.length > 0) {
        get().selectProfile(profiles[0].id);
      }
      return;
    }

    audioCueService.unlock();
    if (preferences.soundEnabled) {
      audioCueService.playChime('start');
    }
    if (preferences.voiceCuesEnabled) {
      const initialCue =
        activeProfile.type === 'series'
          ? activeProfile.seriesConfig?.steps[0]?.name || activeProfile.name
          : activeProfile.name;
      audioCueService.speak(`Starting ${initialCue}`);
    }

    set({ sessionStartedAt: new Date() });

    timerEngine.start(
      (state) => set({ timerState: state }),
      async () => {
        const { onTimerComplete, preferences: prefs, sessionStartedAt, timerState } = get();
        onTimerComplete?.();

        if (prefs.soundEnabled) {
          audioCueService.playChime('complete');
        }
        if (prefs.voiceCuesEnabled) {
          audioCueService.speak('Session complete. Great work.');
        }
        if (prefs.vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }

        try {
          const repo = await getSessionRepository();
          if (repo) {
            const startedAt = sessionStartedAt || new Date();
            const elapsedMinutes = Math.max(
              0.1,
              (timerState?.totalElapsedSeconds || activeProfile.totalDurationSeconds) / 60
            );
            await repo.create({
              profileId: activeProfile.id,
              startedAt,
              completedAt: new Date(),
              plannedDurationMinutes: activeProfile.totalDurationSeconds / 60,
              actualDurationMinutes: elapsedMinutes,
              completionStatus: SessionStatus.COMPLETED,
              pauseCount: timerState?.pauseCount || 0,
              totalPauseDurationMinutes: 0,
            });
            await get().loadProgress();
          }
        } catch {
          // Ignore persistence errors
        }
      },
      (phase) => {
        const { onPhaseChange, preferences: prefs, timerState } = get();
        onPhaseChange?.(phase);

        if (prefs.soundEnabled) {
          audioCueService.playChime(phase === 'rest' || phase === 'break' ? 'rest' : 'phase');
        }
        if (prefs.voiceCuesEnabled) {
          const stepName = timerState?.seriesState?.currentStep?.name;
          const cueMap: Record<string, string> = {
            inhale: 'Breathe in',
            'hold-in': 'Hold',
            exhale: 'Breathe out',
            'hold-out': 'Hold',
            rest: 'Rest',
            break: 'Break time',
            cooldown: 'Cooling down',
            exercise: stepName || 'Next exercise',
          };
          audioCueService.speak(cueMap[phase] || phase);
        }
      }
    );
  },

  pauseTimer: () => {
    const { timerEngine } = get();
    timerEngine?.pause();
    audioCueService.stopSpeech();
    set({ timerState: timerEngine?.getState() || null });
  },

  resumeTimer: () => {
    const { timerEngine } = get();
    audioCueService.unlock();
    timerEngine?.resume();
  },

  stopTimer: () => {
    const { timerEngine } = get();
    timerEngine?.stop();
    audioCueService.stopSpeech();
    set({ timerState: timerEngine?.getState() || null, sessionStartedAt: null });
  },
}));
