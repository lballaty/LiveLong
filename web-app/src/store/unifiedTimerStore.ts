// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/store/unifiedTimerStore.ts
// Description: Unified store for managing timer profiles, preferences, audio cues, and IndexedDB session history
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

import { create } from 'zustand';
import {
  UnifiedProfile,
  UnifiedTimerState,
  PracticePreferences,
  SessionPlan,
  createSimpleProfile,
  cloneProfileAsCustom,
  convertExerciseSeriesToUnified,
  convertBreathingPatternToUnified,
} from '@/types/unified-profile.types';
import { UnifiedTimerEngine } from '@/services/timer/UnifiedTimerEngine';
import { JAPANESE_EXERCISE_SERIES } from '@/data/japanese-exercise-series';
import { resolveSeriesStep } from '@/data/exercise-library';
import { getAllBreathingProfiles } from '@/data/breathing-profiles';
import { audioCueService } from '@/services/audio/AudioCueService';
import {
  backgroundMusicService,
  MusicTrackOption,
  normalizeMusicTrackId,
} from '@/services/audio/BackgroundMusicService';
import { IndexedDBService } from '@/services/database/IndexedDBService';
import { SessionRepository } from '@/services/repositories/SessionRepository';
import { Session, SessionStatistics, SessionStatus } from '@/types/profile.types';

const PREFS_STORAGE_KEY = 'livelong_preferences';
const CUSTOM_PROFILES_STORAGE_KEY = 'livelong_custom_profiles';
const PROFILE_MUSIC_STORAGE_KEY = 'livelong_profile_music';
const CUSTOM_MUSIC_STORAGE_KEY = 'livelong_custom_music';
const SESSION_PLANS_STORAGE_KEY = 'livelong_session_plans';
const PROFILE_ORDER_STORAGE_KEY = 'livelong_profile_order';
const PINNED_IDS_STORAGE_KEY = 'livelong_pinned_ids';
const USER_DEFAULT_PREFS_KEY = 'livelong_user_default_preferences';

const DEFAULT_PINNED_IDS = [
  'default-session-morning-longevity',
  'default-session-desk-focus',
  'rajio-taiso-series',
  'tai-chi-morning-series',
  'box-breathing-profile',
];

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

function buildDefaultSessionPlans(profiles: UnifiedProfile[]): SessionPlan[] {
  const findId = (idOrName: string): string | null => {
    const match = profiles.find((p) => p.id === idOrName || p.name === idOrName);
    return match ? match.id : null;
  };
  const makeItems = (targets: string[]) =>
    targets
      .map(findId)
      .filter((id): id is string => Boolean(id))
      .map((profileId, idx) => ({ id: `default-item-${idx + 1}-${profileId}`, profileId }));

  const now = new Date();
  const specs = [
    {
      id: 'default-session-morning-longevity',
      name: 'Morning Longevity Stack',
      description: 'Energizing Rajio Taiso movement followed by Box Breathing for calm focus',
      icon: '🌅',
      targets: ['rajio-taiso-series', 'box-breathing-profile'],
    },
    {
      id: 'default-session-midday-reset',
      name: 'Midday Focus & Reset',
      description: 'Gentle Tai Chi flow, Deep Breathing reset, and a 25-minute Pomodoro block',
      icon: '⚡',
      targets: ['tai-chi-morning-series', 'deep-breathing-profile', 'Pomodoro'],
    },
    {
      id: 'default-session-nature-calm',
      name: 'Nature & Calm Decompression',
      description: 'Shinrin-yoku forest awareness paired with 4-7-8 Relaxation breathing',
      icon: '🌲',
      targets: ['shinrin-yoku-series', '4-7-8-breathing-profile'],
    },
    {
      id: 'default-session-vitality-breath',
      name: 'Vitality & Breath Power',
      description: 'Wim Hof power breathing followed by full-body Rajio Taiso calisthenics',
      icon: '🔥',
      targets: ['wim-hof-breathing-profile', 'rajio-taiso-series'],
    },
    {
      id: 'default-session-desk-focus',
      name: 'Desk Reset & Focus',
      description: 'Posture mobility reset, Box Breathing, and a 25-minute Pomodoro sprint',
      icon: '🪑',
      targets: ['desk-reset-series', 'box-breathing-profile', 'Pomodoro'],
    },
    {
      id: 'default-session-core-calm',
      name: 'Core AMRAP & Zen Cooldown',
      description: 'Timed sit-ups & plank circuit followed by Zazen seated stillness',
      icon: '💪',
      targets: ['core-amrap-series', 'zazen-sitting-series'],
    },
  ];

  return specs
    .map((spec) => ({
      id: spec.id,
      name: spec.name,
      description: spec.description,
      icon: spec.icon,
      items: makeItems(spec.targets),
      createdAt: now,
      updatedAt: now,
    }))
    .filter((plan) => plan.items.length >= 2);
}

