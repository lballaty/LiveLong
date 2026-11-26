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
      chimeVolume: 0.7,
      voiceCuesEnabled: false,
      voiceId: 'woman',
      voiceVolume: 0.9,
      musicMuted: false,
      musicVolume: 0.25,
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
      expect(audioCueService.playChime).toHaveBeenCalledWith('start', 0.7);
      expect(audioCueService.speakCue).toHaveBeenCalled();
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
      expect(audioCueService.playChime).toHaveBeenCalledWith('rest', 0.7);
      expect(audioCueService.speakCue).toHaveBeenCalledWith('session.break', 'Break time.', undefined, 0.9, 'woman');

      // Break (1s) -> 0s -> Complete
      jest.advanceTimersByTime(2000);
      for (let i = 0; i < 8; i++) {
        await Promise.resolve();
      }

      expect(onTimerComplete).toHaveBeenCalledTimes(1);
      expect(audioCueService.playChime).toHaveBeenCalledWith('complete', 0.7);
      expect(audioCueService.speakCue).toHaveBeenCalledWith(
        'session.complete',
        "That's the end of your session. Take a moment to notice how you feel. Well done.",
        undefined,
        0.9,
        'woman'
      );
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

  describe('Routine cloning, step review, and SessionPlan composition', () => {
    it('duplicates a built-in series routine as a custom editable routine', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      const cloned = useUnifiedTimerStore.getState().duplicateProfile('rajio-taiso-series');
      expect(cloned).not.toBeNull();
      expect(cloned?.isCustom).toBe(true);
      expect(cloned?.type).toBe('series');
      expect(cloned?.name).toContain('(Custom)');
      expect(
        useUnifiedTimerStore.getState().customProfiles.some((p) => p.id === cloned?.id)
      ).toBe(true);
    });

    it('jumps between steps for rapid review', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      useUnifiedTimerStore.getState().selectProfile('rajio-taiso-series');

      useUnifiedTimerStore.getState().jumpToStep(2);
      expect(useUnifiedTimerStore.getState().timerState?.seriesState?.currentStepIndex).toBe(2);

      useUnifiedTimerStore.getState().nextStep();
      expect(useUnifiedTimerStore.getState().timerState?.seriesState?.currentStepIndex).toBe(3);

      useUnifiedTimerStore.getState().prevStep();
      expect(useUnifiedTimerStore.getState().timerState?.seriesState?.currentStepIndex).toBe(2);
    });

    it('seeds default SessionPlans on fresh init and creates, updates, starts, stops, and deletes a SessionPlan', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      const profiles = useUnifiedTimerStore.getState().profiles;
      const initialPlans = useUnifiedTimerStore.getState().sessionPlans;
      expect(initialPlans.length).toBeGreaterThanOrEqual(4);

      const plan = useUnifiedTimerStore.getState().createSessionPlan({
        name: 'Custom Morning Stack',
        description: 'Rajio + Breath',
        icon: '🌅',
        items: [
          { id: 'i1', profileId: profiles[0].id },
          { id: 'i2', profileId: profiles[1].id },
        ],
      });

      expect(useUnifiedTimerStore.getState().sessionPlans).toHaveLength(initialPlans.length + 1);
      useUnifiedTimerStore.getState().startSessionPlan(plan.id);
      expect(useUnifiedTimerStore.getState().activeSessionPlan?.id).toBe(plan.id);
      expect(useUnifiedTimerStore.getState().activeSessionIndex).toBe(0);

      useUnifiedTimerStore.getState().updateSessionPlan(plan.id, { name: 'Updated Stack' });
      expect(useUnifiedTimerStore.getState().activeSessionPlan?.name).toBe('Updated Stack');

      useUnifiedTimerStore.getState().stopSessionPlan();
      expect(useUnifiedTimerStore.getState().activeSessionPlan).toBeNull();

      useUnifiedTimerStore.getState().deleteSessionPlan(plan.id);
      expect(useUnifiedTimerStore.getState().sessionPlans).toHaveLength(initialPlans.length);
    });

    it('saves user defaults, resets to saved defaults, and restores factory defaults', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      useUnifiedTimerStore.getState().updatePreferences({ chimeVolume: 0.4, musicVolume: 0.5 });
      useUnifiedTimerStore.getState().saveAsDefaults();
      expect(useUnifiedTimerStore.getState().hasSavedDefaults).toBe(true);

      useUnifiedTimerStore.getState().updatePreferences({ chimeVolume: 0.9, musicMuted: true });
      useUnifiedTimerStore.getState().resetAllPreferences(false);
      expect(useUnifiedTimerStore.getState().preferences.chimeVolume).toBe(0.4);
      expect(useUnifiedTimerStore.getState().preferences.musicMuted).toBe(false);

      useUnifiedTimerStore.getState().resetAllPreferences(true);
      expect(useUnifiedTimerStore.getState().hasSavedDefaults).toBe(false);
      expect(useUnifiedTimerStore.getState().preferences.chimeVolume).toBe(0.7);
      expect(useUnifiedTimerStore.getState().preferences.characterId).toBe('robot-r1');
    });

    it('reorders profile cards and persists order to localStorage', () => {
      useUnifiedTimerStore.getState().initializeProfiles();
      const ids = useUnifiedTimerStore.getState().profiles.slice(0, 2).map((p) => p.id);
      useUnifiedTimerStore.getState().moveProfileOrder(ids[0], 1, ids);
      const order = useUnifiedTimerStore.getState().profileOrder;
      expect(order.indexOf(ids[1])).toBeLessThan(order.indexOf(ids[0]));
    });
  });
});
