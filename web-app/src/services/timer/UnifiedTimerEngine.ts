// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/timer/UnifiedTimerEngine.ts
// Description: Unified timer engine supporting simple timers, series, and breathing patterns
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

import { UnifiedProfile, UnifiedTimerState, SeriesStep, BreathingPhase } from '@/types/unified-profile.types';

export class UnifiedTimerEngine {
  private profile: UnifiedProfile;
  private state: UnifiedTimerState;
  private intervalId: NodeJS.Timeout | null = null;
  private onUpdate?: (state: UnifiedTimerState) => void;
  private onComplete?: () => void;
  private onPhaseChange?: (phase: string) => void;

  constructor(profile: UnifiedProfile) {
    this.profile = profile;
    this.state = this.initializeState(profile);
  }

  private initializeState(profile: UnifiedProfile): UnifiedTimerState {
    const baseState: UnifiedTimerState = {
      profile,
      status: 'idle',
      remainingSeconds: 0,
      totalElapsedSeconds: 0,
      pauseCount: 0
    };

    switch (profile.type) {
      case 'simple': {
        const workSeconds = (profile.simpleDuration?.workMinutes || 0) * 60 +
          (profile.simpleDuration?.workSeconds || 0);
        return {
          ...baseState,
          remainingSeconds: workSeconds,
          simpleState: {
            isWorkPhase: true,
            sessionsCompleted: 0
          }
        };
      }

      case 'series': {
        const warmupSeconds = (profile.seriesConfig?.warmupMinutes || 0) * 60 +
          (profile.seriesConfig?.warmupSeconds || 0);
        const firstStep = profile.seriesConfig?.steps[0];
        const initialSeconds = warmupSeconds > 0 ? warmupSeconds :
          firstStep ? (firstStep.durationMinutes * 60 + firstStep.durationSeconds) : 0;

        return {
          ...baseState,
          remainingSeconds: initialSeconds,
          seriesState: {
            currentPhase: warmupSeconds > 0 ? 'warmup' : 'exercise',
            currentStepIndex: 0,
            currentStep: firstStep,
            completedSteps: []
          }
        };
      }

      case 'breathing': {
        const pattern = profile.breathingConfig?.pattern || [];
        const firstPhase = pattern[0];
        return {
          ...baseState,
          remainingSeconds: firstPhase?.durationSeconds || 0,
          breathingState: {
            currentCycle: 1,
            currentPhaseIndex: 0,
            currentPhase: firstPhase || { type: 'inhale', durationSeconds: 4 }
          }
        };
      }

      default:
        return baseState;
    }
  }

  public start(onUpdate?: (state: UnifiedTimerState) => void, onComplete?: () => void, onPhaseChange?: (phase: string) => void) {
    if (this.state.status === 'running') return;

    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.onPhaseChange = onPhaseChange;
    this.state.status = 'running';

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);

