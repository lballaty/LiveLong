// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/timer/__tests__/UnifiedTimerEngine.test.ts
// Description: Unit tests for UnifiedTimerEngine covering simple, series, and breathing timer flows
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

import { UnifiedTimerEngine } from '../UnifiedTimerEngine';
import { UnifiedProfile } from '@/types/unified-profile.types';

const makeSimpleProfile = (
  workMinutes = 0,
  workSeconds = 2,
  breakMinutes = 0,
  breakSeconds = 1
): UnifiedProfile => ({
  id: 'simple-1',
  name: 'Test Simple',
  description: 'Simple timer',
  type: 'simple',
  color: '#ef4444',
  icon: '🍅',
  soundEnabled: true,
  vibrationEnabled: true,
  simpleDuration: {
    workMinutes,
    workSeconds,
    breakMinutes,
    breakSeconds,
  },
  totalDurationSeconds: workMinutes * 60 + workSeconds + breakMinutes * 60 + breakSeconds,
  isDefault: false,
  isCustom: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeSeriesProfile = (options?: {
  warmupSeconds?: number;
  cooldownSeconds?: number;
  includeRest?: boolean;
}): UnifiedProfile => {
  const warmupSeconds = options?.warmupSeconds ?? 1;
  const cooldownSeconds = options?.cooldownSeconds ?? 1;
  const includeRest = options?.includeRest ?? true;

  return {
    id: 'series-1',
    name: 'Test Series',
    description: 'Series timer',
    type: 'series',
    color: '#3b82f6',
    icon: '🎯',
    soundEnabled: true,
    vibrationEnabled: true,
    seriesConfig: {
      warmupMinutes: 0,
      warmupSeconds,
      cooldownMinutes: 0,
      cooldownSeconds,
      steps: [
        {
          id: 'step-1',
          name: 'Arm Circles',
          description: 'Rotate arms',
          durationMinutes: 0,
          durationSeconds: 2,
          restMinutes: 0,
          restSeconds: includeRest ? 1 : 0,
        },
        {
          id: 'step-2',
          name: 'Deep Stretch',
          description: 'Stretch side',
          durationMinutes: 0,
          durationSeconds: 1,
          restMinutes: 0,
          restSeconds: 0,
        },
      ],
    },
    totalDurationSeconds: 6,
    isDefault: false,
    isCustom: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

const makeBreathingProfile = (cycleCount = 2): UnifiedProfile => ({
  id: 'breathing-1',
  name: 'Box Breathing',
  description: '4-phase breathing',
  type: 'breathing',
  color: '#8b5cf6',
  icon: '🫁',
  soundEnabled: true,
  vibrationEnabled: true,
  breathingConfig: {
    pattern: [
      { type: 'inhale', durationSeconds: 1 },
      { type: 'hold-in', durationSeconds: 1 },
      { type: 'exhale', durationSeconds: 1 },
      { type: 'hold-out', durationSeconds: 1 },
    ],
    cycleCount,
    totalDurationMinutes: (4 * cycleCount) / 60,
  },
  totalDurationSeconds: 4 * cycleCount,
  isDefault: false,
  isCustom: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('UnifiedTimerEngine', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('initializes simple profile state with work duration', () => {
      const engine = new UnifiedTimerEngine(makeSimpleProfile(1, 30, 0, 15));
      const state = engine.getState();

      expect(state.status).toBe('idle');
      expect(state.remainingSeconds).toBe(90);
      expect(state.totalElapsedSeconds).toBe(0);
      expect(state.pauseCount).toBe(0);
      expect(state.simpleState).toEqual({
        isWorkPhase: true,
        sessionsCompleted: 0,
      });
    });

    it('initializes series profile with warmup when warmup > 0', () => {
      const engine = new UnifiedTimerEngine(makeSeriesProfile({ warmupSeconds: 10 }));
      const state = engine.getState();

      expect(state.remainingSeconds).toBe(10);
      expect(state.seriesState).toEqual({
        currentPhase: 'warmup',
        currentStepIndex: 0,
        currentStep: expect.objectContaining({ id: 'step-1', name: 'Arm Circles' }),
        completedSteps: [],
      });
    });

    it('initializes series profile directly to exercise when warmup is 0', () => {
      const engine = new UnifiedTimerEngine(makeSeriesProfile({ warmupSeconds: 0 }));
      const state = engine.getState();

      expect(state.remainingSeconds).toBe(2);
      expect(state.seriesState?.currentPhase).toBe('exercise');
      expect(state.seriesState?.currentStep?.id).toBe('step-1');
    });

    it('handles series profile with empty steps and no warmup', () => {
      const profile = makeSeriesProfile({ warmupSeconds: 0 });
      profile.seriesConfig!.steps = [];
      const engine = new UnifiedTimerEngine(profile);

      expect(engine.getState().remainingSeconds).toBe(0);
      expect(engine.getState().seriesState?.currentStep).toBeUndefined();
    });

    it('initializes breathing profile with first phase and fallback when pattern is empty', () => {
      const engine = new UnifiedTimerEngine(makeBreathingProfile(2));
      expect(engine.getState().remainingSeconds).toBe(1);
      expect(engine.getState().breathingState).toEqual({
        currentCycle: 1,
        currentPhaseIndex: 0,
        currentPhase: { type: 'inhale', durationSeconds: 1 },
      });

      const emptyBreathing = makeBreathingProfile(1);
      emptyBreathing.breathingConfig!.pattern = [];
      const emptyEngine = new UnifiedTimerEngine(emptyBreathing);
      expect(emptyEngine.getState().remainingSeconds).toBe(0);
      expect(emptyEngine.getState().breathingState?.currentPhase).toEqual({
        type: 'inhale',
        durationSeconds: 4,
      });
    });

    it('returns base state for unknown profile type', () => {
      const weirdProfile = {
        ...makeSimpleProfile(),
        type: 'unknown' as UnifiedProfile['type'],
      };
      const engine = new UnifiedTimerEngine(weirdProfile);
      expect(engine.getState().remainingSeconds).toBe(0);
      expect(engine.getCurrentPhaseDescription()).toBe('');
    });
  });

  describe('simple timer flow (work -> break -> complete)', () => {
    it('transitions from work to break and completes session', () => {
      const engine = new UnifiedTimerEngine(makeSimpleProfile(0, 2, 0, 1));
      const onUpdate = jest.fn();
      const onComplete = jest.fn();
      const onPhaseChange = jest.fn();

      engine.start(onUpdate, onComplete, onPhaseChange);
      expect(engine.getState().status).toBe('running');
      expect(onUpdate).toHaveBeenCalledTimes(1);

      // Work phase: 2s -> 1s -> 0s
      jest.advanceTimersByTime(2000);
      expect(engine.getState().remainingSeconds).toBe(0);
      expect(engine.getState().totalElapsedSeconds).toBe(2);
      expect(engine.getState().simpleState?.isWorkPhase).toBe(true);

      // Next tick triggers work -> break transition
      jest.advanceTimersByTime(1000);
      expect(onPhaseChange).toHaveBeenCalledWith('break');
      expect(engine.getState().simpleState?.isWorkPhase).toBe(false);
      expect(engine.getState().remainingSeconds).toBe(1);
      expect(engine.getCurrentPhaseDescription()).toBe('Break Time');

      // Break phase: 1s -> 0s
      jest.advanceTimersByTime(1000);
      expect(engine.getState().remainingSeconds).toBe(0);

      // Next tick triggers completion and stop()
      jest.advanceTimersByTime(1000);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(engine.getState().status).toBe('idle');
      expect(engine.getState().remainingSeconds).toBe(2);
    });
  });

  describe('series timer flow (warmup -> steps -> rest -> cooldown -> complete)', () => {
    it('progresses through warmup, steps with/without rest, cooldown, and completes', () => {
      const engine = new UnifiedTimerEngine(
        makeSeriesProfile({ warmupSeconds: 1, cooldownSeconds: 1, includeRest: true })
      );
      const onUpdate = jest.fn();
      const onComplete = jest.fn();
      const onPhaseChange = jest.fn();

      engine.start(onUpdate, onComplete, onPhaseChange);
      expect(engine.getCurrentPhaseDescription()).toBe('Warming Up');

      // Warmup (1s) -> 0s, then transition to step-1
      jest.advanceTimersByTime(2000);
      expect(onPhaseChange).toHaveBeenLastCalledWith('exercise');
      expect(engine.getState().seriesState?.currentPhase).toBe('exercise');
      expect(engine.getState().seriesState?.currentStep?.id).toBe('step-1');
      expect(engine.getCurrentPhaseDescription()).toBe('Arm Circles');

      // Step 1 (2s) -> 0s, then transition to rest (1s)
      jest.advanceTimersByTime(3000);
      expect(onPhaseChange).toHaveBeenLastCalledWith('rest');
      expect(engine.getState().seriesState?.currentPhase).toBe('rest');
      expect(engine.getCurrentPhaseDescription()).toBe('Rest');

      // Rest (1s) -> 0s, then transition to step-2
      jest.advanceTimersByTime(2000);
      expect(onPhaseChange).toHaveBeenLastCalledWith('exercise');
      expect(engine.getState().seriesState?.currentStep?.id).toBe('step-2');
      expect(engine.getState().seriesState?.completedSteps).toEqual(['step-1']);
      expect(engine.getCurrentPhaseDescription()).toBe('Deep Stretch');

      // Step 2 (1s, 0s rest) -> 0s, then transition directly to cooldown
      jest.advanceTimersByTime(2000);
      expect(onPhaseChange).toHaveBeenLastCalledWith('cooldown');
      expect(engine.getState().seriesState?.currentPhase).toBe('cooldown');
      expect(engine.getState().seriesState?.completedSteps).toEqual(['step-1', 'step-2']);
      expect(engine.getCurrentPhaseDescription()).toBe('Cooling Down');

      // Cooldown (1s) -> 0s, then complete
      jest.advanceTimersByTime(2000);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(engine.getState().status).toBe('idle');
    });

    it('completes directly after final step when cooldown is 0', () => {
      const engine = new UnifiedTimerEngine(
        makeSeriesProfile({ warmupSeconds: 0, cooldownSeconds: 0, includeRest: false })
      );
      const onComplete = jest.fn();
      const onPhaseChange = jest.fn();

      engine.start(undefined, onComplete, onPhaseChange);

      // Step 1 (2s) -> 0s -> Step 2 (1s)
      jest.advanceTimersByTime(3000);
      expect(engine.getState().seriesState?.currentStep?.id).toBe('step-2');

      // Step 2 (1s) -> 0s -> complete
      jest.advanceTimersByTime(2000);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onPhaseChange).not.toHaveBeenCalledWith('cooldown');
      expect(engine.getState().status).toBe('idle');
    });
  });

  describe('breathing timer flow (inhale -> hold-in -> exhale -> hold-out cycles)', () => {
    it('cycles through all breathing phases across multiple cycles and completes', () => {
      const engine = new UnifiedTimerEngine(makeBreathingProfile(2));
      const onComplete = jest.fn();
      const onPhaseChange = jest.fn();

      engine.start(undefined, onComplete, onPhaseChange);
      expect(engine.getCurrentPhaseDescription()).toBe('Breathe In (1/2)');

      // Cycle 1: inhale (1s) -> hold-in
      jest.advanceTimersByTime(2000);
      expect(onPhaseChange).toHaveBeenLastCalledWith('hold-in');
      expect(engine.getCurrentPhaseDescription()).toBe('Hold (1/2)');

      // hold-in (1s) -> exhale
      jest.advanceTimersByTime(2000);
      expect(onPhaseChange).toHaveBeenLastCalledWith('exhale');
      expect(engine.getCurrentPhaseDescription()).toBe('Breathe Out (1/2)');

      // exhale (1s) -> hold-out
      jest.advanceTimersByTime(2000);
      expect(onPhaseChange).toHaveBeenLastCalledWith('hold-out');
      expect(engine.getCurrentPhaseDescription()).toBe('Hold (1/2)');

      // hold-out (1s) -> Cycle 2 inhale
      jest.advanceTimersByTime(2000);
      expect(onPhaseChange).toHaveBeenLastCalledWith('inhale');
      expect(engine.getState().breathingState?.currentCycle).toBe(2);
      expect(engine.getCurrentPhaseDescription()).toBe('Breathe In (2/2)');

      // Cycle 2 remaining 3 phases (hold-in, exhale, hold-out) + final completion tick
      jest.advanceTimersByTime(8000);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(engine.getState().status).toBe('idle');
    });
  });

  describe('pause, resume, stop, and guard conditions', () => {
    it('pauses, increments pauseCount, resumes, and stops cleanly', () => {
      const engine = new UnifiedTimerEngine(makeSimpleProfile(0, 10, 0, 5));
      const onUpdate = jest.fn();

      // Pause/resume no-op while idle
      engine.pause();
      engine.resume();
      expect(engine.getState().status).toBe('idle');
      expect(engine.getState().pauseCount).toBe(0);

      engine.start(onUpdate);
      // Calling start again while running is a no-op
      const callsAfterStart = onUpdate.mock.calls.length;
      engine.start(onUpdate);
      expect(onUpdate).toHaveBeenCalledTimes(callsAfterStart);

      jest.advanceTimersByTime(3000);
      expect(engine.getState().remainingSeconds).toBe(7);

      engine.pause();
      expect(engine.getState().status).toBe('paused');
      expect(engine.getState().pauseCount).toBe(1);

      // Advancing time while paused does not tick
      jest.advanceTimersByTime(5000);
      expect(engine.getState().remainingSeconds).toBe(7);

      engine.resume();
      expect(engine.getState().status).toBe('running');
      jest.advanceTimersByTime(2000);
      expect(engine.getState().remainingSeconds).toBe(5);

      engine.stop();
      expect(engine.getState().status).toBe('idle');
      expect(engine.getState().remainingSeconds).toBe(10);
      expect(engine.getState().totalElapsedSeconds).toBe(0);
    });
  });

  describe('getCurrentPhaseDescription', () => {
    it('returns Focus Time for simple work phase and Exercise fallback when step is missing', () => {
      const simpleEngine = new UnifiedTimerEngine(makeSimpleProfile());
      expect(simpleEngine.getCurrentPhaseDescription()).toBe('Focus Time');

      const seriesProfile = makeSeriesProfile({ warmupSeconds: 0 });
      seriesProfile.seriesConfig!.steps = [];
      const seriesEngine = new UnifiedTimerEngine(seriesProfile);
      expect(seriesEngine.getCurrentPhaseDescription()).toBe('Exercise');
    });
  });
});
