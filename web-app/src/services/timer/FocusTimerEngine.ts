// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/timer/FocusTimerEngine.ts
// Description: Core focus timer engine with precise second-level countdown for work, exercise, and meditation sessions
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import {
  ITimerController,
  TimerData,
  TimerState,
  TimerStateChangeListener,
  TimerEvent
} from '@/types/timer.types';
import { getBackgroundTimerService, BackgroundTimerWorkerService } from './BackgroundTimerWorkerService';

/**
 * Focus Timer Engine Implementation
 *
 * Business Purpose: Provides accurate countdown timer functionality with second-level
 * precision for various activities including work sessions (25 minutes), exercise
 * intervals (30 seconds), meditation (10 minutes), and custom durations.
 */
export class FocusTimerEngine implements ITimerController {
  private currentTimerState: TimerState = TimerState.IDLE;
  private plannedDurationSeconds: number = 0;
  private remainingDurationSeconds: number = 0;
  private timerIntervalId: NodeJS.Timeout | null = null;
  private stateChangeListeners: Set<TimerStateChangeListener> = new Set();
  private timerStartTimestamp: number | null = null;
  private pausedAtTimestamp: number = 0;
  private accumulatedPauseMilliseconds: number = 0;
  private backgroundTimerService: BackgroundTimerWorkerService | null = null;
  private workerUpdateUnsubscribe: (() => void) | null = null;
  private workerCompletionUnsubscribe: (() => void) | null = null;
  private useWebWorker: boolean = false;

  constructor(initialDurationSeconds: number = 1500) { // Default 25 minutes
    this.setTimerDurationInSeconds(initialDurationSeconds);
    this.initializeBackgroundService();
  }

  /**
   * Initialize background timer service for iOS PWA support
   */
  private initializeBackgroundService(): void {
    try {
      this.backgroundTimerService = getBackgroundTimerService();

      // Check if we're on iOS and should use worker
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;

      this.useWebWorker = (isIOS || isPWA) && this.backgroundTimerService.isWorkerSupported();

      if (this.useWebWorker) {
        // Subscribe to worker updates
        this.workerUpdateUnsubscribe = this.backgroundTimerService.subscribeToTimerUpdates((status) => {
          this.remainingDurationSeconds = status.remainingSeconds;
          this.currentTimerState = status.isRunning ? TimerState.RUNNING :
                                   status.isComplete ? TimerState.IDLE : TimerState.PAUSED;
          this.notifyStateChangeListeners(TimerEvent.TICK);
        });

        this.workerCompletionUnsubscribe = this.backgroundTimerService.subscribeToCompletion(() => {
          this.completeTimerSession();
        });
      }
    } catch (error) {
      console.warn('Background timer service not available, using fallback:', error);
      this.useWebWorker = false;
    }
  }

  /**
   * Set timer duration in seconds for granular control
   *
   * Business Purpose: Allows precise timing for various activities including
   * exercise intervals (30s rest), work sessions (25min), or custom durations
   *
   * @param durationInSeconds Duration for the timer in seconds
   */
  public setTimerDurationInSeconds(durationInSeconds: number): void {
    this.plannedDurationSeconds = durationInSeconds;
    this.remainingDurationSeconds = this.plannedDurationSeconds;

    if (this.useWebWorker && this.backgroundTimerService) {
      this.backgroundTimerService.setTimerDuration(durationInSeconds);
    }

    this.notifyStateChangeListeners(TimerEvent.RESET);
  }

  /**
   * Set timer duration in minutes for convenience
   *
   * @param durationInMinutes Duration for the timer in minutes
   */
  public setTimerDurationInMinutes(durationInMinutes: number): void {
    this.setTimerDurationInSeconds(durationInMinutes * 60);
  }