    this.onUpdate?.({ ...this.state });
  }

  public pause() {
    if (this.state.status !== 'running') return;

    this.state.status = 'paused';
    this.state.pauseCount++;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.onUpdate?.({ ...this.state });
  }

  public resume() {
    if (this.state.status !== 'paused') return;
    this.start(this.onUpdate, this.onComplete, this.onPhaseChange);
  }

  public stop() {
    this.state.status = 'idle';

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state = this.initializeState(this.profile);
    this.onUpdate?.({ ...this.state });
  }

  private tick() {
    if (this.state.remainingSeconds > 0) {
      this.state.remainingSeconds--;
      this.state.totalElapsedSeconds++;
    } else {
      this.handlePhaseComplete();
    }

    this.onUpdate?.({ ...this.state });
  }

  private handlePhaseComplete() {
    switch (this.profile.type) {
      case 'simple':
        this.handleSimplePhaseComplete();
        break;
      case 'series':
        this.handleSeriesPhaseComplete();
        break;
      case 'breathing':
        this.handleBreathingPhaseComplete();
        break;
    }
  }

  private handleSimplePhaseComplete() {
    if (!this.state.simpleState) return;

    if (this.state.simpleState.isWorkPhase) {
      // Switch to break
      this.state.simpleState.isWorkPhase = false;
      const breakSeconds = (this.profile.simpleDuration?.breakMinutes || 0) * 60 +
        (this.profile.simpleDuration?.breakSeconds || 0);
      this.state.remainingSeconds = breakSeconds;
      this.onPhaseChange?.('break');
    } else {
      // Complete session
      this.state.simpleState.sessionsCompleted++;
      this.state.simpleState.isWorkPhase = true;
      this.state.status = 'completed';
      this.onComplete?.();
      this.stop();
    }
  }

  private handleSeriesPhaseComplete() {
    if (!this.state.seriesState || !this.profile.seriesConfig) return;

    const { currentPhase, currentStepIndex, currentStep } = this.state.seriesState;
    const { steps, cooldownMinutes, cooldownSeconds } = this.profile.seriesConfig;

    switch (currentPhase) {
      case 'warmup':
        // Move to first exercise
        this.state.seriesState.currentPhase = 'exercise';
        this.state.seriesState.currentStepIndex = 0;
        this.state.seriesState.currentStep = steps[0];
        this.state.remainingSeconds = steps[0].durationMinutes * 60 + steps[0].durationSeconds;
        this.onPhaseChange?.('exercise');
        break;

      case 'exercise': {
        if (!currentStep) return;

        // Move to rest if there's rest time
        const restSeconds = currentStep.restMinutes * 60 + currentStep.restSeconds;
        if (restSeconds > 0) {
          this.state.seriesState.currentPhase = 'rest';
          this.state.remainingSeconds = restSeconds;
          this.onPhaseChange?.('rest');
        } else {
          // Move to next exercise or cooldown
          this.moveToNextExercise();
        }
        break;
      }

      case 'rest':
        // Move to next exercise or cooldown
        this.moveToNextExercise();
        break;

      case 'cooldown':
        // Complete series
        this.state.status = 'completed';
        this.onComplete?.();
        this.stop();
        break;
    }
  }

  private moveToNextExercise() {
    if (!this.state.seriesState || !this.profile.seriesConfig) return;

    const { currentStepIndex, currentStep } = this.state.seriesState;
    const { steps, cooldownMinutes, cooldownSeconds } = this.profile.seriesConfig;

    if (currentStep) {
      this.state.seriesState.completedSteps.push(currentStep.id);
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      // Move to next exercise
      this.state.seriesState.currentPhase = 'exercise';
      this.state.seriesState.currentStepIndex = nextIndex;
      this.state.seriesState.currentStep = steps[nextIndex];
      this.state.remainingSeconds = steps[nextIndex].durationMinutes * 60 + steps[nextIndex].durationSeconds;
      this.onPhaseChange?.('exercise');
    } else {
      // Move to cooldown or complete
      const cooldownTotal = (cooldownMinutes || 0) * 60 + (cooldownSeconds || 0);
      if (cooldownTotal > 0) {
        this.state.seriesState.currentPhase = 'cooldown';
        this.state.remainingSeconds = cooldownTotal;
        this.onPhaseChange?.('cooldown');
      } else {
        this.state.status = 'completed';
        this.onComplete?.();
        this.stop();
      }
    }
  }

  private handleBreathingPhaseComplete() {
    if (!this.state.breathingState || !this.profile.breathingConfig) return;

    const { currentPhaseIndex, currentCycle } = this.state.breathingState;
    const { pattern, cycleCount } = this.profile.breathingConfig;

    const nextPhaseIndex = currentPhaseIndex + 1;

    if (nextPhaseIndex < pattern.length) {
      // Move to next phase in current cycle
      this.state.breathingState.currentPhaseIndex = nextPhaseIndex;
      this.state.breathingState.currentPhase = pattern[nextPhaseIndex];
      this.state.remainingSeconds = pattern[nextPhaseIndex].durationSeconds;
      this.onPhaseChange?.(pattern[nextPhaseIndex].type);
    } else if (currentCycle < cycleCount) {
      // Start next cycle
      this.state.breathingState.currentCycle++;
      this.state.breathingState.currentPhaseIndex = 0;
      this.state.breathingState.currentPhase = pattern[0];
      this.state.remainingSeconds = pattern[0].durationSeconds;
      this.onPhaseChange?.(pattern[0].type);
    } else {
      // Complete breathing session
      this.state.status = 'completed';
      this.onComplete?.();
      this.stop();
    }
  }

  public getState(): UnifiedTimerState {
    return { ...this.state };
  }

  public getCurrentPhaseDescription(): string {
    switch (this.profile.type) {
      case 'simple':
        return this.state.simpleState?.isWorkPhase ? 'Focus Time' : 'Break Time';

      case 'series': {
        if (!this.state.seriesState) return '';
        const { currentPhase, currentStep } = this.state.seriesState;
        if (currentPhase === 'warmup') return 'Warming Up';
        if (currentPhase === 'cooldown') return 'Cooling Down';
        if (currentPhase === 'rest') return 'Rest';
        return currentStep?.name || 'Exercise';
      }

      case 'breathing': {
        if (!this.state.breathingState) return '';
        const phase = this.state.breathingState.currentPhase;
        const cycle = this.state.breathingState.currentCycle;
        const totalCycles = this.profile.breathingConfig?.cycleCount || 0;
        const phaseNames = {
          'inhale': 'Breathe In',
          'hold-in': 'Hold',
          'exhale': 'Breathe Out',
          'hold-out': 'Hold'
        };
        return `${phaseNames[phase.type]} (${cycle}/${totalCycles})`;
      }

      default:
        return '';
    }
  }
}