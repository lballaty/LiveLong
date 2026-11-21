// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/types/timer.types.ts
// Description: Core timer type definitions following SOLID principles
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

/**
 * Timer state enumeration
 * Represents all possible states a timer can be in
 */
export enum TimerState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  STOPPED = 'stopped',
}

/**
 * Timer configuration interface
 * Single Responsibility: Only defines timer configuration
 */
export interface TimerConfig {
  readonly durationMinutes: number;
  readonly autoStart?: boolean;
  readonly notifyOnComplete?: boolean;
}

/**
 * Timer data interface
 * Contains current state and timing information
 */
export interface TimerData {
  readonly state: TimerState;
  readonly remainingSeconds: number;
  readonly elapsedSeconds: number;
  readonly totalSeconds: number;
  readonly progress: number; // 0-1
  readonly startedAt: Date | null;
  readonly pausedAt: Date | null;
  readonly completedAt: Date | null;
}

/**
 * Timer controller interface
 * Dependency Inversion: Depend on abstractions, not implementations
 */
export interface ITimerController {
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(): void;
  getState(): TimerData;
  subscribe(listener: TimerStateChangeListener): () => void;
}

/**
 * Timer state change listener type
 */
export type TimerStateChangeListener = (state: TimerData, event?: TimerEvent) => void;

/**
 * Timer event types for event-driven architecture
 */
export enum TimerEvent {
  TICK = 'tick',
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  STOP = 'stop',
  COMPLETE = 'complete',
  RESET = 'reset',
}

/**
 * Timer event payload interface
 */
export interface TimerEventPayload {
  readonly event: TimerEvent;
  readonly timestamp: Date;
  readonly timerData: TimerData;
}