  /**
   * Start the focus timer
   *
   * Business Purpose: Begins a focused work/exercise/meditation session
   * helping users maintain concentration for the specified duration
   */
  public startFocusTimer(): void {
    if (this.currentTimerState === TimerState.RUNNING) return;

    this.currentTimerState = TimerState.RUNNING;

    // Use Web Worker for background operation if available
    if (this.useWebWorker && this.backgroundTimerService) {
      this.backgroundTimerService.startBackgroundTimer(this.remainingDurationSeconds);
    } else {
      // Fallback to regular timer
      // Calculate actual start time accounting for any previous progress
      const elapsedSeconds = this.plannedDurationSeconds - this.remainingDurationSeconds;
      this.timerStartTimestamp = Date.now() - (elapsedSeconds * 1000);

      // Reset accumulated pause time when starting fresh
      if (this.remainingDurationSeconds === this.plannedDurationSeconds) {
        this.accumulatedPauseMilliseconds = 0;
      }

      this.timerIntervalId = setInterval(() => {
        this.updateTimerProgress();
      }, 100); // Check every 100ms for smooth UI updates
    }

    this.notifyStateChangeListeners(TimerEvent.START);
  }

  /**
   * Pause the running timer
   *
   * Business Purpose: Allows users to handle interruptions without losing
   * their progress in the current focus session
   */
  public pauseTimer(): void {
    if (this.currentTimerState !== TimerState.RUNNING) return;

    this.currentTimerState = TimerState.PAUSED;

    if (this.useWebWorker && this.backgroundTimerService) {
      this.backgroundTimerService.pauseBackgroundTimer();
    } else {
      this.pausedAtTimestamp = Date.now();

      if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId);
        this.timerIntervalId = null;
      }
    }

    this.notifyStateChangeListeners(TimerEvent.PAUSE);
  }

  /**
   * Resume timer from paused state
   *
   * Business Purpose: Continues the focus session exactly where it was paused,
   * maintaining accurate timing for the user's productivity tracking
   */
  public resumeTimer(): void {
    if (this.currentTimerState !== TimerState.PAUSED) return;

    if (this.useWebWorker && this.backgroundTimerService) {
      this.backgroundTimerService.resumeBackgroundTimer();
      this.currentTimerState = TimerState.RUNNING;
    } else {
      if (this.pausedAtTimestamp && this.timerStartTimestamp) {
        const currentPauseDuration = Date.now() - this.pausedAtTimestamp;
        this.accumulatedPauseMilliseconds += currentPauseDuration;
      }

      this.startFocusTimer();
    }

    this.notifyStateChangeListeners(TimerEvent.RESUME);
  }

  /**
   * Stop the timer completely
   *
   * Business Purpose: Ends the current focus session when user decides
   * not to continue, marking it as incomplete for analytics
   */
  public stopTimer(): void {
    this.currentTimerState = TimerState.STOPPED;

    if (this.useWebWorker && this.backgroundTimerService) {
      this.backgroundTimerService.stopBackgroundTimer();
    } else {
      if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId);
        this.timerIntervalId = null;
      }
    }

    this.notifyStateChangeListeners(TimerEvent.STOP);
  }

  /**
   * Reset timer to initial duration
   *
   * Business Purpose: Prepares timer for a fresh focus session with
   * the same duration settings
   */
  public resetTimer(): void {
    this.stopTimer();
    this.currentTimerState = TimerState.IDLE;
    this.remainingDurationSeconds = this.plannedDurationSeconds;
    this.timerStartTimestamp = null;
    this.pausedAtTimestamp = 0;
    this.accumulatedPauseMilliseconds = 0;
    this.notifyStateChangeListeners(TimerEvent.RESET);
  }

  /**
   * Get current timer state and progress data
   *
   * Business Purpose: Provides UI components with real-time timer information
   * for display and progress tracking
   */
  public getCurrentTimerState(): TimerData {
    return {
      state: this.currentTimerState,
      totalSeconds: this.plannedDurationSeconds,
      remainingSeconds: this.remainingDurationSeconds,
      elapsedSeconds: this.plannedDurationSeconds - this.remainingDurationSeconds,
      progress: this.plannedDurationSeconds > 0
        ? (this.plannedDurationSeconds - this.remainingDurationSeconds) / this.plannedDurationSeconds
        : 0,
      startedAt: this.timerStartTimestamp ? new Date(this.timerStartTimestamp) : null,
      pausedAt: this.pausedAtTimestamp ? new Date(this.pausedAtTimestamp) : null,
      completedAt: this.currentTimerState === TimerState.COMPLETED ? new Date() : null
    };
  }

  /**
   * Subscribe to timer state changes
   *
   * @param listener Callback function for state updates
   * @returns Unsubscribe function
   */
  public subscribeToTimerUpdates(listener: TimerStateChangeListener): () => void {
    this.stateChangeListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  /**
   * Update timer progress on each tick
   */
  private updateTimerProgress(): void {
    if (this.currentTimerState !== TimerState.RUNNING || !this.timerStartTimestamp) return;

    // Calculate elapsed time accounting for pauses
    const totalElapsedMilliseconds = Date.now() - this.timerStartTimestamp - this.accumulatedPauseMilliseconds;
    const elapsedSeconds = Math.floor(totalElapsedMilliseconds / 1000);
    const newRemainingSeconds = Math.max(0, this.plannedDurationSeconds - elapsedSeconds);

    // Only update if seconds changed to prevent unnecessary re-renders
    if (newRemainingSeconds !== this.remainingDurationSeconds) {
      this.remainingDurationSeconds = newRemainingSeconds;
      this.notifyStateChangeListeners(TimerEvent.TICK);

      if (this.remainingDurationSeconds === 0) {
        this.completeTimerSession();
      }
    }
  }

  /**
   * Handle successful timer completion
   *
   * Business Purpose: Marks the focus session as successfully completed,
   * triggering celebrations and recording achievement for user motivation
   */
  private completeTimerSession(): void {
    this.currentTimerState = TimerState.COMPLETED;

    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    this.notifyStateChangeListeners(TimerEvent.COMPLETE);
  }

  /**
   * Notify all registered listeners of state changes
   */
  private notifyStateChangeListeners(event: TimerEvent): void {
    const currentStateData = this.getCurrentTimerState();
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(currentStateData, event);
      } catch (error) {
        console.error('Error in timer state change listener:', error);
      }
    });
  }

  /**
   * Get formatted time string for display
   *
   * @returns Time in MM:SS or HH:MM:SS format
   */
  public getFormattedTimeDisplay(): string {
    const hours = Math.floor(this.remainingDurationSeconds / 3600);
    const minutes = Math.floor((this.remainingDurationSeconds % 3600) / 60);
    const seconds = this.remainingDurationSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Get progress percentage for UI display
   */
  public getProgressPercentage(): number {
    if (this.plannedDurationSeconds === 0) return 0;
    return Math.round(((this.plannedDurationSeconds - this.remainingDurationSeconds) / this.plannedDurationSeconds) * 100);
  }

  /**
   * Clean up resources when timer is no longer needed
   *
   * Business Purpose: Prevents memory leaks and ensures proper cleanup
   * when user navigates away from timer screen
   */
  public destroyTimer(): void {
    this.stopTimer();
    this.stateChangeListeners.clear();

    // Clean up Web Worker subscriptions
    if (this.workerUpdateUnsubscribe) {
      this.workerUpdateUnsubscribe();
      this.workerUpdateUnsubscribe = null;
    }

    if (this.workerCompletionUnsubscribe) {
      this.workerCompletionUnsubscribe();
      this.workerCompletionUnsubscribe = null;
    }
  }

  // Backward compatibility aliases
  public start = this.startFocusTimer;
  public pause = this.pauseTimer;
  public resume = this.resumeTimer;
  public stop = this.stopTimer;
  public reset = this.resetTimer;
  public getState = this.getCurrentTimerState;
  public subscribe = this.subscribeToTimerUpdates;
  public destroy = this.destroyTimer;
}