// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/store/__tests__/unifiedTimerStore.test.ts
// Description: Unit tests for useUnifiedTimerStore covering profile management, preferences, and timer controls
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

import { useUnifiedTimerStore } from '../unifiedTimerStore';
import { createSimpleProfile, UnifiedProfile } from '@/types/unified-profile.types';
import { audioCueService } from '@/services/audio/AudioCueService';
import { IndexedDBService } from '@/services/database/IndexedDBService';
import { SessionRepository } from '@/services/repositories/SessionRepository';
import { SessionStatus } from '@/types/profile.types';

jest.mock('@/services/audio/AudioCueService', () => ({
  audioCueService: {
    unlock: jest.fn(),
    playChime: jest.fn(),
    speak: jest.fn(),
    speakCue: jest.fn(),
    stopSpeech: jest.fn(),
  },
}));

jest.mock('@/services/database/IndexedDBService', () => ({
  IndexedDBService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('@/services/repositories/SessionRepository', () => ({
  SessionRepository: jest.fn(),
}));

const resetStore = () => {
  const existingEngine = useUnifiedTimerStore.getState().timerEngine;
  existingEngine?.stop();
  useUnifiedTimerStore.setState({
    profiles: [],
    activeProfile: null,
    customProfiles: [],
    timerEngine: null,
    timerState: null,
    sessionStartedAt: null,
    preferences: {
      characterId: 'm25-athletic',
      variant: 'standing',
      views: 'front',
      soundEnabled: true,
      voiceCuesEnabled: false,
      vibrationEnabled: true,
    },
    stats: null,
    recentSessions: [],
    onTimerUpdate: undefined,
    onTimerComplete: undefined,
    onPhaseChange: undefined,
  });
};

describe('useUnifiedTimerStore', () => {
  const mockCreate = jest.fn();
  const mockGetStatistics = jest.fn();
  const mockFindByDateRange = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    window.localStorage.clear();
    resetStore();

    (IndexedDBService.getInstance as jest.Mock).mockReturnValue({
      initialize: jest.fn().mockResolvedValue(undefined),
    });
    mockCreate.mockResolvedValue({ id: 'session-1' });
    mockGetStatistics.mockResolvedValue({
      totalSessions: 2,
      completedSessions: 2,
      totalMinutes: 30,
      averageSessionMinutes: 15,
      completionRate: 100,
      currentStreak: 1,
      longestStreak: 2,
    });
    mockFindByDateRange.mockResolvedValue([
      {
        id: 's1',
        profileId: 'p1',
        startedAt: new Date('2026-11-20T10:00:00Z'),
        completedAt: new Date('2026-11-20T10:15:00Z'),
        plannedDurationMinutes: 15,
        actualDurationMinutes: 15,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      },
      {
        id: 's2',
        profileId: 'p1',
        startedAt: new Date('2026-11-21T10:00:00Z'),
        completedAt: new Date('2026-11-21T10:15:00Z'),
        plannedDurationMinutes: 15,
        actualDurationMinutes: 15,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      },
    ]);
    (SessionRepository as jest.Mock).mockImplementation(() => ({
      create: mockCreate,
      getStatistics: mockGetStatistics,
      findByDateRange: mockFindByDateRange,
    }));
  });

  afterEach(() => {
    useUnifiedTimerStore.getState().timerEngine?.stop();
    jest.useRealTimers();
  });

  describe('initializeProfiles', () => {
    it('loads default profiles, sets activeProfile, and initializes timerEngine', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      const state = useUnifiedTimerStore.getState();

      expect(state.profiles.length).toBeGreaterThanOrEqual(8);
      expect(state.activeProfile).toEqual(state.profiles[0]);
      expect(state.timerEngine).not.toBeNull();
      expect(state.timerState).not.toBeNull();
    });

    it('restores stored custom profiles and preferences from localStorage', () => {
      const custom = createSimpleProfile('Custom Focus', 'Desc', 10, 2, '#111111', '🔥');
      custom.isCustom = true;
      window.localStorage.setItem('livelong_custom_profiles', JSON.stringify([custom]));
      window.localStorage.setItem(
        'livelong_preferences',
        JSON.stringify({ voiceCuesEnabled: true, variant: 'chair' })
      );

      useUnifiedTimerStore.getState().initializeProfiles();
      const state = useUnifiedTimerStore.getState();

      expect(state.customProfiles).toHaveLength(1);
      expect(state.customProfiles[0].name).toBe('Custom Focus');
      expect(state.preferences.voiceCuesEnabled).toBe(true);
      expect(state.preferences.variant).toBe('chair');
      expect(state.preferences.soundEnabled).toBe(true);
    });

    it('handles invalid JSON in localStorage gracefully and is idempotent once initialized', () => {
      window.localStorage.setItem('livelong_custom_profiles', '{bad-json');
      window.localStorage.setItem('livelong_preferences', '{bad-json');

      useUnifiedTimerStore.getState().initializeProfiles();
      const firstProfiles = useUnifiedTimerStore.getState().profiles;
      expect(useUnifiedTimerStore.getState().customProfiles).toEqual([]);
      expect(useUnifiedTimerStore.getState().preferences.soundEnabled).toBe(true);

      // Second call returns early without replacing profiles
      useUnifiedTimerStore.getState().initializeProfiles();
      expect(useUnifiedTimerStore.getState().profiles).toBe(firstProfiles);
    });
  });

  describe('selectProfile', () => {
    it('stops previous timer, stops speech, and activates selected default or custom profile', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      const prevEngine = useUnifiedTimerStore.getState().timerEngine!;
      const stopSpy = jest.spyOn(prevEngine, 'stop');

      const target = useUnifiedTimerStore.getState().profiles[1];
      useUnifiedTimerStore.getState().selectProfile(target.id);

      expect(stopSpy).toHaveBeenCalled();
      expect(audioCueService.stopSpeech).toHaveBeenCalled();
      expect(useUnifiedTimerStore.getState().activeProfile?.id).toBe(target.id);
      expect(useUnifiedTimerStore.getState().sessionStartedAt).toBeNull();

      // Selecting a custom profile also works
      const custom = createSimpleProfile('My Custom', 'Desc', 5, 1, '#000', '⭐');
      useUnifiedTimerStore.getState().createCustomProfile(custom);
      useUnifiedTimerStore.getState().selectProfile(custom.id);
      expect(useUnifiedTimerStore.getState().activeProfile?.id).toBe(custom.id);

      // Unknown id leaves activeProfile unchanged
      useUnifiedTimerStore.getState().selectProfile('non-existent-id');
      expect(useUnifiedTimerStore.getState().activeProfile?.id).toBe(custom.id);
    });
  });

  describe('createCustomProfile, updateProfile, deleteCustomProfile', () => {
    it('creates, updates, and deletes custom profiles while persisting to localStorage', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      const custom: UnifiedProfile = {
        ...createSimpleProfile('Sprint', 'Short sprint', 5, 1, '#222', '🚀'),
        isDefault: true,
        isCustom: false,
      };

      useUnifiedTimerStore.getState().createCustomProfile(custom);
      expect(useUnifiedTimerStore.getState().customProfiles).toHaveLength(1);
      expect(useUnifiedTimerStore.getState().customProfiles[0].isCustom).toBe(true);
      expect(useUnifiedTimerStore.getState().customProfiles[0].isDefault).toBe(false);
      expect(JSON.parse(window.localStorage.getItem('livelong_custom_profiles')!)).toHaveLength(1);

      // Select it and update it
      useUnifiedTimerStore.getState().selectProfile(custom.id);
      useUnifiedTimerStore.getState().updateProfile(custom.id, {
        name: 'Updated Sprint',
        id: 'attempted-overwrite',
        type: 'breathing',
      });

      const updated = useUnifiedTimerStore.getState().customProfiles[0];
      expect(updated.name).toBe('Updated Sprint');
      expect(updated.id).toBe(custom.id);
      expect(updated.type).toBe('simple');
      expect(useUnifiedTimerStore.getState().activeProfile?.name).toBe('Updated Sprint');

      // Delete custom profile
      useUnifiedTimerStore.getState().deleteCustomProfile(custom.id);
      expect(useUnifiedTimerStore.getState().customProfiles).toHaveLength(0);
      expect(JSON.parse(window.localStorage.getItem('livelong_custom_profiles')!)).toHaveLength(0);
    });

    it('updates built-in profiles without altering their id or type', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      const firstId = useUnifiedTimerStore.getState().profiles[0].id;
      const firstType = useUnifiedTimerStore.getState().profiles[0].type;

      useUnifiedTimerStore.getState().updateProfile(firstId, { name: 'Renamed Built-in' });
      expect(useUnifiedTimerStore.getState().profiles[0].name).toBe('Renamed Built-in');
      expect(useUnifiedTimerStore.getState().profiles[0].id).toBe(firstId);
      expect(useUnifiedTimerStore.getState().profiles[0].type).toBe(firstType);
    });
  });

  describe('updatePreferences', () => {
    it('merges preference updates and persists to localStorage', () => {
      useUnifiedTimerStore.getState().updatePreferences({
        soundEnabled: false,
        voiceCuesEnabled: true,
        characterId: 'f30-slim',
      });

      const prefs = useUnifiedTimerStore.getState().preferences;
      expect(prefs.soundEnabled).toBe(false);
      expect(prefs.voiceCuesEnabled).toBe(true);
      expect(prefs.characterId).toBe('f30-slim');
      expect(prefs.vibrationEnabled).toBe(true);

      const stored = JSON.parse(window.localStorage.getItem('livelong_preferences')!);
      expect(stored.voiceCuesEnabled).toBe(true);
    });
  });

  describe('startTimer, pauseTimer, resumeTimer, stopTimer, and completion', () => {
    it('selects first profile and returns when startTimer is called without active engine', () => {
      const profile = createSimpleProfile('Fallback', 'Desc', 1, 1, '#000', '⏱');
      useUnifiedTimerStore.setState({ profiles: [profile], activeProfile: null, timerEngine: null });

      useUnifiedTimerStore.getState().startTimer();
      expect(useUnifiedTimerStore.getState().activeProfile?.id).toBe(profile.id);
      expect(useUnifiedTimerStore.getState().timerEngine).not.toBeNull();
    });

    it('starts, pauses, resumes, and stops timer with audio cues', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      useUnifiedTimerStore.getState().updatePreferences({ soundEnabled: true, voiceCuesEnabled: true });

      useUnifiedTimerStore.getState().startTimer();
      expect(audioCueService.unlock).toHaveBeenCalled();
      expect(audioCueService.playChime).toHaveBeenCalledWith('start');
      expect(audioCueService.speak).toHaveBeenCalled();
      expect(useUnifiedTimerStore.getState().sessionStartedAt).toBeInstanceOf(Date);
      expect(useUnifiedTimerStore.getState().timerState?.status).toBe('running');

      useUnifiedTimerStore.getState().pauseTimer();
      expect(audioCueService.stopSpeech).toHaveBeenCalled();
      expect(useUnifiedTimerStore.getState().timerState?.status).toBe('paused');

      useUnifiedTimerStore.getState().resumeTimer();
      expect(audioCueService.unlock).toHaveBeenCalledTimes(2);
      expect(useUnifiedTimerStore.getState().timerState?.status).toBe('running');

      useUnifiedTimerStore.getState().stopTimer();
      expect(audioCueService.stopSpeech).toHaveBeenCalledTimes(2);
      expect(useUnifiedTimerStore.getState().timerState?.status).toBe('idle');
      expect(useUnifiedTimerStore.getState().sessionStartedAt).toBeNull();
    });

    it('handles phase changes, completion callbacks, vibration, and session persistence', async () => {
      const vibrateMock = jest.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        configurable: true,
        writable: true,
      });

      const quickProfile: UnifiedProfile = {
        ...createSimpleProfile('Quick', 'Quick test', 0, 0, '#000', '⚡'),
        simpleDuration: { workMinutes: 0, workSeconds: 1, breakMinutes: 0, breakSeconds: 1 },
        totalDurationSeconds: 2,
      };

      const onTimerComplete = jest.fn();
      const onPhaseChange = jest.fn();

      useUnifiedTimerStore.getState().initializeProfiles();
      useUnifiedTimerStore.getState().createCustomProfile(quickProfile);
      useUnifiedTimerStore.getState().selectProfile(quickProfile.id);
      useUnifiedTimerStore.getState().updatePreferences({
        soundEnabled: true,
        voiceCuesEnabled: true,
        vibrationEnabled: true,
      });
      useUnifiedTimerStore.setState({ onTimerComplete, onPhaseChange });

      useUnifiedTimerStore.getState().startTimer();

      // Work (1s) -> 0s -> Break
      jest.advanceTimersByTime(2000);
      expect(onPhaseChange).toHaveBeenCalledWith('break');
      expect(audioCueService.playChime).toHaveBeenCalledWith('rest');
      expect(audioCueService.speak).toHaveBeenCalledWith('Break time');

      // Break (1s) -> 0s -> Complete
      jest.advanceTimersByTime(2000);
      for (let i = 0; i < 8; i++) {
        await Promise.resolve();
      }

      expect(onTimerComplete).toHaveBeenCalledTimes(1);
      expect(audioCueService.playChime).toHaveBeenCalledWith('complete');
      expect(audioCueService.speak).toHaveBeenCalledWith('Session complete. Great work.');
      expect(vibrateMock).toHaveBeenCalledWith([200, 100, 200]);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          profileId: quickProfile.id,
          completionStatus: SessionStatus.COMPLETED,
        })
      );
      expect(useUnifiedTimerStore.getState().stats?.totalSessions).toBe(2);
      expect(useUnifiedTimerStore.getState().recentSessions.map((s) => s.id)).toEqual(['s2', 's1']);
    });
  });
});
