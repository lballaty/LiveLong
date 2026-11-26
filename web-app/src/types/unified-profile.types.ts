// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/types/unified-profile.types.ts
// Description: Unified profile system supporting simple timers, exercise series, and breathing patterns
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

import { generateUUID } from '@/utils/uuid';

/**
 * Unified timer profile supporting multiple timer types
 */
export interface UnifiedProfile {
  id: string;
  name: string;
  description: string;
  type: 'simple' | 'series' | 'breathing';

  // Visual customization
  color: string;
  icon: string;
  backgroundAnimation?: string;

  // Audio/Haptic settings
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationSound?: string;
  musicTrackId?: string;

  // Simple timer properties (when type === 'simple')
  simpleDuration?: {
    workMinutes: number;
    workSeconds: number;
    breakMinutes: number;
    breakSeconds: number;
  };

  // Series properties (when type === 'series')
  seriesConfig?: {
    warmupMinutes: number;
    warmupSeconds: number;
    cooldownMinutes: number;
    cooldownSeconds: number;
    steps: SeriesStep[];
  };

  // Breathing properties (when type === 'breathing')
  breathingConfig?: {
    pattern: BreathingPhase[];
    cycleCount: number;
    totalDurationMinutes: number;
  };

  // Calculated fields
  totalDurationSeconds: number;
  isDefault: boolean;
  isCustom: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type CastCharacterId =
  | 'robot-r1'
  | 'm25-athletic'
  | 'f30-slim'
  | 'm50-heavier'
  | 'f50-fuller'
  | 'f72-stooped'
  | 'm75-slim';

export type ExerciseVariant = 'standing' | 'chair';
export type ExerciseViewMode = 'front' | 'side' | 'both';

export type VoiceOptionId = 'woman' | 'man';

export interface PracticePreferences {
  characterId: CastCharacterId;
  variant: ExerciseVariant;
  views: ExerciseViewMode;
  soundEnabled: boolean;
  chimeVolume: number; // 0.0 - 1.0
  voiceCuesEnabled: boolean;
  voiceId: VoiceOptionId;
  voiceVolume: number; // 0.0 - 1.0
  musicMuted: boolean;
  musicVolume: number; // 0.0 - 1.0
  vibrationEnabled: boolean;
}

export interface StepAnimationRef {
  pack: string;
  version?: string;
}

export type ExerciseCategory =
  | 'mobility'
  | 'strength'
  | 'balance'
  | 'cardio'
  | 'mindfulness'
  | 'breathing';

export type ExercisePrescriptionMode =
  | 'timed'
  | 'reps'
  | 'hold'
  | 'interval'
  | 'breath'
  | 'stillness';

export interface ExerciseMediaBinding {
  animation?: StepAnimationRef & {
    fallbackType?: 'robot-poc' | 'breathing' | 'stillness';
  };
  audio: {
    cueId: string;
    defaultVoiceScript: string;
    completionCueId?: string;
  };
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  description: string;
  flow: string;
  category: ExerciseCategory;
  tags: string[];
  defaultMode: ExercisePrescriptionMode;
  defaultDurationSeconds: number;
  defaultRestSeconds: number;
  defaultTargetReps?: number;
  supportedVariants: ExerciseVariant[];
  media: ExerciseMediaBinding;
  isDefault: boolean;
}

/**
 * Step (prescribed block) in a series (exercise, meditation, etc.)
 */
export interface SeriesStep {
  id: string;
  exerciseId?: string;
  name: string;
  description: string;
  durationMinutes: number;
  durationSeconds: number;
  restMinutes: number;
  restSeconds: number;
  mode?: ExercisePrescriptionMode;
  targetReps?: number;
  rounds?: number;
  instructions?: string;
  cueId?: string;
  voiceScript?: string;
  breathingPattern?: BreathingPhase[];
  animation?: StepAnimationRef;
}

export interface SessionPlanItem {
  id: string;
  profileId: string;
  transitionRestSeconds?: number;
  musicOverrideId?: string;
}

export interface SessionPlan {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: SessionPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Single phase of breathing
 */
export interface BreathingPhase {
  type: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
  durationSeconds: number;
  instruction?: string;
}

/**
 * Timer state for active sessions
 */
export interface UnifiedTimerState {
  profile: UnifiedProfile;
  status: 'idle' | 'running' | 'paused' | 'completed';