const DEFAULT_PREFERENCES: PracticePreferences = {
  characterId: 'robot-r1',
  variant: 'standing',
  views: 'front',
  soundEnabled: true,
  chimeVolume: 0.7,
  voiceCuesEnabled: false,
  voiceId: 'woman',
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
  profileOrder: string[];

  // Timer
  timerEngine: UnifiedTimerEngine | null;
  timerState: UnifiedTimerState | null;
  sessionStartedAt: Date | null;
  isIntroPlaying: boolean;

  // Session Plans (multi-routine playlists)
  sessionPlans: SessionPlan[];
  activeSessionPlan: SessionPlan | null;
  activeSessionIndex: number;
  pinnedIds: string[];

  // Preferences & Progress
  preferences: PracticePreferences;
  hasSavedDefaults: boolean;
  profileMusicMap: Record<string, string>;
  customMusicTracks: MusicTrackOption[];
  stats: SessionStatistics | null;
  recentSessions: Session[];

  // Actions
  initializeProfiles: () => void;
  selectProfile: (profileId: string) => void;
  createCustomProfile: (profile: UnifiedProfile) => void;
  duplicateProfile: (profileId: string) => UnifiedProfile | null;
  updateProfile: (profileId: string, updates: Partial<UnifiedProfile>) => void;
  deleteCustomProfile: (profileId: string) => void;
  moveProfileOrder: (profileId: string, direction: -1 | 1, scopeIds?: string[]) => void;
  createSessionPlan: (plan: Omit<SessionPlan, 'id' | 'createdAt' | 'updatedAt'>) => SessionPlan;
  updateSessionPlan: (planId: string, updates: Partial<SessionPlan>) => void;
  deleteSessionPlan: (planId: string) => void;
  startSessionPlan: (planId: string) => void;
  stopSessionPlan: () => void;
  togglePin: (id: string) => void;
  updatePreferences: (updates: Partial<PracticePreferences>) => void;
  saveAsDefaults: () => void;
  resetAllPreferences: (toFactory?: boolean) => void;
  setProfileMusic: (profileId: string, trackId: string) => void;
  addCustomMusicTrack: (track: MusicTrackOption) => void;
  loadProgress: () => Promise<void>;

  // Timer & review controls
  setBreathingCycles: (cycles: number) => void;
  startTimer: () => void;
  skipIntro: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  jumpToStep: (stepIndex: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  previewStepCue: (stepIndex?: number) => void;

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
  profileOrder: [],
  timerEngine: null,
  timerState: null,
  sessionStartedAt: null,
  isIntroPlaying: false,
  sessionPlans: [],
  activeSessionPlan: null,
  activeSessionIndex: 0,
  pinnedIds: [],
  preferences: DEFAULT_PREFERENCES,
  hasSavedDefaults: false,
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

    const exerciseProfiles = Object.values(JAPANESE_EXERCISE_SERIES).map((series) => {
      const unified = convertExerciseSeriesToUnified(series);
      if (unified.seriesConfig) {
        unified.seriesConfig.steps = unified.seriesConfig.steps.map(resolveSeriesStep);
      }
      return unified;
    });

    const seriesMeta: Record<string, { icon: string; color: string }> = {
      'rajio-taiso-series': { icon: '📻', color: '#dc2626' },
      'tai-chi-morning-series': { icon: '☯️', color: '#0891b2' },
      'shinrin-yoku-series': { icon: '🌲', color: '#059669' },
      'ikigai-reflection-series': { icon: '🧭', color: '#d97706' },
      'zazen-sitting-series': { icon: '🪷', color: '#6366f1' },
      'desk-reset-series': { icon: '🪑', color: '#0284c7' },
      'core-amrap-series': { icon: '💪', color: '#e11d48' },
    };

    exerciseProfiles.forEach((profile) => {
      const meta = seriesMeta[profile.id];
      if (meta) {
        profile.icon = meta.icon;
        profile.color = meta.color;
      }
    });

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
    const rawProfileMusic = loadStoredJson<Record<string, string>>(PROFILE_MUSIC_STORAGE_KEY, {});
    const storedProfileMusic = Object.fromEntries(
      Object.entries(rawProfileMusic).map(([k, v]) => [k, normalizeMusicTrackId(v)])
    );
    const storedCustomMusic = loadStoredJson<MusicTrackOption[]>(CUSTOM_MUSIC_STORAGE_KEY, []);
    const rawSessionPlans =
      typeof window !== 'undefined' ? window.localStorage.getItem(SESSION_PLANS_STORAGE_KEY) : null;
    const storedSessionPlans =
      rawSessionPlans === null
        ? buildDefaultSessionPlans(allProfiles)
        : loadStoredJson<SessionPlan[]>(SESSION_PLANS_STORAGE_KEY, []);
    const storedProfileOrder = loadStoredJson<string[]>(PROFILE_ORDER_STORAGE_KEY, []);
    const rawPinnedIds =
      typeof window !== 'undefined' ? window.localStorage.getItem(PINNED_IDS_STORAGE_KEY) : null;
    const storedPinnedIds =
      rawPinnedIds === null
        ? DEFAULT_PINNED_IDS
        : loadStoredJson<string[]>(PINNED_IDS_STORAGE_KEY, []);
    const hasSavedDefaults = Boolean(
      loadStoredJson<Partial<PracticePreferences> | null>(USER_DEFAULT_PREFS_KEY, null)
    );
    const defaultActive = allProfiles[0];
    const engine = defaultActive ? new UnifiedTimerEngine(defaultActive) : null;

    set({
      profiles: allProfiles,
      customProfiles: storedCustom,
      profileOrder: storedProfileOrder,
      sessionPlans: storedSessionPlans,
      pinnedIds: storedPinnedIds,
      preferences: storedPrefs,
      hasSavedDefaults,
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

  moveProfileOrder: (profileId: string, direction: -1 | 1, scopeIds?: string[]) => {
    const allIds = [...get().profiles, ...get().customProfiles].map((p) => p.id);
    const current = [...get().profileOrder];
    allIds.forEach((id) => {
      if (!current.includes(id)) current.push(id);
    });
    const visibleIds = scopeIds && scopeIds.length > 0 ? scopeIds : current;
    const orderedVisible = current.filter((id) => visibleIds.includes(id));
    const idx = orderedVisible.indexOf(profileId);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= orderedVisible.length) return;
    const neighborId = orderedVisible[targetIdx];
    const posA = current.indexOf(profileId);
    const posB = current.indexOf(neighborId);
    if (posA < 0 || posB < 0) return;
    [current[posA], current[posB]] = [current[posB], current[posA]];

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PROFILE_ORDER_STORAGE_KEY, JSON.stringify(current));
      } catch {
        // Ignore
      }
    }
    set({ profileOrder: current });
  },

  duplicateProfile: (profileId: string) => {
    const all = [...get().profiles, ...get().customProfiles];
    const source = all.find((p) => p.id === profileId);
    if (!source) return null;
    const cloned = cloneProfileAsCustom(source);
    get().createCustomProfile(cloned);
    return cloned;
  },

  createSessionPlan: (plan) => {
    const now = new Date();
    const created: SessionPlan = {
      ...plan,
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    const next = [...get().sessionPlans, created];
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SESSION_PLANS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    set({ sessionPlans: next });
    return created;
  },

  updateSessionPlan: (planId: string, updates: Partial<SessionPlan>) => {
    const next = get().sessionPlans.map((p) =>
      p.id === planId ? { ...p, ...updates, id: p.id, updatedAt: new Date() } : p
    );
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SESSION_PLANS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    const active = get().activeSessionPlan;
    set({
      sessionPlans: next,
      activeSessionPlan: active?.id === planId ? next.find((p) => p.id === planId) || null : active,
    });
  },

  deleteSessionPlan: (planId: string) => {
    const next = get().sessionPlans.filter((p) => p.id !== planId);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SESSION_PLANS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    const active = get().activeSessionPlan;
    set({
      sessionPlans: next,
      activeSessionPlan: active?.id === planId ? null : active,
    });
  },

  startSessionPlan: (planId: string) => {
    const plan = get().sessionPlans.find((p) => p.id === planId);
    if (!plan || plan.items.length === 0) return;
    const firstItem = plan.items[0];
    get().selectProfile(firstItem.profileId);
    set({ activeSessionPlan: plan, activeSessionIndex: 0 });
    get().startTimer();
  },

  stopSessionPlan: () => {
    get().stopTimer();
    set({ activeSessionPlan: null, activeSessionIndex: 0 });
  },

  togglePin: (id: string) => {
    const current = get().pinnedIds;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PINNED_IDS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    set({ pinnedIds: next });
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

  saveAsDefaults: () => {
    const current = get().preferences;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(USER_DEFAULT_PREFS_KEY, JSON.stringify(current));
      } catch {
        // Ignore
      }
    }
    set({ hasSavedDefaults: true });
  },

  resetAllPreferences: (toFactory = false) => {
    let target: PracticePreferences = { ...DEFAULT_PREFERENCES };
    let nextHasSaved = get().hasSavedDefaults;

    if (toFactory) {
      nextHasSaved = false;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(USER_DEFAULT_PREFS_KEY);
          window.localStorage.removeItem(PROFILE_MUSIC_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
    } else if (typeof window !== 'undefined') {
      const saved = loadStoredJson<Partial<PracticePreferences> | null>(
        USER_DEFAULT_PREFS_KEY,
        null
      );
      if (saved) {
        target = { ...DEFAULT_PREFERENCES, ...saved };
        nextHasSaved = true;
      }
    }

    backgroundMusicService.setVolume(target.musicVolume);
    backgroundMusicService.setMuted(target.musicMuted);
    if (!target.voiceCuesEnabled) {
      audioCueService.stopSpeech();
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(target));
      } catch {
        // Ignore
      }
    }

    set({
      preferences: target,
      hasSavedDefaults: nextHasSaved,
      ...(toFactory ? { profileMusicMap: {} } : {}),
    });
  },

  setProfileMusic: (profileId: string, trackId: string) => {
    const resolvedId = normalizeMusicTrackId(trackId);
    const next = { ...get().profileMusicMap, [profileId]: resolvedId };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PROFILE_MUSIC_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
    }
    set({ profileMusicMap: next });

    const { activeProfile, timerState, isIntroPlaying, preferences, customMusicTracks } = get();
    if (activeProfile?.id === profileId && (timerState?.status === 'running' || isIntroPlaying)) {
      if (resolvedId === 'none') {
        backgroundMusicService.stop();
      } else {
        backgroundMusicService.setVolume(preferences.musicVolume);
        backgroundMusicService.setMuted(preferences.musicMuted);
        backgroundMusicService.start(resolvedId, customMusicTracks);
      }
    }
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
    const activeTrackId = normalizeMusicTrackId(
      get().profileMusicMap[activeProfile.id] || activeProfile.musicTrackId || 'none'
    );
    if (activeTrackId !== 'none') {
      backgroundMusicService.setVolume(preferences.musicVolume);
      backgroundMusicService.setMuted(preferences.musicMuted);
      backgroundMusicService.start(activeTrackId, get().customMusicTracks);
    }

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
        preferences.voiceVolume,
        preferences.voiceId
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
          preferences.voiceVolume,
          preferences.voiceId
        );
      } else {
        const initialCue =
          activeProfile.type === 'series'
            ? activeProfile.seriesConfig?.steps[0]?.name || activeProfile.name
            : activeProfile.name;
        const cueId =
          activeProfile.id === 'rajio-taiso-series' ? 'rajio-taiso.warmup' : activeProfile.id;
        audioCueService.speakCue(
          cueId,
          `Starting ${initialCue}`,
          undefined,
          preferences.voiceVolume,
          preferences.voiceId
        );
      }
    }

    set({ sessionStartedAt: new Date(), isIntroPlaying: false });

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
            prefs.voiceVolume,
            prefs.voiceId
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

        const { activeSessionPlan, activeSessionIndex } = get();
        if (activeSessionPlan && activeSessionIndex + 1 < activeSessionPlan.items.length) {
          const nextIdx = activeSessionIndex + 1;
          const nextItem = activeSessionPlan.items[nextIdx];
          get().selectProfile(nextItem.profileId);
          set({ activeSessionPlan, activeSessionIndex: nextIdx });
          get().startTimer();
        } else if (activeSessionPlan) {
          set({ activeSessionPlan: null, activeSessionIndex: 0 });
        }
      },
      (phase) => {
        const { onPhaseChange, preferences: prefs, timerEngine, activeProfile: prof } = get();
        const latestState = timerEngine?.getState() || get().timerState;
        onPhaseChange?.(phase);

        if (prefs.soundEnabled) {
          audioCueService.playChime(
            phase === 'rest' || phase === 'break' ? 'rest' : 'phase',
            prefs.chimeVolume
          );
        }
        if (prefs.voiceCuesEnabled) {
          if (prof?.type === 'breathing' && latestState?.breathingState) {
            const cycle = latestState.breathingState.currentCycle;
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
                prefs.voiceVolume,
                prefs.voiceId
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
                prefs.voiceVolume,
                prefs.voiceId
              );
              return;
            }

            const cueId = isShort ? `breathing.${phase}.short` : `breathing.${phase}`;
            const fallback = (isShort ? shortCues : fullCues)[phase] || phase;
            audioCueService.speakCue(cueId, fallback, undefined, prefs.voiceVolume, prefs.voiceId);
            return;
          }

          const step = latestState?.seriesState?.currentStep;
          const cueMap: Record<string, string> = {
            rest: 'Rest.',
            break: 'Break time.',
            cooldown: 'Cooling down.',
            exercise: step
              ? step.voiceScript || `${step.name}. ${step.instructions || ''}`.trim()
              : 'Next exercise.',
          };
          const cueId =
            phase === 'rest'
              ? 'session.rest'
              : phase === 'exercise' && step
              ? step.cueId || (prof?.id === 'rajio-taiso-series' ? `rajio-taiso.${step.id}` : step.id)
              : `session.${phase}`;
          audioCueService.speakCue(
            cueId,
            cueMap[phase] || phase,
            undefined,
            prefs.voiceVolume,
            prefs.voiceId
          );
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
    set({
      timerState: timerEngine?.getState() || null,
      sessionStartedAt: null,
      isIntroPlaying: false,
      activeSessionPlan: null,
      activeSessionIndex: 0,
    });
  },

  jumpToStep: (stepIndex: number) => {
    const { timerEngine } = get();
    if (!timerEngine) return;
    if (timerEngine.jumpToStep(stepIndex)) {
      set({ timerState: timerEngine.getState() });
      get().previewStepCue(stepIndex);
    }
  },

  nextStep: () => {
    const { timerEngine } = get();
    if (!timerEngine) return;
    if (timerEngine.nextStep()) {
      const nextState = timerEngine.getState();
      set({ timerState: nextState });
      get().previewStepCue(nextState.seriesState?.currentStepIndex);
    }
  },

  prevStep: () => {
    const { timerEngine } = get();
    if (!timerEngine) return;
    if (timerEngine.prevStep()) {
      const nextState = timerEngine.getState();
      set({ timerState: nextState });
      get().previewStepCue(nextState.seriesState?.currentStepIndex);
    }
  },

  previewStepCue: (stepIndex?: number) => {
    const { activeProfile, timerState, preferences } = get();
    if (!activeProfile) return;
    audioCueService.unlock();
    if (preferences.soundEnabled) {
      audioCueService.playChime('phase', preferences.chimeVolume);
    }
    if (!preferences.voiceCuesEnabled) return;
    if (activeProfile.type === 'series' && activeProfile.seriesConfig) {
      const idx =
        stepIndex !== undefined
          ? stepIndex
          : timerState?.seriesState?.currentStepIndex ?? 0;
      const step = activeProfile.seriesConfig.steps[idx];
      if (!step) return;
      const cueId =
        step.cueId || (activeProfile.id === 'rajio-taiso-series' ? `rajio-taiso.${step.id}` : step.id);
      const script = step.voiceScript || `${step.name}. ${step.instructions || ''}`.trim();
      audioCueService.speakCue(cueId, script, undefined, preferences.voiceVolume, preferences.voiceId);
    } else if (activeProfile.type === 'breathing' && activeProfile.breathingConfig) {
      const phase =
        timerState?.breathingState?.currentPhase || activeProfile.breathingConfig.pattern[0];
      if (!phase) return;
      audioCueService.speakCue(
        `breathing.${phase.type}`,
        phase.instruction || `Breathe ${phase.type}`,
        undefined,
        preferences.voiceVolume,
        preferences.voiceId
      );
    }
  },
}));
