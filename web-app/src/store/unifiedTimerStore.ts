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
import {
  backgroundMusicService,
  MusicTrackOption,
} from '@/services/audio/BackgroundMusicService';
import { IndexedDBService } from '@/services/database/IndexedDBService';
import { SessionRepository } from '@/services/repositories/SessionRepository';
import { Session, SessionStatistics, SessionStatus } from '@/types/profile.types';

const PREFS_STORAGE_KEY = 'livelong_preferences';
const CUSTOM_PROFILES_STORAGE_KEY = 'livelong_custom_profiles';
const PROFILE_MUSIC_STORAGE_KEY = 'livelong_profile_music';
const CUSTOM_MUSIC_STORAGE_KEY = 'livelong_custom_music';

function loadStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const DEFAULT_PREFERENCES: PracticePreferences = {
  characterId: 'm25-athletic',
  variant: 'standing',
  views: 'front',
  soundEnabled: true,
  chimeVolume: 0.7,
  voiceCuesEnabled: false,
  voiceVolume: 0.9,
  musicMuted: false,
  musicVolume: 0.25,
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
  isIntroPlaying: boolean;

  // Preferences & Progress
  preferences: PracticePreferences;
  profileMusicMap: Record<string, string>;
  customMusicTracks: MusicTrackOption[];
  stats: SessionStatistics | null;
  recentSessions: Session[];

  // Actions
  initializeProfiles: () => void;
  selectProfile: (profileId: string) => void;
  createCustomProfile: (profile: UnifiedProfile) => void;
  updateProfile: (profileId: string, updates: Partial<UnifiedProfile>) => void;
  deleteCustomProfile: (profileId: string) => void;
  updatePreferences: (updates: Partial<PracticePreferences>) => void;
  setProfileMusic: (profileId: string, trackId: string) => void;
  addCustomMusicTrack: (track: MusicTrackOption) => void;
  loadProgress: () => Promise<void>;

  // Timer controls
  setBreathingCycles: (cycles: number) => void;
  startTimer: () => void;
  skipIntro: () => void;
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
  isIntroPlaying: false,
  preferences: DEFAULT_PREFERENCES,
  profileMusicMap: {},
  customMusicTracks: [],
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
    backgroundMusicService.setVolume(storedPrefs.musicVolume);
    backgroundMusicService.setMuted(storedPrefs.musicMuted);
    const storedProfileMusic = loadStoredJson<Record<string, string>>(PROFILE_MUSIC_STORAGE_KEY, {});
    const storedCustomMusic = loadStoredJson<MusicTrackOption[]>(CUSTOM_MUSIC_STORAGE_KEY, []);
    const defaultActive = allProfiles[0];
    const engine = defaultActive ? new UnifiedTimerEngine(defaultActive) : null;

    set({
      profiles: allProfiles,
      customProfiles: storedCustom,
      preferences: storedPrefs,
      profileMusicMap: storedProfileMusic,
      customMusicTracks: storedCustomMusic,
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
    backgroundMusicService.stop();

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

    const isUpdatingIdleActive =
      updatedActiveProfile?.id === profileId && get().timerState?.status === 'idle';
    const nextEngine =
      isUpdatingIdleActive && updatedActiveProfile
        ? new UnifiedTimerEngine(updatedActiveProfile)
        : get().timerEngine;

    set({
      profiles: updatedProfiles,
      customProfiles: updatedCustomProfiles,
      activeProfile: updatedActiveProfile,
      timerEngine: nextEngine,
      timerState: nextEngine ? nextEngine.getState() : get().timerState,
    });
  },

  setBreathingCycles: (cycles: number) => {
    const { activeProfile } = get();
    if (!activeProfile || activeProfile.type !== 'breathing' || !activeProfile.breathingConfig) {
      return;
    }
    const clamped = Math.max(1, Math.min(60, Math.round(cycles)));
    const cycleDuration = activeProfile.breathingConfig.pattern.reduce(
      (sum, p) => sum + p.durationSeconds,
      0
    );
    const totalDurationSeconds = cycleDuration * clamped;
    get().updateProfile(activeProfile.id, {
      breathingConfig: {
        ...activeProfile.breathingConfig,
        cycleCount: clamped,
        totalDurationMinutes: totalDurationSeconds / 60,
      },
      totalDurationSeconds,
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
    if (updates.musicVolume !== undefined) {
      backgroundMusicService.setVolume(next.musicVolume);
    }
    if (updates.musicMuted !== undefined) {
      backgroundMusicService.setMuted(next.musicMuted);
    }
    if (updates.voiceCuesEnabled === false) {
      audioCueService.stopSpeech();
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    set({ preferences: next });
  },

  setProfileMusic: (profileId: string, trackId: string) => {
    const next = { ...get().profileMusicMap, [profileId]: trackId };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PROFILE_MUSIC_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    set({ profileMusicMap: next });
  },

  addCustomMusicTrack: (track: MusicTrackOption) => {
    const next = [...get().customMusicTracks, track];
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CUSTOM_MUSIC_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
    }
    set({ customMusicTracks: next });
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

  skipIntro: () => {
    if (!get().isIntroPlaying) return;
    audioCueService.stopSpeech();
    set({ isIntroPlaying: false });
    get().startTimer();
  },

  startTimer: () => {
    const { timerEngine, activeProfile, preferences, isIntroPlaying } = get();
    if (!timerEngine || !activeProfile) {
      const profiles = get().profiles;
      if (profiles.length > 0) {
        get().selectProfile(profiles[0].id);
      }
      return;
    }

    audioCueService.unlock();

    // Play ~20s calming intro before Round 1 when voice cues are enabled for breathing
    if (
      activeProfile.type === 'breathing' &&
      preferences.voiceCuesEnabled &&
      !isIntroPlaying &&
      (get().timerState?.totalElapsedSeconds || 0) === 0
    ) {
      set({ isIntroPlaying: true });
      const introFallback =
        "Let's take a few minutes just for you. Sit comfortably, let your shoulders soften, and follow my voice. Gently let all the air out.";
      audioCueService.speakCue(
        'breathing.intro',
        introFallback,
        () => {
          if (get().isIntroPlaying) {
            set({ isIntroPlaying: false });
            get().startTimer();
          }
        },
        preferences.voiceVolume
      );
      return;
    }

    if (preferences.soundEnabled) {
      audioCueService.playChime('start', preferences.chimeVolume);
    }
    if (preferences.voiceCuesEnabled) {
      if (activeProfile.type === 'breathing') {
        audioCueService.speakCue(
          'breathing.inhale',
          'Breathe in slowly through your nose.',
          undefined,
          preferences.voiceVolume
        );
      } else {
        const initialCue =
          activeProfile.type === 'series'
            ? activeProfile.seriesConfig?.steps[0]?.name || activeProfile.name
            : activeProfile.name;
        const cueId =
          activeProfile.id === 'rajio-taiso-series' ? 'rajio-taiso.warmup' : activeProfile.id;
        audioCueService.speakCue(cueId, `Starting ${initialCue}`, undefined, preferences.voiceVolume);
      }
    }

    set({ sessionStartedAt: new Date(), isIntroPlaying: false });

    const activeTrackId = get().profileMusicMap[activeProfile.id] || activeProfile.musicTrackId || 'none';
    if (activeTrackId !== 'none') {
      backgroundMusicService.setVolume(preferences.musicVolume);
      backgroundMusicService.setMuted(preferences.musicMuted);
      backgroundMusicService.start(activeTrackId, get().customMusicTracks);
    }

    timerEngine.start(
      (state) => set({ timerState: state }),
      async () => {
        const { onTimerComplete, preferences: prefs, sessionStartedAt, timerState } = get();
        backgroundMusicService.stop();
        onTimerComplete?.();

        if (prefs.soundEnabled) {
          audioCueService.playChime('complete', prefs.chimeVolume);
        }
        if (prefs.voiceCuesEnabled) {
          audioCueService.speakCue(
            'session.complete',
            "That's the end of your session. Take a moment to notice how you feel. Well done.",
            undefined,
            prefs.voiceVolume
          );
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
        const { onPhaseChange, preferences: prefs, timerState, activeProfile: prof } = get();
        onPhaseChange?.(phase);

        if (prefs.soundEnabled) {
          audioCueService.playChime(
            phase === 'rest' || phase === 'break' ? 'rest' : 'phase',
            prefs.chimeVolume
          );
        }
        if (prefs.voiceCuesEnabled) {
          if (prof?.type === 'breathing' && timerState?.breathingState) {
            const cycle = timerState.breathingState.currentCycle;
            const totalCycles = prof.breathingConfig?.cycleCount || 1;
            const isShort = cycle > 1;
            const shortCues: Record<string, string[]> = {
              inhale: ['Breathe in.', 'Inhale gently.', 'Draw air in.'],
              'hold-in': ['Hold.', 'Pause here.', 'Hold gently.'],
              exhale: ['And let it go.', 'Breathe out slowly.', 'Release softly.'],
              'hold-out': ['And pause.', 'Rest empty.', 'Stay still.'],
            };
            const fullCues: Record<string, string> = {
              inhale: 'Breathe in slowly through your nose.',
              'hold-in': 'And hold, nice and easy.',
              exhale: 'Now breathe out slowly, and let the tension go.',
              'hold-out': 'Rest here, empty and still.',
            };

            if (phase === 'inhale' && totalCycles > 2 && cycle === totalCycles) {
              audioCueService.speakCue(
                'breathing.inhale.last',
                'One last round. Breathe in.',
                undefined,
                prefs.voiceVolume
              );
              return;
            }
            if (phase === 'inhale' && totalCycles >= 4 && cycle === Math.ceil(totalCycles / 2)) {
              audioCueService.speakCue(
                'breathing.encourage',
                [
                  "You're doing really well. Keep following the rhythm.",
                  'Stay steady and relaxed.',
                  'Nice and easy, keep going.',
                ],
                undefined,
                prefs.voiceVolume
              );
              return;
            }

            const cueId = isShort ? `breathing.${phase}.short` : `breathing.${phase}`;
            const fallback = (isShort ? shortCues : fullCues)[phase] || phase;
            audioCueService.speakCue(cueId, fallback, undefined, prefs.voiceVolume);
            return;
          }

          const step = timerState?.seriesState?.currentStep;
          const cueMap: Record<string, string> = {
            rest: 'Rest.',
            break: 'Break time.',
            cooldown: 'Cooling down.',
            exercise: step?.name || 'Next exercise.',
          };
          const cueId =
            phase === 'rest'
              ? 'session.rest'
              : phase === 'exercise' && step
              ? `rajio-taiso.${step.id}`
              : `session.${phase}`;
          audioCueService.speakCue(cueId, cueMap[phase] || phase, undefined, prefs.voiceVolume);
        }
      }
    );
  },

  pauseTimer: () => {
    const { timerEngine } = get();
    timerEngine?.pause();
    audioCueService.stopSpeech();
    backgroundMusicService.pause();
    set({ timerState: timerEngine?.getState() || null });
  },

  resumeTimer: () => {
    const { timerEngine, activeProfile, profileMusicMap, customMusicTracks } = get();
    audioCueService.unlock();
    if (activeProfile) {
      const trackId = profileMusicMap[activeProfile.id] || activeProfile.musicTrackId || 'none';
      if (trackId !== 'none') {
        backgroundMusicService.resume(trackId, customMusicTracks);
      }
    }
    timerEngine?.resume();
  },

  stopTimer: () => {
    const { timerEngine } = get();
    timerEngine?.stop();
    audioCueService.stopSpeech();
    backgroundMusicService.stop();
    set({ timerState: timerEngine?.getState() || null, sessionStartedAt: null });
  },
}));