  // Simple timer state
  simpleState?: {
    isWorkPhase: boolean;
    sessionsCompleted: number;
  };

  // Series state
  seriesState?: {
    currentPhase: 'warmup' | 'exercise' | 'rest' | 'cooldown';
    currentStepIndex: number;
    currentStep?: SeriesStep;
    completedSteps: string[];
  };

  // Breathing state
  breathingState?: {
    currentCycle: number;
    currentPhaseIndex: number;
    currentPhase: BreathingPhase;
  };

  // Common timing
  remainingSeconds: number;
  totalElapsedSeconds: number;
  pauseCount: number;
}

/**
 * Profile converter from legacy ExerciseSeries
 */
export function convertExerciseSeriesToUnified(series: any): UnifiedProfile {
  const steps: SeriesStep[] = series.steps.map((step: any) => ({
    id: step.id,
    exerciseId: step.exerciseId,
    name: step.name,
    description: step.description || '',
    durationMinutes: Math.floor(step.durationMinutes),
    durationSeconds: Math.round((step.durationMinutes % 1) * 60),
    restMinutes: Math.floor(step.restDurationMinutes),
    restSeconds: Math.round((step.restDurationMinutes % 1) * 60),
    mode: step.mode,
    targetReps: step.targetReps,
    rounds: step.rounds,
    instructions: step.instructions,
    cueId: step.cueId,
    voiceScript: step.voiceScript,
    animation: step.animation
  }));

  const totalSeconds = (series.warmupDurationMinutes || 0) * 60 +
    (series.cooldownDurationMinutes || 0) * 60 +
    steps.reduce((total: number, step: SeriesStep) =>
      total + (step.durationMinutes * 60 + step.durationSeconds) +
      (step.restMinutes * 60 + step.restSeconds), 0);

  return {
    id: series.id,
    name: series.name,
    description: series.description,
    type: 'series',
    color: '#3b82f6',
    icon: '🎯',
    backgroundAnimation: series.backgroundAnimation,
    soundEnabled: true,
    vibrationEnabled: true,
    seriesConfig: {
      warmupMinutes: Math.floor(series.warmupDurationMinutes || 0),
      warmupSeconds: Math.round(((series.warmupDurationMinutes || 0) % 1) * 60),
      cooldownMinutes: Math.floor(series.cooldownDurationMinutes || 0),
      cooldownSeconds: Math.round(((series.cooldownDurationMinutes || 0) % 1) * 60),
      steps
    },
    totalDurationSeconds: totalSeconds,
    isDefault: true,
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Profile converter from legacy breathing pattern
 */
export function convertBreathingPatternToUnified(pattern: any, profile: any): UnifiedProfile {
  const phases: BreathingPhase[] = [];

  if (pattern.inhaleSeconds > 0) {
    phases.push({ type: 'inhale', durationSeconds: pattern.inhaleSeconds });
  }
  const holdIn = pattern.holdInSeconds ?? pattern.holdInhaleSeconds ?? 0;
  if (holdIn > 0) {
    phases.push({ type: 'hold-in', durationSeconds: holdIn });
  }
  if (pattern.exhaleSeconds > 0) {
    phases.push({ type: 'exhale', durationSeconds: pattern.exhaleSeconds });
  }
  const holdOut = pattern.holdOutSeconds ?? pattern.holdExhaleSeconds ?? 0;
  if (holdOut > 0) {
    phases.push({ type: 'hold-out', durationSeconds: holdOut });
  }

  const cycleCount = pattern.cycles ?? pattern.cycleCount ?? 8;
  const cycleDuration = phases.reduce((total, phase) => total + phase.durationSeconds, 0);
  const totalSeconds = cycleDuration * cycleCount;

  return {
    id: profile.id,
    name: profile.name,
    description: profile.description,
    type: 'breathing',
    color: profile.themeColor || profile.color || '#8b5cf6',
    icon: profile.icon || '🫁',
    backgroundAnimation: profile.exerciseSeries?.backgroundAnimation || profile.backgroundAnimation,
    soundEnabled: true,
    vibrationEnabled: true,
    breathingConfig: {
      pattern: phases,
      cycleCount,
      totalDurationMinutes: totalSeconds / 60
    },
    totalDurationSeconds: totalSeconds,
    isDefault: true,
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Create a simple timer profile
 */
export function createSimpleProfile(
  name: string,
  description: string,
  workMinutes: number,
  breakMinutes: number,
  color: string,
  icon: string
): UnifiedProfile {
  const totalSeconds = (workMinutes * 60) + (breakMinutes * 60);

  return {
    id: `simple-${generateUUID()}`,
    name,
    description,
    type: 'simple',
    color,
    icon,
    soundEnabled: true,
    vibrationEnabled: true,
    simpleDuration: {
      workMinutes: Math.floor(workMinutes),
      workSeconds: Math.round((workMinutes % 1) * 60),
      breakMinutes: Math.floor(breakMinutes),
      breakSeconds: Math.round((breakMinutes % 1) * 60)
    },
    totalDurationSeconds: totalSeconds,
    isDefault: false,
    isCustom: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function calculateSeriesTotalSeconds(
  warmupMinutes: number,
  warmupSeconds: number,
  cooldownMinutes: number,
  cooldownSeconds: number,
  steps: SeriesStep[]
): number {
  const warmup = (warmupMinutes * 60) + warmupSeconds;
  const cooldown = (cooldownMinutes * 60) + cooldownSeconds;
  const stepsTotal = steps.reduce(
    (sum, s) =>
      sum + (s.durationMinutes * 60 + s.durationSeconds) + (s.restMinutes * 60 + s.restSeconds),
    0
  );
  return warmup + stepsTotal + cooldown;
}

export function createSeriesProfile(params: {
  id?: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  musicTrackId?: string;
  warmupMinutes: number;
  warmupSeconds: number;
  cooldownMinutes: number;
  cooldownSeconds: number;
  steps: SeriesStep[];
}): UnifiedProfile {
  const totalSeconds = calculateSeriesTotalSeconds(
    params.warmupMinutes,
    params.warmupSeconds,
    params.cooldownMinutes,
    params.cooldownSeconds,
    params.steps
  );
  const now = new Date();
  return {
    id: params.id || `series-${generateUUID()}`,
    name: params.name,
    description: params.description,
    type: 'series',
    color: params.color,
    icon: params.icon,
    musicTrackId: params.musicTrackId,
    soundEnabled: true,
    vibrationEnabled: true,
    seriesConfig: {
      warmupMinutes: params.warmupMinutes,
      warmupSeconds: params.warmupSeconds,
      cooldownMinutes: params.cooldownMinutes,
      cooldownSeconds: params.cooldownSeconds,
      steps: params.steps,
    },
    totalDurationSeconds: totalSeconds,
    isDefault: false,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function createBreathingProfile(params: {
  id?: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  musicTrackId?: string;
  pattern: BreathingPhase[];
  cycleCount: number;
}): UnifiedProfile {
  const cycleSeconds = params.pattern.reduce((sum, p) => sum + p.durationSeconds, 0);
  const totalSeconds = cycleSeconds * params.cycleCount;
  const now = new Date();
  return {
    id: params.id || `breathing-${generateUUID()}`,
    name: params.name,
    description: params.description,
    type: 'breathing',
    color: params.color,
    icon: params.icon,
    musicTrackId: params.musicTrackId,
    soundEnabled: true,
    vibrationEnabled: true,
    breathingConfig: {
      pattern: params.pattern,
      cycleCount: params.cycleCount,
      totalDurationMinutes: totalSeconds / 60,
    },
    totalDurationSeconds: totalSeconds,
    isDefault: false,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function cloneProfileAsCustom(source: UnifiedProfile): UnifiedProfile {
  const now = new Date();
  return {
    ...JSON.parse(JSON.stringify(source)),
    id: `${source.type}-${generateUUID()}`,
    name: `${source.name} (Custom)`,
    isDefault: false,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };
}